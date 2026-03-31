import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:provider/provider.dart';
import 'services/progress_service.dart';
import 'database_service.dart';

class ProgressDashboardPage extends StatefulWidget {
  const ProgressDashboardPage({super.key});

  @override
  State<ProgressDashboardPage> createState() => _ProgressDashboardPageState();
}

class _ProgressDashboardPageState extends State<ProgressDashboardPage> {
  late ProgressService _service;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    final uid = FirebaseAuth.instance.currentUser?.uid;
    final db = DatabaseService(uid: uid);
    _service = ProgressService(db: db);
    // load data then clear loading flag
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await _service.refresh();
      if (mounted) setState(() => _loading = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<ProgressService>.value(
      value: _service,
      child: Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(title: const Text('Progress Dashboard'), backgroundColor: Colors.red),
        body: Consumer<ProgressService>(builder: (context, svc, _) {
          final uid = FirebaseAuth.instance.currentUser?.uid;
          if (uid == null) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  const Icon(Icons.lock_outline, size: 56, color: Colors.white70),
                  const SizedBox(height: 12),
                  const Text('Sign in to view your progress', style: TextStyle(color: Colors.white70, fontSize: 16)),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () async {
                      if (mounted) {
                        setState(() => _loading = true);
                        await svc.refresh();
                        setState(() => _loading = false);
                      }
                    },
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                    child: const Text('Refresh / Retry'),
                  )
                ]),
              ),
            );
          }

          if (_loading) {
            return const Center(child: CircularProgressIndicator(color: Colors.red));
          }

          // If we have no sessions yet, show helpful CTA and a demo-data option for testing
          final empty = svc.recentSessions.isEmpty;

          return RefreshIndicator(
            onRefresh: svc.refresh,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top cards
                  Row(
                    children: [
                      Expanded(child: _buildMetricCard('Weekly Calories', '${svc.weeklyCalories} kcal', Colors.orange)),
                      const SizedBox(width: 12),
                      Expanded(child: _buildMetricCard('Total Hours', svc.totalWorkoutHours.toStringAsFixed(1), Colors.blue)),
                      const SizedBox(width: 12),
                      Expanded(child: _buildMetricCard('Streak', '${svc.activeStreakDays}d', Colors.green)),
                    ],
                  ),
                  const SizedBox(height: 20),

                  const Text('Weekly Calories', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 180,
                    child: empty ? _buildEmptyChartPlaceholder() : _CaloriesBarChart(sessions: svc.recentSessions),
                  ),
                  const SizedBox(height: 20),

                  const Text('Achievements', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: svc.badges.isEmpty
                        ? [Chip(label: Text('No badges yet', style: TextStyle(color: Colors.white70)), backgroundColor: Colors.grey[850])]
                        : svc.badges.map((id) => _buildBadgeChip(id)).toList(),
                  ),
                  const SizedBox(height: 24),
                  Row(children: [
                    ElevatedButton.icon(
                      onPressed: () async {
                        await svc.refresh();
                        if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Progress refreshed')));
                      },
                      icon: const Icon(Icons.refresh),
                      label: const Text('Refresh'),
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                    ),
                    const SizedBox(width: 12),
                    if (empty)
                      ElevatedButton.icon(
                        onPressed: () async {
                          // create demo sessions for the last 7 days to help testing
                          final now = DateTime.now();
                          for (int i = 0; i < 7; i++) {
                            final day = now.subtract(Duration(days: i));
                            final session = {
                              'completedAt': day.toIso8601String(),
                              'calories': 200 + i * 20,
                              'durationSeconds': 20 * 60,
                            };
                            try {
                              await _service.db.saveCompletedWorkoutSession(session);
                            } catch (_) {}
                          }
                          await svc.refresh();
                          if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Demo data added')));
                        },
                        icon: const Icon(Icons.playlist_add),
                        label: const Text('Load demo data'),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.grey[800]),
                      ),
                  ]),
                  const SizedBox(height: 16),
                  // Diagnostic / debug info to help understand empty state
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: Colors.grey[900], borderRadius: BorderRadius.circular(8)),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('Debug', style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text('Sessions fetched: ${svc.fetchedSessionsCount}', style: const TextStyle(color: Colors.white60)),
                      const SizedBox(height: 4),
                      Text('Days fetched: ${svc.fetchedDaysCount}', style: const TextStyle(color: Colors.white60)),
                      const SizedBox(height: 8),
                      if (svc.lastError != null)
                        Text('Last error: ${svc.lastError}', style: const TextStyle(color: Colors.redAccent)),
                    ]),
                  )
                ],
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildEmptyChartPlaceholder() {
    return Container(
      decoration: BoxDecoration(color: Colors.grey[900], borderRadius: BorderRadius.circular(8)),
      alignment: Alignment.center,
      child: Column(mainAxisSize: MainAxisSize.min, children: const [
        Icon(Icons.show_chart, color: Colors.white24, size: 48),
        SizedBox(height: 8),
        Text('No workout history yet', style: TextStyle(color: Colors.white54)),
      ]),
    );
  }

  Widget _buildBadgeChip(String id) {
    String label = id.replaceAll('_', ' ').toUpperCase();
    Color color = Colors.orange;
    if (id.contains('7-day')) color = Colors.green;
    if (id.contains('30-day')) color = Colors.purple;
    if (id.contains('100-workouts')) color = Colors.amber;
    if (id.contains('10k')) color = Colors.blueGrey;
    return Chip(label: Text(label, style: const TextStyle(color: Colors.white)), backgroundColor: color.withOpacity(0.9));
  }

  Widget _buildMetricCard(String title, String value, Color accent) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: Colors.grey[900], borderRadius: BorderRadius.circular(12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: Colors.white70)),
          const SizedBox(height: 8),
          Row(children: [
            Expanded(child: Text(value, style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold))),
            Container(width: 36, height: 36, decoration: BoxDecoration(color: accent, borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.show_chart, color: Colors.white)),
          ])
        ],
      ),
    );
  }
}

