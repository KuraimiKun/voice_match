import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/socket_events.dart';
import '../../../shared/providers.dart';

class VoiceChatScreen extends ConsumerStatefulWidget {
  const VoiceChatScreen({super.key});

  @override
  ConsumerState<VoiceChatScreen> createState() => _VoiceChatScreenState();
}

class _VoiceChatScreenState extends ConsumerState<VoiceChatScreen> {
  String _status = 'Preparing microphone...';
  String? _voiceSessionId;
  bool _muted = false;
  bool _cleanedUp = false;

  @override
  void initState() {
    super.initState();
    _start();
  }

  Future<void> _start() async {
    final socket = ref.read(socketServiceProvider);
    final call = ref.read(voiceCallServiceProvider);
    await socket.connectAndAuthenticate();

    socket.on(SocketEvents.waiting, (_) {
      if (mounted) setState(() => _status = 'Waiting for a voice partner...');
    });

    socket.on(SocketEvents.matched, (data) async {
      final m = Map<String, dynamic>.from(data as Map);
      _voiceSessionId = m['voiceSessionId'] as String;
      _cleanedUp = false;
      if (mounted) setState(() => _status = 'Matched. Connecting audio...');
      await call.createPeer(
        onIceCandidate: (c) => socket.emit(SocketEvents.iceCandidate, {
          'voiceSessionId': _voiceSessionId,
          'payload': c.toMap(),
        }),
      );
      if (m['initiator'] == true) {
        final offer = await call.createOffer();
        socket.emit(SocketEvents.offer, {'voiceSessionId': _voiceSessionId, 'payload': offer.toMap()});
      }
    });

    socket.on(SocketEvents.offer, (data) async {
      final m = Map<String, dynamic>.from(data as Map);
      final sdp = Map<String, dynamic>.from(m['sdp'] as Map);
      _voiceSessionId ??= m['voiceSessionId'] as String?;
      final answer = await call.createAnswer(RTCSessionDescription(sdp['sdp'] as String, sdp['type'] as String));
      socket.emit(SocketEvents.answer, {'voiceSessionId': _voiceSessionId, 'payload': answer.toMap()});
      if (mounted) setState(() => _status = 'Connected');
    });

    socket.on(SocketEvents.answer, (data) async {
      final sdp = Map<String, dynamic>.from((data as Map)['sdp'] as Map);
      await call.acceptAnswer(RTCSessionDescription(sdp['sdp'] as String, sdp['type'] as String));
      if (mounted) setState(() => _status = 'Connected');
    });

    socket.on(SocketEvents.iceCandidate, (data) async {
      final c = Map<String, dynamic>.from((data as Map)['candidate'] as Map);
      await call.addIceCandidate(RTCIceCandidate(c['candidate'] as String?, c['sdpMid'] as String?, c['sdpMLineIndex'] as int?));
    });

    socket.on(SocketEvents.partnerLeft, (_) async {
      await _cleanup();
      if (mounted) setState(() => _status = 'Partner left');
    });

    socket.on(SocketEvents.friendAddPending, (_) {
      if (mounted) setState(() => _status = 'Friend request pending. If they add you too, chat unlocks.');
    });

    socket.on(SocketEvents.friendshipCreated, (data) {
      final roomId = (data as Map)['chatRoom']['id'] as String;
      if (mounted) context.push('/chat/$roomId');
    });

    ref.read(matchingServiceProvider).start();
  }

  Future<void> _cleanup() async {
    if (_cleanedUp) return;
    _cleanedUp = true;
    await ref.read(voiceCallServiceProvider).dispose();
  }

  @override
  void dispose() {
    final socket = ref.read(socketServiceProvider);
    for (final event in [
      SocketEvents.waiting,
      SocketEvents.matched,
      SocketEvents.offer,
      SocketEvents.answer,
      SocketEvents.iceCandidate,
      SocketEvents.partnerLeft,
      SocketEvents.friendAddPending,
      SocketEvents.friendshipCreated,
    ]) {
      socket.off(event);
    }
    _cleanup();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Voice chat')),
    body: Padding(
      padding: const EdgeInsets.all(24),
      child: Column(children: [
        Text(_status, textAlign: TextAlign.center),
        const Spacer(),
        Wrap(spacing: 12, runSpacing: 12, alignment: WrapAlignment.center, children: [
          FilledButton.tonal(
            onPressed: () {
              _muted = !_muted;
              ref.read(voiceCallServiceProvider).setMuted(_muted);
              setState(() {});
            },
            child: Text(_muted ? 'Unmute' : 'Mute'),
          ),
          FilledButton.tonal(
            onPressed: _voiceSessionId == null ? null : () => ref.read(friendshipServiceProvider).addCurrentPartner(_voiceSessionId!),
            child: const Text('Add friend'),
          ),
          FilledButton.tonal(
            onPressed: _voiceSessionId == null
                ? null
                : () async {
                    ref.read(matchingServiceProvider).skip(_voiceSessionId!);
                    await _cleanup();
                  },
            child: const Text('Skip'),
          ),
          FilledButton.tonal(
            onPressed: _voiceSessionId == null
                ? null
                : () => ref.read(reportServiceProvider).reportUserInCall(voiceSessionId: _voiceSessionId!, reason: 'OTHER'),
            child: const Text('Report'),
          ),
          FilledButton.tonal(
            onPressed: _voiceSessionId == null
                ? null
                : () async {
                    ref.read(blockServiceProvider).blockFromSocket(voiceSessionId: _voiceSessionId);
                    await _cleanup();
                  },
            child: const Text('Block'),
          ),
          FilledButton(
            onPressed: () async {
              if (_voiceSessionId != null) ref.read(matchingServiceProvider).end(_voiceSessionId!);
              await _cleanup();
              if (context.mounted) context.pop();
            },
            child: const Text('End'),
          ),
        ]),
      ]),
    ),
  );
}
