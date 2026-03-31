import 'package:flutter/foundation.dart';
import '../database_service.dart';

class ProgressService extends ChangeNotifier {
  final DatabaseService db;

  int weeklyCalories = 0;
  double totalWorkoutHours = 0.0;
  int activeStreakDays = 0;
  List<String> badges = [];
  List<Map<String, dynamic>> _recentSessions = [];
  // Debug / diagnostic info
  int fetchedSessionsCount = 0;
  int fetchedDaysCount = 0;
  String? lastError;

  ProgressService({required this.db});

  Future<void> refresh() async {
    lastError = null;
    fetchedSessionsCount = 0;
    fetchedDaysCount = 0;
    notifyListeners();
    try {
      // Fetch workout sessions and completed day history
      final sessions = await db.getWorkoutHistory();
      final dayHistory = await db.getCompletedDayHistory();

      fetchedSessionsCount = sessions.length;
      fetchedDaysCount = dayHistory.length;

      _recentSessions = sessions;

      final now = DateTime.now();
      final sevenDaysAgo = now.subtract(const Duration(days: 7));

      double totalSeconds = 0.0;

      for (final s in sessions) {
        // Flexibly read calories and duration fields
        // Duration may be stored as seconds or minutes
        double seconds = 0.0;
        if (s['durationSeconds'] != null) {
          seconds = (s['durationSeconds'] as num).toDouble();
        } else if (s['duration'] != null) {
          final d = s['duration'];
          if (d is num) seconds = d.toDouble();
          if (d is String) seconds = double.tryParse(d) ?? 0.0;
        } else if (s['durationMinutes'] != null) {
          seconds = (s['durationMinutes'] as num).toDouble() * 60.0;
        }

        totalSeconds += seconds;
      }

      // Recompute weekly calories properly by checking dates
      int weekly = 0;
      for (final s in sessions) {
        final ca = s['completedAt'] ?? s['timestamp'];
        DateTime? at;
        if (ca is String) at = DateTime.tryParse(ca);
        if (ca is DateTime) at = ca;
        if (at != null && at.isAfter(sevenDaysAgo)) {
          final calories = (s['calories'] ?? s['cal'] ?? 0);
          if (calories is String) {
            weekly += int.tryParse(calories) ?? 0;
          } else if (calories is num) weekly += calories.toInt();
        }
      }

      weeklyCalories = weekly;
      totalWorkoutHours = (totalSeconds / 3600.0);

      // Active streak using completed day history (assumes each entry has 'completedAt')
      final days = dayHistory.map<DateTime?>((m) {
        final ca = m['completedAt'];
        if (ca is String) return DateTime.tryParse(ca);
        if (ca is DateTime) return ca;
        return null;
      }).whereType<DateTime>().toList();

      days.sort((a, b) => b.compareTo(a)); // newest first

      int streak = 0;
      DateTime cursor = DateTime(now.year, now.month, now.day);
      for (int i = 0; i < 1000; i++) {
        final found = days.any((d) {
          final dd = DateTime(d.year, d.month, d.day);
          return dd == cursor;
        });
        if (found) {
          streak++;
          cursor = cursor.subtract(const Duration(days: 1));
        } else {
          break;
        }
      }
      activeStreakDays = streak;

      // Simple badges logic
      final b = <String>[];
      if (activeStreakDays >= 7) b.add('7-day_streak');
      if (activeStreakDays >= 30) b.add('30-day_streak');
      final totalWorkouts = sessions.length;
      if (totalWorkouts >= 100) b.add('100-workouts');
      if (weeklyCalories >= 10000) b.add('10k-calories');

      badges = b;

      // Emit a concise debug log so runtime consumers (flutter run) can see counts
      try {
        // ignore: avoid_print
        debugPrint('ProgressService: sessions=$fetchedSessionsCount days=$fetchedDaysCount lastError=$lastError');
      } catch (_) {}

      notifyListeners();
    } catch (e) {
      lastError = e.toString();
      // keep defaults but surface diagnostic info
      debugPrint('ProgressService.refresh error: $e');
      notifyListeners();
    }
  }

  // Expose recentSessions for charting (convert completedAt to DateTime)
  List<Map<String, dynamic>> get recentSessions => List.unmodifiable(_recentSessions);
}
