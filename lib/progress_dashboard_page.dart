import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:lottie/lottie.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class ProgressDashboardPage extends StatefulWidget {
  const ProgressDashboardPage({super.key});

  @override
  State<ProgressDashboardPage> createState() => _ProgressDashboardPageState();
}

class _ProgressDashboardPageState extends State<ProgressDashboardPage>
    with TickerProviderStateMixin {
  static const Color kRed = Color(0xFFFF3B30);
  static const Color kBg = Colors.black;

  late final AnimationController _pulseCtrl;
  late final AnimationController _rotateCtrl;
  final PageController _weekPager = PageController();

  // Data
  List<WeeklyCalories> _weeks = [];
  int _page = 0;
  bool _loading = true;
  String? _error;

  // Fake metrics (adjust if you store these too)
  int totalHours = 6;
  int streak = 5;

  // Subscription for Firestore updates
  StreamSubscription<QuerySnapshot<Map<String, dynamic>>>? _weeksSub;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 3))..repeat(reverse: true);
    _rotateCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 2));
    _listenWeeks(); // start live updates
  }

  @override
  void dispose() {
    _weeksSub?.cancel();
    _pulseCtrl.dispose();
    _rotateCtrl.dispose();
    _weekPager.dispose();
    super.dispose();
  }

  // Live listener (replaces _loadWeeks)
  void _listenWeeks() {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) {
      setState(() { _weeks = []; _loading = false; _error = null; });
      return;
    }
    final now = DateTime.now();
    final from = now.subtract(const Duration(days: 7 * 12));

    setState(() { _loading = true; _error = null; });
    _weeksSub?.cancel();

    _weeksSub = FirebaseFirestore.instance
        .collection('workoutHistory')
        .where('userId', isEqualTo: uid)
        .where('timestamp', isGreaterThanOrEqualTo: Timestamp.fromDate(from))
        .orderBy('timestamp')
        .snapshots()
        .listen((snap) async {
      final Map<DateTime, List<double>> weekly = {};

      for (final doc in snap.docs) {
        final data = doc.data();
        final ts = (data['timestamp'] as Timestamp?)?.toDate();
        if (ts == null) continue;
        final kcal = (data['caloriesBurned'] as num?)?.toDouble() ?? 0.0;

        final monday = _weekStart(ts);
        final dayIndex = (ts.weekday + 6) % 7; // Mon=0..Sun=6
        weekly.putIfAbsent(monday, () => List<double>.filled(7, 0));
        weekly[monday]![dayIndex] += kcal;
      }

      // Ensure empty weeks exist so swipe works
      for (int i = 0; i < 12; i++) {
        final monday = _weekStart(now.subtract(Duration(days: 7 * i)));
        weekly.putIfAbsent(monday, () => List<double>.filled(7, 0));
      }

      final sorted = weekly.keys.toList()..sort();
      final out = [for (final m in sorted) WeeklyCalories(weekStart: m, perDay: weekly[m]!)];


      setState(() {
        _weeks = out;
        _page = _weeks.length - 1;
        _loading = false;
      });

      await Future<void>.delayed(const Duration(milliseconds: 60));
      if (_weekPager.hasClients) _weekPager.jumpToPage(_page);
    }, onError: (e) {
      setState(() { _error = e.toString(); _loading = false; });
    });
  }

  double get _currentTotal =>
      _weeks.isEmpty ? 0 : _weeks[_page].perDay.fold(0.0, (a, b) => a + b);

  // If you have a weekly goal in DB, plug it here
  double get _weeklyGoal => 3000;
  double get _completion => (_currentTotal / _weeklyGoal).clamp(0.0, 1.0);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('Progress', style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      floatingActionButton: _buildRefresh(),
      body: Stack(
        children: [
          _AnimatedBackdrop(pulse: _pulseCtrl),
          if (_loading)
            const Center(child: CircularProgressIndicator(color: kRed))
          else if (_error != null)
            Center(
              child: Text('Error: $_error', style: const TextStyle(color: Colors.white)),
            )
          else
            SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildRing(),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      Expanded(
                        child: MetricCard(
                          title: 'Weekly Calories',
                          value: _currentTotal,
                          unit: 'kcal',
                          color: kRed,
                          icon: Icons.local_fire_department,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: MetricCard(
                          title: 'Total Hours',
                          value: totalHours.toDouble(),
                          unit: 'hrs',
                          color: Colors.orange,
                          icon: Icons.timer_outlined,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: MetricCard(
                          title: 'Streak',
                          value: streak.toDouble(),
                          unit: 'days',
                          color: Colors.amber,
                          icon: Icons.bolt_outlined,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 22),
                  _glassCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Weekly Calories',
                            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 8),
                        SizedBox(
                          height: 260,
                          child: PageView.builder(
                            controller: _weekPager,
                            onPageChanged: (i) => setState(() => _page = i),
                            itemCount: _weeks.length,
                            itemBuilder: (ctx, i) {
                              final w = _weeks[i];
                              return Padding(
                                padding: const EdgeInsets.only(right: 8.0),
                                child: _WeeklyBarChart(data: w.perDay),
                              );
                            },
                          ),
                        ),
                        const SizedBox(height: 6),
                        Center(
                          child: Text(
                            _weeks.isEmpty
                                ? ''
                                : 'Week of ${_fmtDate(_weeks[_page].weekStart)}  •  swipe for history',
                            style: TextStyle(color: Colors.white.withOpacity(.7), fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  _glassCard(
                    child: Row(
                      children: [
                        SizedBox(
                          width: 80,
                          height: 80,
                          child: Lottie.network(
                            'https://assets5.lottiefiles.com/packages/lf20_5ngs2ksb.json',
                            repeat: true,
                            fit: BoxFit.contain,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            '🔥 You’re doing amazing! Keep the streak alive!',
                            style: TextStyle(color: Colors.white.withOpacity(.9), fontSize: 16, height: 1.3),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  // Ring (custom painter)
  Widget _buildRing() {
    return Center(
      child: Stack(
        alignment: Alignment.center,
        children: [
          AnimatedBuilder(
            animation: _pulseCtrl,
            builder: (context, _) {
              final blur = 18 + 18 * _pulseCtrl.value;
              return Container(
                width: 220,
                height: 220,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [BoxShadow(color: kRed.withOpacity(.35), blurRadius: blur, spreadRadius: 4)],
                ),
              );
            },
          ),
          SizedBox(
            width: 220,
            height: 220,
            child: CustomPaint(
              painter: _RingPainter(
                progress: _completion,
                backgroundColor: Colors.white10,
                strokeWidth: 16,
                gradient: const SweepGradient(
                  startAngle: -pi / 2,
                  endAngle: 3 * pi / 2,
                  colors: [Color(0xFFFF3B30), Color(0xFFFF8A00)],
                ),
              ),
            ),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('${(_completion * 100).round()}%',
                  style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text('Weekly Goal', style: TextStyle(color: Colors.white.withOpacity(.7), fontSize: 14)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _glassCard({required Widget child}) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 6),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(.06),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withOpacity(.08)),
        boxShadow: const [BoxShadow(color: Colors.black87, blurRadius: 18, offset: Offset(0, 8))],
      ),
      child: child,
    );
  }

  Widget _buildRefresh() {
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [BoxShadow(color: kRed.withOpacity(.5), blurRadius: 18, spreadRadius: 2)],
      ),
      child: FloatingActionButton(
        backgroundColor: kRed,
        onPressed: () {
          _rotateCtrl.repeat();
          _listenWeeks();
          Future.delayed(const Duration(milliseconds: 600), _rotateCtrl.stop);
        },
        child: RotationTransition(
          turns: _rotateCtrl,
          child: const Icon(Icons.sync, color: Colors.white),
        ),
      ),
    );
  }
}

// Metric card with proper layout (no vertical wrapping)
class MetricCard extends StatelessWidget {
  final String title;
  final double value;
  final String unit;
  final Color color;
  final IconData icon;

  const MetricCard({
    super.key,
    required this.title,
    required this.value,
    required this.unit,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(.06),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withOpacity(.08)),
        boxShadow: const [
          BoxShadow(color: Colors.black87, blurRadius: 18, offset: Offset(0, 8)),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: color.withOpacity(.15),
              shape: BoxShape.circle,
              border: Border.all(color: color.withOpacity(.5)),
              boxShadow: [
                BoxShadow(color: color.withOpacity(.45), blurRadius: 16, spreadRadius: 1),
              ],
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                RichText(
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: '${value.toStringAsFixed(value.truncateToDouble() == value ? 0 : 1)} ',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      TextSpan(
                        text: unit,
                        style: TextStyle(
                          color: Colors.white.withOpacity(.85),
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Colors.white.withOpacity(.7),
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}


// Bar chart for a single week
class _WeeklyBarChart extends StatelessWidget {
  final List<double> data;
  const _WeeklyBarChart({required this.data});

  static const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  @override
  Widget build(BuildContext context) {
    final maxY = (data.fold<double>(0, max) + 120).toDouble();

    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceBetween,
        minY: 0,
        maxY: maxY,
        gridData: FlGridData(show: false),
        borderData: FlBorderData(show: false),
        titlesData: FlTitlesData(
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              getTitlesWidget: (v, m) =>
                  Text(v.toInt().toString(), style: TextStyle(color: Colors.white.withOpacity(.4), fontSize: 10)),
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (v, m) {
                final i = v.toInt();
                if (i < 0 || i >= labels.length) return const SizedBox.shrink();
                return Text(labels[i], style: TextStyle(color: Colors.white.withOpacity(.6)));
              },
            ),
          ),
        ),
        barTouchData: BarTouchData(
          enabled: true,
          touchTooltipData: const BarTouchTooltipData(), // version-safe
        ),
        barGroups: List.generate(data.length, (i) {
          final v = data[i];
          return BarChartGroupData(
            x: i,
            barsSpace: 2,
            barRods: [
              BarChartRodData(
                toY: v,
                width: 14,
                gradient: const LinearGradient(colors: [Color(0xFFFF3B30), Color(0xFFFF8A00)]),
                backDrawRodData: BackgroundBarChartRodData(show: true, toY: maxY, color: Colors.white10),
                borderRadius: BorderRadius.circular(6),
              ),
            ],
          );
        }),
      ),
    );
  }
}

class _AnimatedBackdrop extends StatelessWidget {
  final Animation<double> pulse;
  const _AnimatedBackdrop({required this.pulse});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: pulse,
      builder: (_, __) {
        final v = pulse.value;
        return Container(
          decoration: BoxDecoration(
            gradient: RadialGradient(
              center: const Alignment(0, -0.4),
              radius: 1.2,
              colors: [const Color(0xFFFF3B30).withOpacity(.12 + .08 * v), Colors.transparent],
              stops: const [0, 1],
            ),
          ),
        );
      },
    );
  }
}

class _RingPainter extends CustomPainter {
  final double progress; // 0..1
  final double strokeWidth;
  final Color backgroundColor;
  final SweepGradient gradient;

  _RingPainter({
    required this.progress,
    required this.strokeWidth,
    required this.backgroundColor,
    required this.gradient,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (min(size.width, size.height) - strokeWidth) / 2;

    final bgPaint = Paint()
      ..color = backgroundColor
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = strokeWidth;
    canvas.drawCircle(center, radius, bgPaint);

    final rect = Rect.fromCircle(center: center, radius: radius);
    final sweepPaint = Paint()
      ..shader = gradient.createShader(rect)
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = strokeWidth;
    final start = -pi / 2;
    final sweep = 2 * pi * progress;
    canvas.drawArc(rect, start, sweep, false, sweepPaint);
  }

  @override
  bool shouldRepaint(covariant _RingPainter oldDelegate) {
    return oldDelegate.progress != progress ||
        oldDelegate.strokeWidth != strokeWidth ||
        oldDelegate.backgroundColor != backgroundColor;
  }
}

class WeeklyCalories {
  final DateTime weekStart; // Monday
  final List<double> perDay; // 7 values
  WeeklyCalories({required this.weekStart, required this.perDay});
}

// Helpers
DateTime _weekStart(DateTime d) {
  final wd = d.weekday; // 1..7
  final diff = wd - DateTime.monday;
  return DateTime(d.year, d.month, d.day).subtract(Duration(days: diff));
}

String _two(int v) => v.toString().padLeft(2, '0');
String _fmtDate(DateTime d) => '${_two(d.day)}/${_two(d.month)}/${d.year}';