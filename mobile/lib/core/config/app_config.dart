class AppConfig {
  static const apiBaseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: 'http://localhost:3000');
  static const socketUrl = String.fromEnvironment('SOCKET_URL', defaultValue: 'http://localhost:3000');
  static const messageMaxLength = 1000;
}
