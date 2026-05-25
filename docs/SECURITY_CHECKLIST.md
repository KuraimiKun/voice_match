# Security Checklist

## Local milestone status

- [x] Anonymous account flow uses generated anonymous handles.
- [x] No real names, phone numbers, exact location, public profiles, public rooms, images, files, or video in MVP.
- [x] Socket connections must authenticate before protected events.
- [x] Socket user identity is stored server-side in `socket.data.userId`.
- [x] Matching uses persistent `userId`; socket IDs are only live transport identifiers.
- [x] Add friend uses `voiceSessionId` and server-side partner lookup.
- [x] Signaling validates active voice session membership.
- [x] Backend relays WebRTC signaling only; raw audio is never sent through Socket.IO.
- [x] Chat room joins validate membership server-side.
- [x] Message sending validates membership, block state, empty body, and 1,000 character length.
- [x] Block checks are enforced for matching and chat messages.
- [x] Redis-backed rate limits exist for auth, queue, friend add, reports/messages, and blocks.
- [x] Health endpoint checks API, database, and Redis.

## Production hardening before launch

- [ ] Replace local JWT secret with a strong secret from a secret manager.
- [ ] Use managed PostgreSQL with backups and TLS.
- [ ] Use managed Redis or hardened Redis with network isolation.
- [ ] Use Coturn or managed TURN with short-lived credentials.
- [ ] Enforce HTTPS/WSS at a reverse proxy or load balancer.
- [ ] Configure strict CORS for production app origins only.
- [ ] Add device/IP-aware abuse detection and moderation queues.
- [ ] Add audit logs for moderation actions.
- [ ] Add structured log shipping and alerting.
- [ ] Add privacy policy, terms, and age/community safety review.
