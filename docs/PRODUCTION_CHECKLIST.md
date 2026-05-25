# Production Deployment Checklist

## Infrastructure

- Flutter app released through Android/iOS stores.
- NestJS backend runs as a stateless container.
- PostgreSQL is managed, encrypted at rest, with automated backups.
- Redis is managed with TLS/auth and eviction policy appropriate for ephemeral keys.
- TURN is Coturn behind static IPs or a managed TURN provider.
- HTTPS/WSS is terminated at cloud load balancer or reverse proxy.
- Socket.IO horizontal scale uses Redis adapter and sticky sessions.
- Secrets are injected through secret manager, not image layers.

## Environment variables

Required:

- `NODE_ENV=production`
- `PORT`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGINS`
- `MESSAGE_MAX_LENGTH=1000`
- `MESSAGE_MAX_PER_WINDOW`
- `MESSAGE_WINDOW_SECONDS`
- `REPORT_MAX_PER_WINDOW`
- `REPORT_WINDOW_SECONDS`
- `QUEUE_MAX_PER_WINDOW`
- `QUEUE_WINDOW_SECONDS`
- `TURN_REALM`
- `TURN_STATIC_AUTH_SECRET` or managed TURN credentials

## Backend deployment steps

1. Build image from `backend/Dockerfile`.
2. Run Prisma migration job:
   `npm run prisma:deploy`.
3. Start API container.
4. Verify `/health`.
5. Verify Socket.IO WSS connection.
6. Verify structured logs include request IDs.
7. Verify CORS only allows intended app/web origins.

## TURN

- Do not ship static TURN usernames/passwords in mobile builds.
- Prefer REST TURN auth with HMAC short-lived credentials.
- Rotate TURN auth secret periodically.
- Monitor relay bandwidth and abuse.

## Observability

- JSON logs to cloud logging.
- Metrics-ready counters:
  - anonymous accounts created
  - sockets authenticated
  - queue joins
  - matches created
  - voice sessions ended by reason
  - friend adds pending/created
  - messages sent/rejected
  - reports submitted
  - blocks created
  - rate-limit rejections
- Alerts:
  - high report rate
  - high socket auth failures
  - DB/Redis health failures
  - TURN bandwidth spike
  - queue wait time spike

## Data and privacy

- No exact location collection.
- No real-name/phone requirement.
- No audio recording in MVP.
- Define retention for reports, messages, and deleted users.
- Add data export/deletion process before public launch.
- Update privacy policy and terms.

## App store readiness

- Safety policy and moderation contact.
- Age rating aligned with random live voice interactions.
- Blocking/reporting visible and functional.
- Community rules shown before first use.
- Microphone permission copy explains audio chat.
- No video/images/files in MVP.
