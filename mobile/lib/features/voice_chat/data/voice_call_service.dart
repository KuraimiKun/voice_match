import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:permission_handler/permission_handler.dart';

class VoiceCallService {
  RTCPeerConnection? _peer;
  MediaStream? _localStream;

  Future<void> ensureMicPermission() async {
    final status = await Permission.microphone.request();
    if (!status.isGranted) throw StateError('microphone_permission_denied');
  }

  Future<RTCPeerConnection> createPeer({required void Function(RTCIceCandidate) onIceCandidate}) async {
    await ensureMicPermission();
    _localStream = await navigator.mediaDevices.getUserMedia({'audio': true, 'video': false});
    final peer = await createPeerConnection({
      'iceServers': [
        {'urls': 'stun:stun.l.google.com:19302'},
        // Production: fetch short-lived TURN credentials from backend instead of hardcoding.
      ]
    });
    for (final track in _localStream!.getAudioTracks()) {
      await peer.addTrack(track, _localStream!);
    }
    peer.onIceCandidate = (candidate) { if (candidate.candidate != null) onIceCandidate(candidate); };
    _peer = peer;
    return peer;
  }

  Future<RTCSessionDescription> createOffer() async {
    final offer = await _peer!.createOffer({'offerToReceiveAudio': true, 'offerToReceiveVideo': false});
    await _peer!.setLocalDescription(offer);
    return offer;
  }

  Future<RTCSessionDescription> createAnswer(RTCSessionDescription offer) async {
    await _peer!.setRemoteDescription(offer);
    final answer = await _peer!.createAnswer({'offerToReceiveAudio': true, 'offerToReceiveVideo': false});
    await _peer!.setLocalDescription(answer);
    return answer;
  }

  Future<void> acceptAnswer(RTCSessionDescription answer) => _peer!.setRemoteDescription(answer);
  Future<void> addIceCandidate(RTCIceCandidate candidate) => _peer!.addCandidate(candidate);

  void setMuted(bool muted) {
    for (final track in _localStream?.getAudioTracks() ?? <MediaStreamTrack>[]) {
      track.enabled = !muted;
    }
  }

  Future<void> dispose() async {
    for (final track in _localStream?.getTracks() ?? <MediaStreamTrack>[]) {
      await track.stop();
    }
    await _localStream?.dispose();
    await _peer?.close();
    _localStream = null;
    _peer = null;
  }
}
