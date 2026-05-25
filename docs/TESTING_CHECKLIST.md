# Testing Checklist

## Backend unit tests

- AuthService creates anonymous user and reuses the same user for the same installation ID.
- AuthService rejects invalid socket JWT.
- MatchingService returns waiting when no candidate exists.
- MatchingService creates VoiceSession when two eligible users join.
- MatchingService skips stale sockets and self-matches.
- MatchingService refuses users blocked in either direction.
- VoiceSessionsService rejects non-members.
- FriendshipsService uses voiceSessionId, not arbitrary target user ID.
- FriendshipsService creates pending FriendAdd for one-sided add.
- FriendshipsService creates normalized Friendship and one ChatRoom for reciprocal add.
- ChatRoomsService validates membership and block state.
- MessagesService rejects empty body.
- MessagesService rejects >1,000 characters.
- MessagesService sanitizes control characters.
- MessagesService rate-limits spam.
- BlocksService prevents duplicate blocks.
- ReportsService stores voice and message reports and rate-limits abuse.

## Backend integration tests

- `POST /auth/anonymous` returns stable response shape: `{ token, user, deviceSessionId }`.
- `GET /me` requires bearer token.
- `GET /chat-rooms` returns only rooms where user is part of friendship.
- `GET /chat-rooms/:roomId/messages` rejects non-members.
- `POST /reports` stores moderation-ready data.
- `POST /blocks` prevents future chat/matching.
- Socket must authenticate before `join_queue`.
- Socket disconnect removes presence and queue marker.
- `offer`, `answer`, and `ice_candidate` relay only to the voice session partner.
- `friend_add_current_partner` rejects non-session members.
- `chat_message_send` emits only to `chat:${roomId}` after validation.

## Flutter tests

- SplashScreen creates or loads anonymous account and routes based on rules acceptance.
- RulesScreen persists age gate/community rules acceptance.
- HomeScreen starts voice flow.
- VoiceChatScreen requests mic permission before WebRTC setup.
- VoiceCallService uses audio true and video false.
- VoiceCallService cleans tracks on dispose.
- ChatService prevents empty and overlength sends.
- ChatScreen joins/leaves room and appends real-time messages.
- FriendsInboxScreen loads rooms from backend.

## Manual WebRTC tests

- Same Wi-Fi direct P2P.
- Different networks using STUN.
- Restricted NAT using TURN.
- Permission denied path.
- Skip during waiting.
- Skip after matched.
- Partner disconnect.
- Mute/unmute local track.
- Add friend before WebRTC connected.
- Report/block during call.

## Abuse/safety tests

- A blocked B: A and B are never matched.
- A blocked B: B cannot send to A in existing room.
- User spams messages: rate limit triggers stable error.
- User spams reports: rate limit triggers stable error.
- Banned user cannot be queued after ModerationService is integrated into MatchingService gate.
- Empty report details are allowed; invalid reason is rejected.

## Load and resilience tests

- 1,000 sockets connect/authenticate.
- Queue churn: rapid join/stop/disconnect does not create orphan sessions.
- Redis restart behavior: presence and queue recover as ephemeral data.
- PostgreSQL connection failure makes `/health` fail.
- Socket.IO behind load balancer requires sticky sessions or Redis adapter before horizontal scale.
