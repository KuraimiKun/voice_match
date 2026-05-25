export const SocketEvents = {
  socketAuthenticate: 'socket_authenticate', socketAuthenticated: 'socket_authenticated', socketAuthError: 'socket_auth_error',
  joinQueue: 'join_queue', waiting: 'waiting', matched: 'matched', stopSearching: 'stop_searching', skip: 'skip', partnerLeft: 'partner_left',
  offer: 'offer', answer: 'answer', iceCandidate: 'ice_candidate',
  friendAddCurrentPartner: 'friend_add_current_partner', friendAddPending: 'friend_add_pending', friendshipCreated: 'friendship_created', friendRoomsLoad: 'friend_rooms_load', friendRooms: 'friend_rooms',
  joinChatRoom: 'join_chat_room', chatHistory: 'chat_history', chatMessageSend: 'chat_message_send', chatMessageNew: 'chat_message_new', typingStart: 'typing_start', typingStop: 'typing_stop', leaveChatRoom: 'leave_chat_room',
  reportUser: 'report_user', reportMessage: 'report_message', blockUser: 'block_user', userBlocked: 'user_blocked', errorMessage: 'error_message', endCall: 'end_call',
} as const;
