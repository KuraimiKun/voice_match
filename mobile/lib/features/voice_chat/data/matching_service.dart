import '../../../core/constants/socket_events.dart';
import 'socket_service.dart';

class MatchingService {
  MatchingService(this._socket);
  final SocketService _socket;
  Future<void> start() async { await _socket.connectAndAuthenticate(); _socket.emit(SocketEvents.joinQueue); }
  void stop() => _socket.emit(SocketEvents.stopSearching);
  void skip(String voiceSessionId) => _socket.emit(SocketEvents.skip, {'voiceSessionId': voiceSessionId});
  void end(String voiceSessionId) => _socket.emit(SocketEvents.endCall, {'voiceSessionId': voiceSessionId});
}
