# Manual E2E Test - Random Voice Social App

This guide is for Windows PowerShell local testing with Android emulator and/or a physical Android phone.

## 1. Start Docker Desktop

Open Docker Desktop from the Start menu, or run:

```powershell
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
docker info
```

Wait until `docker info` succeeds.

## 2. Start PostgreSQL and Redis

```powershell
cd F:\project
docker compose config --quiet
docker compose up -d postgres redis
docker compose ps
```

Expected ports:
- PostgreSQL: `localhost:15432` -> container `5432`
- Redis: `localhost:56379` -> container `6379`

Expected status:
- `project-postgres-1` is healthy
- `project-redis-1` is healthy

## 3. Run Prisma migration

```powershell
cd F:\project\backend
npm install
npx prisma generate
npx prisma validate
npx prisma migrate dev --name init
```

If the migration already exists, Prisma should report that the database is in sync. Do not delete local data unless you intentionally want a clean dev reset.

## 4. Start backend locally

Host-local backend development uses `backend\.env`:

```env
DATABASE_URL=postgresql://app:app_password@localhost:15432/random_voice_social?schema=public
REDIS_URL=redis://localhost:56379
```

Start the backend:

```powershell
cd F:\project\backend
npm run build
npm run start
```

Expected: backend listens on `http://localhost:3000`.

## 5. Validate REST auth and health

Open a second PowerShell window:

```powershell
$body = @{
  installationId = "local-device-a"
  platform = "ANDROID"
  appVersion = "0.1.0"
} | ConvertTo-Json

$res = Invoke-RestMethod -Method Post -Uri http://localhost:3000/auth/anonymous -ContentType "application/json" -Body $body
$res

$token = $res.token
Invoke-RestMethod -Method Get -Uri http://localhost:3000/me -Headers @{ Authorization = "Bearer $token" }

Invoke-RestMethod -Method Get -Uri http://localhost:3000/health
```

Expected:
- `/auth/anonymous` returns `token`, `user`, and `deviceSessionId`.
- `/me` returns the same anonymous user with a Bearer token.
- `/health` returns `ok: true` and healthy API/database/Redis checks.

## 6. Run backend socket smoke test

Keep backend running, then in a second PowerShell:

```powershell
cd F:\project\backend
npm run test:socket
```

Expected:
- unauthenticated queue join is rejected
- two sockets authenticate
- both receive `matched`
- fake offer is relayed to partner only
- mutual friend add creates one chat room
- chat message is delivered
- block prevents further chat messages

## 7. Android emulator setup

Start an Android emulator from Android Studio Device Manager, then:

```powershell
cd F:\project\mobile
flutter pub get
dart analyze
flutter test
flutter run
```

The default mobile config is emulator-ready:

```text
API_BASE_URL=http://10.0.2.2:3000
SOCKET_URL=http://10.0.2.2:3000
```

## 8. Physical Android phone setup

Phone and PC must be on the same Wi-Fi.

Find the PC IPv4 address:

```powershell
ipconfig
```

Look for the active Wi-Fi or Ethernet adapter IPv4, for example `192.168.1.25`.

Allow backend port 3000 through Windows Firewall if needed:

```powershell
New-NetFirewallRule -DisplayName "Random Voice Social Backend 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

Run the app on the phone with dart defines:

```powershell
cd F:\project\mobile
flutter run --dart-define=API_BASE_URL=http://192.168.x.x:3000 --dart-define=SOCKET_URL=http://192.168.x.x:3000
```

Replace `192.168.x.x` with the PC IPv4 address.

## 9. Two-device local test flow

Use either two emulators, emulator + physical phone, or two physical phones.

1. User A creates anonymous account.
2. User B creates anonymous account.
3. User A joins queue.
4. User B joins queue.
5. Both users receive matched.
6. WebRTC audio-only call starts.
7. User A mutes.
8. User A unmutes.
9. User A ends or skips.
10. Users can match again if not blocked.
11. User A adds friend.
12. User B adds friend.
13. One Friendship is created.
14. One ChatRoom is created.
15. Friend inbox shows chat room.
16. User A sends message.
17. User B receives message.
18. User B replies.
19. User A receives reply.
20. User A blocks User B.
21. Chat messages stop.
22. Future matching between the two users is blocked.

## 10. Troubleshooting

### Docker port conflict

Check port usage:

```powershell
netstat -ano | findstr ":15432"
netstat -ano | findstr ":56379"
```

This project intentionally avoids common ERP ports by using `15432` and `56379` on the host.

### Prisma generate EPERM on Windows

If `npx prisma generate` fails renaming `query_engine-windows.dll.node`, stop any running backend process first:

```powershell
netstat -ano | findstr ":3000"
Stop-Process -Id <PID> -Force
npx prisma generate
```

### Emulator cannot reach backend

Use `10.0.2.2`, not `localhost`, from Android emulator.

### Phone cannot reach backend

Use the PC LAN IP with `--dart-define`, verify both devices are on the same Wi-Fi, and allow firewall port 3000.

### WebRTC connects locally but not across networks

For MVP local testing, STUN may be enough. Production needs Coturn or managed TURN with short-lived credentials.
