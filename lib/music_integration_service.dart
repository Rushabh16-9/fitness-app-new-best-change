import 'package:youtube_player_flutter/youtube_player_flutter.dart';

class MusicIntegrationService {
  YoutubePlayerController? _controller;
  bool _isPlaying = false;

  // Initialize YouTube player
  void initializePlayer(String videoId) {
    _controller = YoutubePlayerController(
      initialVideoId: videoId,
      flags: const YoutubePlayerFlags(
        autoPlay: false,
        mute: false,
        loop: true,
      ),
    );
  }

  YoutubePlayerController? get controller => _controller;

  // Play music
  void playMusic() {
    if (_controller != null) {
      _controller!.play();
      _isPlaying = true;
    }
  }

  // Pause music
  void pauseMusic() {
    if (_controller != null) {
      _controller!.pause();
      _isPlaying = false;
    }
  }

  // Resume music
  void resumeMusic() {
    if (_controller != null && !_isPlaying) {
      _controller!.play();
      _isPlaying = true;
    }
  }

  // Skip to next (not supported in YouTube player, just restart)
  void skipToNext() {
    if (_controller != null) {
      _controller!.seekTo(const Duration(seconds: 0));
    }
  }

  // Skip to previous (not supported, just pause)
  void skipToPrevious() {
    pauseMusic();
  }

  // Set volume (YouTube player doesn't support volume control directly)
  void setVolume(double volume) {
    // Not implemented for YouTube
  }

  // Get current playback state
  bool get isPlaying => _isPlaying;

  // Disconnect (dispose controller)
  void disconnect() {
    _controller?.dispose();
    _controller = null;
    _isPlaying = false;
  }

  // Get video ID by genre (placeholder)
  String? getVideoId(String genre) {
    const Map<String, String> workoutVideos = {
      'Upbeat Pop': 'dQw4w9WgXcQ', // Example video ID
      'Rock Energy': 'dQw4w9WgXcQ',
      'Electronic': 'dQw4w9WgXcQ',
      'Hip Hop': 'dQw4w9WgXcQ',
      'Motivational': 'dQw4w9WgXcQ',
    };
    return workoutVideos[genre];
  }
}
