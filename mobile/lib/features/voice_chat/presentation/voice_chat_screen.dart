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
  String? _peerUserId;
  bool _muted = false;

  @override
  void initState() { super.initState(); _start(); }

  Future<void> _start() async {
    final socket = ref.read(socketServiceProvider);
    final call = ref.read(voiceCallServiceProvider);
    await socket.connectAndAuthenticate();
    socket.on(SocketEvents.waiting, (_) => setState(() => _status = 'Waiting for a voice partner...'));
    socket.on(SocketEvents.matched, (data) async {
      final m = Map<String, dynamic>.from(data as Map);
      _voiceSessionId = m['voiceSessionId'] as String;
      _peerUserId = m['peerUserId'] as String;
      setState(() => _status = 'Matched. Connecting audio...');
      await call.createPeer(onIceCandidate: (c) => socket.emit(SocketEvents.iceCandidate, {'voiceSessionId': _voiceSessionId, 'candidate': c.toMap()}));
      if (m['initiator'] == true) {
        final offer = await call.createOffer();
        socket.emit(SocketEvents.offer, {'voiceSessionId': _voiceSessionId, 'sdp': offer.toMap()});
      }
    });
    socket.on(SocketEvents.offer, (data) async {
      final m = Map<String, dynamic>.from(data as Map);
      final sdp = Map<String, dynamic>.from(m['sdp'] as Map);
      final answer = await call.createAnswer(RTCSessionDescription(sdp['sdp'] as String, sdp['type'] as String));
      socket.emit(SocketEvents.answer, {'voiceSessionId': _voiceSessionId, 'sdp': answer.toMap()});
      setState(() => _status = 'Connected');
    });
    socket.on(SocketEvents.answer, (data) async {
      final sdp = Map<String, dynamic>.from((data as Map)['sdp'] as Map);
      await call.acceptAnswer(RTCSessionDescription(sdp['sdp'] as String, sdp['type'] as String));
      setState(() => _status = 'Connected');
    });
    socket.on(SocketEvents.iceCandidate, (data) async {
      final c = Map<String, dynamic>.from((data as Map)['candidate'] as Map);
      await call.addIceCandidate(RTCIceCandidate(c['candidate'] as String?, c['sdpMid'] as String?, c['sdpMLineIndex'] as int?));
    });
    socket.on(SocketEvents.partnerLeft, (_) async { await _cleanup(); if (mounted) setState(() => _status = 'Partner left'); });
    socket.on(SocketEvents.friendAddPending, (_) => setState(() => _status = 'Friend request pending. If they add you too, chat unlocks.'));
    socket.on(SocketEvents.friendshipCreated, (data) { final roomId = (data as Map)['chatRoom']['id'] as String; if (mounted) context.push('/chat/$roomId'); });
    ref.read(matchingServiceProvider).start();
  }

  Future<void> _cleanup() async { await ref.read(voiceCallServiceProvider).dispose(); }
  @override
  void dispose() { ref.read(socketServiceProvider).off(SocketEvents.waiting); ref.read(socketServiceProvider).off(SocketEvents.matched); _cleanup(); super.dispose(); }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Voice chat')),
    body: Padding(
      padding: const EdgeInsets.all(24),
      child: Column(children: [
        Text(_status, textAlign: TextAlign.center),
        const Spacer(),
        Wrap(spacing: 12, runSpacing: 12, alignment: WrapAlignment.center, children: [
          FilledButton.tonal(onPressed: () { _muted = !_muted; ref.read(voiceCallServiceProvider).setMuted(_muted); setState(() {}); }, child: Text(_muted ? 'Unmute' : 'Mute')),
          FilledButton.tonal(onPressed: _voiceSessionId == null ? null : () => ref.read(friendshipServiceProvider).addCurrentPartner(_voiceSessionId!), child: const Text('Add friend')),
          FilledButton.tonal(onPressed: _voiceSessionId == null ? null : () => ref.read(matchingServiceProvider).skip(_voiceSessionId!), child: const Text('Skip')),
          FilledButton.tonal(onPressed: _peerUserId == null ? null : () => context.push('/report'), child: const Text('Report')),
          FilledButton.tonal(onPressed: _peerUserId == null ? null : () => ref.read(blockServiceProvider).blockFromSocket(_peerUserId!, voiceSessionId: _voiceSessionId), child: const Text('Block')),
          FilledButton(onPressed: () async { if (_voiceSessionId != null) ref.read(matchingServiceProvider).end(_voiceSessionId!); await _cleanup(); if (context.mounted) context.pop(); }, child: const Text('End')),
        ]),
      ]),
    ),
  );
}
