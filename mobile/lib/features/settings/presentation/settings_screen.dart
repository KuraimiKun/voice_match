import 'package:flutter/material.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Settings')),
    body: const Padding(padding: EdgeInsets.all(24), child: Text('MVP settings: community rules, safety resources, and future push notification preferences.')),
  );
}
