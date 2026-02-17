import 'package:flutter/material.dart';
import 'dart:async';
import 'database_service.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'exercise_repository.dart';
import 'exercise_model.dart';
import 'home_page.dart' show dayPlans;
import 'day_exercise_page.dart' show ExerciseDetailPage;

class FriendWorkoutPlayer extends StatefulWidget {
  final int? dayIndex;
  final String sessionId;
  const FriendWorkoutPlayer({super.key, this.dayIndex, required this.sessionId});

  @override
  State<FriendWorkoutPlayer> createState() => _FriendWorkoutPlayerState();
}

class _FriendWorkoutPlayerState extends State<FriendWorkoutPlayer> {
  final _db = DatabaseService(uid: FirebaseAuth.instance.currentUser?.uid);
  int _exerciseDuration = 30; // default per-exercise seconds
  bool _showWarmup = true;
  List<Exercise> _exercises = [];
  StreamSubscription? _sessionSub;
  DateTime? _scheduledStart;
  int _secondsLeft = 0;
  bool _running = false;
  int _currentIndex = 0;

  Future<void> _saveCustomization() async {
    final metadata = {
      'customization': {
        'exerciseDuration': _exerciseDuration,
        'showWarmup': _showWarmup,
      }
    };
    await _db.updateFriendSession(widget.sessionId, metadata);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Customization saved')));
  }

  Future<void> _loadExercisesForDay() async {
    if (widget.dayIndex == null) return;
    final repo = ExerciseRepository();
    final all = await repo.loadAllExercises();
    final mus = (dayPlans[widget.dayIndex!]['muscleGroups'] as List).map((e) => e.toString().toLowerCase()).toList();
    final filtered = all.where((exercise) {
      final allMuscles = [...exercise.primaryMuscles, ...exercise.secondaryMuscles]
          .map((m) => m.toLowerCase().replaceAll('-', ' ').replaceAll('_', ' ').trim()).toList();
      return allMuscles.any((muscle) => mus.contains(muscle));
    }).toList();
    setState(() {
      _exercises = filtered.take(12).toList();
    });
  }

  void _listenSession() {
    _sessionSub = _db.streamFriendSession(widget.sessionId).listen((s) {
      if (s == null) return;
      // load customization if present
      final custom = s['customization'] as Map<String, dynamic>? ?? s['metadata']?['customization'] as Map<String, dynamic>?;
      if (custom != null) {
        setState(() {
          _exerciseDuration = custom['exerciseDuration'] ?? _exerciseDuration;
          _showWarmup = custom['showWarmup'] ?? _showWarmup;
        });
      }

      // scheduled start handling (stored as ISO string)
      if (s['startAt'] != null) {
        DateTime? serverStart;
        try {
          serverStart = DateTime.tryParse(s['startAt']);
        } catch (_) {}
        if (serverStart != null) {
          final seconds = serverStart.difference(DateTime.now()).inSeconds;
          setState(() {
            _scheduledStart = serverStart;
            _secondsLeft = seconds.clamp(0, 9999);
          });
          // start countdown and auto-start when reaches zero
          Timer.periodic(const Duration(seconds: 1), (t) {
            final left = serverStart!.difference(DateTime.now()).inSeconds;
            if (!mounted) {
              t.cancel();
              return;
            }
            setState(() => _secondsLeft = left.clamp(0, 9999));
            if (left <= 0) {
              t.cancel();
              // begin the synchronized workout
              _startSynchronizedWorkout();
            }
          });
        }
      }
      // if session has 'started' flag (legacy) trigger start as well
      if (s['started'] == true && _scheduledStart == null) {
        _startSynchronizedWorkout();
      }
    });
  }

