import { io, Socket } from 'socket.io-client';

type AuthResult = { token: string; user: { id: string; anonymousHandle: string }; deviceSessionId: string };
type MatchPayload = { voiceSessionId: string; partnerSocketId: string; initiator: boolean };

const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:3000';

function waitFor<T>(socket: Socket, event: string, timeoutMs = 5000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`timeout_waiting_for_${event}`));
    }, timeoutMs);
    const handler = (payload: T) => {
      cleanup();
      resolve(payload);
    };
    const errorHandler = (payload: unknown) => {
      cleanup();
      reject(new Error(`socket_error_${event}_${JSON.stringify(payload)}`));
    };
    const cleanup = () => {
      clearTimeout(timer);
      socket.off(event, handler);
      socket.off('error_message', errorHandler);
    };
    socket.once(event, handler);
    socket.once('error_message', errorHandler);
  });
}

async function postJson<T>(path: string, body: unknown, token?: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`POST ${path} failed ${response.status}: ${await response.text()}`);
  return response.json() as Promise<T>;
}

async function auth(installationId: string): Promise<AuthResult> {
  return postJson<AuthResult>('/auth/anonymous', { installationId, platform: 'ANDROID', appVersion: '0.1.0' });
}

function connectSocket(token?: string): Promise<Socket> {
  const socket = io(baseUrl, { transports: ['websocket'], reconnection: false });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('socket_connect_timeout')), 5000);
    socket.once('connect', () => {
      clearTimeout(timer);
      if (!token) return resolve(socket);
      const authenticated = waitFor(socket, 'socket_authenticated');
      socket.emit('socket_authenticate', { token });
      authenticated.then(() => resolve(socket), reject);
    });
    socket.once('connect_error', reject);
  });
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log(`socket smoke target: ${baseUrl}`);
  const userA = await auth(`socket-smoke-a-${Date.now()}`);
  const userB = await auth(`socket-smoke-b-${Date.now()}`);
  console.log(`created users: ${userA.user.id}, ${userB.user.id}`);

  const unauth = await connectSocket();
  const unauthError = waitFor<{ code: string }>(unauth, 'error_message');
  unauth.emit('join_queue');
  const unauthPayload = await unauthError;
  assert(unauthPayload.code === 'socket_not_authenticated', 'unauthenticated join_queue should be rejected');
  unauth.disconnect();

  const socketA = await connectSocket(userA.token);
  const socketB = await connectSocket(userB.token);

  const waitA = waitFor(socketA, 'waiting');
  socketA.emit('join_queue');
  await waitA;
  console.log('A entered waiting state');

  const matchedA = waitFor<MatchPayload>(socketA, 'matched');
  const matchedB = waitFor<MatchPayload>(socketB, 'matched');
  socketB.emit('join_queue');
  const [matchA, matchB] = await Promise.all([matchedA, matchedB]);
  assert(Boolean(matchA.voiceSessionId && matchB.voiceSessionId), 'matched payload must include voiceSessionId');
  assert(matchA.voiceSessionId === matchB.voiceSessionId, 'both sockets must receive same voiceSessionId');
  assert(Boolean(matchA.partnerSocketId && matchB.partnerSocketId), 'matched payload must include partnerSocketId');
  assert(typeof matchA.initiator === 'boolean' && typeof matchB.initiator === 'boolean', 'matched payload must include initiator boolean');
  assert(matchA.initiator !== matchB.initiator, 'one peer must be initiator');
  console.log(`matched voice session: ${matchA.voiceSessionId}`);

  const offerRelay = waitFor<{ voiceSessionId: string; sdp: Record<string, unknown> }>(socketB, 'offer');
  socketA.emit('offer', {
    voiceSessionId: matchA.voiceSessionId,
    payload: { type: 'offer', sdp: 'fake-audio-only-sdp' },
  });
  const offer = await offerRelay;
  assert(offer.voiceSessionId === matchA.voiceSessionId, 'offer relay should preserve voiceSessionId');
  assert(offer.sdp.type === 'offer', 'offer relay should preserve payload');
  console.log('offer relayed to partner');

  const pending = waitFor(socketA, 'friend_add_pending');
  socketA.emit('friend_add_current_partner', { voiceSessionId: matchA.voiceSessionId });
  await pending;
  console.log('friend add pending confirmed');

  const createdA = waitFor<any>(socketA, 'friendship_created');
  const createdB = waitFor<any>(socketB, 'friendship_created');
  socketB.emit('friend_add_current_partner', { voiceSessionId: matchA.voiceSessionId });
  const [friendA, friendB] = await Promise.all([createdA, createdB]);
  const chatRoomId = friendA.chatRoom?.id ?? friendB.chatRoom?.id;
  assert(chatRoomId, 'friendship_created must include chatRoom.id');
  console.log(`friendship and chat room created: ${chatRoomId}`);

  const historyA = waitFor(socketA, 'chat_history');
  const historyB = waitFor(socketB, 'chat_history');
  socketA.emit('join_chat_room', { roomId: chatRoomId });
  socketB.emit('join_chat_room', { roomId: chatRoomId });
  await Promise.all([historyA, historyB]);

  const messageNew = waitFor<any>(socketB, 'chat_message_new');
  socketA.emit('chat_message_send', { roomId: chatRoomId, body: 'hello from socket smoke test' });
  const messagePayload = await messageNew;
  assert(messagePayload.message?.body === 'hello from socket smoke test', 'chat_message_new should include stored message body');
  console.log('chat message delivered');

  const blockAck = waitFor(socketA, 'user_blocked');
  socketA.emit('block_user', { targetUserId: userB.user.id, reason: 'socket smoke test cleanup' });
  await blockAck;
  console.log('block acknowledged');

  const blockedMessageError = waitFor<{ code: string }>(socketB, 'error_message');
  socketB.emit('chat_message_send', { roomId: chatRoomId, body: 'this should be blocked' });
  const blockedMessagePayload = await blockedMessageError;
  assert(blockedMessagePayload.code === 'chat_blocked', 'messages after block must be rejected');
  console.log('post-block messaging rejected');

  socketA.disconnect();
  socketB.disconnect();
  console.log('socket smoke test passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
