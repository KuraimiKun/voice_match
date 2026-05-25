import '../../../core/network/api_client.dart';
import '../../../core/constants/socket_events.dart';
import '../../voice_chat/data/socket_service.dart';

class BlockService {
  BlockService(this._api, this._socket);
  final ApiClient _api;
  final SocketService _socket;
  Future<void> blockViaRest(String targetUserId, {String? reason}) async => _api.dio.post('/blocks', data: {'targetUserId': targetUserId, 'reason': reason});
  void blockFromSocket(String targetUserId, {String? reason, String? voiceSessionId}) => _socket.emit(SocketEvents.blockUser, {'targetUserId': targetUserId, 'reason': reason, 'voiceSessionId': voiceSessionId});
}
