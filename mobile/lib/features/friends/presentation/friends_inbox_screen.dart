import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/models/chat_models.dart';
import '../../../shared/providers.dart';

class FriendsInboxScreen extends ConsumerStatefulWidget {
  const FriendsInboxScreen({super.key});
  @override
  ConsumerState<FriendsInboxScreen> createState() => _FriendsInboxScreenState();
}
class _FriendsInboxScreenState extends ConsumerState<FriendsInboxScreen> {
  late Future<List<ChatRoomSummary>> _future;
  @override
  void initState() { super.initState(); _future = ref.read(chatServiceProvider).rooms(); }
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Friend inbox')),
    body: FutureBuilder<List<ChatRoomSummary>>(
      future: _future,
      builder: (context, snapshot) {
        final rooms = snapshot.data ?? [];
        if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
        if (rooms.isEmpty) return const Center(child: Text('No mutual-friend rooms yet.'));
        return ListView.builder(itemCount: rooms.length, itemBuilder: (_, i) => ListTile(title: Text('Friend ${rooms[i].peerUserId.substring(0, 8)}'), subtitle: const Text('Private room unlocked'), onTap: () => context.push('/chat/${rooms[i].id}')));
      },
    ),
  );
}
