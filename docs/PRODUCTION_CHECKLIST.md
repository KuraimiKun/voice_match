# Production Checklist

## Runtime services

- [ ] Flutter app built and signed for Android/iOS.
- [ ] Backend container built from `backend/Dockerfile`.
- [ ] PostgreSQL is managed or backed up and reachable only from backend network.
- [ ] Redis is managed or network-isolated.
- [ ] Coturn or managed TURN is configured for WebRTC NAT traversal.
- [ ] HTTPS and WSS terminate at a reverse proxy or cloud load balancer.

## Environment variables

Host-local development uses `localhost:15432` and `localhost:56379`.
Docker-internal backend uses service names:

```env
DATABASE_URL=postgresql://app:app_password@postgres:5432/random_voice_social?schema=public
REDIS_URL=redis://redis:6379
```

Production must set:

- `NODE_ENV=production`
- `PORT`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGINS`
- `MESSAGE_MAX_LENGTH`
- rate limit windows and maxes
- TURN realm/secret or managed TURN configuration

## Deployment gates

- [ ] `npx prisma migrate deploy` succeeds.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm test -- --runInBand` passes.
- [ ] `npm run build` passes.
- [ ] Flutter `dart analyze` passes.
- [ ] Flutter tests pass.
- [ ] Socket smoke test passes against staging.
- [ ] Health endpoint reports API/database/Redis healthy.
- [ ] Logs include request IDs and structured errors.
- [ ] Rollback plan is documented.

## Not in MVP

Do not enable video, image sharing, file sharing, public rooms, discovery, public profiles, exact location, or real-name identity until a separate safety and privacy review is complete.
