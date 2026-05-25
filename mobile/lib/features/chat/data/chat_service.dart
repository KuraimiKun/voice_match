import '../../../core/config/app_config.dart';
import '../../../core/constants/socket_events.dart';
import '../../../core/network/api_client.dart';
import '../../../shared/models/chat_models.dart';
import '../../voice_chat/data/socket_service.dart';

class ChatService {
  ChatService(this._api, this._socket);
  final ApiClient _api;
  final SocketService _socket;

  Future<List<ChatRoomSummary>> rooms() async {
    final res = await _api.dio.get<Map<String, dynamic>>('/chat-rooms');
    return ((res.data!['rooms'] as List<dynamic>)).map((e) => ChatRoomSummary.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<ChatMessage>> history(String roomId) async {
    final res = await _api.dio.get<Map<String, dynamic>>('/chat-rooms/$roomId/messages');
    return ((res.data!['messages'] as List<dynamic>)).map((e) => ChatMessage.fromJson(e as Map<String, dynamic>)).toList();
  }

  void joinRoom(String roomId) => _socket.emit(SocketEvents.joinChatRoom, {'roomId': roomId});
  void leaveRoom(String roomId) => _socket.emit(SocketEvents.leaveChatRoom, {'roomId': roomId});
  void send(String roomId, String body) {
    final trimmed = body.trim();
    if (trimmed.isEmpty || trimmed.length > AppConfig.messageMaxLength) return;
    _socket.emit(SocketEvents.chatMessageSend, {'roomId': roomId, 'body': trimmed});
  }
  void typingStart(String roomId) => _socket.emit(SocketEvents.typingStart, {'roomId': roomId});
  void typingStop(String roomId) => _socket.emit(SocketEvents.typingStop, {'roomId': roomId});
}
