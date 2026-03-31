import 'package:flutter/material.dart';
import 'package:audioplayers/audioplayers.dart';

class RecoveryMindfulnessPage extends StatefulWidget {
  const RecoveryMindfulnessPage({super.key});

  @override
  State<RecoveryMindfulnessPage> createState() => _RecoveryMindfulnessPageState();
}

class _RecoveryMindfulnessPageState extends State<RecoveryMindfulnessPage> {
  final AudioPlayer _audioPlayer = AudioPlayer();
  bool _isPlaying = false;
  String _currentMeditation = '';

  final List<Map<String, String>> _meditations = [
    {'title': 'Deep Breathing', 'duration': '5 min', 'description': 'Focus on your breath to reduce stress'},
    {'title': 'Body Scan', 'duration': '10 min', 'description': 'Relax each part of your body'},
    {'title': 'Mindful Walking', 'duration': '15 min', 'description': 'Walk with awareness'},
    {'title': 'Gratitude Practice', 'duration': '5 min', 'description': 'Reflect on things you\'re grateful for'},
  ];

  final List<Map<String, String>> _breathingExercises = [
    {'name': '4-7-8 Breathing', 'pattern': 'Inhale 4s, Hold 7s, Exhale 8s'},
    {'name': 'Box Breathing', 'pattern': 'Inhale 4s, Hold 4s, Exhale 4s, Hold 4s'},
    {'name': 'Alternate Nostril', 'pattern': 'Alternate breathing through nostrils'},
  ];

  @override
  void dispose() {
    _audioPlayer.dispose();
    super.dispose();
  }

  void _playMeditation(String title) async {
    if (_isPlaying && _currentMeditation == title) {
      await _audioPlayer.pause();
      setState(() {
        _isPlaying = false;
      });
    } else {
      // In a real app, you would load actual meditation audio files
      // For now, we'll just simulate playing
      setState(() {
        _isPlaying = true;
        _currentMeditation = title;
      });
      // Simulate audio playback
      await Future.delayed(const Duration(seconds: 2));
      setState(() {
        _isPlaying = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Recovery & Mindfulness'),
          backgroundColor: Colors.black,
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Meditations'),
              Tab(text: 'Breathing'),
              Tab(text: 'Recovery'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildMeditationsTab(),
            _buildBreathingTab(),
            _buildRecoveryTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildMeditationsTab() {
    return ListView.builder(
      itemCount: _meditations.length,
      itemBuilder: (context, index) {
        final meditation = _meditations[index];
        final isPlaying = _isPlaying && _currentMeditation == meditation['title'];
        return Card(
          color: Colors.grey[900],
          margin: const EdgeInsets.all(8),
          child: ListTile(
            title: Text(
              meditation['title']!,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  meditation['duration']!,
                  style: const TextStyle(color: Colors.red),
                ),
                Text(
                  meditation['description']!,
                  style: const TextStyle(color: Colors.grey),
                ),
              ],
            ),
            trailing: IconButton(
              icon: Icon(
                isPlaying ? Icons.pause : Icons.play_arrow,
                color: Colors.red,
                size: 32,
              ),
              onPressed: () => _playMeditation(meditation['title']!),
            ),
          ),
        );
      },
    );
  }

  Widget _buildBreathingTab() {
    return ListView.builder(
      itemCount: _breathingExercises.length,
      itemBuilder: (context, index) {
        final exercise = _breathingExercises[index];
        return Card(
          color: Colors.grey[900],
          margin: const EdgeInsets.all(8),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  exercise['name']!,
                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  exercise['pattern']!,
                  style: const TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 16),
                Center(
                  child: ElevatedButton(
                    onPressed: () => _startBreathingExercise(exercise['name']!),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                    ),
                    child: const Text('Start Exercise'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildRecoveryTab() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _buildRecoveryCard(
            'Active Recovery',
            'Light exercise to promote blood flow',
            Icons.directions_run,
          ),
          const SizedBox(height: 16),
          _buildRecoveryCard(
            'Foam Rolling',
            'Self-massage to release muscle tension',
            Icons.sports_baseball,
          ),
          const SizedBox(height: 16),
          _buildRecoveryCard(
            'Stretching',
            'Improve flexibility and reduce soreness',
            Icons.accessibility,
          ),
          const SizedBox(height: 16),
          _buildRecoveryCard(
            'Hydration Tracker',
            'Monitor your daily water intake',
            Icons.local_drink,
          ),
        ],
      ),
    );
  }

  Widget _buildRecoveryCard(String title, String description, IconData icon) {
    return Card(
      color: Colors.grey[900],
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(icon, color: Colors.red, size: 40),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    description,
                    style: const TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.arrow_forward, color: Colors.red),
              onPressed: () => _navigateToRecoveryDetail(title),
            ),
          ],
        ),
      ),
    );
  }

  void _startBreathingExercise(String exerciseName) {
    // Navigate to breathing exercise screen or show instructions
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Starting $exerciseName...')),
    );
  }

  void _navigateToRecoveryDetail(String title) {
    // Navigate to detailed recovery screen
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Opening $title details...')),
    );
  }
}
