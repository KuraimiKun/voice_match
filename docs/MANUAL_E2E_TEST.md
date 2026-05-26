# Manual E2E Test - Random Voice Social App

This guide is for Windows PowerShell local testing with Android emulator and/or a physical Android phone.

## Current local test result

Test date: 2026-05-26 SEAST

Devices attempted:
- Android emulator: Pixel 3a API 34, `emulator-5554`
- Physical Android phone: `138122553K024909`, blocked because ADB reported `unauthorized`

Backend URL used:
- Host checks: `http://localhost:3000`
- Emulator app default: `http://10.0.2.2:3000`
- Physical phone: not run; use `http://<PC-LAN-IP>:3000` after USB authorization and firewall setup

Passed:
- Docker Compose config validation.
- PostgreSQL and Redis local containers were healthy.
- Backend `/health` returned healthy API/database/Redis checks.
- Backend socket smoke test passed for auth, matching, signaling relay, mutual friend unlock, chat delivery, block acknowledgement, and post-block message rejection.
- Flutter `pub get`, `dart analyze`, and `flutter test` passed.
- Android debug APK built successfully.
- Android emulator installed and launched `com.example.random_voice_social_app/.MainActivity`.

Failed or blocked:
- Full two-device manual E2E was not completed in this agent-run because only one Android target was authorized.
- Physical phone was detected but unauthorized. Accept the USB debugging/RSA prompt on the phone, then re-run `adb devices` until it shows `device`.
- Initial Android build failed with old `flutter_webrtc` Android embedding compile errors. This was fixed by updating `flutter_webrtc` and using in-process Kotlin compilation for local Windows builds.

Fixes made:
- Updated `flutter_webrtc` to a current Android-compatible version.
- Added local Gradle/Kotlin stability settings for Windows debug builds.

Remaining risks:
- Real microphone permission, live WebRTC audio, and two-device UI interaction still need a human-driven two-device pass.
- Physical phone connectivity may require Windows Firewall inbound TCP port 3000 and correct PC LAN IP.
- Production WebRTC still requires TURN/Coturn or managed TURN with short-lived credentials.

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
npm run start
```

Health check:

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/health
```

Expected:
- `ok` is `true`
- `checks.api`, `checks.database`, and `checks.redis` are `healthy`

## 5. Validate anonymous auth REST flow

In another PowerShell:

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
flutter build apk --debug
flutter run
```

The default mobile config is emulator-ready:

```text
API_BASE_URL=http://10.0.2.2:3000
SOCKET_URL=http://10.0.2.2:3000
```

## 8. Physical Android phone setup

Phone and PC must be on the same Wi-Fi.

Before running on a USB-connected phone, authorize ADB:

```powershell
adb devices
```

If the device shows `unauthorized`, unlock the phone and accept the USB debugging/RSA prompt. Reconnect the cable or toggle USB debugging if the prompt does not appear. Continue only when `adb devices` shows `device`.

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

1. User A opens app.
2. User B opens app.
3. User A creates anonymous account.
4. User B creates anonymous account.
5. User A joins queue.
6. User B joins queue.
7. Both users receive matched.
8. WebRTC audio-only call starts.
9. User A mutes.
10. User A unmutes.
11. User A ends or skips.
12. Users can match again if not blocked.
13. User A adds friend.
14. User B adds friend.
15. One Friendship is created.
16. One ChatRoom is created.
17. Friend inbox shows chat room.
18. User A sends message.
19. User B receives message.
20. User B replies.
21. User A receives reply.
22. User A blocks User B.
23. Chat messages stop.
24. Future matching between the two users is blocked.

## 10. Troubleshooting

### Docker port conflict

Check port usage:

```powershell
netstat -ano | findstr ":15432"
netstat -ano | findstr ":56379"
```

This project intentionally avoids common ERP ports by using `15432` and `56379` on the host.

### Backend port 3000 already in use

Check the process:

```powershell
netstat -ano | findstr ":3000"
Invoke-RestMethod -Method Get -Uri http://localhost:3000/health
```

If `/health` is healthy, the backend may already be running. Do not start a second copy. If the process is stale, stop it:

```powershell
Stop-Process -Id <PID> -Force
```

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

### Android build fails on Flutter WebRTC Registrar

If the Android build fails with `PluginRegistry.Registrar` from `flutter_webrtc`, run:

```powershell
cd F:\project\mobile
flutter pub get
flutter build apk --debug
```

The project should use a current `flutter_webrtc` version compatible with the current Flutter Android embedding.

### Kotlin compile daemon does not connect on Windows

This project sets local Gradle properties to use in-process Kotlin compilation. If Gradle still hangs, stop daemons and retry:

```powershell
cd F:\project\mobile
.\android\gradlew --stop
flutter build apk --debug
```

### WebRTC connects locally but not across networks

For MVP local testing, STUN may be enough. Production needs Coturn or managed TURN with short-lived credentials.
