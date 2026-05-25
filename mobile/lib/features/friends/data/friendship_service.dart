import '../../../core/constants/socket_events.dart';
import '../../voice_chat/data/socket_service.dart';

class FriendshipService {
  FriendshipService(this._socket);
  final SocketService _socket;
  void addCurrentPartner(String voiceSessionId) => _socket.emit(SocketEvents.friendAddCurrentPartner, {'voiceSessionId': voiceSessionId});
  void loadFriendRooms() => _socket.emit(SocketEvents.friendRoomsLoad);
}
