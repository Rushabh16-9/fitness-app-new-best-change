
import 'package:flutter/material.dart';
import 'exercise_repository.dart';
import 'exercise_model.dart';
import 'package:audioplayers/audioplayers.dart';
// music selection moved to the Music page
import 'services/voice_coach_service.dart';
import 'package:provider/provider.dart';
import 'services/music_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'music_playlist_page.dart';
import 'dart:async';
// import 'widgets/ai_exercise_assistant.dart'; // not used here after UI changes

class DayExercisePage extends StatefulWidget {
  final int day;
  final String title;
  final List<String> muscleGroups;

  const DayExercisePage({super.key, required this.day, required this.title, required this.muscleGroups});

  @override
  State<DayExercisePage> createState() => _DayExercisePageState();
}

class _DayExercisePageState extends State<DayExercisePage> {
  List<Exercise> filteredExercises = [];
  bool isLoading = true;
  late List<bool> completed;
  late List<int> timers;
  final int minExercisesPerDay = 5;

  @override
  void initState() {
    super.initState();
    completed = [];
    timers = [];
    _loadExercises();
  }

  Future<void> _loadExercises() async {
    final repo = ExerciseRepository();
    List<Exercise> all = await repo.loadAllExercises();
    final targetMuscles = widget.muscleGroups.map((m) => m.toLowerCase().replaceAll('-', ' ').replaceAll('_', ' ').trim()).toList();
    final filtered = all.where((exercise) {
      // Only show exercises where ANY primaryMuscles OR secondaryMuscles matches ANY target muscle exactly
      final allMuscles = [...exercise.primaryMuscles, ...exercise.secondaryMuscles]
          .map((m) => m.toLowerCase().replaceAll('-', ' ').replaceAll('_', ' ').trim())
          .toList();
      return allMuscles.any((muscle) => targetMuscles.contains(muscle));
    }).toList();
    setState(() {
      filteredExercises = filtered.take(minExercisesPerDay).toList();
      completed = List<bool>.filled(filteredExercises.length, false);
      timers = List<int>.filled(filteredExercises.length, 30); // 30 seconds per exercise
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Day ${widget.day} Exercises'),
        backgroundColor: Colors.black,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.red))
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    itemCount: filteredExercises.length,
                    itemBuilder: (context, idx) {
                      final ex = filteredExercises[idx];
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: _ExerciseCard(
                          exercise: ex,
                          durationSeconds: timers[idx],
                          completed: completed[idx],
                          onToggleComplete: (v) {
                            setState(() => completed[idx] = v);
                          },
                          onOpen: () async {
                            // open animated detail view
                            await Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => ExerciseDetailPage(
                                  exercises: filteredExercises,
                                  initialIndex: idx,
                                ),
                              ),
                            );
                            // optionally refresh after return
                            setState(() {});
                          },
                        ),
                      );
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: ElevatedButton(
                    onPressed: completed.every((c) => c)
                        ? () async {
                            // Show workout summary modal before returning to home
                            final totalSeconds = timers.fold<int>(0, (a, b) => a + b);
                            final calories = (totalSeconds * 0.12).round();
                            await showWorkoutSummary(context, totalSeconds: totalSeconds, calories: calories, day: widget.day, onContinue: () {
                              Navigator.pop(context, true);
                            });
                          }
                        : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.redAccent,
                      padding: EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(
                      completed.every((c) => c) ? 'Back to Home' : 'Complete all to unlock',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}

// Timer widget for each exercise
class TimerWidget extends StatefulWidget {
  final int seconds;
  final VoidCallback? onTimerComplete;
  const TimerWidget({super.key, required this.seconds, this.onTimerComplete});

  @override
  State<TimerWidget> createState() => _TimerWidgetState();
}

class _TimerWidgetState extends State<TimerWidget> {
  late int remaining;
  bool running = false;

  @override
  void initState() {
    super.initState();
    remaining = widget.seconds;
  }

  void startTimer() {
    if (running || remaining == 0) return;
    running = true;
    Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) {
        t.cancel();
        return;
      }
      setState(() {
        if (remaining > 0) remaining--;
        if (remaining == 0) {
          running = false;
          widget.onTimerComplete?.call();
          t.cancel();
        }
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text('$remaining s', style: TextStyle(color: Colors.white)),
        IconButton(
          icon: Icon(Icons.play_arrow, color: Colors.white),
          onPressed: remaining > 0 ? startTimer : null,
        ),
      ],
    );
  }
}

