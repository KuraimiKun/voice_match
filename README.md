# Random Voice Social App

Production-aligned MVP scaffold for an anonymous random audio-only voice chat app with mutual-friend private text chat rooms.

The project contains:
- Flutter mobile app using Riverpod-style services
- NestJS TypeScript backend
- PostgreSQL with Prisma
- Redis-backed presence, matching, and rate limits
- Socket.IO signaling and realtime chat
- WebRTC audio-only mobile calls
- Safety controls: age/rules screens, report, block, mutual friend gate

MVP exclusions: no video, no image/file sharing, no public rooms, no discovery, no real names, no public profiles, no exact location.

## Local quick start on Windows

Start infrastructure:

```powershell
# From repository root
docker compose up -d postgres redis
docker compose ps
```

Backend:

```powershell
cd backend
npm install
npx prisma generate
npx prisma validate
npx prisma migrate dev --name init
npx tsc --noEmit
npm test -- --runInBand
npm run build
npm run start
```

REST smoke test:

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/health
```

Socket smoke test, with backend running:

```powershell
cd backend
npm run test:socket
```

Flutter:

```powershell
cd mobile
flutter pub get
dart analyze
flutter test
flutter run
```

Android emulator defaults to `http://10.0.2.2:3000`. For a physical phone, pass the PC LAN IP:

```powershell
flutter run --dart-define=API_BASE_URL=http://192.168.x.x:3000 --dart-define=SOCKET_URL=http://192.168.x.x:3000
```

See:
- `docs/SETUP.md`
- `docs/MANUAL_E2E_TEST.md`
- `docs/TESTING_CHECKLIST.md`
- `docs/SECURITY_CHECKLIST.md`
- `docs/PRODUCTION_CHECKLIST.md`
