import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/widgets/primary_button.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Random Voice Social'), actions: [IconButton(onPressed: () => context.push('/settings'), icon: const Icon(Icons.settings))]),
    body: Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
      PrimaryButton(label: 'Start random voice chat', onPressed: () => context.push('/voice')),
      TextButton(onPressed: () => context.push('/friends'), child: const Text('Friend inbox')),
      TextButton(onPressed: () => context.push('/blocked'), child: const Text('Blocked users')),
    ])),
  );
}
