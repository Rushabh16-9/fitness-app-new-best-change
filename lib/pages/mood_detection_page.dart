import 'package:flutter/material.dart';
import '../services/mood_service.dart';
import 'package:provider/provider.dart';
import '../widgets/mood_recommendation_card.dart';
import 'face_mood_capture_page.dart';
import 'exercise_runner_page.dart';

class MoodDetectionPage extends StatefulWidget {
  const MoodDetectionPage({super.key});

  @override
  State<MoodDetectionPage> createState() => _MoodDetectionPageState();
}

class _MoodDetectionPageState extends State<MoodDetectionPage> {
  final List<int> _answers = [3, 3, 3, 3, 3];
  bool _loading = false;
  late final MoodService _moodService;
  bool _initialized = false;

  final List<String> _questions = [
    'How energetic do you feel right now?',
    'How stressed do you feel?',
    'How motivated are you to exercise?',
    'How well did you sleep last night?',
    'How calm/relaxed do you feel?'
  ];

  @override
  void initState() {
    super.initState();
    _moodService = MoodService();
    _initializeService();
  }

  Future<void> _initializeService() async {
    setState(() => _loading = true);
    await _moodService.initialize();
    setState(() {
      _loading = false;
      _initialized = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: _moodService,
      child: Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(title: const Text('Mood Detection'), backgroundColor: Colors.red),
      body: Consumer<MoodService>(builder: (context, svc, _) {
        return _loading 
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircularProgressIndicator(color: Colors.red),
                  const SizedBox(height: 16),
                  Text(
                    _initialized ? 'Analyzing your mood...' : 'Loading 1500+ exercises...',
                    style: const TextStyle(color: Colors.white70),
                  ),
                ],
              ),
            )
          : SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Quick Mood Check', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Answer five quick questions to personalize your workout.', style: TextStyle(color: Colors.white70)),
            const SizedBox(height: 16),
            ...List.generate(_questions.length, (i) => _buildQuestion(i)),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(child: ElevatedButton(onPressed: () => _onSubmit(context), style: ElevatedButton.styleFrom(backgroundColor: Colors.red), child: const Text('Detect Mood & Recommend'))),
            ]),
            const SizedBox(height: 8),
            Row(children: [
              Expanded(child: OutlinedButton.icon(onPressed: () async {
                // Open selfie capture flow
                await Navigator.push(context, MaterialPageRoute(builder: (_) => const FaceMoodCapturePage()));
              }, icon: const Icon(Icons.camera_alt, color: Colors.white70), label: const Text('Use Selfie for mood', style: TextStyle(color: Colors.white70)))),
            ]),
            const SizedBox(height: 20),
            if (svc.detectedMood != null) ...[
              Text('Detected mood: ${svc.detectedMood}', style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text('Recommendations', style: TextStyle(color: Colors.white70)),
              const SizedBox(height: 8),
              ...svc.recommendations.map((r) => MoodRecommendationCard(recommendation: r, onStart: (rec) => _onStartRec(context, rec))),
            ]
          ]),
        );
      }),
    ));
  }

  Widget _buildQuestion(int idx) {
    final q = _questions[idx];
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: Colors.grey[900], borderRadius: BorderRadius.circular(12)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(q, style: const TextStyle(color: Colors.white)),
        const SizedBox(height: 8),
        Row(children: List.generate(5, (i) {
          final val = i + 1;
          final selected = _answers[idx] == val;
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4.0),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: selected ? Colors.red : Colors.grey[800],
                ),
                onPressed: () => setState(() => _answers[idx] = val),
                child: Text('$val', style: const TextStyle(color: Colors.white)),
              ),
            ),
          );
        }))
      ]),
    );
  }

  Future<void> _onSubmit(BuildContext ctx) async {
    setState(() => _loading = true);
    try {
      final svc = Provider.of<MoodService>(ctx, listen: false);
      await svc.detectAndGenerate(_answers);
      setState(() => _loading = false);
      // scroll to results is automatic since content is appended
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text('Failed to detect mood: $e')));
    }
  }

  void _onStartRec(BuildContext ctx, Map<String, dynamic> rec) async {
    // Ask duration override (optional) and then confirm start - simulate gym time picker
    final chosen = await showDialog<int>(context: ctx, builder: (_) {
      int minutes = (rec['durationSeconds'] ?? 600) ~/ 60;
      return AlertDialog(
        backgroundColor: Colors.black,
        title: Text('Start ${rec['title']}', style: const TextStyle(color: Colors.white)),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          const Text('Choose duration (minutes)', style: TextStyle(color: Colors.white70)),
          const SizedBox(height: 8),
          StatefulBuilder(builder: (c, setS) => Row(children: [
            IconButton(onPressed: () => setS(() => minutes = (minutes - 1).clamp(5, 180)), icon: const Icon(Icons.remove, color: Colors.white70)),
            Expanded(child: Center(child: Text('$minutes', style: const TextStyle(color: Colors.white, fontSize: 18)))),
            IconButton(onPressed: () => setS(() => minutes = (minutes + 1).clamp(5, 180)), icon: const Icon(Icons.add, color: Colors.white70)),
          ]))
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(onPressed: () => Navigator.pop(ctx, minutes), child: const Text('Start'))
        ],
      );
    });

    if (chosen != null) {
      if (mounted) ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text('Starting "${rec['title']}" for $chosen minutes')));
      // Convert exercises to expected shape for the runner; preserve image/gifUrl/instructions/etc and fill durations if missing
      final rawExercises = List<Map<String, dynamic>>.from(rec['exercises'] as List);
      final perExerciseDuration = ((rec['durationSeconds'] ?? (chosen * 60)) ~/ rawExercises.length);
      final exs = rawExercises.map((e) {
        final m = Map<String, dynamic>.from(e);
        m['name'] = m['name'] ?? m['title'] ?? 'Exercise';
        m['duration'] = m['duration'] ?? perExerciseDuration;
        // Ensure keys 'image' and 'gifUrl' are passed through if present from the database
        return m;
      }).toList();

      // Open the exercise runner
      Navigator.push(ctx, MaterialPageRoute(builder: (_) => ExerciseRunnerPage(exercises: exs, totalMinutes: chosen)));
    }
  }
}