class _CaloriesBarChart extends StatelessWidget {
  final List<Map<String, dynamic>> sessions;
  const _CaloriesBarChart({required this.sessions});

  @override
  Widget build(BuildContext context) {
    // Build a simple last-7-days buckets of calories using completedAt/timestamp or today as fallback
    final now = DateTime.now();
    final buckets = List<int>.filled(7, 0);
    for (final s in sessions) {
      DateTime? at;
      final ca = s['completedAt'] ?? s['timestamp'];
      if (ca is String) at = DateTime.tryParse(ca);
      if (ca is DateTime) at = ca;
      if (at == null) continue;
      final diff = now.difference(at).inDays;
      if (diff >= 0 && diff < 7) {
        final idx = 6 - diff; // oldest at 0, newest at 6
        final calories = (s['calories'] ?? s['cal'] ?? 0);
        int c = 0;
        if (calories is String) c = int.tryParse(calories) ?? 0;
        if (calories is num) c = calories.toInt();
        buckets[idx] += c;
      }
    }

    final maxVal = buckets.reduce((a, b) => a > b ? a : b).clamp(1, double.infinity).toDouble();

    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY: maxVal * 1.2,
        titlesData: FlTitlesData(
          topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 40, getTitlesWidget: (v, meta) => Text('${v.toInt()}', style: const TextStyle(color: Colors.white70, fontSize: 10)))),
          bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, getTitlesWidget: (v, meta) {
            final idx = v.toInt();
            final label = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][idx % 7];
            return Padding(padding: const EdgeInsets.only(top: 6), child: Text(label, style: const TextStyle(color: Colors.white70, fontSize: 10)));
          }, reservedSize: 30)),
        ),
        borderData: FlBorderData(show: false),
        barGroups: List.generate(7, (i) {
          return BarChartGroupData(x: i, barsSpace: 4, barRods: [BarChartRodData(toY: buckets[i].toDouble(), color: Colors.redAccent)]);
        }),
      ),
    );
  }
}