  void _startSynchronizedWorkout() {
    if (_running) return;
    setState(() => _running = true);
    // Start runner at current index
    Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => _WorkoutSessionRunner(
      exercises: _exercises,
      initialIndex: _currentIndex,
      perExerciseSeconds: _exerciseDuration,
      sessionId: widget.sessionId,
    )));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(title: Text('Workout: Day ${widget.dayIndex != null ? widget.dayIndex! + 1 : ''}')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (widget.dayIndex != null) Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 6.0),
                child: Text('Day ${widget.dayIndex! + 1} - ${dayPlans[widget.dayIndex!]['subtitle']}', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 8),
              Expanded(
                child: _exercises.isEmpty ? const Center(child: CircularProgressIndicator(color: Colors.red)) : PageView.builder(
                  itemCount: _exercises.length,
                  controller: PageController(viewportFraction: 1.0),
                  onPageChanged: (i) => setState(() => _currentIndex = i),
                  itemBuilder: (context, i) {
                    final ex = _exercises[i];
                    return GestureDetector(
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => ExerciseDetailPage(exercises: _exercises, initialIndex: i)));
                      },
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.red.shade900,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            if (ex.images.isNotEmpty)
                              Expanded(child: Padding(
                                padding: const EdgeInsets.all(12.0),
                                child: Image.asset(ex.imagePath, fit: BoxFit.contain),
                              )),
                            const SizedBox(height: 8),
                            Text(ex.name, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
                            const SizedBox(height: 8),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 12.0),
                              child: Text(ex.category, style: const TextStyle(color: Colors.white70), textAlign: TextAlign.center),
                            ),
                            const SizedBox(height: 18),
                            Text('${_exerciseDuration}s', style: const TextStyle(color: Colors.white, fontSize: 20)),
                            const SizedBox(height: 12),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 8),
              if (_scheduledStart != null && !_running)
                Center(child: Text('Starting in: ${_secondsLeft}s', style: const TextStyle(color: Colors.white70, fontSize: 18))),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(child: ElevatedButton(onPressed: _saveCustomization, child: const Text('Save'))),
                  const SizedBox(width: 8),
                  Expanded(child: ElevatedButton(onPressed: () {
                    // manual local start
                    _startSynchronizedWorkout();
                  }, child: const Text('Start'))),
                ],
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _loadExercisesForDay();
    _listenSession();
  }

  @override
  void dispose() {
    _sessionSub?.cancel();
    super.dispose();
  }
}

class _SimpleWorkoutRunner extends StatefulWidget {
  final int duration;
  final bool showWarmup;
  const _SimpleWorkoutRunner({required this.duration, required this.showWarmup});

  @override
  State<_SimpleWorkoutRunner> createState() => _SimpleWorkoutRunnerState();
}

// Synchronized runner used when a session starts. Shows full-screen exercise and advances automatically.
class _WorkoutSessionRunner extends StatefulWidget {
  final List<Exercise> exercises;
  final int initialIndex;
  final int perExerciseSeconds;
  final String sessionId;

  const _WorkoutSessionRunner({required this.exercises, required this.initialIndex, required this.perExerciseSeconds, required this.sessionId});

  @override
  State<_WorkoutSessionRunner> createState() => _WorkoutSessionRunnerState();
}

