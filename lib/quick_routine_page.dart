import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'services/exercise_catalog_service.dart';
import 'services/music_service.dart';

class QuickRoutinePage extends StatefulWidget {
  final String focusTag; // e.g., 'core', 'legs', 'arms'
  const QuickRoutinePage({super.key, required this.focusTag});

  @override
  State<QuickRoutinePage> createState() => _QuickRoutinePageState();
}

class _QuickRoutinePageState extends State<QuickRoutinePage> {
  final ExerciseCatalogService _service = ExerciseCatalogService();
  final List<ExerciseEntry> _plan = [];
  int _current = 0;
  int _secondsPerExercise = 40;
  int _restSeconds = 20;
  bool _restEnabled = true;
  bool _inRest = false;
  int _seconds = 40;
  Timer? _timer;
  bool _running = false;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    await _service.load();
    final p = await SharedPreferences.getInstance();
    final faves = p.getStringList('exercise_faves') ?? [];
    final favEntries = _service.all.where((e) => faves.contains(e.id) && e.tags.contains(widget.focusTag)).toList()..shuffle();
    final tagEntries = _service.all.where((e) => e.tags.contains(widget.focusTag)).toList()..shuffle();
    // Build 10-minute routine: 10 x 40s with 20s rest implicitly (user-controlled)
    final src = [...favEntries, ...tagEntries];
    final seen = <String>{};
    for (final e in src) {
      if (seen.add(e.id)) _plan.add(e);
      if (_plan.length >= 10) break;
    }
    if (_plan.isEmpty && _service.all.isNotEmpty) {
      _plan.addAll(_service.all.take(10));
    }
    _seconds = _secondsPerExercise;
    setState(() {});
  }

  void _toggle() {
    if (_running) {
      _timer?.cancel();
      setState(() => _running = false);
    } else {
      _timer = Timer.periodic(const Duration(seconds: 1), (t) {
        if (!mounted) return;
        if (_seconds > 0) {
          setState(() => _seconds--);
          return;
        }
        // End of phase
        if (_inRest) {
          // Move to next exercise
          if (_current < _plan.length - 1) {
            setState(() {
              _current++;
              _inRest = false;
              _seconds = _secondsPerExercise;
            });
          } else {
            t.cancel();
            setState(() => _running = false);
          }
        } else {
          // End of exercise; decide rest or next
          if (_restEnabled && _current < _plan.length - 1) {
            setState(() {
              _inRest = true;
              _seconds = _restSeconds;
            });
          } else if (_current < _plan.length - 1) {
            setState(() {
              _current++;
              _seconds = _secondsPerExercise;
            });
          } else {
            t.cancel();
            setState(() => _running = false);
          }
        }
      });
      setState(() => _running = true);
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // MusicService is a singleton, not a Provider
    final music = MusicService.I;
    final ex = (_plan.isEmpty || _current >= _plan.length) ? null : _plan[_current];
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: Text('10-min ${widget.focusTag[0].toUpperCase()}${widget.focusTag.substring(1)}'),
        actions: [
          ValueListenableBuilder<MusicStatus>(
            valueListenable: music.status,
            builder: (context, s, _) => IconButton(
              icon: Icon(s.isPlaying ? Icons.pause_circle : Icons.play_circle),
              onPressed: s.hasTracks ? music.playPause : null,
            ),
          ),
          ValueListenableBuilder<MusicStatus>(
            valueListenable: music.status,
            builder: (context, s, _) => IconButton(
              icon: const Icon(Icons.skip_next),
              onPressed: s.hasTracks ? music.next : null,
            ),
          ),
          IconButton(icon: const Icon(Icons.settings), onPressed: _openSettings),
        ],
      ),
      body: _plan.isEmpty
          ? const Center(child: CircularProgressIndicator(color: Colors.red))
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Header with image + circular timer overlay
                  _HeaderTimer(
                    name: _inRest ? 'REST' : (ex?.name ?? ''),
                    tags: ex?.tags ?? const [],
                    imageAsset: ex?.assetPath,
                    imageUrl: ex?.gifUrl ?? '',
                    progress: _inRest
                        ? (_restSeconds == 0 ? 1 : (_restSeconds - _seconds) / max(1, _restSeconds))
                        : (_secondsPerExercise == 0 ? 1 : (_secondsPerExercise - _seconds) / max(1, _secondsPerExercise)),
                    seconds: _seconds,
                    index: _current,
                    total: _plan.length,
                    onShuffle: _regenerate,
                    inRest: _inRest,
                  ),
                  const SizedBox(height: 12),
                  // Up next list
                  if (_current < _plan.length - 1) ...[
                    const Text('Up next', style: TextStyle(color: Colors.white70)),
                    const SizedBox(height: 8),
                    SizedBox(
                      height: 84,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemBuilder: (_, i) {
                          final ix = _current + 1 + i;
                          if (ix >= _plan.length) return const SizedBox.shrink();
                          final e = _plan[ix];
                          return _UpNextTile(e: e, idx: ix + 1);
                        },
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemCount: min(6, _plan.length - _current - 1),
                      ),
                    ),
                    const SizedBox(height: 8),
                  ],
                  // Controls
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: _current > 0
                              ? () => setState(() {
                                    _current--;
                                    _inRest = false;
                                    _seconds = _secondsPerExercise;
                                  })
                              : null,
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.grey.shade800, padding: const EdgeInsets.symmetric(vertical: 12)),
                          icon: const Icon(Icons.skip_previous),
                          label: const Text('Prev'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: _toggle,
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.red, padding: const EdgeInsets.symmetric(vertical: 12)),
                          icon: Icon(_running ? Icons.pause : Icons.play_arrow),
                          label: Text(_running ? 'Pause' : 'Start'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: _current < _plan.length - 1
                              ? () => setState(() {
                                    _current++;
                                    _inRest = false;
                                    _seconds = _secondsPerExercise;
                                  })
                              : null,
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.grey.shade800, padding: const EdgeInsets.symmetric(vertical: 12)),
                          icon: const Icon(Icons.skip_next),
                          label: const Text('Next'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Rest toggle and summary
                  Row(
                    children: [
                      Switch(
                        value: _restEnabled,
                        onChanged: (v) => setState(() {
                          _restEnabled = v;
                          if (!v && _inRest) {
                            _inRest = false;
                            _seconds = _secondsPerExercise;
                          }
                        }),
                      ),
                      const Text('Include 20s rest', style: TextStyle(color: Colors.white70)),
                      const Spacer(),
                      Text('${_secondsPerExercise}s / ex • ${_restEnabled ? '${_restSeconds}s rest' : 'no rest'}',
                          style: const TextStyle(color: Colors.white38)),
                    ],
                  ),
                  // Now playing
                  Row(
                    children: [
                      const Icon(Icons.music_note, color: Colors.white54),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          music.currentTitle,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: Colors.white70),
                        ),
                      ),
                      IconButton(
                        icon: Icon(music.playerState == PlayerState.playing ? Icons.pause : Icons.play_arrow, color: Colors.white70),
                        onPressed: music.hasTracks ? music.playPause : null,
                      )
                    ],
                  )
                ],
              ),
            ),
    );
  }

  void _regenerate() {
    if (_service.all.isEmpty) return;
    final p = Random();
    final pool = _service.all.where((e) => e.tags.contains(widget.focusTag)).toList();
    pool.shuffle(p);
    _plan
      ..clear()
      ..addAll(pool.take(10));
    setState(() {
      _current = 0;
      _inRest = false;
      _seconds = _secondsPerExercise;
    });
  }

  void _openSettings() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.black,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (ctx) {
        int exSec = _secondsPerExercise;
        int restSec = _restSeconds;
        bool rest = _restEnabled;
        return StatefulBuilder(
          builder: (_, setM) => Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Routine Settings', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                Row(children: [
                  const Expanded(child: Text('Seconds per exercise', style: TextStyle(color: Colors.white70))),
                  IconButton(onPressed: () => setM(() => exSec = (exSec - 5).clamp(10, 120)), icon: const Icon(Icons.remove, color: Colors.white70)),
                  Text('$exSec', style: const TextStyle(color: Colors.white)),
                  IconButton(onPressed: () => setM(() => exSec = (exSec + 5).clamp(10, 120)), icon: const Icon(Icons.add, color: Colors.white70)),
                ]),
                const SizedBox(height: 8),
                Row(children: [
                  const Expanded(child: Text('Include rest', style: TextStyle(color: Colors.white70))),
                  Switch(value: rest, onChanged: (v) => setM(() => rest = v)),
                ]),
                if (rest) ...[
                  Row(children: [
                    const Expanded(child: Text('Rest seconds', style: TextStyle(color: Colors.white70))),
                    IconButton(onPressed: () => setM(() => restSec = (restSec - 5).clamp(5, 60)), icon: const Icon(Icons.remove, color: Colors.white70)),
                    Text('$restSec', style: const TextStyle(color: Colors.white)),
                    IconButton(onPressed: () => setM(() => restSec = (restSec + 5).clamp(5, 60)), icon: const Icon(Icons.add, color: Colors.white70)),
                  ]),
                ],
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                    onPressed: () {
                      setState(() {
                        _secondsPerExercise = exSec;
                        _restSeconds = restSec;
                        _restEnabled = rest;
                        _inRest = false;
                        _seconds = _secondsPerExercise;
                      });
                      Navigator.pop(context);
                    },
                    child: const Text('Apply'),
                  ),
                )
              ],
            ),
          ),
        );
      },
    );
  }
}

