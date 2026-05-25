class AnonymousAuthResponse {
  AnonymousAuthResponse({required this.token, required this.userId, required this.anonymousHandle});
  final String token;
  final String userId;
  final String anonymousHandle;
  factory AnonymousAuthResponse.fromJson(Map<String, dynamic> json) => AnonymousAuthResponse(
    token: json['token'] as String,
    userId: (json['user'] as Map<String, dynamic>)['id'] as String,
    anonymousHandle: (json['user'] as Map<String, dynamic>)['anonymousHandle'] as String,
  );
}
