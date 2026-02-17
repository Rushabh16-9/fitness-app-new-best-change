import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'day_exercise_page.dart';
import 'database_service.dart';
import 'exercise_explorer_page.dart';
import 'services/hydration_service.dart';
import 'services/exercise_catalog_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'quick_routine_page.dart';
import 'diet_plan_page.dart';
import 'ai_plan_page.dart';
import 'chatbot_widget.dart';
import 'progress_dashboard_page.dart';
import 'food_calorie_page.dart';
import 'pages/mood_detection_page.dart';
import 'friends_page.dart';
import 'music_playlist_page.dart';

final List<Map<String, dynamic>> dayPlans = List.generate(30, (i) => {
      'title': 'Day ${i + 1}',
      'subtitle': _getSubtitle(i),
      'muscleGroups': _getMuscleGroups(i),
    });

String _getSubtitle(int i) {
  const subs = [
    'Biceps & Forearms',
    'Calves & Middle Back',
    'Abdominals & Chest',
    'Lats & Triceps',
    'Shoulders',
    'Rest',
    'Quads & Hamstrings',
    'Chest & Triceps',
    'Back & Biceps',
    'Legs',
    'Shoulders',
    'Abs',
    'Rest',
    'Biceps & Forearms',
    'Calves & Middle Back',
    'Abdominals & Chest',
    'Lats & Triceps',
    'Shoulders',
    'Quads & Hamstrings',
    'Chest & Triceps',
    'Back & Biceps',
    'Legs',
    'Shoulders',
    'Abs',
    'Rest',
    'Biceps & Forearms',
    'Calves & Middle Back',
    'Abdominals & Chest',
    'Lats & Triceps',
    'Shoulders',
  ];
  return subs[i % subs.length];
}

