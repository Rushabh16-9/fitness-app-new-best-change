import 'package:flutter/material.dart';
import 'constants.dart';
import 'database_service.dart';
import 'package:firebase_auth/firebase_auth.dart';

class AchievementsPage extends StatefulWidget {
  const AchievementsPage({super.key});

  @override
  State<AchievementsPage> createState() => _AchievementsPageState();
}

class _AchievementsPageState extends State<AchievementsPage> {
  List<Map<String, dynamic>> _achievements = [];
  List<Map<String, dynamic>> _unlockedAchievements = [];
  List<Map<String, dynamic>> _lockedAchievements = [];
  bool _isLoading = true;
  bool _isSaving = false;

  String? _uid;
  late DatabaseService _db;
  final Map<String, int> _progressById = {}; // id -> currentProgress
  final Set<String> _unlockedIds = {}; // fast lookup for unlocked

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadAchievements();
    });
  }

  Future<void> _loadAchievements() async {
    setState(() => _isLoading = true);
    try {
      _uid = FirebaseAuth.instance.currentUser?.uid;
      _db = DatabaseService(uid: _uid);
      final userProfile = await _db.getUserProfile();

      // Get user's achievements data
      final List<dynamic> unlockedIdsRaw = userProfile['unlockedAchievements'] ?? [];
      final Map<String, dynamic> progressRaw = userProfile['achievementProgress'] ?? {};
      _unlockedIds
        ..clear()
        ..addAll(unlockedIdsRaw.map((e) => e.toString()));
      _progressById
        ..clear()
        ..addAll(progressRaw.map((k, v) => MapEntry(k, (v as num).toInt())));

      // Define all available achievements
      _achievements = _getAllAchievements();

      // Separate unlocked and locked achievements
      _unlockedAchievements = _achievements.where((achievement) => _unlockedIds.contains(achievement['id'] as String)).toList();

      _lockedAchievements = _achievements.where((achievement) => !_unlockedIds.contains(achievement['id'] as String)).toList();

      // Update progress for locked achievements
      for (var achievement in _lockedAchievements) {
        final id = achievement['id'] as String;
        final progressValue = _progressById[id] ?? 0;
        achievement['currentProgress'] = progressValue;
      }

      setState(() => _isLoading = false);
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading achievements: $e')),
        );
      }
    }
  }

  Future<void> _saveAchievementsToDb() async {
    if (_uid == null) return;
    setState(() => _isSaving = true);
    try {
      await _db.updateUserProfile({
        'unlockedAchievements': _unlockedIds.toList(),
        'achievementProgress': _progressById,
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save achievements. Check your connection.')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<void> _incrementProgress(Map<String, dynamic> achievement) async {
    final String id = achievement['id'] as String;
    final int max = (achievement['maxProgress'] as num).toInt();
    final int points = (achievement['points'] as num).toInt();
    final prev = _progressById[id] ?? 0;
    if (_unlockedIds.contains(id)) return;
    final next = (prev + 1).clamp(0, max);
    setState(() {
      _progressById[id] = next;
    });
    await _saveAchievementsToDb();
    if (next >= max) {
      await _unlockAchievement(achievement, addPoints: points);
    }
  }

  Future<void> _unlockAchievement(Map<String, dynamic> achievement, {int addPoints = 0}) async {
    final String id = achievement['id'] as String;
    if (_unlockedIds.contains(id)) return;
    setState(() {
      _unlockedIds.add(id);
      // Ensure progress reflects completion
      _progressById[id] = (achievement['maxProgress'] as num).toInt();
    });
    await _saveAchievementsToDb();
    if (addPoints > 0) {
      try { await _db.addUserPoints(addPoints); } catch (_) {}
    }
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Unlocked: ${achievement['title']} (+$addPoints pts)')),
    );
    // Refresh lists
    _partitionAchievements();
  }

  void _partitionAchievements() {
    _unlockedAchievements = _achievements.where((a) => _unlockedIds.contains(a['id'] as String)).toList();
    _lockedAchievements = _achievements.where((a) => !_unlockedIds.contains(a['id'] as String)).toList();
    for (var a in _lockedAchievements) {
      a['currentProgress'] = _progressById[a['id']] ?? 0;
    }
    if (mounted) setState(() {});
  }

  Future<void> _syncFromActivity() async {
    if (_uid == null) return;
    setState(() => _isSaving = true);
    try {
      final dayHistory = await _db.getCompletedDayHistory();
      final completedWorkouts = await _db.getCompletedWorkouts();
      final completedChallenges = await _db.getCompletedChallenges();

      // Helper: consecutive streak from dayHistory
      int longestStreak = 0;
      int currentStreak = 0;
      final days = dayHistory.map((e) => (e['day'] as num).toInt()).toList()..sort();
      int? prevDay;
      for (final d in days) {
        if (prevDay == null || d == prevDay + 1) {
          currentStreak += 1;
        } else if (d == prevDay) {
          // same day duplicate, ignore
        } else {
          currentStreak = 1;
        }
        longestStreak = currentStreak > longestStreak ? currentStreak : longestStreak;
        prevDay = d;
      }

      // first_workout
      if ((completedWorkouts.isNotEmpty || dayHistory.isNotEmpty) && !_unlockedIds.contains('first_workout')) {
        _progressById['first_workout'] = 1;
        _unlockedIds.add('first_workout');
      }

      // week_streak (max 7)
      _progressById['week_streak'] = longestStreak.clamp(0, 7);
      if (longestStreak >= 7) _unlockedIds.add('week_streak');

      // month_streak (max 30)
      _progressById['month_streak'] = longestStreak.clamp(0, 30);
      if (longestStreak >= 30) _unlockedIds.add('month_streak');

      // challenge_master: completed 10 challenges
      final completedCount = completedChallenges.length;
      _progressById['challenge_master'] = completedCount.clamp(0, 10);
      if (completedCount >= 10) _unlockedIds.add('challenge_master');

      // early_bird: workouts before 7 AM
      int earlyCount = 0;
      for (final h in dayHistory) {
        final ts = h['completedAt'];
        if (ts is String) {
          final dt = DateTime.tryParse(ts);
          if (dt != null && dt.hour < 7) earlyCount += 1;
        }
      }
      _progressById['early_bird'] = earlyCount.clamp(0, 10);
      if (earlyCount >= 10) _unlockedIds.add('early_bird');

      await _saveAchievementsToDb();
      _partitionAchievements();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Achievements synced with your activity.')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Sync failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  List<Map<String, dynamic>> _getAllAchievements() {
    return [
      {
        'id': 'first_workout',
        'title': 'First Steps',
        'description': 'Complete your first workout',
        'icon': Icons.directions_run,
        'color': Colors.blue,
        'rarity': 'Common',
        'points': 10,
        'maxProgress': 1,
      },
      {
        'id': 'week_streak',
        'title': 'Week Warrior',
        'description': 'Complete workouts for 7 consecutive days',
        'icon': Icons.calendar_today,
        'color': Colors.green,
        'rarity': 'Uncommon',
        'points': 50,
        'maxProgress': 7,
      },
      {
        'id': 'month_streak',
        'title': 'Monthly Master',
        'description': 'Complete workouts for 30 consecutive days',
        'icon': Icons.calendar_view_month,
        'color': Colors.purple,
        'rarity': 'Rare',
        'points': 200,
        'maxProgress': 30,
      },
      {
        'id': 'challenge_master',
        'title': 'Challenge Master',
        'description': 'Complete 10 challenges',
        'icon': Icons.emoji_events,
        'color': Colors.orange,
        'rarity': 'Epic',
        'points': 150,
        'maxProgress': 10,
      },
      {
        'id': 'pose_perfect',
        'title': 'Pose Perfect',
        'description': 'Hold a yoga pose perfectly for 60 seconds',
        'icon': Icons.accessibility,
        'color': Colors.pink,
        'rarity': 'Rare',
        'points': 100,
        'maxProgress': 60,
      },
      {
        'id': 'calorie_burner',
        'title': 'Calorie Burner',
        'description': 'Burn 10,000 calories through workouts',
        'icon': Icons.local_fire_department,
        'color': Colors.red,
        'rarity': 'Epic',
        'points': 300,
        'maxProgress': 10000,
      },
      {
        'id': 'meal_tracker',
        'title': 'Nutrition Ninja',
        'description': 'Log meals for 30 days',
        'icon': Icons.restaurant,
        'color': Colors.teal,
        'rarity': 'Uncommon',
        'points': 75,
        'maxProgress': 30,
      },
      {
        'id': 'social_butterfly',
        'title': 'Social Butterfly',
        'description': 'Share your progress 5 times',
        'icon': Icons.share,
        'color': Colors.indigo,
        'rarity': 'Common',
        'points': 25,
        'maxProgress': 5,
      },
      {
        'id': 'early_bird',
        'title': 'Early Bird',
        'description': 'Complete 10 workouts before 7 AM',
        'icon': Icons.wb_sunny,
        'color': Colors.amber,
        'rarity': 'Rare',
        'points': 125,
        'maxProgress': 10,
      },
      {
        'id': 'consistency_king',
        'title': 'Consistency King',
        'description': 'Complete workouts for 100 days',
        'icon': Icons.military_tech,
        'color': Colors.deepOrange,
        'rarity': 'Legendary',
        'points': 500,
        'maxProgress': 100,
      },
    ];
  }

  Color _getRarityColor(String rarity) {
    switch (rarity) {
      case 'Common':
        return Colors.grey;
      case 'Uncommon':
        return Colors.green;
      case 'Rare':
        return Colors.blue;
      case 'Epic':
        return Colors.purple;
      case 'Legendary':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConstants.darkBackground,
      appBar: AppBar(
        title: Text('Achievements', style: AppConstants.titleLarge),
        backgroundColor: AppConstants.primaryRed,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadAchievements,
          ),
          IconButton(
            tooltip: 'Sync with Activity',
            icon: const Icon(Icons.sync),
            onPressed: _isSaving ? null : _syncFromActivity,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppConstants.primaryRed),
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadAchievements,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppConstants.paddingMedium),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildStatsCard(),
                    const SizedBox(height: AppConstants.paddingLarge),
                    if (_unlockedAchievements.isNotEmpty) ...[
                      _buildSectionHeader('Unlocked Achievements'),
                      const SizedBox(height: AppConstants.paddingMedium),
                      ..._unlockedAchievements.map((achievement) => _buildAchievementCard(achievement, true)),
                      const SizedBox(height: AppConstants.paddingLarge),
                    ],
                    if (_lockedAchievements.isNotEmpty) ...[
                      _buildSectionHeader('Locked Achievements'),
                      const SizedBox(height: AppConstants.paddingMedium),
                      ..._lockedAchievements.map((achievement) => _buildAchievementCard(achievement, false)),
                    ],
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildStatsCard() {
    final totalPoints = _unlockedAchievements.fold<int>(0, (sum, achievement) => sum + (achievement['points'] as int));
    final completionRate = _achievements.isEmpty ? 0.0 : (_unlockedAchievements.length / _achievements.length) * 100;

    return Card(
      color: AppConstants.cardBackground,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusMedium),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.paddingMedium),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildStatItem('${_unlockedAchievements.length}', 'Unlocked'),
            _buildStatItem('$totalPoints', 'Points'),
            _buildStatItem('${completionRate.toStringAsFixed(0)}%', 'Complete'),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: AppConstants.headlineMedium.copyWith(
            color: AppConstants.primaryRed,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: AppConstants.bodyMedium.copyWith(color: AppConstants.textSecondary),
        ),
      ],
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: AppConstants.headlineSmall,
    );
  }

  Widget _buildAchievementCard(Map<String, dynamic> achievement, bool isUnlocked) {
    final progress = isUnlocked ? 1.0 : ((achievement['currentProgress'] ?? 0) / (achievement['maxProgress'] ?? 1));
    final rarityColor = _getRarityColor(achievement['rarity']);
    final canIncrement = !isUnlocked && ((achievement['maxProgress'] as num).toInt() > 1);
    final canUnlockOneShot = !isUnlocked && ((achievement['maxProgress'] as num).toInt() == 1);

    return Card(
      color: isUnlocked ? AppConstants.cardBackground : AppConstants.cardBackground.withOpacity(0.7),
      margin: const EdgeInsets.only(bottom: AppConstants.paddingMedium),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusMedium),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isUnlocked ? (achievement['color'] as Color).withOpacity(0.2) : Colors.grey.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
                  ),
                  child: Icon(
                    achievement['icon'] as IconData,
                    color: isUnlocked ? achievement['color'] as Color : Colors.grey,
                    size: 32,
                  ),
                ),
                const SizedBox(width: AppConstants.paddingMedium),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              achievement['title'],
                              style: AppConstants.titleMedium.copyWith(
                                color: isUnlocked ? AppConstants.textPrimary : AppConstants.textSecondary,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: rarityColor.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              achievement['rarity'],
                              style: AppConstants.bodySmall.copyWith(
                                color: rarityColor,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      Text(
                        achievement['description'],
                        style: AppConstants.bodyMedium.copyWith(
                          color: isUnlocked ? AppConstants.textSecondary : AppConstants.textSecondary.withOpacity(0.7),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppConstants.paddingMedium),
            Row(
              children: [
                Icon(
                  Icons.star,
                  color: Colors.amber,
                  size: 16,
                ),
                const SizedBox(width: 4),
                Text(
                  '${achievement['points']} points',
                  style: AppConstants.bodySmall.copyWith(
                    color: isUnlocked ? AppConstants.textSecondary : AppConstants.textSecondary.withOpacity(0.7),
                  ),
                ),
                const Spacer(),
                if (!isUnlocked && achievement['maxProgress'] != 1)
                  Text(
                    '${achievement['currentProgress'] ?? 0}/${achievement['maxProgress']}',
                    style: AppConstants.bodySmall.copyWith(
                      color: AppConstants.textSecondary,
                    ),
                  ),
              ],
            ),
            if (!isUnlocked && achievement['maxProgress'] != 1) ...[
              const SizedBox(height: AppConstants.paddingSmall),
              LinearProgressIndicator(
                value: progress.clamp(0.0, 1.0),
                backgroundColor: AppConstants.dividerColor,
                valueColor: AlwaysStoppedAnimation<Color>(AppConstants.primaryRed),
              ),
            ],
            if (!isUnlocked) ...[
              const SizedBox(height: AppConstants.paddingMedium),
              Row(
                children: [
                  if (canIncrement)
                    FilledButton.icon(
                      onPressed: _isSaving ? null : () => _incrementProgress(achievement),
                      icon: const Icon(Icons.add_task),
                      label: const Text('Add Progress'),
                      style: FilledButton.styleFrom(backgroundColor: AppConstants.primaryRed),
                    ),
                  if (canUnlockOneShot)
                    FilledButton.icon(
                      onPressed: _isSaving ? null : () => _unlockAchievement(achievement, addPoints: (achievement['points'] as num).toInt()),
                      icon: const Icon(Icons.lock_open),
                      label: const Text('Unlock'),
                      style: FilledButton.styleFrom(backgroundColor: AppConstants.primaryRed),
                    ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