class ExerciseDetailPage extends StatefulWidget {
  final List<Exercise> exercises;
  final int initialIndex;
  const ExerciseDetailPage({super.key, required this.exercises, required this.initialIndex});

  @override
  State<ExerciseDetailPage> createState() => _ExerciseDetailPageState();
}

class _ExerciseDetailPageState extends State<ExerciseDetailPage> {
  late int currentIndex;
  int sets = 3;
  int reps = 15;
  int timerSeconds = 30;
  bool timerRunning = false;
  bool timerDone = false;
  int remaining = 30;
  Timer? _timer;
  // Music and voice coach
  final AudioPlayer _musicPlayer = AudioPlayer();
  bool _voiceEnabled = true;
  final VoiceCoachService _voiceCoach = VoiceCoachService();
  Future<void> playAlarmSound() async {
    // Disabled: we no longer play the alarm sound from here. Playback is handled
    // by the Music page / MusicService if the user chooses to play music.
    return;
  }

  @override
  void initState() {
    super.initState();
    currentIndex = widget.initialIndex;
  sets = 3;
  reps = 15;
  timerSeconds = getTimerForExercise(widget.exercises[currentIndex]);
  remaining = timerSeconds;
  // load voice preference (default true)
  () async {
    final p = await SharedPreferences.getInstance();
    final enabled = p.getBool('voice_coach_enabled');
    if (enabled != null) {
      setState(() => _voiceEnabled = enabled);
    }
  }();
  // Register music duck callback once the widget is mounted and providers are available.
  WidgetsBinding.instance.addPostFrameCallback((_) {
    try {
      final ms = Provider.of<MusicService>(context, listen: false);
      _voiceCoach.setDuckCallback((bool duck) async {
        try {
          await ms.duck(duck);
        } catch (_) {}
      });
    } catch (_) {}
  });
  }

  bool isDumbbellExercise(Exercise ex) {
    final name = ex.name.toLowerCase();
    return name.contains('dumbbell') || name.contains('dumbell') || name.contains('dumbules');
  }

  int getTimerForExercise(Exercise ex) {
    if (isDumbbellExercise(ex)) {
      return 0;
    }
    if (ex.category.toLowerCase().contains('cardio')) return 30;
    if (ex.category.toLowerCase().contains('strength')) return 45;
    return 30;
  }

