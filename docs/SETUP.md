# Local Setup Instructions

## Prerequisites

- Docker and Docker Compose
- Node.js 20+
- npm 10+
- Flutter 3.19+ with Android/iOS tooling
- A physical device is recommended for microphone/WebRTC testing

## 1. Configure backend environment

```bash
cp backend/.env.example backend/.env
```

For local Docker Compose, use:

```env
DATABASE_URL=postgresql://app:app_password@postgres:5432/random_voice_social?schema=public
REDIS_URL=redis://redis:6379
JWT_SECRET=replace-with-a-long-random-local-secret
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

For running NestJS directly on host while DB/Redis are in Docker, use `localhost` hostnames:

```env
DATABASE_URL=postgresql://app:app_password@localhost:5432/random_voice_social?schema=public
REDIS_URL=redis://localhost:6379
```

## 2. Start infrastructure

```bash
docker compose up -d postgres redis
```

Optional local TURN:

```bash
docker compose --profile turn up -d coturn
```

## 3. Install backend dependencies and migrate DB

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

Check health:

```bash
curl http://localhost:3000/health
```

Expected:

```json
{"ok":true,"service":"random-voice-social-backend","time":"..."}
```

## 4. Run mobile app

```bash
cd mobile
flutter pub get
flutter run --dart-define=API_BASE_URL=http://localhost:3000 --dart-define=SOCKET_URL=http://localhost:3000
```

For Android emulator, `localhost` from the emulator points to the emulator itself. Use:

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000 --dart-define=SOCKET_URL=http://10.0.2.2:3000
```

For a physical device, use your LAN IP and ensure firewall allows port 3000.

## 5. Manual happy-path verification

1. Start backend.
2. Launch app on two devices/simulators.
3. Accept rules and age gate on both.
4. Tap Start on both.
5. Grant microphone permission.
6. Confirm both reach matched state.
7. Confirm WebRTC audio connects.
8. User A taps Add friend: app shows pending.
9. User B taps Add friend: both receive friendship created and private chat unlocks.
10. Send text message in room and verify real-time delivery.
11. Block peer and verify future matching/messaging is prevented.
12. Report peer and verify row appears in `Report` table.

## 6. Useful DB commands

```bash
cd backend
npm run prisma:studio
```

## 7. Reset local state

```bash
docker compose down -v
```
