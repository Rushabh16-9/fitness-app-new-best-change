import 'package:flutter/material.dart';

typedef OnStartCallback = void Function(Map<String, dynamic> recommendation);

class MoodRecommendationCard extends StatelessWidget {
  final Map<String, dynamic> recommendation;
  final OnStartCallback? onStart;

  const MoodRecommendationCard({super.key, required this.recommendation, this.onStart});

  @override
  Widget build(BuildContext context) {
    final title = recommendation['title'] ?? '';
    final desc = recommendation['description'] ?? '';
    final dur = recommendation['durationSeconds'] ?? 0;
    final minutes = (dur / 60).ceil();
    final level = recommendation['level'] ?? '';
    final benefits = recommendation['benefits'] as List<dynamic>? ?? [];
    final exercises = recommendation['exercises'] as List<dynamic>? ?? [];
    final exerciseCount = exercises.length;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.grey[900], 
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red.withOpacity(0.3), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start, 
                  children: [
                    Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 6),
                    Text(desc, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: () => onStart?.call(recommendation),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
                child: const Text('Start', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 12,
            runSpacing: 8,
            children: [
              _buildInfoChip(Icons.timer, '$minutes min', Colors.red),
              _buildInfoChip(Icons.fitness_center, '$exerciseCount exercises', Colors.orange),
              if (level.isNotEmpty) _buildInfoChip(Icons.trending_up, level.toUpperCase(), Colors.blue),
            ],
          ),
          if (benefits.isNotEmpty) ...[
            const SizedBox(height: 12),
            const Text('Benefits:', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 6),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: benefits.take(3).map((benefit) => Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.red.withOpacity(0.3), width: 1),
                ),
                child: Text(
                  '✓ $benefit',
                  style: const TextStyle(color: Colors.white70, fontSize: 11),
                ),
              )).toList(),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
