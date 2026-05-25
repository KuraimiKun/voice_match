import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/providers.dart';
import '../../../shared/widgets/primary_button.dart';

class RulesScreen extends ConsumerWidget {
  const RulesScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Community rules')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('You must be old enough to use this app in your region. Be respectful. No harassment, sexual exploitation, hate, threats, scams, or illegal behavior. Voice chats are anonymous and temporary. Private text rooms unlock only after mutual friend adds.'),
          const Spacer(),
          PrimaryButton(label: 'I pass the age gate and accept', onPressed: () async { await ref.read(localStorageProvider).acceptRules(); if (context.mounted) context.go('/home'); }),
        ]),
      ),
    );
  }
}
