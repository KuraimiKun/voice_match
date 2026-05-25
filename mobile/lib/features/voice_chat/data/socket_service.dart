import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../../../core/config/app_config.dart';
import '../../../core/constants/socket_events.dart';
import '../../../core/storage/local_storage_service.dart';

class SocketService {
  SocketService(this._storage);
  final LocalStorageService _storage;
  io.Socket? _socket;

  io.Socket get socket {
    final value = _socket;
    if (value == null) throw StateError('Socket not connected');
    return value;
  }

  Future<void> connectAndAuthenticate() async {
    if (_socket?.connected ?? false) return;
    final token = await _storage.getToken();
    final completer = Completer<void>();
    final s = io.io(AppConfig.socketUrl, io.OptionBuilder().setTransports(['websocket']).disableAutoConnect().build());
    _socket = s;
    s.onConnect((_) => s.emit(SocketEvents.socketAuthenticate, {'token': token}));
    s.on(SocketEvents.socketAuthenticated, (_) { if (!completer.isCompleted) completer.complete(); });
    s.on(SocketEvents.socketAuthError, (data) { if (!completer.isCompleted) completer.completeError(StateError('socket auth failed: $data')); });
    s.connect();
    return completer.future.timeout(const Duration(seconds: 10));
  }

  void emit(String event, [dynamic data]) => socket.emit(event, data);
  void on(String event, Function(dynamic) handler) => socket.on(event, handler);
  void off(String event) => socket.off(event);
  void disconnect() => _socket?.disconnect();
}