  void startTimer() {
    if (timerRunning || remaining == 0) return;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) {
        t.cancel();
        return;
      }
      setState(() {
        if (remaining > 0) remaining--;
        if (remaining == 0) {
          t.cancel();
          timerRunning = false;
          timerDone = true;
          // play a single alarm when timer completes
          playAlarmSound();
          // stop music and voice coach on completion
          _musicPlayer.stop();
          if (_voiceEnabled) _voiceCoach.speak("Great job — exercise complete!");
        }
        // call voice coach on each tick for milestones
        if (_voiceEnabled) _voiceCoach.onTick(remainingSeconds: remaining, totalSeconds: timerSeconds);
      });
    });
    setState(() { timerRunning = true; });
    // Music is intentionally not auto-started here. Users can open the Music
    // page (via the Music button) and control playback there while exercising.
    // small prompt
    if (_voiceEnabled) _voiceCoach.speak("Start now — focus on form and breathe");
  }

  void pauseTimer() {
    _timer?.cancel();
    setState(() { timerRunning = false; });
    // pause music and voice prompts
    try { _musicPlayer.pause(); } catch (e) {}
    if (_voiceEnabled) _voiceCoach.stop();
  }

  void resetTimer() {
    _timer?.cancel();
    setState(() { remaining = timerSeconds; timerDone = false; timerRunning = false; });
    try { _musicPlayer.stop(); } catch (e) {}
    if (_voiceEnabled) _voiceCoach.stop();
  }

  void nextExercise() {
    // cancel running timer first
    _timer?.cancel();
  try { _musicPlayer.stop(); } catch (e) {}
    _voiceCoach.stop();
    if (currentIndex < widget.exercises.length - 1) {
      setState(() {
        currentIndex++;
        timerSeconds = getTimerForExercise(widget.exercises[currentIndex]);
        remaining = timerSeconds;
        timerDone = false;
        timerRunning = false;
      });
    } else {
      // if last exercise, just mark done
      setState(() {
        timerDone = true;
        timerRunning = false;
      });
    }
      // confirmation sound disabled
  }

  // _getExerciseType removed - not needed in this file after UI updates

  void previousExercise() {
    if (currentIndex > 0) {
      setState(() {
        currentIndex--;
        timerSeconds = getTimerForExercise(widget.exercises[currentIndex]);
        remaining = timerSeconds;
        timerDone = false;
        timerRunning = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final ex = widget.exercises[currentIndex];
    // detail animation key
    final detailKey = ValueKey<int>(currentIndex);
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          // voice toggle: tap to toggle voice coach on/off (persisted)
          IconButton(
            tooltip: _voiceEnabled ? 'Voice coach: On' : 'Voice coach: Off',
            icon: Icon(_voiceEnabled ? Icons.record_voice_over : Icons.record_voice_over_outlined, color: _voiceEnabled ? Colors.redAccent : Colors.white70),
            onPressed: () async {
              final p = await SharedPreferences.getInstance();
              setState(() => _voiceEnabled = !_voiceEnabled);
              await p.setBool('voice_coach_enabled', _voiceEnabled);
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(_voiceEnabled ? 'Voice coach enabled' : 'Voice coach disabled')));
            },
          ),
        ],
      ),
      body: SafeArea(
        bottom: false,
        child: Container(
          color: Colors.grey[900],
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // AnimatedSwitcher for transitions between exercises
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 450),
                  transitionBuilder: (child, anim) => FadeTransition(opacity: anim, child: SlideTransition(position: Tween<Offset>(begin: const Offset(0.0, 0.1), end: Offset.zero).animate(anim), child: child)),
                  child: Container(
                    key: detailKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                                if (ex.images.isNotEmpty)
                                  _FadeImage(assetPath: ex.assetImage ?? ex.imagePath, height: 320),
                        const SizedBox(height: 12),
                        Text(ex.name.toUpperCase(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 24), textAlign: TextAlign.center),
                        const SizedBox(height: 8),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                if (isDumbbellExercise(ex)) ...[
                  // Use a Wrap so the sets/reps controls flow on small screens instead of overflowing
                  Wrap(
                    alignment: WrapAlignment.center,
                    spacing: 12,
                    runSpacing: 8,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      const Text('SETS:', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 20)),
                      // Constrain dropdown width so it doesn't cause overflow
                      SizedBox(
                        width: 88,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          decoration: BoxDecoration(
                            color: Colors.grey[850],
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: DropdownButton<int>(
                            isExpanded: true,
                            value: sets,
                            dropdownColor: Colors.grey[900],
                            style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                            iconSize: 28,
                            underline: const SizedBox.shrink(),
                            items: List.generate(10, (i) => DropdownMenuItem(value: i + 1, child: Text('${i + 1}', style: const TextStyle(fontSize: 18)))),
                            onChanged: (val) => setState(() { sets = val ?? 3; }),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text('REPS:', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 20)),
                      SizedBox(
                        width: 88,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          decoration: BoxDecoration(
                            color: Colors.grey[850],
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: DropdownButton<int>(
                            isExpanded: true,
                            value: reps,
                            dropdownColor: Colors.grey[900],
                            style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                            iconSize: 28,
                            underline: const SizedBox.shrink(),
                            items: List.generate(50, (i) => DropdownMenuItem(value: i + 1, child: Text('${i + 1}', style: const TextStyle(fontSize: 18)))),
                            onChanged: (val) => setState(() { reps = val ?? 15; }),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      shape: const CircleBorder(),
                      padding: const EdgeInsets.all(24),
                    ),
                    onPressed: nextExercise,
                    child: const Icon(Icons.check, color: Colors.white, size: 40),
                  ),
                ] else ...[
                  // Larger image and elevated placement for a tall, centered layout
                  // Image is already displayed above via _FadeImage inside the AnimatedSwitcher.
                  // Keep a single prominent image here (name shown above with the image), avoid duplicating it.
                  const SizedBox(height: 28),
                  // Timer display
                  Text(
                    '${(remaining ~/ 60).toString().padLeft(2, '0')}:${(remaining % 60).toString().padLeft(2, '0')}',
                    style: const TextStyle(fontSize: 72, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 12),
                  // Single toggle start/pause button (with glow), reset, and complete
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Play/Pause with pulsing glow
                      _PlayPauseButton(isPlaying: timerRunning, enabled: remaining > 0, onPressed: () {
                        if (timerRunning) {
                          pauseTimer();
                        } else {
                          startTimer();
                        }
                      }),
                      const SizedBox(width: 20),
                      // Reset
                      ElevatedButton(
                        onPressed: resetTimer,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.grey[800],
                          shape: const CircleBorder(),
                          padding: const EdgeInsets.all(16),
                        ),
                        child: const Icon(Icons.refresh, color: Colors.white, size: 28),
                      ),
                      const SizedBox(width: 20),
                      // Complete (confirm if not finished)
                      ElevatedButton(
                        onPressed: () async {
                          if (!timerDone) {
                            final res = await showDialog<bool>(context: context, builder: (_) => AlertDialog(
                              backgroundColor: Colors.black,
                              title: const Text('Mark complete?', style: TextStyle(color: Colors.white)),
                              content: const Text('Timer has not finished. Mark this exercise complete?', style: TextStyle(color: Colors.white70)),
                              actions: [
                                TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
                                TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Yes')),
                              ],
                            ));
                            if (res != true) return;
                          }
                          nextExercise();
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.grey[800],
                          shape: const CircleBorder(),
                          padding: const EdgeInsets.all(28),
                        ),
                        child: const Icon(Icons.check, color: Colors.white, size: 36),
                      ),
                    ],
                  ),
                  ],
                const SizedBox(height: 24),
                // Controls row: Previous • Music • Next
                Wrap(
                  alignment: WrapAlignment.center,
                  spacing: 12,
                  runSpacing: 8,
                  children: [
                    TextButton.icon(
                      onPressed: previousExercise,
                      icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
                      label: const Text('Previous', style: TextStyle(color: Colors.white)),
                    ),
                    // Open the Music page so the user can pick/play tracks while exercising
                    TextButton.icon(
                      onPressed: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const MusicPlaylistPage()));
                      },
                      icon: const Icon(Icons.music_note, color: Colors.white),
                      label: const Text('Music', style: TextStyle(color: Colors.white)),
                    ),
                    TextButton.icon(
                      onPressed: nextExercise,
                      icon: const Icon(Icons.arrow_forward_ios, color: Colors.white),
                      label: const Text('Next', style: TextStyle(color: Colors.white)),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
      // Music control moved into the page controls (opens MusicPlaylistPage). No FAB here.
    );
  }
}