class _HeaderTimer extends StatelessWidget {
  final String name;
  final List<String> tags;
  final String? imageAsset;
  final String imageUrl;
  final double progress; // 0..1
  final int seconds;
  final int index;
  final int total;
  final VoidCallback onShuffle;
  final bool inRest;

  const _HeaderTimer({
    required this.name,
    required this.tags,
    required this.imageAsset,
    required this.imageUrl,
    required this.progress,
    required this.seconds,
    required this.index,
    required this.total,
    required this.onShuffle,
    required this.inRest,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 280,
      child: Stack(
        children: [
          Positioned.fill(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: imageAsset != null && imageAsset!.isNotEmpty
                  ? Image.asset(imageAsset!, fit: BoxFit.cover)
                  : Image.network(imageUrl, fit: BoxFit.cover, errorBuilder: (_, __, ___) => Container(color: Colors.black26)),
            ),
          ),
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.black.withOpacity(0.2), Colors.black.withOpacity(0.6)],
                ),
              ),
            ),
          ),
          // Top bar
          Positioned(
            top: 12,
            left: 12,
            right: 12,
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(12)),
                  child: Text(inRest ? 'REST' : (tags.isNotEmpty ? tags.first : 'Workout'),
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(12)),
                  child: Text('${index + 1}/$total', style: const TextStyle(color: Colors.white)),
                ),
                IconButton(onPressed: onShuffle, icon: const Icon(Icons.shuffle, color: Colors.white))
              ],
            ),
          ),
          // Center circular timer
          Center(
            child: SizedBox(
              width: 160,
              height: 160,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  CustomPaint(
                    size: const Size(160, 160),
                    painter: _RingPainter(progress: progress, color: inRest ? Colors.lightBlueAccent : Colors.red),
                  ),
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('$seconds', style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text(
                        name,
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: Colors.white70),
                      ),
                    ],
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  final double progress;
  final Color color;
  const _RingPainter({required this.progress, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = min(size.width, size.height) / 2 - 8;
    final bg = Paint()
      ..color = Colors.white12
      ..style = PaintingStyle.stroke
      ..strokeWidth = 10
      ..strokeCap = StrokeCap.round;
    final fg = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 10
      ..strokeCap = StrokeCap.round;
    // background circle
    canvas.drawCircle(center, radius, bg);
    // arc
    final sweep = 2 * pi * progress.clamp(0.0, 1.0);
    final rect = Rect.fromCircle(center: center, radius: radius);
    canvas.drawArc(rect, -pi / 2, sweep, false, fg);
  }

  @override
  bool shouldRepaint(covariant _RingPainter oldDelegate) => oldDelegate.progress != progress || oldDelegate.color != color;
}

class _UpNextTile extends StatelessWidget {
  final ExerciseEntry e;
  final int idx;
  const _UpNextTile({required this.e, required this.idx});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 140,
      decoration: BoxDecoration(color: Colors.grey.shade900, borderRadius: BorderRadius.circular(12)),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.horizontal(left: Radius.circular(12)),
            child: SizedBox(
              width: 70,
              height: 84,
              child: e.assetPath != null && e.assetPath!.isNotEmpty
                  ? Image.asset(e.assetPath!, fit: BoxFit.cover)
                  : Image.network(e.gifUrl, fit: BoxFit.cover, errorBuilder: (_, __, ___) => Container(color: Colors.black26)),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('$idx', style: const TextStyle(color: Colors.white38, fontSize: 12)),
                Text(e.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
              ],
            ),
          )
        ],
      ),
    );
  }
}
