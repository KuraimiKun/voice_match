import 'package:flutter/material.dart';

ThemeData buildAppTheme() {
  const seed = Color(0xFF3E6AE1);
  return ThemeData(
    colorScheme: ColorScheme.fromSeed(seedColor: seed, brightness: Brightness.dark),
    useMaterial3: true,
    scaffoldBackgroundColor: const Color(0xFF10131A),
    appBarTheme: const AppBarTheme(centerTitle: true),
  );
}
