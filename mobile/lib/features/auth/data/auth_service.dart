import '../../../core/network/api_client.dart';
import '../../../core/storage/local_storage_service.dart';
import '../../../shared/models/auth_models.dart';

class AuthService {
  AuthService(this._api, this._storage);
  final ApiClient _api;
  final LocalStorageService _storage;

  Future<AnonymousAuthResponse> bootstrap() async {
    final existing = await _storage.getToken();
    if (existing != null) {
      final me = await _api.dio.get<Map<String, dynamic>>('/me');
      final user = me.data!['user'] as Map<String, dynamic>;
      return AnonymousAuthResponse(token: existing, userId: user['id'] as String, anonymousHandle: user['anonymousHandle'] as String);
    }
    final installationId = await _storage.installationId();
    final res = await _api.dio.post<Map<String, dynamic>>('/auth/anonymous', data: {'installationId': installationId, 'platform': 'UNKNOWN'});
    final auth = AnonymousAuthResponse.fromJson(res.data!);
    await _storage.setToken(auth.token);
    return auth;
  }
}
