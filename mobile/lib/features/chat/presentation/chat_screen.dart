import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/socket_events.dart';
import '../../../shared/models/chat_models.dart';
import '../../../shared/providers.dart';

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key, required this.roomId});
  final String roomId;
  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}
class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _controller = TextEditingController();
  final List<ChatMessage> _messages = [];
  bool _typing = false;
  @override
  void initState() { super.initState(); _init(); }
  Future<void> _init() async {
    await ref.read(socketServiceProvider).connectAndAuthenticate();
    _messages.addAll(await ref.read(chatServiceProvider).history(widget.roomId));
    final socket = ref.read(socketServiceProvider);
    socket.on(SocketEvents.chatMessageNew, (data) { final m = ChatMessage.fromJson(Map<String, dynamic>.from((data as Map)['message'] as Map)); if (m.roomId == widget.roomId) setState(() => _messages.add(m)); });
    socket.on(SocketEvents.typingStart, (_) => setState(() => _typing = true));
    socket.on(SocketEvents.typingStop, (_) => setState(() => _typing = false));
    ref.read(chatServiceProvider).joinRoom(widget.roomId);
    setState(() {});
  }
  @override
  void dispose() { ref.read(chatServiceProvider).leaveRoom(widget.roomId); _controller.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Private chat'), actions: [IconButton(onPressed: () {}, icon: const Icon(Icons.block))]),
    body: Column(children: [
      Expanded(child: ListView.builder(itemCount: _messages.length, itemBuilder: (_, i) => ListTile(title: Text(_messages[i].body), subtitle: Text(_messages[i].createdAt.toLocal().toString())))),
      if (_typing) const Padding(padding: EdgeInsets.all(8), child: Text('Friend is typing...')),
      SafeArea(child: Padding(padding: const EdgeInsets.all(8), child: Row(children: [
        Expanded(child: TextField(controller: _controller, maxLength: 1000, onChanged: (_) => ref.read(chatServiceProvider).typingStart(widget.roomId), decoration: const InputDecoration(hintText: 'Message'))),
        IconButton(icon: const Icon(Icons.send), onPressed: () { ref.read(chatServiceProvider).send(widget.roomId, _controller.text); _controller.clear(); ref.read(chatServiceProvider).typingStop(widget.roomId); }),
      ]))),
    ]),
  );
}
