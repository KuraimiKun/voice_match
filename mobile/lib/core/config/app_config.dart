class AppConfig {
  // Android emulator default. Override with --dart-define for desktop or physical devices.
  static const apiBaseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: 'http://10.0.2.2:3000');
  static const socketUrl = String.fromEnvironment('SOCKET_URL', defaultValue: 'http://10.0.2.2:3000');
  static const messageMaxLength = 1000;
}
