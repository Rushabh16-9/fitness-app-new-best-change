import 'dart:convert';
import 'package:flutter/services.dart';
import '../models/exercise_model.dart';

class ExerciseDatabase {
  static ExerciseDatabase? _instance;
  static ExerciseDatabase get instance {
    _instance ??= ExerciseDatabase._();
    return _instance!;
  }
  
  ExerciseDatabase._();
  
  List<Exercise> _allExercises = [];
  bool _isLoaded = false;
  
  Future<void> loadExercises() async {
    if (_isLoaded) return;
    
    try {
      // Load consolidated exercise dataset from the bundled free-exercise-db
      final String jsonString = await rootBundle.loadString(
        'assets/data/free-exercise-db-main/dist/exercises.json',
      );
      final List<dynamic> jsonList = json.decode(jsonString);
      _allExercises = jsonList.map((json) => Exercise.fromJson(json)).toList();
      _isLoaded = true;
      print('Loaded ${_allExercises.length} exercises');
    } catch (e) {
      print('Error loading exercises: $e');
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
  
  // Filter exercises by difficulty level
  List<Exercise> byDifficulty(String difficulty) {
    return _allExercises.where((e) => e.difficulty == difficulty).toList();
  }
  
  // Filter exercises by intensity (for mood matching)
  List<Exercise> byIntensity(String intensity) {
    return _allExercises.where((e) => e.intensity == intensity).toList();
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
  
  // Warmup exercises (low intensity stretches)
  List<Exercise> get warmupExercises {
    return _allExercises.where((e) {
      final n = e.name.toLowerCase();
      final eq = e.equipments.map((x) => x.toLowerCase()).toList();
      return (n.contains('stretch') || n.contains('warm') || n.contains('circle') || n.contains('rotation')) &&
          eq.any((x) => x.contains('body weight'));
    }).toList();
  }
  
  // Stress relief (yoga, stretches, low intensity)
  List<Exercise> get stressReliefExercises {
    return _allExercises.where((e) {
      final n = e.name.toLowerCase();
      final eq = e.equipments.map((x) => x.toLowerCase()).toList();
      return (n.contains('stretch') || n.contains('yoga') || n.contains('cobra') || n.contains('bridge') ||
              n.contains('roll') || n.contains('cat')) &&
          eq.any((x) => x.contains('body weight')) &&
          e.intensity == 'low';
    }).toList();
  }
  
  // Calming flow (gentle movements)
  List<Exercise> get calmingExercises {
    return _allExercises.where((e) {
      final n = e.name.toLowerCase();
      final eq = e.equipments.map((x) => x.toLowerCase()).toList();
      return (n.contains('plank') || n.contains('bridge') || n.contains('leg raise') || n.contains('pike')) &&
          eq.any((x) => x.contains('body weight')) &&
          !n.contains('jump');
    }).toList();
  }
  
  // Energy boost (cardio, HIIT, high intensity)
  List<Exercise> get energyBoostExercises {
    return _allExercises.where((e) {
      final n = e.name.toLowerCase();
      return n.contains('burpee') || n.contains('jump') || n.contains('jack') || n.contains('sprint') ||
          n.contains('hop') || n.contains('skip') ||
          e.intensity == 'high';
    }).toList();
  }
  
  // Core/abs exercises
  List<Exercise> get coreExercises {
    return _allExercises.where((e) {
      final bp = e.bodyParts.map((x) => x.toLowerCase()).toList();
      final tm = e.targetMuscles.map((x) => x.toLowerCase()).toList();
      return bp.contains('waist') && tm.contains('abs');
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
      return bp.contains('upper legs') || bp.contains('lower legs');
    }).toList();
  }
  
  // Beginner friendly (body weight only)
  List<Exercise> get beginnerExercises {
    return _allExercises.where((e) {
      final eq = e.equipments.map((x) => x.toLowerCase()).toList();
      return e.difficulty == 'beginner' && eq.any((x) => x.contains('body weight'));
    }).toList();
  }
  
  // Intermediate (dumbbells, kettlebells)
  List<Exercise> get intermediateExercises {
    return _allExercises.where((e) {
      final eq = e.equipments.map((x) => x.toLowerCase()).toList();
      return e.difficulty == 'intermediate' &&
          (eq.any((x) => x.contains('dumbbell')) || eq.any((x) => x.contains('kettlebell')));
    }).toList();
  }
  
  // Advanced (complex movements, heavy equipment)
  List<Exercise> get advancedExercises {
    return _allExercises.where((e) => e.difficulty == 'advanced').toList();
  }
  
  // Get exercise by ID
  Exercise? getById(String id) {
    try {
      return _allExercises.firstWhere((e) => e.id == id);
    } catch (_) {
      return null;
    }
  }
  
  // Statistics
  Map<String, int> get equipmentStats {
    final Map<String, int> stats = {};
    for (var exercise in _allExercises) {
      for (var equipment in exercise.equipments) {
        stats[equipment] = (stats[equipment] ?? 0) + 1;
      }
    }
    return stats;
  }
  
  Map<String, int> get bodyPartStats {
    final Map<String, int> stats = {};
    for (var exercise in _allExercises) {
      for (var bodyPart in exercise.bodyParts) {
        stats[bodyPart] = (stats[bodyPart] ?? 0) + 1;
      }
    }
    return stats;
  }
  
  Map<String, int> get difficultyStats {
    final Map<String, int> stats = {};
    for (var exercise in _allExercises) {
      stats[exercise.difficulty] = (stats[exercise.difficulty] ?? 0) + 1;
    }
    return stats;
  }
}
