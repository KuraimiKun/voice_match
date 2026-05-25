# Random Voice Social App

Production-grade full-stack blueprint and implementation scaffold for an anonymous random audio-only voice chat platform with mutual-friend private chat rooms.

This project intentionally does not copy Omegle branding, UI, colors, name, logo, or protected product identity. MVP scope is anonymous audio-only random matching, safety controls, mutual-friend unlocking, and private text rooms.

## Monorepo layout

```text
backend/   NestJS + TypeScript + Prisma + PostgreSQL + Redis + Socket.IO
mobile/    Flutter + Riverpod + WebRTC + Socket.IO client
docs/      Architecture, setup, deployment, testing, security, roadmaps
```

## MVP guarantees

- Persistent anonymous user account, no names, phone numbers, public profiles, exact location, image/file upload, video, or public rooms.
- Random 1-to-1 audio-only voice sessions.
- Socket.IO is used only for signaling, matching, and chat events; raw audio flows peer-to-peer over WebRTC.
- Add friend uses `voiceSessionId`; clients cannot choose arbitrary target user IDs.
- One-sided friend add creates `FriendAdd`; mutual adds create `Friendship` and exactly one `ChatRoom`.
- Chat messages are allowed only in server-validated mutual-friend rooms.
- Blocks prevent future matching and messaging.
- Reports are stored for moderation review.
- Redis backs presence, queues, and rate limits.
- PostgreSQL stores permanent records.

## Quick start

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

Then in another terminal:

```bash
cd backend
npm install
npm run prisma:migrate
npm run start:dev
```

For Flutter:

```bash
cd mobile
flutter pub get
flutter run --dart-define=API_BASE_URL=http://localhost:3000 --dart-define=SOCKET_URL=http://localhost:3000
```

See `docs/SETUP.md` for complete setup and verification steps.
