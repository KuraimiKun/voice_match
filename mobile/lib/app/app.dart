import 'package:flutter/material.dart';
import 'router.dart';
import 'theme.dart';

class RandomVoiceSocialApp extends StatelessWidget {
  const RandomVoiceSocialApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Random Voice Social',
      theme: buildAppTheme(),
      routerConfig: appRouter,
      debugShowCheckedModeBanner: false,
    );
  }
}
