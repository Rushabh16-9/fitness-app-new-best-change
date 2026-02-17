import 'dart:math';
import 'package:flutter_tts/flutter_tts.dart';

class VoiceCoachService {
  final FlutterTts _tts = FlutterTts();
  final Random _rng = Random();
  // Optional callback to duck/restore music volume while speaking.
  Future<void> Function(bool duck)? _duckCallback;

  // List of motivational messages; extend as needed
  final List<String> _motivationalPhrases = [
    "You're crushing it — keep the pace!",
    "Nice form — let's go for one more!",
    "Breathe through it, you're doing great!",
    "Halfway there — push with purpose!",
    "Keep steady, you've got this!",
    "Amazing effort — finish strong!",
    "Small steps, big results — keep moving!",
    // stronger, higher-energy cues
    "Drive through the heels — powerful reps now!",
    "Explode up — control on the way down!",
    "Push with purpose — one rep at a time!",
    "Stay strong — focus on full range of motion!",
  ];

  VoiceCoachService() {
    // slower, clearer speech for coaching prompts
    _tts.setSpeechRate(0.6);
    _tts.setVolume(1.0);
    _tts.setPitch(1.05);
    // When speech completes, ensure music is restored if ducking was used.
    try {
      _tts.setCompletionHandler(() {
        try {
          if (_duckCallback != null) _duckCallback!(false);
        } catch (_) {}
      });
    } catch (_) {}
  }

  Future<void> speak(String text) async {
    try {
      // If a duck callback is provided, lower music first
      if (_duckCallback != null) {
        try {
          await _duckCallback!(true);
        } catch (_) {}
      }
      await _tts.stop();
      await _tts.speak(text);
    } catch (e) {
      // ignore TTS errors silently
    }
  }

  /// Register a callback to duck (true) or restore (false) music volume.
  void setDuckCallback(Future<void> Function(bool duck) cb) {
    _duckCallback = cb;
  }

  void speakMotivation() {
    final phrase = _motivationalPhrases[_rng.nextInt(_motivationalPhrases.length)];
    // Use a slightly stronger delivery for motivation
    speak(phrase);
  }

  // Called every tick. We will speak at useful milestones.
  void onTick({required int remainingSeconds, required int totalSeconds}) {
    // speak at half time, 10s left, and when completed (handled elsewhere)
    if (remainingSeconds == (totalSeconds ~/ 2)) {
      speakMotivation();
    } else if (remainingSeconds == 10) {
      speak("Only ten seconds left — push!");
    }
  }

  Future<void> stop() async {
    try {
      await _tts.stop();
      // restore music if we had ducked
      try {
        if (_duckCallback != null) await _duckCallback!(false);
      } catch (_) {}
    } catch (e) {}
  }
}
