import 'dart:convert';
import 'package:flutter/services.dart' show rootBundle;
import 'database_service.dart';

class EquipmentItem {
  final String id;
  final String name;
  final String category;
  final String difficulty;
  final String image;
  final String description;
  final int price;
  final String currency;
  final List<String> tags;
  final double baseScore;

  EquipmentItem({
    required this.id,
    required this.name,
    required this.category,
    required this.difficulty,
    required this.image,
    required this.description,
    required this.price,
    required this.currency,
    required this.tags,
    required this.baseScore,
  });

  factory EquipmentItem.fromJson(Map<String, dynamic> j) => EquipmentItem(
        id: j['id'],
        name: j['name'],
        category: j['category'],
        difficulty: j['difficulty'],
        image: j['image'],
        description: j['description'],
        price: j['price'],
        currency: j['currency'] ?? 'INR',
        tags: (j['tags'] as List).map((e) => e.toString()).toList(),
        baseScore: (j['recoScore'] as num).toDouble(),
      );
}

class EquipmentRecommendationService {
  final DatabaseService databaseService;
  List<EquipmentItem>? _cache;

  EquipmentRecommendationService(this.databaseService);

  Future<List<EquipmentItem>> loadCatalog() async {
    if (_cache != null) return _cache!;
    final src = await rootBundle.loadString('assets/data/equipment/equipment_catalog.json');
    final data = jsonDecode(src) as List;
    _cache = data.map((e) => EquipmentItem.fromJson(e)).toList();
    return _cache!;
  }

  Future<List<EquipmentItem>> recommended() async {
    final catalog = await loadCatalog();
    double userFactor = 0.5;
    try {
      final workouts = await databaseService.getCompletedWorkouts();
      if (workouts.isNotEmpty) {
        // crude scaling: more workouts -> more advanced gear
        userFactor = (workouts.length / 30).clamp(0.2, 1.0);
      }
    } catch (_) {}
    // Build scored list
    final scored = catalog
        .map((e) => MapEntry(e, e.baseScore * 0.7 + userFactor * 0.3))
        .toList();
    // Sort by score descending
    scored.sort((a, b) => b.value.compareTo(a.value));
    // Take top N (up to 3 for now) and return equipment items
    final topN = scored.map((e) => e.key).take(3).toList();
    return topN;
  }
}
