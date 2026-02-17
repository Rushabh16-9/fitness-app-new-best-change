import 'dart:math';

/// Simple rule-based AI plan generator for offline generation.
/// Produces a 30-day list of maps: { title, subtitle, muscleGroups }
List<Map<String, dynamic>> generate30DayPlan({
  required int age,
  required double weightKg,
  required double heightCm,
  required List<String> problems,
  required String? focus,
}) {
  final bmi = weightKg / pow(heightCm / 100.0, 2);
  final rng = Random(bmi.toInt() + age);

  // Base muscle groups bank
  final allGroups = [
    'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs', 'Full Body', 'Rest'
  ];

  // Problem-based exclusions (coarse)
  final excludedGroups = <String>{};
  for (final p in problems) {
    final key = p.toLowerCase();
    if (key.contains('knee') || key.contains('knees')) {
      excludedGroups.addAll(['Legs']);
    }
    if (key.contains('shoulder')) {
      excludedGroups.addAll(['Shoulders']);
    }
    if (key.contains('back') || key.contains('lower back')) {
      excludedGroups.addAll(['Back', 'Full Body']);
    }
    if (key.contains('neck')) {
      excludedGroups.addAll(['Shoulders']);
    }
    if (key.contains('wrist') || key.contains('elbow')) {
      excludedGroups.addAll(['Arms']);
    }
  }

  // Age / BMI adjustments: older or higher BMI -> lower intensity -> more rest/abs/core days
  final bool lowIntensity = age >= 55 || bmi >= 30;

  List<Map<String, dynamic>> plan = [];
  for (int day = 0; day < 30; day++) {
    // Choose focus if provided to appear more frequently
    String chosen;
    if (focus != null && focus.isNotEmpty && rng.nextDouble() < 0.6) {
      chosen = focus;
    } else {
      // pick a group not excluded
      final candidates = allGroups.where((g) => !excludedGroups.contains(g)).toList();
      if (candidates.isEmpty) candidates.addAll(allGroups);
      chosen = candidates[rng.nextInt(candidates.length)];
    }

    // Add periodic rest days depending on intensity
    if (!lowIntensity && day % 7 == 6) {
      chosen = 'Rest';
    }
    if (lowIntensity && day % 5 == 4) {
      chosen = 'Rest';
    }

    // Short subtitle
    final subtitle = (chosen == 'Rest') ? 'Recovery & Mobility' : '$chosen focused session';

    plan.add({'title': 'Day ${day + 1}', 'subtitle': subtitle, 'muscleGroups': [chosen]});
  }

  return plan;
}
