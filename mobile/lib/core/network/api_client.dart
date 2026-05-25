import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../storage/local_storage_service.dart';

class ApiClient {
  ApiClient(this._storage)
      : dio = Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl, connectTimeout: const Duration(seconds: 10), receiveTimeout: const Duration(seconds: 10))) {
    dio.interceptors.add(InterceptorsWrapper(onRequest: (options, handler) async {
      final token = await _storage.getToken();
      if (token != null) options.headers['Authorization'] = 'Bearer $token';
      handler.next(options);
    }));
  }

  final LocalStorageService _storage;
  final Dio dio;
}
