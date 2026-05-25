# API and Socket Contracts

## REST

### POST /auth/anonymous

Request:

```json
{"installationId":"uuid-or-random-install-id","platform":"ANDROID","appVersion":"0.1.0"}
```

Response:

```json
{"token":"jwt","user":{"id":"uuid","anonymousHandle":"anon_..."},"deviceSessionId":"uuid"}
```

### GET /me

Auth: Bearer token.

Response:

```json
{"user":{"id":"uuid","anonymousHandle":"anon_...","createdAt":"...","rulesAcceptedAt":null,"ageGatePassedAt":null}}
```

### GET /friends

Returns mutual friendships for the authenticated user with private `chatRoomId` when available.

### GET /chat-rooms

Returns only mutual-friend rooms for the authenticated user.

### GET /chat-rooms/:roomId/messages

Server validates membership and block state.

### POST /reports

Stores a moderation report.

### POST /blocks

Creates a block edge. Duplicate blocks are idempotent.

### GET /health

Checks app, DB, and Redis.

## Socket.IO rules

- All events except `socket_authenticate` require authenticated socket.
- `socket.data.userId` is set after auth.
- Business logic is in services, not gateway handlers.
- Payloads must be DTO-validated in a hardening pass before public launch.

## Socket.IO events

Authentication:

- `socket_authenticate { token }`
- `socket_authenticated { userId }`
- `socket_auth_error { code }`

Matching:

- `join_queue {}`
- `waiting {}`
- `matched { voiceSessionId, peerUserId, initiator }`
- `stop_searching {}`
- `skip { voiceSessionId }`
- `partner_left { voiceSessionId, reason }`

WebRTC signaling:

- `offer { voiceSessionId, sdp }`
- `answer { voiceSessionId, sdp }`
- `ice_candidate { voiceSessionId, candidate }`

Friendship:

- `friend_add_current_partner { voiceSessionId }`
- `friend_add_pending { status, targetUserId }`
- `friendship_created { status, peerUserId, friendship, chatRoom }`
- `friend_rooms_load {}`
- `friend_rooms { rooms }`

Chat:

- `join_chat_room { roomId }`
- `chat_history { messages }`
- `chat_message_send { roomId, body }`
- `chat_message_new { message }`
- `typing_start { roomId }`
- `typing_stop { roomId }`
- `leave_chat_room { roomId }`

Safety:

- `report_user { voiceSessionId, reason, details }`
- `report_message { messageId, reason, details }`
- `block_user { targetUserId, reason, voiceSessionId }`
- `user_blocked { block }`
- `error_message { code }`
