import 'dart:async';

import 'package:flutter/material.dart';

class ExerciseRunnerPage extends StatefulWidget {
  final List<Map<String, dynamic>> exercises;
  final int startIndex;
  final int totalMinutes;

  const ExerciseRunnerPage({super.key, required this.exercises, this.startIndex = 0, this.totalMinutes = 10});

  @override
  State<ExerciseRunnerPage> createState() => _ExerciseRunnerPageState();
}

class _ExerciseRunnerPageState extends State<ExerciseRunnerPage> {
  late int _index;
  late int _remainingSeconds;
  Timer? _timer;
  bool _running = false;

  @override
  void initState() {
    super.initState();
    _index = widget.startIndex;
    // Distribute totalMinutes across exercises if individual durations missing
    final totalSec = widget.totalMinutes * 60;
    final per = (totalSec / (widget.exercises.length)).round();
    _remainingSeconds = widget.exercises[_index]['duration'] ?? per;
  }

  void _start() {
    if (_running) return;
    _running = true;
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return;
      setState(() {
        _remainingSeconds = (_remainingSeconds - 1).clamp(0, 99999);
        if (_remainingSeconds <= 0) _nextExercise();
      });
    });
  }

  void _pause() {
    _timer?.cancel();
    _running = false;
  }

  void _reset() {
    _pause();
    final totalSec = widget.totalMinutes * 60;
    final per = (totalSec / (widget.exercises.length)).round();
    setState(() {
      _remainingSeconds = widget.exercises[_index]['duration'] ?? per;
    });
  }

  void _nextExercise() {
    _pause();
    if (_index < widget.exercises.length - 1) {
      setState(() {
        _index++;
        final totalSec = widget.totalMinutes * 60;
        final per = (totalSec / (widget.exercises.length)).round();
        _remainingSeconds = widget.exercises[_index]['duration'] ?? per;
      });
      _start();
    } else {
      // finished
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Workout complete!')));
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _format(int sec) {
    final m = (sec / 60).floor().toString().padLeft(2, '0');
    final s = (sec % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    final ex = widget.exercises[_index];
    final title = ex['name'] ?? 'Exercise';
    final image = ex['image'] as String?;
    final instructions = ex['instructions'] as List<dynamic>? ?? [];
    final targetMuscles = ex['targetMuscles'] as List<dynamic>? ?? [];
    final equipment = ex['equipment'] ?? '';
    final difficulty = ex['difficulty'] ?? '';

    // Debug: log current exercise and image path
    // ignore: avoid_print
    print('[Runner] #${_index + 1}/${widget.exercises.length}: $title -> ${image == null || image.isEmpty ? '<missing>' : image}');

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.red, 
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title.toUpperCase(), style: const TextStyle(fontSize: 16)),
            Text('Exercise ${_index + 1} of ${widget.exercises.length}', 
              style: const TextStyle(fontSize: 12, color: Colors.white70)),
          ],
        ),
      ),
      body: Column(children: [
        // Exercise GIF/Image
        if (image != null && image.isNotEmpty)
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.asset(
                image,
                height: 240,
                fit: BoxFit.cover,
                excludeFromSemantics: true,
                errorBuilder: (context, error, stackTrace) {
                  // Network fallback removed per requirement; show placeholder if missing
                  return Container(
                    height: 240,
                    color: Colors.grey[900],
                    child: const Center(
                      child: Icon(Icons.fitness_center, size: 72, color: Colors.white70),
                    ),
                  );
                },
              ),
            ),
          )
        else
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Container(
              height: 240, 
              decoration: BoxDecoration(
                color: Colors.grey[900],
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Center(child: Icon(Icons.fitness_center, size: 72, color: Colors.white70)),
            ),
          ),

        // Exercise metadata chips
        if (targetMuscles.isNotEmpty || equipment.isNotEmpty || difficulty.isNotEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              alignment: WrapAlignment.center,
              children: [
                if (difficulty.isNotEmpty)
                  _buildMetadataChip(Icons.trending_up, difficulty.toUpperCase(), Colors.blue),
                if (equipment.isNotEmpty && equipment != 'body weight')
                  _buildMetadataChip(Icons.fitness_center, equipment.toUpperCase(), Colors.orange),
                if (targetMuscles.isNotEmpty)
                  _buildMetadataChip(Icons.sports_martial_arts, targetMuscles.take(2).join(', ').toUpperCase(), Colors.purple),
              ],
            ),
          ),

        const SizedBox(height: 8),
        
        // Timer
        Expanded(
          child: Center(child: Text(_format(_remainingSeconds), style: const TextStyle(color: Colors.white, fontSize: 64, fontWeight: FontWeight.bold))),
        ),

        // Instructions (collapsible)
        if (instructions.isNotEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18.0),
            child: ExpansionTile(
              title: const Text('Instructions', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              iconColor: Colors.red,
              collapsedIconColor: Colors.white70,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey[900],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: instructions.asMap().entries.map((entry) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4.0),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('${entry.key + 1}.', style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(entry.value, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),

        const SizedBox(height: 12),

        // Large circular controls row (play, reset, complete)
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 18.0, horizontal: 24),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: [
            // Play large
            SizedBox(
              width: 90,
              height: 90,
              child: FloatingActionButton(
                backgroundColor: Colors.red,
                onPressed: _running ? _pause : _start,
                child: Icon(_running ? Icons.pause : Icons.play_arrow, size: 36),
              ),
            ),

            // Reset medium
            SizedBox(
              width: 64,
              height: 64,
              child: FloatingActionButton(
                backgroundColor: Colors.grey[800],
                onPressed: _reset,
                child: const Icon(Icons.refresh, size: 28),
              ),
            ),

            // Complete large
            SizedBox(
              width: 90,
              height: 90,
              child: FloatingActionButton(
                backgroundColor: Colors.grey[800],
                onPressed: _nextExercise,
                child: const Icon(Icons.check, size: 36),
              ),
            ),
          ]),
        ),

        // Bottom navigation row: Previous | Music | Next
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 18.0, vertical: 8),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            TextButton.icon(onPressed: () {
              if (_index > 0) {
                setState(() {
                  _index--;
                  final totalSec = widget.totalMinutes * 60;
                  final per = (totalSec / (widget.exercises.length)).round();
                  _remainingSeconds = widget.exercises[_index]['duration'] ?? per;
                });
              }
            }, icon: const Icon(Icons.chevron_left, color: Colors.white70), label: const Text('Previous', style: TextStyle(color: Colors.white70))),

            TextButton.icon(onPressed: () {
              // Music control placeholder
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Music control (placeholder)')));
            }, icon: const Icon(Icons.music_note, color: Colors.white70), label: const Text('Music', style: TextStyle(color: Colors.white70))),

            TextButton.icon(onPressed: () {
              _nextExercise();
            }, icon: const Icon(Icons.chevron_right, color: Colors.white70), label: const Text('Next', style: TextStyle(color: Colors.white70))),
          ]),
        ),
      ]),
    );
  }

  Widget _buildMetadataChip(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.5), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 6),
          Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
