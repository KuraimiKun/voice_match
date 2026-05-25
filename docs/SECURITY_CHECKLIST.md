# Security Checklist

## Identity and auth

- JWT secret is strong and production-only.
- Device installation ID is not treated as a secure credential by itself.
- Revoked `DeviceSession` records are checked before token renewal if renewal is added.
- Socket authentication is mandatory before all events except `socket_authenticate`.
- `socket.data.userId` is the source of truth for socket actions.

## Matching and voice

- Matching uses permanent `userId`, not socket ID.
- Presence maps user ID to socket ID in Redis only.
- VoiceSession stores user IDs only.
- Add friend uses `voiceSessionId` and server-side partner lookup.
- Signaling relays only to the verified voice session partner.
- Raw audio is never proxied through backend.
- TURN credentials are short-lived in production.

## Chat

- Chat rooms exist only for mutual friendships.
- Every join/send/history request validates membership server-side.
- Block state is checked before join and send.
- Message body is trimmed and sanitized.
- Empty messages are rejected.
- Messages over 1,000 characters are rejected.
- No image/file/video payloads accepted.

## Safety and moderation

- Reports include reporter, reported user where known, voice session/message/room context, reason, details, and status.
- Blocks are unique and indexed.
- Blocking during queue removes/ends active interactions.
- Basic report reasons are enumerated.
- Bans are indexed for active checks.
- Admin tools must never expose raw secrets or allow SQL injection.

## API hardening

- DTO validation with whitelist and forbidNonWhitelisted.
- Stable error response codes.
- Helmet enabled.
- CORS allowlist in production.
- Request IDs on every request.
- Rate limits for queue joins, messages, reports, auth attempts, and future admin endpoints.
- Dependency audit in CI.

## Infrastructure

- PostgreSQL TLS in production.
- Redis TLS/auth in production.
- Container runs as non-root in hardened final image before launch.
- Network policies restrict DB/Redis to backend only.
- Backups tested with restore drills.
- Logs do not include JWTs, TURN secrets, message bodies at info level, or PII.