// Small fade-in image widget for nicer visuals
class _FadeImage extends StatefulWidget {
  final String assetPath;
  final double height;
  const _FadeImage({required this.assetPath, this.height = 220});

  @override
  State<_FadeImage> createState() => _FadeImageState();
}

class _FadeImageState extends State<_FadeImage> with SingleTickerProviderStateMixin {
  bool _visible = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => setState(() => _visible = true));
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      duration: const Duration(milliseconds: 450),
      opacity: _visible ? 1 : 0,
      child: ClipRRect(borderRadius: BorderRadius.circular(12), child: Image.asset(widget.assetPath, height: widget.height, fit: BoxFit.contain)),
    );
  }
}

// Premium exercise card used in the Day list
class _ExerciseCard extends StatelessWidget {
  final Exercise exercise;
  final int durationSeconds;
  final bool completed;
  final ValueChanged<bool> onToggleComplete;
  final VoidCallback onOpen;

  const _ExerciseCard({required this.exercise, required this.durationSeconds, required this.completed, required this.onToggleComplete, required this.onOpen});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onOpen,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(colors: [Colors.red.shade800, Colors.red.shade600], begin: Alignment.topLeft, end: Alignment.bottomRight),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.6), blurRadius: 12, offset: const Offset(0, 6))],
        ),
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.asset(
                    exercise.assetImage ?? exercise.imagePath,
                    width: 96,
                    height: 96,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(width: 96, height: 96, color: Colors.black26),
                  ),
                ),
                Positioned(
                  left: 6,
                  top: 6,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: Colors.black45, borderRadius: BorderRadius.circular(8)),
                    child: Text(exercise.category, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(exercise.name, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                Row(children: [
                  const Icon(Icons.timer, color: Colors.white70, size: 14),
                  const SizedBox(width: 6),
                  Text('${(durationSeconds ~/ 60)}:${(durationSeconds % 60).toString().padLeft(2, '0')}', style: const TextStyle(color: Colors.white70)),
                ]),
                const SizedBox(height: 8),
                Row(children: [
                  ElevatedButton(
                    onPressed: onOpen,
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.black, padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                    child: Row(children: const [Icon(Icons.play_arrow, color: Colors.white), SizedBox(width: 6), Text('Start', style: TextStyle(color: Colors.white))]),
                  ),
                ]),
              ]),
            ),
            Column(mainAxisSize: MainAxisSize.min, children: [
              Checkbox(value: completed, onChanged: (v) => onToggleComplete(v ?? false), activeColor: Colors.greenAccent),
            ])
          ],
        ),
      ),
    );
  }
}

