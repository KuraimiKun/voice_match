class ChatRoomSummary {
  ChatRoomSummary({required this.id, required this.peerUserId});
  final String id;
  final String peerUserId;
  factory ChatRoomSummary.fromJson(Map<String, dynamic> json) => ChatRoomSummary(id: json['id'] as String, peerUserId: json['peerUserId'] as String);
}

class ChatMessage {
  ChatMessage({required this.id, required this.roomId, required this.senderId, required this.body, required this.createdAt});
  final String id;
  final String roomId;
  final String senderId;
  final String body;
  final DateTime createdAt;
  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
    id: json['id'] as String,
    roomId: json['roomId'] as String,
    senderId: json['senderId'] as String,
    body: json['body'] as String,
    createdAt: DateTime.parse(json['createdAt'] as String),
  );
}
