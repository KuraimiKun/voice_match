import 'package:go_router/go_router.dart';
import '../features/auth/presentation/splash_screen.dart';
import '../features/rules/presentation/rules_screen.dart';
import '../features/voice_chat/presentation/home_screen.dart';
import '../features/voice_chat/presentation/voice_chat_screen.dart';
import '../features/friends/presentation/friends_inbox_screen.dart';
import '../features/chat/presentation/chat_screen.dart';
import '../features/reports/presentation/report_screen.dart';
import '../features/blocks/presentation/blocked_users_screen.dart';
import '../features/settings/presentation/settings_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (_, __) => const SplashScreen()),
    GoRoute(path: '/rules', builder: (_, __) => const RulesScreen()),
    GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
    GoRoute(path: '/voice', builder: (_, __) => const VoiceChatScreen()),
    GoRoute(path: '/friends', builder: (_, __) => const FriendsInboxScreen()),
    GoRoute(path: '/chat/:roomId', builder: (_, state) => ChatScreen(roomId: state.pathParameters['roomId']!)),
    GoRoute(path: '/report', builder: (_, __) => const ReportScreen()),
    GoRoute(path: '/blocked', builder: (_, __) => const BlockedUsersScreen()),
    GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
  ],
);
