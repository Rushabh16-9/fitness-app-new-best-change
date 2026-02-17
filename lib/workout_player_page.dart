import 'package:flutter/material.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import 'exercise_service.dart';
import 'spotify_music_service.dart';

class WorkoutPlayerPage extends StatefulWidget {
  final String exerciseId;

  const WorkoutPlayerPage({super.key, required this.exerciseId});

  @override
  State<WorkoutPlayerPage> createState() => _WorkoutPlayerPageState();
}

class _WorkoutPlayerPageState extends State<WorkoutPlayerPage> {
  late YoutubePlayerController _youtubeController;
  late SpotifyMusicService _spotifyService;
  Map<String, dynamic>? _exercise;
  bool _isLoading = true;
  final int _timerSeconds = 30;
  bool _timerRunning = false;

  @override
  void initState() {
    super.initState();
    _spotifyService = SpotifyMusicService();
    _loadExercise();
  }

  Future<void> _loadExercise() async {
    final exerciseService = ExerciseService();
    _exercise = await exerciseService.getExerciseById(widget.exerciseId);
    if (_exercise?['videoUrl'] != null) {
      final videoId = YoutubePlayer.convertUrlToId(_exercise!['videoUrl']);
      if (videoId != null) {
        _youtubeController = YoutubePlayerController(
          initialVideoId: videoId,
          flags: const YoutubePlayerFlags(
            autoPlay: false,
            mute: false,
          ),
        );
      }
    }
    setState(() {
      _isLoading = false;
    });
  }

  void _startTimer() {
    setState(() {
      _timerRunning = true;
    });
    // Timer logic here - you can implement countdown timer
  }

  void _pauseTimer() {
    setState(() {
      _timerRunning = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_exercise?['name'] ?? 'Exercise'),
        backgroundColor: Colors.red,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // YouTube Video Player
            if (_exercise?['videoUrl'] != null && YoutubePlayer.convertUrlToId(_exercise!['videoUrl']) != null)
              YoutubePlayer(
                controller: _youtubeController,
                showVideoProgressIndicator: true,
              )
            else
              Container(
                height: 200,
                color: Colors.grey,
                child: const Center(child: Text('Video not available')),
              ),

            const SizedBox(height: 16),

            // Exercise Details
            Text(
              _exercise?['name'] ?? '',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            Text('Difficulty: ${_exercise?['difficulty'] ?? ''}'),
            Text('Muscle Group: ${_exercise?['muscleGroup'] ?? ''}'),

            const SizedBox(height: 16),

            // Timer
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.red[100],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  Text(
                    '$_timerSeconds seconds',
                    style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ElevatedButton(
                        onPressed: _timerRunning ? _pauseTimer : _startTimer,
                        child: Text(_timerRunning ? 'Pause' : 'Start'),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Spotify Integration
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.green[100],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  const Text(
                    'Workout Music',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  ElevatedButton.icon(
                    onPressed: () async {
                      await _spotifyService.openWorkoutPlaylist();
                    },
                    icon: const Icon(Icons.music_note),
                    label: const Text('Open Spotify Workout Playlist'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _youtubeController.dispose();
    super.dispose();
  }
}
