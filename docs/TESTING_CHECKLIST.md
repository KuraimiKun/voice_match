# Testing Checklist

## Automated local checks

Backend:

```powershell
cd F:\project\backend
npm install
npx prisma generate
npx prisma validate
npx prisma migrate dev --name init
npx tsc --noEmit
npm test -- --runInBand
npm run build
```

With backend running on port 3000:

```powershell
npm run test:socket
```

Flutter:

```powershell
cd F:\project\mobile
flutter pub get
dart analyze
flutter test
flutter build apk --debug
```

Docker:

```powershell
cd F:\project
docker compose config --quiet
docker compose up -d postgres redis
docker compose ps
```

## Latest local validation result

Test date: 2026-05-26 SEAST

Backend URL:
- Host validation: `http://localhost:3000`
- Emulator runtime: `http://10.0.2.2:3000`

Devices:
- Android emulator: Pixel 3a API 34, `emulator-5554`
- Physical Android phone: `138122553K024909`, blocked because ADB reported `unauthorized`

Passed:
- [x] Docker Compose config validation.
- [x] PostgreSQL and Redis local containers healthy.
- [x] Prisma generate/validate/migration previously passed.
- [x] Backend TypeScript compile, Jest tests, and build passed.
- [x] Backend `/health` returned healthy API/database/Redis checks.
- [x] Backend socket smoke test passed matching, signaling relay, mutual friend chat unlock, messaging, and block enforcement.
- [x] Flutter `pub get`, `dart analyze`, and `flutter test` passed.
- [x] Android debug APK built.
- [x] Android app installed and launched on emulator.

Blocked/not completed:
- [ ] Full human two-device UI E2E flow was not completed because only one Android target was authorized.
- [ ] Physical phone run blocked until the USB debugging/RSA authorization prompt is accepted.
- [ ] Live WebRTC microphone/audio behavior still needs real two-device verification.

Fixes made during latest validation:
- Updated `flutter_webrtc` to a current Android-compatible version after old plugin code failed on `PluginRegistry.Registrar`.
- Added Gradle/Kotlin local settings for more reliable Windows debug builds.

Remaining risks:
- Android phone connectivity may need Windows Firewall inbound TCP port 3000.
- WebRTC NAT traversal outside local testing requires TURN/Coturn or managed TURN.
- Real two-device manual flow should be completed before internal alpha.

## Manual MVP flow

- [ ] User A opens app.
- [ ] User B opens app.
- [ ] User A creates anonymous account.
- [ ] User B creates anonymous account.
- [ ] User A joins queue.
- [ ] User B joins queue.
- [ ] Both users receive `matched` with `voiceSessionId`, `partnerSocketId`, and `initiator`.
- [ ] WebRTC starts audio only; no video permission or track is requested.
- [ ] User A mutes and unmutes.
- [ ] User A ends or skips.
- [ ] Users can match again if neither has blocked the other.
- [ ] User A adds friend and sees pending state.
- [ ] User B adds friend.
- [ ] One Friendship is created.
- [ ] One ChatRoom is created.
- [ ] Friend inbox shows the chat room for both users.
- [ ] User A sends a text message.
- [ ] User B receives the message in realtime.
- [ ] User B replies.
- [ ] User A receives the reply in realtime.
- [ ] User A blocks User B.
- [ ] Chat messages stop after block.
- [ ] Future matching between those two users is blocked.

## Regression areas

- Socket authentication is required before queue/chat/signaling events.
- `friend_add_current_partner` uses `voiceSessionId`, not client supplied target user IDs.
- Chat room membership is validated server-side.
- Message body is sanitized, non-empty, and max 1,000 characters.
- Blocks are checked in matching and messaging.
- Reports are persisted for moderation review.
- Disconnect removes presence and queue state.
