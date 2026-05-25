import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

class LocalStorageService {
  LocalStorageService(this._secureStorage);
  final FlutterSecureStorage _secureStorage;

  static const _tokenKey = 'auth_token';
  static const _installationIdKey = 'installation_id';
  static const _rulesAcceptedKey = 'rules_accepted';

  Future<String?> getToken() => _secureStorage.read(key: _tokenKey);
  Future<void> setToken(String token) => _secureStorage.write(key: _tokenKey, value: token);

  Future<String> installationId() async {
    final prefs = await SharedPreferences.getInstance();
    final existing = prefs.getString(_installationIdKey);
    if (existing != null) return existing;
    final id = const Uuid().v4();
    await prefs.setString(_installationIdKey, id);
    return id;
  }

  Future<bool> rulesAccepted() async => (await SharedPreferences.getInstance()).getBool(_rulesAcceptedKey) ?? false;
  Future<void> acceptRules() async => (await SharedPreferences.getInstance()).setBool(_rulesAcceptedKey, true);
}
