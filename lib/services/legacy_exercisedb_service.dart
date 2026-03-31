import 'dart:convert';
import 'package:flutter/services.dart';
import '../models/exercise_model.dart';

/// Service to load exercises from the legacy exercisedb-api-main dataset
/// This dataset contains 1500+ exercises with GIF URLs mapping to the bundled media files
class LegacyExerciseDbService {
  static LegacyExerciseDbService? _instance;
  static LegacyExerciseDbService get instance {
    _instance ??= LegacyExerciseDbService._();
    return _instance!;
  }
  
  LegacyExerciseDbService._();
  
  List<Exercise> _allExercises = [];
  bool _isLoaded = false;
  
  Future<void> loadExercises() async {
    if (_isLoaded) return;
    
    try {
      // Load legacy exercisedb dataset with gifUrl mappings
      final String jsonString = await rootBundle.loadString(
        'assets/data/exercise vidio/exercisedb-api-main/src/data/exercises.json',
      );
      final List<dynamic> jsonList = json.decode(jsonString);
      _allExercises = jsonList.map((json) => Exercise.fromJson(json)).toList();
      _isLoaded = true;
      print('[LegacyExerciseDb] Loaded ${_allExercises.length} exercises with GIF mappings');
    } catch (e) {
      print('[LegacyExerciseDb] Error loading exercises: $e');
      _allExercises = [];
    }
  }
  
  List<Exercise> get allExercises => _allExercises;
  
  // Filter exercises by equipment
  List<Exercise> byEquipment(String equipment) {
    return _allExercises.where((e) => 
      e.equipments.any((eq) => eq.toLowerCase().contains(equipment.toLowerCase()))
    ).toList();
  }
  
  // Filter exercises by body part
  List<Exercise> byBodyPart(String bodyPart) {
    return _allExercises.where((e) => 
      e.bodyParts.any((bp) => bp.toLowerCase().contains(bodyPart.toLowerCase()))
    ).toList();
  }
  
  // Filter exercises by target muscle
  List<Exercise> byMuscle(String muscle) {
    return _allExercises.where((e) => 
      e.targetMuscles.any((m) => m.toLowerCase().contains(muscle.toLowerCase())) ||
      e.secondaryMuscles.any((m) => m.toLowerCase().contains(muscle.toLowerCase()))
    ).toList();
  }
  
  // Search exercises by name
  List<Exercise> search(String query) {
    final lowerQuery = query.toLowerCase();
    return _allExercises.where((e) => 
      e.name.toLowerCase().contains(lowerQuery)
    ).toList();
  }
  
  // Get random exercises from a filtered list
  List<Exercise> getRandomExercises(List<Exercise> pool, int count) {
    if (pool.isEmpty) return [];
    final shuffled = List<Exercise>.from(pool)..shuffle();
    return shuffled.take(count).toList();
  }
  
  // === CURATED EXERCISE SETS FOR MOOD-BASED WORKOUTS ===
  
  // Stress relief (low intensity, stretches)
  List<Exercise> get stressReliefExercises {
    return _allExercises.where((e) {
      final n = e.name.toLowerCase();
      return (n.contains('stretch') || n.contains('roll') || n.contains('cobra') || 
              n.contains('yoga') || n.contains('bridge')) &&
          e.equipments.any((eq) => eq.toLowerCase().contains('body weight'));
    }).toList();
  }
  
  // Calming exercises
  List<Exercise> get calmingExercises {
    return _allExercises.where((e) {
      final n = e.name.toLowerCase();
      return (n.contains('plank') || n.contains('hold') || n.contains('leg raise')) &&
          !n.contains('jump') &&
          e.equipments.any((eq) => eq.toLowerCase().contains('body weight'));
    }).toList();
  }
  
  // Energy boost (cardio, HIIT, high intensity)
  List<Exercise> get energyBoostExercises {
    return _allExercises.where((e) {
      final n = e.name.toLowerCase();
      return n.contains('burpee') || n.contains('jump') || n.contains('jack') || 
             n.contains('sprint') || n.contains('hop') || n.contains('skip');
    }).toList();
  }

  // Warmup exercises (low intensity, stretches, mobility)
  List<Exercise> get warmupExercises {
    return _allExercises.where((e) {
      final n = e.name.toLowerCase();
      return (n.contains('stretch') || n.contains('warm') || n.contains('circle') ||
              n.contains('rotation') || n.contains('mobility')) &&
          e.equipments.any((eq) => eq.toLowerCase().contains('body weight'));
    }).toList();
  }
  
  // Core/abs exercises
  List<Exercise> get coreExercises {
    return _allExercises.where((e) {
      final bp = e.bodyParts.map((x) => x.toLowerCase()).toList();
      final tm = e.targetMuscles.map((x) => x.toLowerCase()).toList();
      return bp.any((b) => b.contains('waist') || b.contains('core')) || 
             tm.any((m) => m.contains('abs') || m.contains('obliques'));
    }).toList();
  }
  
  // Upper body strength
  List<Exercise> get upperBodyExercises {
    const parts = ['chest', 'back', 'shoulders', 'upper arms'];
    return _allExercises.where((e) {
      final bp = e.bodyParts.map((x) => x.toLowerCase()).toList();
      return bp.any((b) => parts.contains(b));
    }).toList();
  }
  
  // Lower body strength
  List<Exercise> get lowerBodyExercises {
    return _allExercises.where((e) {
      final bp = e.bodyParts.map((x) => x.toLowerCase()).toList();
      return bp.any((b) => b.contains('legs') || b.contains('glutes') || b.contains('calves'));
    }).toList();
  }

  // Intermediate (dumbbells, kettlebells)
  List<Exercise> get intermediateExercises {
    return _allExercises.where((e) {
      final eq = e.equipments.map((x) => x.toLowerCase()).toList();
      return eq.contains('dumbbell') || eq.contains('kettlebell');
    }).toList();
  }
  
  // Get exercise by ID
  Exercise? getById(String id) {
    try {
      return _allExercises.firstWhere((e) => e.id == id);
    } catch (_) {
      return null;
    }
  }
  
  // Get local GIF path for an exercise
  String getLocalGifPath(Exercise ex) {
    try {
      if (ex.gifUrl.isEmpty) return '';
      final uri = Uri.parse(ex.gifUrl);
      final file = uri.pathSegments.isNotEmpty ? uri.pathSegments.last : '';
      if (file.isEmpty) return '';
      return 'assets/data/exercise vidio/exercisedb-api-main/media/$file';
    } catch (_) {
      return '';
    }
  }
}