// Show a workout summary modal (call this when finishing the day's plan)
Future<void> showWorkoutSummary(BuildContext context, {required int totalSeconds, required int calories, required int day, required VoidCallback onContinue}) async {
  await showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.black,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
    builder: (ctx) {
      return Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const SizedBox(height: 8),
          Container(width: 48, height: 6, decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(4))),
          const SizedBox(height: 12),
          const Text('Workout Summary', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
            Column(children: [Text('${(totalSeconds ~/ 60)}m', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)), const SizedBox(height: 4), const Text('Time', style: TextStyle(color: Colors.white70))]),
            Column(children: [Text('$calories kcal', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)), const SizedBox(height: 4), const Text('Calories', style: TextStyle(color: Colors.white70))]),
          ]),
          const SizedBox(height: 20),
          const Text('🔥 You\'re Crushing It!', style: TextStyle(color: Colors.redAccent, fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              onContinue();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.black,
              side: const BorderSide(color: Colors.redAccent, width: 2),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
            child: Text('Continue to Day ${day + 1}', style: const TextStyle(color: Colors.white)),
          ),
          const SizedBox(height: 12),
        ]),
      );
    },
  );
}

// Play/pause button with pulsing glow
class _PlayPauseButton extends StatefulWidget {
  final bool isPlaying;
  final bool enabled;
  final VoidCallback onPressed;
  const _PlayPauseButton({required this.isPlaying, required this.enabled, required this.onPressed});

  @override
  State<_PlayPauseButton> createState() => _PlayPauseButtonState();
}

class _PlayPauseButtonState extends State<_PlayPauseButton> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 900));
    _ctrl.addStatusListener((s) { if (s == AnimationStatus.completed) _ctrl.repeat(); });
    if (widget.isPlaying) _ctrl.repeat();
  }

  @override
  void didUpdateWidget(covariant _PlayPauseButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isPlaying && !_ctrl.isAnimating) _ctrl.repeat();
    if (!widget.isPlaying && _ctrl.isAnimating) _ctrl.stop();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (context, child) {
        final glow = widget.isPlaying ? (_ctrl.value * 0.6 + 0.4) : 0.0;
        return Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: widget.enabled ? [BoxShadow(color: Colors.red.withOpacity(glow), blurRadius: 12 * glow + 4, spreadRadius: 1.0 * glow)] : [],
          ),
          child: ElevatedButton(
            onPressed: widget.enabled ? widget.onPressed : null,
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, shape: const CircleBorder(), padding: const EdgeInsets.all(20)),
            child: Icon(widget.isPlaying ? Icons.pause : Icons.play_arrow, color: Colors.white, size: 36),
          ),
        );
      },
    );
  }
}
