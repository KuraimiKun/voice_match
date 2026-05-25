# Local Setup

## Requirements

- Windows 10/11 with PowerShell
- Docker Desktop
- Node.js 20+
- Flutter SDK with Android toolchain
- Android emulator or Android phone

## Environment files

`backend/.env` is local-only and gitignored. Use host-local service ports:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://app:app_password@localhost:15432/random_voice_social?schema=public
REDIS_URL=redis://localhost:56379
JWT_SECRET=local_dev_secret_change_me_32_plus_chars
```

When using the optional Docker backend profile, Docker Compose overrides backend container values to use Docker-network hosts:

```env
DATABASE_URL=postgresql://app:app_password@postgres:5432/random_voice_social?schema=public
REDIS_URL=redis://redis:6379
```

## Start infrastructure

```powershell
cd F:\project
docker compose config --quiet
docker compose up -d postgres redis
docker compose ps
```

Expected host ports:
- PostgreSQL `localhost:15432`
- Redis `localhost:56379`

## Backend

```powershell
cd F:\project\backend
npm install
npx prisma generate
npx prisma validate
npx prisma migrate dev --name init
npx tsc --noEmit
npm test -- --runInBand
npm run build
npm run start
```

Validate with backend running:

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/health
npm run test:socket
```

## Flutter Android

```powershell
cd F:\project\mobile
flutter pub get
dart analyze
flutter test
flutter run
```

Android emulator uses `http://10.0.2.2:3000` by default.

Physical phone:

```powershell
ipconfig
flutter run --dart-define=API_BASE_URL=http://192.168.x.x:3000 --dart-define=SOCKET_URL=http://192.168.x.x:3000
```
