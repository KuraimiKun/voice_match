# Random Voice Social App Architecture

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task if extending beyond this scaffold.

**Goal:** Build a safe anonymous random audio chat app where private text chat unlocks only after mutual friend adds.

**Architecture:** Flutter owns device UX, microphone permissions, WebRTC peer connection, and feature state. NestJS owns identity, matching, safety, moderation, durable records, and Socket.IO event authorization. PostgreSQL stores durable product data; Redis stores ephemeral presence, matching queues, and rate-limit counters.

**Tech Stack:** Flutter, Riverpod, flutter_webrtc, socket_io_client, NestJS, TypeScript strict mode, Prisma, PostgreSQL, Redis, Socket.IO, Docker Compose, Coturn.

---

## 1. System components

```text
Flutter app
  | HTTPS REST: auth, me, friends, rooms, messages, reports, blocks
  | WSS Socket.IO: auth, queue, matching, WebRTC signaling, chat events
  v
NestJS API container
  | Prisma
  v
PostgreSQL managed DB/local container
  ^
  | Redis client
Redis managed/local container

WebRTC audio media path: Flutter peer <------ SRTP via ICE/STUN/TURN ------> Flutter peer
TURN/STUN: Coturn or managed provider
```

## 2. Backend modules

- AuthModule: anonymous account creation, JWT issue, device session persistence.
- UsersModule: `/me`, minimal user state, bans.
- PresenceModule: Redis online user/socket maps.
- MatchingModule: Redis random queue, block/ban filtering, voice session creation.
- VoiceSessionsModule: session lifecycle, membership and partner lookup.
- SignalingModule: Socket.IO gateway, thin event routing and authorization.
- FriendshipsModule: friend add state machine, mutual detection, friendship creation.
- ChatRoomsModule: room creation and membership validation.
- MessagesModule: message validation, sanitization, storage, unread-ready structure.
- BlocksModule: block creation, future matching/message prevention.
- ReportsModule: voice/user/message report storage.
- ModerationModule: moderation action and ban data structures.
- RateLimitModule: Redis fixed-window limits for risky actions.
- HealthModule: liveness/readiness endpoints.

## 3. Flutter modules

- app: Material app, router, theme.
- core: config, constants, network, storage, errors, utilities.
- features/auth: anonymous account bootstrap.
- features/rules: age gate and community rules acceptance.
- features/voice_chat: random queue, WebRTC audio call, skip/end/mute/report/block/add friend.
- features/friends: friend inbox and mutual-room state.
- features/chat: private text chat only in rooms returned by backend.
- features/reports, blocks, settings: safety and account controls.
- shared: widgets and common models.

## 4. Critical flows

### Anonymous auth

1. App loads local token and anonymous user ID if present.
2. If missing, `POST /auth/anonymous` with device installation ID.
3. Backend creates `User` and `DeviceSession`; returns JWT and stable user payload.
4. Socket authenticates with `socket_authenticate { token }`.

### Random voice matching

1. Authenticated socket emits `join_queue`.
2. Matching service adds user/socket to Redis queue after ban/rate checks.
3. Service pops candidates until it finds a present, unblocked, unbanned pair.
4. Backend creates `VoiceSession` with `userAId` and `userBId`.
5. Gateway emits `matched` to both clients, one as initiator.
6. Initiator creates WebRTC offer; answerer responds; ICE candidates relay through gateway.
7. Raw audio never touches Socket.IO or the backend.

### Friend unlock

1. User emits `friend_add_current_partner { voiceSessionId }`.
2. Server verifies requester belongs to that voice session and calculates the partner from session participants.
3. One-sided add inserts `FriendAdd(requesterId,targetId,status=PENDING)`.
4. Reciprocal add transaction creates/uses normalized `Friendship(userAId,userBId)` and a single `ChatRoom(friendshipId)`.
5. Gateway emits `friend_add_pending` or `friendship_created`.

### Private chat

1. Client loads `/chat-rooms` or emits `friend_rooms_load`.
2. User emits `join_chat_room { roomId }`.
3. Server validates membership through friendship relationship and checks blocks.
4. Server joins socket room `chat:${roomId}` and sends recent `chat_history`.
5. `chat_message_send` validates membership, block state, rate limit, sanitizes, persists, and emits `chat_message_new`.

## 5. Security boundaries

- Trust JWT user ID only; never trust a client-provided permanent target user ID for voice partner actions.
- Socket IDs are ephemeral and never stored in permanent relationships.
- All Socket.IO events require authenticated socket except `socket_authenticate`.
- Blocks are checked for matching, chat join, and message send.
- Reports and messages have fixed-window rate limits.
- TURN credentials must be short-lived or issued by backend in production; never hardcode long-lived TURN secrets in Flutter.
- DTO validation and stable error payloads are used everywhere.

## 6. Observability

- Request ID middleware adds/propagates `x-request-id`.
- JSON logs include request ID and user ID where available.
- `/health` exposes app, DB, and Redis health checks.
- Service methods are structured so metrics counters/timers can be added without changing product logic.
