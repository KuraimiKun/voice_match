import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/providers.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});
  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() { super.initState(); _bootstrap(); }
  Future<void> _bootstrap() async {
    await ref.read(authServiceProvider).bootstrap();
    final accepted = await ref.read(localStorageProvider).rulesAccepted();
    if (!mounted) return;
    context.go(accepted ? '/home' : '/rules');
  }
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: CircularProgressIndicator()));
}
