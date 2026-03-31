import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'services/legacy_exercisedb_service.dart';
import 'models/exercise_model.dart';
import 'package:audioplayers/audioplayers.dart';
import 'asset_resolver.dart';

class AiPlanDayPage extends StatefulWidget {
  final String title;
  final List<String> muscleGroups;
  final List<String> problems;
  final int perExerciseSeconds;

  const AiPlanDayPage({super.key, required this.title, required this.muscleGroups, required this.problems, this.perExerciseSeconds = 45});

  @override
  State<AiPlanDayPage> createState() => _AiPlanDayPageState();
}

class _AiPlanDayPageState extends State<AiPlanDayPage> {
  final LegacyExerciseDbService _db = LegacyExerciseDbService.instance;
  List<Exercise> _exercises = [];
  bool _loading = true;

  // runner state
  late PageController _pageController;
  Timer? _timer;
  int _currentIndex = 0;
  int _remaining = 0;
  bool _running = false;
  bool _onBreak = false;
  final AudioPlayer _audio = AudioPlayer();
  bool _musicPlaying = false;
  final List<String> _tracks = ['alarm.mp3'];
  int _currentTrack = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: 0);
    _loadExercisesForDay();
  }

  Future<void> _loadExercisesForDay() async {
    setState(() => _loading = true);
    try {
      // Ensure asset manifest is available for local image checks
      await AssetResolver.init();
      // Initialize database if needed
      await _db.loadExercises();
      
      // Get all exercises from the 1500+ database
      final all = _db.allExercises;
      
      // Filter by muscle groups - check target muscles and body parts
      final candidates = all.where((e) {
        // Check if exercise targets any of the requested muscle groups
        final targets = [
          ...e.targetMuscles.map((m) => m.toLowerCase()),
          ...e.bodyParts.map((b) => b.toLowerCase()),
        ];
        
        final match = widget.muscleGroups.any((g) => 
          targets.any((t) => t.contains(g.toLowerCase()) || g.toLowerCase().contains(t))
        );
        if (!match) return false;
        
        // Exclude exercises that mention problem areas
        final lowerName = e.displayName.toLowerCase();
        for (final p in widget.problems) {
          if (p.isEmpty) continue;
          final key = p.toLowerCase();
          if (lowerName.contains(key)) return false;
        }
        return true;
      }).toList();

      // If not enough candidates, broaden selection
      List<Exercise> pool = candidates;
      if (pool.length < 5) {
        pool = all.where((e) {
          final lowerName = e.displayName.toLowerCase();
          for (final p in widget.problems) {
            if (p.isNotEmpty && lowerName.contains(p.toLowerCase())) return false;
          }
          return true;
        }).toList();
      }

      // Select 5-8 random exercises
      final count = min(max(5, pool.length >= 5 ? 5 : pool.length), 8);
      final selected = _db.getRandomExercises(pool, count);

      if (mounted) {
        setState(() {
          _exercises = selected;
          _loading = false;
          _remaining = widget.perExerciseSeconds;
        });
        // Debug: log selected exercises and their resolved assets
        for (var i = 0; i < _exercises.length; i++) {
          final ex = _exercises[i];
          final asset = _bestAsset(ex);
          // ignore: avoid_print
          print('[AI Day] Selected #${i + 1}/${_exercises.length}: ${ex.displayName} -> ${asset.isEmpty ? '<missing>' : asset}');
        }
        // Precache current and next exercise images to avoid flashes
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _precacheForIndex(0);
          if (_exercises.length > 1) _precacheForIndex(1);
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _start() {
    if (_exercises.isEmpty) return;
    _timer?.cancel();
    setState(() { _running = true; _onBreak = false; _remaining = widget.perExerciseSeconds; });
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return t.cancel();
      setState(() => _remaining--);
      if (_remaining <= 0) {
        t.cancel();
        _advance();
      }
    });
  }

  void _pause() {
    _timer?.cancel();
    setState(() => _running = false);
  }

  void _restart() {
    _timer?.cancel();
    setState(() { _currentIndex = 0; _pageController.jumpToPage(0); _remaining = widget.perExerciseSeconds; _running = false; _onBreak = false; });
  }

  void _advance() {
    // insert 5s break before next exercise
    if (_currentIndex < _exercises.length - 1) {
      setState(() { _onBreak = true; _remaining = 5; });
      _timer = Timer.periodic(const Duration(seconds: 1), (t) {
        if (!mounted) return t.cancel();
        setState(() => _remaining--);
        if (_remaining <= 0) {
          t.cancel();
          setState(() { _onBreak = false; _currentIndex++; _pageController.animateToPage(_currentIndex, duration: const Duration(milliseconds: 400), curve: Curves.easeInOut); _remaining = widget.perExerciseSeconds; });
          // Debug: log new index and asset
          final ex = _exercises[_currentIndex];
          final asset = _bestAsset(ex);
          // ignore: avoid_print
          print('[AI Day] Now showing #${_currentIndex + 1}/${_exercises.length}: ${ex.displayName} -> ${asset.isEmpty ? '<missing>' : asset}');
          // Precache upcoming image for smoother UX
          if (_currentIndex + 1 < _exercises.length) {
            _precacheForIndex(_currentIndex + 1);
          }
          _start();
        }
      });
    } else {
      // completed
      showDialog(context: context, builder: (_) => AlertDialog(backgroundColor: Colors.grey.shade900, title: const Text('Completed', style: TextStyle(color: Colors.white)), content: const Text('You completed today\'s plan!', style: TextStyle(color: Colors.white70)), actions: [TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('OK'))]));
    }
  }

  Future<void> _toggleMusic() async {
    if (_musicPlaying) {
      await _audio.pause();
      setState(() => _musicPlaying = false);
    } else {
      // play bundled asset (fallback). Ensure the asset exists in pubspec if needed.
      try {
        await _audio.setReleaseMode(ReleaseMode.loop);
        await _audio.play(AssetSource(_tracks[_currentTrack]));
        setState(() => _musicPlaying = true);
      } catch (e) {
        // ignore
      }
    }
  }

  Future<void> _chooseTrack() async {
    final choice = await showDialog<int>(context: context, builder: (_) {
      return SimpleDialog(title: const Text('Choose track'), children: _tracks.asMap().entries.map((e) => SimpleDialogOption(onPressed: () => Navigator.of(context).pop(e.key), child: Text(e.value))).toList());
    });
    if (choice != null) {
      setState(() => _currentTrack = choice);
      if (_musicPlaying) {
        await _audio.stop();
        await _audio.play(AssetSource(_tracks[_currentTrack]));
      }
    }
  }

  Future<void> _nextTrack() async {
    if (_tracks.isEmpty) return;
    setState(() => _currentTrack = (_currentTrack + 1) % _tracks.length);
    if (_musicPlaying) {
      await _audio.stop();
      await _audio.play(AssetSource(_tracks[_currentTrack]));
    }
  }

  Future<void> _prevTrack() async {
    if (_tracks.isEmpty) return;
    setState(() => _currentTrack = (_currentTrack - 1 + _tracks.length) % _tracks.length);
    if (_musicPlaying) {
      await _audio.stop();
      await _audio.play(AssetSource(_tracks[_currentTrack]));
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _audio.dispose();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        backgroundColor: Colors.red,
        elevation: 0,
      ),
      backgroundColor: Colors.black,
      body: _loading 
        ? Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                CircularProgressIndicator(color: Colors.red),
                SizedBox(height: 16),
                Text('Loading AI-selected exercises...', style: TextStyle(color: Colors.white70)),
              ],
            ),
          )
        : _exercises.isEmpty 
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.fitness_center, color: Colors.white30, size: 64),
                  SizedBox(height: 16),
                  Text('No exercises found for today', style: TextStyle(color: Colors.white70, fontSize: 16)),
                ],
              ),
            )
          : SafeArea(
              child: Column(
                children: [
                  // Modern card-style exercise display
                  Expanded(
                    child: PageView.builder(
                      controller: _pageController,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _exercises.length,
                      itemBuilder: (context, i) {
                        final ex = _exercises[i];
                        return _buildExerciseCard(ex);
                      },
                    ),
                  ),
                  
                  // Bottom control panel
                  _buildControlPanel(),
                ],
              ),
            ),
    );
  }

  Widget _buildExerciseCard(Exercise ex) {
    final String bestAsset = _bestAsset(ex);
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.red.shade900,
            Colors.red.shade700,
            Colors.orange.shade800,
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.red.withOpacity(0.3),
            blurRadius: 20,
            spreadRadius: 2,
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: SingleChildScrollView(
          child: Column(
            children: [
              // Exercise GIF/Image with glassmorphism overlay
              Stack(
                children: [
                  // Exercise GIF
                  GestureDetector(
                    onTap: () => _openFullscreen(bestAsset.isNotEmpty ? bestAsset : ex.gifUrl),
                    child: Container(
                      height: 400,
                      width: double.infinity,
                      color: Colors.black38,
                      child: bestAsset.isNotEmpty
                          ? Image.asset(
                              bestAsset,
                              fit: BoxFit.cover,
                              gaplessPlayback: true,
                              excludeFromSemantics: true,
                              errorBuilder: (context, error, stack) => _buildPlaceholder(),
                            )
                          : _buildPlaceholder(),
                    ),
                  ),
                  
                  // Gradient overlay at bottom
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      height: 100,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.bottomCenter,
                          end: Alignment.topCenter,
                          colors: [
                            Colors.red.shade900,
                            Colors.red.shade900.withOpacity(0.7),
                            Colors.transparent,
                          ],
                        ),
                      ),
                    ),
                  ),
                  
                  // Break indicator overlay
                  if (_onBreak)
                    Positioned.fill(
                      child: Container(
                        color: Colors.black87,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Icon(Icons.hourglass_empty, color: Colors.orange, size: 64),
                            SizedBox(height: 16),
                            Text(
                              'BREAK TIME',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 32,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 2,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
              
              // Exercise info section
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    // Exercise name
                    Text(
                      ex.displayName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    
                    const SizedBox(height: 12),
                    
                    // Metadata chips
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      alignment: WrapAlignment.center,
                      children: [
                        _buildMetaChip(ex.equipment, Icons.fitness_center, Colors.purple),
                        if (ex.bodyParts.isNotEmpty)
                          _buildMetaChip(ex.bodyParts.first, Icons.accessibility, Colors.blue),
                        _buildMetaChip(ex.difficulty, Icons.trending_up, Colors.orange),
                      ],
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Timer - Large and prominent
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.black26,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: _running ? Colors.greenAccent : Colors.white24,
                          width: 3,
                        ),
                      ),
                      child: Text(
                        '${_remaining}s',
                        style: TextStyle(
                          color: _running ? Colors.greenAccent : Colors.white,
                          fontSize: 72,
                          fontWeight: FontWeight.bold,
                          fontFeatures: const [FontFeature.tabularFigures()],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _bestAsset(Exercise ex) {
    // Use legacy exercisedb media GIFs (1500+ exercises)
    final asset = _db.getLocalGifPath(ex);
    // ignore: avoid_print
    print('[AI Day Asset] ${ex.displayName} -> ${asset.isEmpty ? '<missing>' : asset}');
    return asset;
  }

  // Network fallback removed per requirement: show only local bundled assets

  void _precacheForIndex(int index) {
    if (!mounted || index < 0 || index >= _exercises.length) return;
    final ex = _exercises[index];
    final best = _bestAsset(ex);
    if (best.isNotEmpty) {
      precacheImage(AssetImage(best), context);
    }
  }

  void _openFullscreen(String source) {
    if (source.isEmpty) return;
    showDialog(
      context: context,
      barrierColor: Colors.black.withOpacity(0.95),
      builder: (_) => GestureDetector(
        onTap: () => Navigator.pop(context),
        child: InteractiveViewer(
          minScale: 0.8,
          maxScale: 5.0,
          child: source.startsWith('http')
              ? Image.network(source, fit: BoxFit.contain)
              : Image.asset(source, fit: BoxFit.contain, gaplessPlayback: true),
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      color: Colors.black38,
      child: const Center(
        child: Icon(
          Icons.fitness_center,
          color: Colors.white30,
          size: 120,
        ),
      ),
    );
  }

  Widget _buildMetaChip(String label, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.5), width: 1.5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 16),
          const SizedBox(width: 6),
          Text(
            label.toUpperCase(),
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildControlPanel() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.grey.shade900,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.5),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Progress indicator
          Row(
            children: [
              Text(
                '${_currentIndex + 1}/${_exercises.length}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: LinearProgressIndicator(
                    value: (_currentIndex + 1) / _exercises.length,
                    backgroundColor: Colors.white12,
                    valueColor: const AlwaysStoppedAnimation<Color>(Colors.red),
                    minHeight: 8,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                widget.muscleGroups.isNotEmpty ? widget.muscleGroups.first : 'Legs',
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 20),
          
          // Main control buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              // Start/Pause button - Large and prominent
              Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: _running ? _pause : _start,
                  borderRadius: BorderRadius.circular(40),
                  child: Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        colors: _running 
                          ? [Colors.orange.shade700, Colors.orange.shade900]
                          : [Colors.red.shade700, Colors.red.shade900],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: (_running ? Colors.orange : Colors.red).withOpacity(0.5),
                          blurRadius: 20,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: Icon(
                      _running ? Icons.pause : Icons.play_arrow,
                      color: Colors.white,
                      size: 56,
                    ),
                  ),
                ),
              ),
              
              // Restart button
              _buildRoundButton(
                Icons.refresh,
                'Restart',
                Colors.orange,
                _restart,
                size: 70,
              ),
              
              // Complete/Next button
              _buildRoundButton(
                Icons.check,
                'Complete',
                Colors.grey.shade800,
                _advance,
                size: 90,
              ),
            ],
          ),
          
          const SizedBox(height: 20),
          
          // Music controls
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20),
            decoration: BoxDecoration(
              color: Colors.blue.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.blue.withOpacity(0.3)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  onPressed: _prevTrack,
                  icon: const Icon(Icons.skip_previous, color: Colors.white70),
                  iconSize: 32,
                ),
                const SizedBox(width: 12),
                ElevatedButton.icon(
                  onPressed: _toggleMusic,
                  icon: Icon(_musicPlaying ? Icons.pause : Icons.music_note),
                  label: Text(_musicPlaying ? 'Pause Music' : 'Play Music'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                IconButton(
                  onPressed: _nextTrack,
                  icon: const Icon(Icons.skip_next, color: Colors.white70),
                  iconSize: 32,
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 12),
          
          // Choose track button
          TextButton.icon(
            onPressed: _chooseTrack,
            icon: const Icon(Icons.library_music, color: Colors.white54, size: 16),
            label: const Text(
              'Choose Track',
              style: TextStyle(color: Colors.white54),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoundButton(IconData icon, String label, Color color, VoidCallback onTap, {double size = 60}) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(size / 2),
            child: Container(
              width: size,
              height: size,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: color,
                boxShadow: [
                  BoxShadow(
                    color: color.withOpacity(0.4),
                    blurRadius: 12,
                    spreadRadius: 1,
                  ),
                ],
              ),
              child: Icon(
                icon,
                color: Colors.white,
                size: size * 0.5,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
