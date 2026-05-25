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
```

Docker:

```powershell
cd F:\project
docker compose config --quiet
docker compose up -d postgres redis
docker compose ps
```

## Manual MVP flow

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
