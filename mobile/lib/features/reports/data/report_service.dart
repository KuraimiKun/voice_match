import '../../../core/network/api_client.dart';
import '../../../core/constants/socket_events.dart';
import '../../voice_chat/data/socket_service.dart';

class ReportService {
  ReportService(this._api, this._socket);
  final ApiClient _api;
  final SocketService _socket;

  Future<void> reportViaRest(Map<String, dynamic> body) async => _api.dio.post('/reports', data: body);
  void reportUserInCall({required String voiceSessionId, required String reason, String? details}) => _socket.emit(SocketEvents.reportUser, {'voiceSessionId': voiceSessionId, 'reason': reason, 'details': details});
  void reportMessage({required String messageId, required String reason, String? details}) => _socket.emit(SocketEvents.reportMessage, {'messageId': messageId, 'reason': reason, 'details': details});
}