class _WorkoutSessionRunnerState extends State<_WorkoutSessionRunner> {
  late int _currentIndex;
  late int _remaining;
  Timer? _timer;
  PageController? _pageController;
  StreamSubscription? _sessionSub;
  final _db = DatabaseService(uid: FirebaseAuth.instance.currentUser?.uid);
  bool _pausedBySession = false;
  Map<String, dynamic>? _sessionData;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _remaining = widget.perExerciseSeconds;
    _pageController = PageController(initialPage: _currentIndex);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _startTimer();
      // listen to session document for pause/resume
      _sessionSub = _db.streamFriendSession(widget.sessionId).listen((s) {
        if (s == null) return;
        _sessionData = s;
        final paused = s['paused'] == true;
        if (paused != _pausedBySession) {
          setState(() => _pausedBySession = paused);
          if (paused) {
            _pause();
          } else {
            _resume();
          }
        }
      });
    });
  }

  void _startTimer() {
    _timer?.cancel();
    setState(() => _remaining = widget.perExerciseSeconds);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return t.cancel();
      setState(() => _remaining--);
      if (_remaining <= 0) {
        t.cancel();
        _nextExercise();
      }
    });
  }

  void _nextExercise() {
    if (_currentIndex < widget.exercises.length - 1) {
      setState(() => _currentIndex++);
      _pageController?.animateToPage(_currentIndex, duration: const Duration(milliseconds: 400), curve: Curves.easeInOut);
      // insert a 5s break between exercises
      _showBreakThenStart();
    } else {
      // Completed session
      _timer?.cancel();
      showDialog(context: context, builder: (_) => AlertDialog(backgroundColor: Colors.grey.shade900, title: const Text('Workout complete', style: TextStyle(color: Colors.white)), actions: [TextButton(onPressed: () => Navigator.of(context).popUntil((r) => r.isFirst), child: const Text('Done', style: TextStyle(color: Colors.red)))]));
    }
  }

  void _showBreakThenStart() {
    _timer?.cancel();
    setState(() => _remaining = 5);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return t.cancel();
      setState(() => _remaining--);
      if (_remaining <= 0) {
        t.cancel();
        // start next exercise timer
        setState(() => _remaining = widget.perExerciseSeconds);
        _startTimer();
      }
    });
  }

  void _pause() {
    _timer?.cancel();
  }

  void _resume() {
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController?.dispose();
    _sessionSub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ex = widget.exercises[_currentIndex];
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(title: Text(ex.name)),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: widget.exercises.length,
                itemBuilder: (context, i) {
                  final e = widget.exercises[i];
                  return Container(
                    margin: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: Colors.red.shade900, borderRadius: BorderRadius.circular(12)),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        if (e.images.isNotEmpty) Expanded(child: Padding(padding: const EdgeInsets.all(12.0), child: Image.asset(e.imagePath, fit: BoxFit.contain))),
                        const SizedBox(height: 12),
                        Text(e.name, style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
                        const SizedBox(height: 12),
                        Text(e.category, style: const TextStyle(color: Colors.white70)),
                        const SizedBox(height: 24),
                        Text('$_remaining s', style: const TextStyle(color: Colors.white, fontSize: 48, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 24),
                        Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                          // Single host-only control: Pause / Resume
                          Builder(builder: (context) {
                            final myUid = FirebaseAuth.instance.currentUser?.uid;
                            final isHost = _sessionData != null && _sessionData!['host'] == myUid;
                            if (!isHost) {
                              return Text(_pausedBySession ? 'Paused by host' : 'Running', style: const TextStyle(color: Colors.white70));
                            }
                            return Row(children: [
                              ElevatedButton(
                                onPressed: () async {
                                  final paused = _sessionData?['paused'] == true;
                                  await _db.updateFriendSession(widget.sessionId, {'paused': !paused});
                                },
                                style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                                child: Text(_pausedBySession ? 'Resume' : 'Pause'),
                              ),
                              const SizedBox(width: 12),
                              ElevatedButton(
                                onPressed: () async {
                                  // Restart the synchronized workout for all participants (5s countdown)
                                  final startAt = DateTime.now().add(const Duration(seconds: 5));
                                  await _db.updateFriendSessionStart(widget.sessionId, true, startAt: startAt, metadata: _sessionData?['metadata']);
                                },
                                style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
                                child: const Text('Restart'),
                              ),
                            ]);
                          }),
                        ])
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SimpleWorkoutRunnerState extends State<_SimpleWorkoutRunner> {
  int _seconds = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _start();
  }

  void _start() {
    _seconds = widget.duration;
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      setState(() => _seconds--);
      if (_seconds <= 0) {
        t.cancel();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Running')),
      body: Center(child: Text('Time left: $_seconds s', style: const TextStyle(fontSize: 32))),
    );
  }
}
