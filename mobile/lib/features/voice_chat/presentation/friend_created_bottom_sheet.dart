import 'package:flutter/material.dart';

class FriendCreatedBottomSheet extends StatelessWidget {
  const FriendCreatedBottomSheet({super.key, required this.roomId});
  final String roomId;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.all(24),
    child: Column(mainAxisSize: MainAxisSize.min, children: [
      const Icon(Icons.check_circle, size: 48),
      const SizedBox(height: 12),
      const Text('Mutual friend! Private chat unlocked.'),
      FilledButton(onPressed: () => Navigator.of(context).pop(roomId), child: const Text('Open chat')),
    ]),
  );
}
