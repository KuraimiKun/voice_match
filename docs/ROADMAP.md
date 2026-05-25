# MVP Roadmap

## Phase 1: Foundation

- Monorepo structure.
- Prisma schema and migrations.
- Anonymous auth.
- JWT-protected REST.
- Socket authentication.
- Health endpoint.
- Docker Compose local stack.

## Phase 2: Random voice MVP

- Redis presence.
- Redis random matching queue.
- Block-aware matching.
- VoiceSession lifecycle.
- WebRTC audio-only offer/answer/ICE relay.
- Flutter mic permission, mute, skip, end, cleanup.

## Phase 3: Safety MVP

- Community rules and age gate.
- Report user during voice call.
- Block user during call.
- Report and block REST endpoints.
- Rate limits.
- Moderation tables and ban structure.

## Phase 4: Mutual friend private chat

- FriendAdd pending records.
- Mutual detection.
- Friendship unique pair.
- ChatRoom auto-create.
- Friend inbox.
- Server-side room membership validation.
- Recent messages.
- Real-time text messages.
- Typing indicator.

## Phase 5: Production readiness

- Integration tests.
- Redis Socket.IO adapter for horizontal scale.
- TURN short-lived credential endpoint.
- Structured logging and metrics exporter.
- CI/CD.
- Privacy policy, terms, app-store safety materials.

# Future Roadmap

## Post-MVP safety

- Human moderation dashboard.
- Automated spam heuristics.
- Shadow bans or queue cooldowns for abusive behavior.
- Message report workflow.
- User data deletion/export.
- Trust and safety analytics.

## Product enhancements

- Push notifications with Firebase Cloud Messaging.
- Unread counts persisted per room.
- Pagination cursor for messages.
- Delete own message.
- Optional interests matching without public profile.
- Friend nickname stored locally only.
- Account recovery without phone number, e.g. recovery code.

## Infrastructure enhancements

- Socket.IO Redis adapter.
- OpenTelemetry traces.
- Prometheus metrics endpoint.
- Blue/green deploys.
- Load testing suite.
- Regional TURN selection.

## Explicitly not in MVP

- Video calls.
- Image sharing.
- File sharing.
- Public group rooms.
- Public profiles.
- Exact location.
- Real names or phone numbers.