List<String> _getMuscleGroups(int i) {
  const plans = [
    ['Biceps', 'Forearms'],
    ['Calves', 'Middle Back'],
    ['Abdominals', 'Chest'],
    ['Lats', 'Triceps'],
    ['Shoulders'],
    ['Rest'],
    ['Quads', 'Hamstrings'],
    ['Chest', 'Triceps'],
    ['Back', 'Biceps'],
    ['Legs'],
    ['Shoulders'],
    ['Abs'],
    ['Rest'],
    ['Biceps', 'Forearms'],
    ['Calves', 'Middle Back'],
    ['Abdominals', 'Chest'],
    ['Lats', 'Triceps'],
    ['Shoulders'],
    ['Quads', 'Hamstrings'],
    ['Chest', 'Triceps'],
    ['Back', 'Biceps'],
    ['Legs'],
    ['Shoulders'],
    ['Abs'],
    ['Rest'],
    ['Biceps', 'Forearms'],
    ['Calves', 'Middle Back'],
    ['Abdominals', 'Chest'],
    ['Lats', 'Triceps'],
    ['Shoulders'],
  ];
  return plans[i % plans.length];
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int completedDays = 0;
  late DatabaseService _databaseService;
  bool _loading = true;
  final HydrationService _hydration = HydrationService();
  int _todayWater = 0;
  final ExerciseCatalogService _exService = ExerciseCatalogService();
  List<ExerciseEntry> _favExercises = [];
  int _hydrationGoal = 2500; // ml
  int _hydrationIntervalMin = 120; // minutes

  @override
  void initState() {
    super.initState();
    _databaseService = DatabaseService(uid: FirebaseAuth.instance.currentUser?.uid);
    _loadPersistedProgress();
  }

  Future<void> _loadPersistedProgress() async {
    try {
      final history = await _databaseService.getCompletedDayHistory();
      final uniqueDays = history.map((e) => e['day'] as int).toSet();
      final water = await _hydration.getTodayMl();

      await _exService.load();
      final p = await SharedPreferences.getInstance();
      final favIds = p.getStringList('exercise_faves') ?? [];
      final favs = _exService.all.where((e) => favIds.contains(e.id)).take(12).toList();

      if (mounted) {
        setState(() {
          completedDays = uniqueDays.length;
          _todayWater = water;
          _favExercises = favs;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _onDayCompleted(int day) {
    if (day >= completedDays) {
      setState(() {
        completedDays = day + 1;
      });
      _databaseService.addCompletedDay(day + 1);
    }
  }

  @override
  Widget build(BuildContext context) {
    final percent = (completedDays / dayPlans.length).clamp(0.0, 1.0);
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('SmartFit Home', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        actions: [
          IconButton(
            tooltip: 'Progress',
            icon: const Icon(Icons.insights, color: Colors.white),
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => ProgressDashboardPage())),
          ),
          IconButton(
            tooltip: 'Menu',
            icon: const Icon(Icons.more_vert, color: Colors.white),
            onPressed: () => _showOptionsMenu(context),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Colors.red))
          : Stack(
              children: [
                SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Welcome section
                      Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Welcome back!',
                                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white)),
                            const Text('Choose your fitness journey',
                                style: TextStyle(fontSize: 14, color: Colors.white70)),
                            const SizedBox(height: 16),
                            // Progress indicator
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Progress', style: TextStyle(fontSize: 16, color: Colors.white)),
                                const SizedBox(height: 8),
                                LinearProgressIndicator(
                                  value: percent,
                                  backgroundColor: Colors.grey[800],
                                  color: Colors.red,
                                  minHeight: 6,
                                ),
                                const SizedBox(height: 4),
                                Text('${(percent * 100).toStringAsFixed(0)}% Complete',
                                    style: const TextStyle(color: Colors.white70, fontSize: 12)),
                              ],
                            ),
                          ],
                        ),
                      ),
                      // Main feature cards
                      SizedBox(
                        height: 180,
                        child: SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Row(
                            children: [
                              SizedBox(
                                width: MediaQuery.of(context).size.width * 0.7,
                                child: _buildMainFeatureCard(
                                  context,
                                  title: 'Diet Plans',
                                  subtitle: 'Personalized nutrition',
                                  icon: Icons.restaurant_menu,
                                  gradient: const LinearGradient(
                                    colors: [Colors.green, Colors.teal],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                  onTap: () => Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (_) => DietPlanPage()),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 16),
                              SizedBox(
                                width: MediaQuery.of(context).size.width * 0.6,
                                child: _buildMainFeatureCard(
                                  context,
                                  title: 'Hydration',
                                  subtitle: '${(_todayWater / 1000).toStringAsFixed(1)} L today',
                                  icon: Icons.water_drop,
                                  gradient: const LinearGradient(
                                    colors: [Colors.lightBlueAccent, Colors.blue],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                  onTap: () => _openHydrationSettings(context),
                                ),
                              ),
                              const SizedBox(width: 16),
                              SizedBox(
                                width: MediaQuery.of(context).size.width * 0.6,
                                child: _buildMainFeatureCard(
                                  context,
                                  title: 'Discover',
                                  subtitle: 'Find exercises',
                                  icon: Icons.search,
                                  gradient: const LinearGradient(
                                    colors: [Colors.red, Colors.deepOrange],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                  onTap: () => Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (_) => ExerciseExplorerPage()),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 16),
                              SizedBox(
                                width: MediaQuery.of(context).size.width * 0.7,
                                child: _buildMainFeatureCard(
                                  context,
                                  title: 'Personalize Plan',
                                  subtitle: 'AI 30-day workout',
                                  icon: Icons.auto_mode,
                                  gradient: const LinearGradient(
                                    colors: [Colors.purple, Colors.indigo],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                  onTap: () => Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (_) => AiPlanPage()),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 16),
                              SizedBox(
                                width: MediaQuery.of(context).size.width * 0.6,
                                child: _buildMainFeatureCard(
                                  context,
                                  title: 'Mood Fitness',
                                  subtitle: 'Detect mood and get a tailored session',
                                  icon: Icons.mood,
                                  gradient: const LinearGradient(
                                    colors: [Colors.teal, Colors.green],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                  onTap: () => Navigator.push(
                    context, MaterialPageRoute(builder: (_) => MoodDetectionPage())),
                                ),
                              ),
                              const SizedBox(width: 16),
                              SizedBox(
                                width: MediaQuery.of(context).size.width * 0.6,
                                child: _buildMainFeatureCard(
                                  context,
                                  title: 'Food Calorie Estimator',
                                  subtitle: 'Snap food or type name to estimate kcal',
                                  icon: Icons.food_bank,
                                  gradient: const LinearGradient(
                                    colors: [Colors.orange, Colors.deepOrangeAccent],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                  onTap: () => Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (_) => FoodCaloriePage()),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      // Quick actions and favorites
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        child: _buildQuickActions(context),
                      ),
                      const SizedBox(height: 12),
                      if (_favExercises.isNotEmpty) ...[
                        SizedBox(
                          height: 140,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            itemBuilder: (_, i) {
                              final ex = _favExercises[i];
                              return _FavCard(
                                title: ex.name,
                                imageAsset: ex.assetPath,
                                imageUrl: ex.gifUrl,
                                onTap: () => _openExercisePreview(context, ex.assetPath, ex.gifUrl),
                              );
                            },
                            separatorBuilder: (_, __) => const SizedBox(width: 12),
                            itemCount: _favExercises.length,
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      // Day-wise plans
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16),
                        child: Text('Day-wise Exercise Plan',
                            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
                      ),
                      const SizedBox(height: 16),
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: dayPlans.length,
                        itemBuilder: (context, idx) {
                          final plan = dayPlans[idx];
                          final isCompleted = idx < completedDays;
                          final isNext = idx == completedDays;
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                            child: GestureDetector(
                              onTap: isNext
                                  ? () async {
                                      final result = await Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => DayExercisePage(
                                            day: idx + 1,
                                            title: plan['title'],
                                            muscleGroups: plan['muscleGroups'],
                                          ),
                                        ),
                                      );
                                      if (result == true) _onDayCompleted(idx);
                                    }
                                  : null,
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 300),
                                decoration: BoxDecoration(
                                  color: isCompleted
                                      ? Colors.grey[900]
                                      : isNext
                                          ? Colors.red[400]
                                          : Colors.red[900],
                                  borderRadius: BorderRadius.circular(16),
                                  boxShadow: [
                                    if (isNext)
                                      BoxShadow(
                                        color: Colors.red.withOpacity(0.3),
                                        blurRadius: 8,
                                        offset: const Offset(0, 4),
                                      ),
                                  ],
                                ),
                                padding: const EdgeInsets.all(20),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        const SizedBox(width: 4),
                                        Expanded(
                                          child: Text(plan['title'],
                                              style: const TextStyle(
                                                  fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                                        ),
                                        if (isCompleted)
                                          const Icon(Icons.check_circle, color: Colors.greenAccent, size: 20),
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                    Text(plan['subtitle'], style: const TextStyle(fontSize: 14, color: Colors.white70)),
                                    if (isNext) ...[
                                      const SizedBox(height: 12),
                                      Align(
                                        alignment: Alignment.centerLeft,
                                        child: Container(
                                          decoration: BoxDecoration(
                                            color: Colors.black,
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                          child: const Text('Start Workout',
                                              style: TextStyle(fontSize: 14, color: Colors.white)),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
                // Chatbot floating bubble
                Positioned(
                  right: 16,
                  bottom: 18,
                  child: SafeArea(child: ChatBotWidget()),
                ),
              ],
            ),
    );
  }

  void _openExercisePreview(BuildContext context, String? assetPath, String gifUrl) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: Colors.black,
        contentPadding: const EdgeInsets.all(0),
        content: AspectRatio(
          aspectRatio: 1,
          child: assetPath != null && assetPath.isNotEmpty
              ? Image.asset(assetPath, fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(color: Colors.black26))
              : Image.network(gifUrl, fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(color: Colors.black26)),
        ),
      ),
    );
  }

  Widget _FavCard({required String title, String? imageAsset, required String imageUrl, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: 180,
        decoration: BoxDecoration(
          color: Colors.grey.shade900,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                child: imageAsset != null && imageAsset.isNotEmpty
                    ? Image.asset(imageAsset, fit: BoxFit.cover, width: double.infinity,
                        errorBuilder: (_, __, ___) => _imgFallback())
                    : Image.network(imageUrl, fit: BoxFit.cover, width: double.infinity,
                        errorBuilder: (_, __, ___) => _imgFallback()),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            )
          ],
        ),
      ),
    );
  }

  Widget _imgFallback() =>
      Container(color: Colors.black26, child: const Center(child: Icon(Icons.fitness_center, color: Colors.white38)));

  Widget _quickBtn(BuildContext context, String label, String tag) {
    return OutlinedButton(
      style: OutlinedButton.styleFrom(
        foregroundColor: Colors.white,
        side: const BorderSide(color: Colors.red),
      ),
      onPressed: () {
        Navigator.push(context, MaterialPageRoute(builder: (_) => QuickRoutinePage(focusTag: tag)));
      },
      child: Text(label, style: const TextStyle(fontSize: 12)),
    );
  }

  Future<void> _openHydrationSettings(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    final goal = prefs.getInt('hydration_goal_ml') ?? _hydrationGoal;
    final interval = prefs.getInt('hydration_interval_min') ?? _hydrationIntervalMin;
    if (!mounted) return;
    int tempGoal = goal;
    int tempInterval = interval;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.black,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (_) {
        return StatefulBuilder(builder: (context, setM) {
          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Hydration Settings',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                Row(
                  children: [
                    const Expanded(child: Text('Daily Goal (ml)', style: TextStyle(color: Colors.white70))),
                    IconButton(
                      onPressed: () => setM(() => tempGoal = (tempGoal - 250).clamp(1000, 5000)),
                      icon: const Icon(Icons.remove, color: Colors.white70),
                    ),
                    Text('$tempGoal', style: const TextStyle(color: Colors.white)),
                    IconButton(
                      onPressed: () => setM(() => tempGoal = (tempGoal + 250).clamp(1000, 5000)),
                      icon: const Icon(Icons.add, color: Colors.white70),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Expanded(child: Text('Reminder Interval (min)', style: TextStyle(color: Colors.white70))),
                    IconButton(
                      onPressed: () => setM(() => tempInterval = (tempInterval - 15).clamp(30, 240)),
                      icon: const Icon(Icons.remove, color: Colors.white70),
                    ),
                    Text('$tempInterval', style: const TextStyle(color: Colors.white)),
                    IconButton(
                      onPressed: () => setM(() => tempInterval = (tempInterval + 15).clamp(30, 240)),
                      icon: const Icon(Icons.add, color: Colors.white70),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                StatefulBuilder(builder: (context2, setM2) {
                  int tempStart = prefs.getInt('hydration_start_hour') ?? 9;
                  int tempEnd = prefs.getInt('hydration_end_hour') ?? 21;
                  bool tempRequire = prefs.getBool('hydration_require_challenge_stop') ?? false;
                  String tempSong = prefs.getString('hydration_song') ?? '';
                  return Column(
                    children: [
                      Row(
                        children: [
                          const Expanded(child: Text('Active Start Hour', style: TextStyle(color: Colors.white70))),
                          IconButton(
                              onPressed: () => setM2(() => tempStart = (tempStart - 1).clamp(0, 23)),
                              icon: const Icon(Icons.remove, color: Colors.white70)),
                          Text('$tempStart:00', style: const TextStyle(color: Colors.white)),
                          IconButton(
                              onPressed: () => setM2(() => tempStart = (tempStart + 1).clamp(0, 23)),
                              icon: const Icon(Icons.add, color: Colors.white70)),
                        ],
                      ),
                      Row(
                        children: [
                          const Expanded(child: Text('Active End Hour', style: TextStyle(color: Colors.white70))),
                          IconButton(
                              onPressed: () => setM2(() => tempEnd = (tempEnd - 1).clamp(0, 23)),
                              icon: const Icon(Icons.remove, color: Colors.white70)),
                          Text('$tempEnd:00', style: const TextStyle(color: Colors.white)),
                          IconButton(
                              onPressed: () => setM2(() => tempEnd = (tempEnd + 1).clamp(0, 23)),
                              icon: const Icon(Icons.add, color: Colors.white70)),
                        ],
                      ),
                      Row(
                        children: [
                          Expanded(
                              child: Text('Require challenge photo to stop alarm',
                                  style: TextStyle(color: Colors.white70))),
                          Switch(value: tempRequire, onChanged: (v) => setM2(() => tempRequire = v)),
                        ],
                      ),
                      Row(
                        children: [
                          const Expanded(child: Text('Selected alarm song', style: TextStyle(color: Colors.white70))),
                          IconButton(
                              onPressed: () async {
                                final t = TextEditingController(text: tempSong);
                                final res = await showDialog<String>(
                                  context: context,
                                  builder: (_) => AlertDialog(
                                    title: const Text('Select alarm song'),
                                    content: TextField(controller: t),
                                    actions: [
                                      TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                                      TextButton(onPressed: () => Navigator.pop(context, t.text), child: const Text('OK')),
                                    ],
                                  ),
                                );
                                if (res != null) setM2(() => tempSong = res);
                              },
                              icon: const Icon(Icons.music_note, color: Colors.white70)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () async {
                              final p = await SharedPreferences.getInstance();
                              await p.setInt('hydration_goal_ml', tempGoal);
                              await p.setInt('hydration_interval_min', tempInterval);
                              await p.setInt('hydration_start_hour', tempStart);
                              await p.setInt('hydration_end_hour', tempEnd);
                              await p.setBool('hydration_require_challenge_stop', tempRequire);
                              await p.setString('hydration_song', tempSong);
                              if (!mounted) return;
                              setState(() {
                                _hydrationGoal = tempGoal;
                                _hydrationIntervalMin = tempInterval;
                              });

                              final uid = FirebaseAuth.instance.currentUser?.uid;
                              if (uid != null) {
                                final db = DatabaseService(uid: uid);
                                await db.updateWorkoutSettings({
                                  'hydration_goal_ml': tempGoal,
                                  'hydration_interval_min': tempInterval,
                                  'hydration_start_hour': tempStart,
                                  'hydration_end_hour': tempEnd,
                                  'hydration_require_challenge_stop': tempRequire,
                                  'hydration_song': tempSong,
                                });
                              }

                              // Scheduling disabled in this build; only saving preferences.
                              if (mounted) Navigator.pop(context);
                            },
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                            child: const Text('Save & Schedule'),
                          ),
                        ),
                      ]),
                    ],
                  );
                }),
                const SizedBox(height: 8),
              ],
            ),
          );
        });
      },
    );
  }

  void _showOptionsMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Color(0xFF1C1C1E),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                margin: const EdgeInsets.only(top: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 20),
              _buildMenuOption(
                context: context,
                icon: Icons.people_outline,
                title: 'Friends',
                subtitle: 'View all friends',
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const FriendsPage()));
                },
              ),
              _buildMenuOption(
                context: context,
                icon: Icons.bar_chart,
                title: 'Progress',
                subtitle: 'View your stats',
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const ProgressDashboardPage()));
                },
              ),
              _buildMenuOption(
                context: context,
                icon: Icons.music_note,
                title: 'Music',
                subtitle: 'Play music playlist',
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const MusicPlaylistPage()));
                },
              ),
              _buildMenuOption(
                context: context,
                icon: Icons.settings,
                title: 'Settings',
                subtitle: 'App preferences',
                onTap: () {
                  Navigator.pop(context);
                },
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMenuOption({
    required BuildContext context,
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: const Color(0xFFFF3B30).withOpacity(.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.people_outline, color: Color(0xFFFF3B30)),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: TextStyle(color: Colors.white.withOpacity(.6), fontSize: 13)),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: Colors.white.withOpacity(.3)),
          ],
        ),
      ),
    );
  }

  Widget _buildMainFeatureCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Gradient gradient,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        height: double.infinity,
        decoration: BoxDecoration(
          gradient: gradient,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 8, offset: const Offset(0, 4)),
          ],
        ),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 28, color: Colors.white),
            const SizedBox(height: 8),
            Text(title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 4),
            Text(subtitle,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 11, color: Colors.white70)),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.grey.shade900, borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Quick Routines',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _quickBtn(context, '10-min Core', 'core')),
              const SizedBox(width: 8),
              Expanded(child: _quickBtn(context, '10-min Legs', 'legs')),
              const SizedBox(width: 8),
              Expanded(child: _quickBtn(context, '10-min Arms', 'arms')),
            ],
          ),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            onPressed: () => _openQuickAlarmPicker(context),
            icon: const Icon(Icons.alarm_add),
            label: const Text('Set Quick Alarm'),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
          ),
          const SizedBox(height: 8),
          ElevatedButton.icon(
            onPressed: () => _triggerAlarmNow(context),
            icon: const Icon(Icons.bolt),
            label: const Text('Trigger Alarm Now (debug)'),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
          ),
        ],
      ),
    );
  }

  Future<void> _openQuickAlarmPicker(BuildContext context) async {
    // Alarm scheduling temporarily disabled in this build.
    final t = await showTimePicker(context: context, initialTime: TimeOfDay.now());
    if (t == null) return;
    if (!mounted) return;
    final formatted = t.format(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Quick alarm feature unavailable. Chosen time: $formatted')),
    );
  }

  Future<void> _triggerAlarmNow(BuildContext context) async {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
        .showSnackBar(const SnackBar(content: Text('Debug alarm unavailable in this build')));
  }
}
