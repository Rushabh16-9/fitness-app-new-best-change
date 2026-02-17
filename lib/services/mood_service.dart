import 'package:flutter/foundation.dart';
import 'legacy_exercisedb_service.dart';
import '../models/exercise_model.dart';
import '../asset_resolver.dart';

/// Face detection integration: the UI/camera page will extract simple
/// face features (smile probability, eye open probabilities) and call
/// `detectFromFaceFeatures` below. Kept in the service so the same
/// mapping logic is used for questionnaire or face-based detection.

/// Comprehensive mood-based fitness recommendation service.
/// Uses legacy exercisedb dataset with 1500+ exercises and GIF mappings.
class MoodService extends ChangeNotifier {
  final LegacyExerciseDbService _exerciseDb = LegacyExerciseDbService.instance;
  bool _isInitialized = false;
  String? _detectedMood;
  String? get detectedMood => _detectedMood;

  List<Map<String, dynamic>> _recommendations = [];
  List<Map<String, dynamic>> get recommendations => List.unmodifiable(_recommendations);

  /// Initialize exercise database (call once on app start)
  Future<void> initialize() async {
    if (_isInitialized) return;
    // Initialize asset manifest so GIF path checks work
    await AssetResolver.init();
    await _exerciseDb.loadExercises();
    _isInitialized = true;
    print('[MoodService] Initialized with ${_exerciseDb.allExercises.length} exercises');
  }

  /// Detect mood from a small questionnaire (answers 1..5). Returns mood key.
  String detectFromAnswers(List<int> answers) {
    // answers length expected 5; each value 1..5
    if (answers.isEmpty) {
      return 'neutral';
    }

    final score = answers.fold<int>(0, (p, e) => p + e);
    String mood;
    if (score <= 10) {
      mood = 'stressed';
    } else if (score <= 14) {
      mood = 'anxious';
    } else if (score <= 18) {
      mood = 'neutral';
    } else if (score <= 22) {
      mood = 'energetic';
    } else {
      mood = 'calm';
    }

    _detectedMood = mood;
    notifyListeners();
    return mood;
  }

  /// Convert Exercise model to map format with legacy GIF path
  Map<String, dynamic> _exerciseToMap(Exercise ex, {int duration = 30}) {
    // Use legacy exercisedb media GIFs (1500+ exercises)
    final String imagePath = _exerciseDb.getLocalGifPath(ex);
    // Debug: confirm resolved image path for Mood recommendations
    // ignore: avoid_print
    print('[MoodService] Image for "${ex.displayName}": ${imagePath.isEmpty ? '<missing>' : imagePath}');
    return {
      'name': ex.displayName,
      'duration': duration,
      'image': imagePath,
      'instructions': ex.instructions,
      'targetMuscles': ex.targetMuscles,
      'equipment': ex.equipment,
      'difficulty': ex.difficulty,
    };
  }

  /// Comprehensive recommendation generator using full exercise database
  List<Map<String, dynamic>> generateRecommendations(String mood) {
    if (!_isInitialized) {
      print('[MoodService] Warning: not initialized, returning empty recommendations');
      return [];
    }

    final List<Map<String, dynamic>> recs = [];

  // Get exercise pools from database
  final stressRelief = _exerciseDb.stressReliefExercises;
  final calming = _exerciseDb.calmingExercises;
  final energyBoost = _exerciseDb.energyBoostExercises;
  final core = _exerciseDb.coreExercises;
  final upperBody = _exerciseDb.upperBodyExercises;
  final lowerBody = _exerciseDb.lowerBodyExercises;
  // Derived pools to replace previous DB sets
  final warmupPool = <Exercise>[
    ...stressRelief,
    ...calming,
  ];
  final beginnerPool = _exerciseDb.allExercises
    .where((e) => e.difficulty == 'beginner')
    .toList();
  final intermediatePool = _exerciseDb.allExercises
    .where((e) => e.difficulty == 'intermediate')
    .toList();

    if (mood == 'stressed' || mood == 'anxious') {
      // STRESSED/ANXIOUS: Focus on calming, stretching, and stress relief
      
      // Plan 1: Stress Relief Flow (20 min) - gentle stretches and calming poses
      final stressFlow = _exerciseDb.getRandomExercises(stressRelief, 8);
      if (stressFlow.isNotEmpty) {
        recs.add({
          'id': 'stress_relief_flow',
          'title': 'Stress Relief Flow (20 min)',
          'description': 'Gentle stretches and calming movements to release tension and anxiety.',
          'type': 'stress-relief',
          'durationSeconds': 1200,
          'level': 'beginner',
          'benefits': ['Reduces stress', 'Calms nervous system', 'Improves flexibility', 'Promotes relaxation'],
          'exercises': stressFlow.map((e) => _exerciseToMap(e, duration: 90)).toList(),
        });
      }

      // Plan 2: Calming Body Scan (15 min) - slow movements + warmup
      final calmingMix = [
        ..._exerciseDb.getRandomExercises(warmupPool, 4),
        ..._exerciseDb.getRandomExercises(calming, 4),
      ];
      if (calmingMix.isNotEmpty) {
        recs.add({
          'id': 'calming_body_scan',
          'title': 'Calming Body Scan (15 min)',
          'description': 'Slow, mindful movements to reconnect with your body and reduce anxiety.',
          'type': 'mindful',
          'durationSeconds': 900,
          'level': 'beginner',
          'benefits': ['Reduces anxiety', 'Improves mind-body connection', 'Gentle on joints'],
          'exercises': calmingMix.map((e) => _exerciseToMap(e, duration: 60)).toList(),
        });
      }

      // Plan 3: Beginner Decompression (25 min) - comprehensive stress relief
      final decompression = [
        ..._exerciseDb.getRandomExercises(stressRelief, 6),
        ..._exerciseDb.getRandomExercises(
            beginnerPool.where((e) => e.intensity == 'low').toList(), 4),
      ];
      if (decompression.isNotEmpty) {
        recs.add({
          'id': 'beginner_decompression',
          'title': 'Beginner Decompression (25 min)',
          'description': 'Extended session of stress-relieving movements and gentle bodyweight exercises.',
          'type': 'stress-relief',
          'durationSeconds': 1500,
          'level': 'beginner',
          'benefits': ['Deep stress relief', 'Improves sleep quality', 'Releases muscle tension'],
          'exercises': decompression.map((e) => _exerciseToMap(e, duration: 90)).toList(),
        });
      }

    } else if (mood == 'energetic') {
      // ENERGETIC: High-intensity cardio, HIIT, challenging exercises
      
      // Plan 1: HIIT Energy Blast (20 min) - intense cardio circuit
      final hiitBlast = _exerciseDb.getRandomExercises(energyBoost, 10);
      if (hiitBlast.isNotEmpty) {
        recs.add({
          'id': 'hiit_energy_blast',
          'title': 'HIIT Energy Blast (20 min)',
          'description': 'High-intensity cardio circuit to channel your energy into an explosive workout.',
          'type': 'hiit',
          'durationSeconds': 1200,
          'level': 'intermediate',
          'benefits': ['Burns calories fast', 'Boosts metabolism', 'Improves cardiovascular fitness', 'Releases endorphins'],
          'exercises': hiitBlast.map((e) => _exerciseToMap(e, duration: 45)).toList(),
        });
      }

      // Plan 2: Full Body Power (30 min) - strength + cardio
      final fullPower = [
        ..._exerciseDb.getRandomExercises(warmupPool, 3),
        ..._exerciseDb.getRandomExercises(upperBody.where((e) => e.difficulty == 'intermediate').toList(), 4),
        ..._exerciseDb.getRandomExercises(lowerBody.where((e) => e.difficulty == 'intermediate').toList(), 4),
        ..._exerciseDb.getRandomExercises(core, 3),
        ..._exerciseDb.getRandomExercises(energyBoost, 2),
      ];
      if (fullPower.isNotEmpty) {
        recs.add({
          'id': 'full_body_power',
          'title': 'Full Body Power (30 min)',
          'description': 'Complete workout targeting all major muscle groups with high-energy finishers.',
          'type': 'full-body',
          'durationSeconds': 1800,
          'level': 'intermediate',
          'benefits': ['Total body conditioning', 'Builds strength', 'Improves endurance', 'Maximizes calorie burn'],
          'exercises': fullPower.map((e) => _exerciseToMap(e, duration: 60)).toList(),
        });
      }

      // Plan 3: Cardio Core Crusher (25 min) - cardio + abs
      final cardioCore = [
        ..._exerciseDb.getRandomExercises(energyBoost, 8),
        ..._exerciseDb.getRandomExercises(core, 6),
      ];
      if (cardioCore.isNotEmpty) {
        recs.add({
          'id': 'cardio_core_crusher',
          'title': 'Cardio Core Crusher (25 min)',
          'description': 'Dynamic cardio moves combined with core-blasting exercises.',
          'type': 'cardio-core',
          'durationSeconds': 1500,
          'level': 'intermediate',
          'benefits': ['Sculpts abs', 'Burns fat', 'Improves athletic performance', 'Boosts energy'],
          'exercises': cardioCore.map((e) => _exerciseToMap(e, duration: 60)).toList(),
        });
      }

    } else if (mood == 'calm') {
      // CALM: Balanced mix of gentle strength and flexibility
      
      // Plan 1: Gentle Strength Flow (25 min) - low impact strength
      final gentleStrength = [
        ..._exerciseDb.getRandomExercises(warmupPool, 3),
        ..._exerciseDb.getRandomExercises(beginnerPool, 8),
        ..._exerciseDb.getRandomExercises(stressRelief, 3),
      ];
      if (gentleStrength.isNotEmpty) {
        recs.add({
          'id': 'gentle_strength_flow',
          'title': 'Gentle Strength Flow (25 min)',
          'description': 'Balanced workout with gentle strength exercises and flexibility work.',
          'type': 'balanced',
          'durationSeconds': 1500,
          'level': 'beginner',
          'benefits': ['Builds foundational strength', 'Improves flexibility', 'Low impact', 'Restores energy'],
          'exercises': gentleStrength.map((e) => _exerciseToMap(e, duration: 60)).toList(),
        });
      }

      // Plan 2: Mobility & Core (20 min) - flexibility + core stability
        final mobilityCore = [
        ..._exerciseDb.getRandomExercises(warmupPool, 4),
        ..._exerciseDb.getRandomExercises(core.where((e) => e.intensity != 'high').toList(), 6),
        ..._exerciseDb.getRandomExercises(calming, 3),
      ];
      if (mobilityCore.isNotEmpty) {
        recs.add({
          'id': 'mobility_core',
          'title': 'Mobility & Core (20 min)',
          'description': 'Focus on joint mobility and core stability with calm, controlled movements.',
          'type': 'mobility',
          'durationSeconds': 1200,
          'level': 'beginner',
          'benefits': ['Improves posture', 'Strengthens core', 'Enhances mobility', 'Reduces injury risk'],
          'exercises': mobilityCore.map((e) => _exerciseToMap(e, duration: 60)).toList(),
        });
      }

      // Plan 3: Restore & Recharge (15 min) - restorative session
      final restore = [
        ..._exerciseDb.getRandomExercises(stressRelief, 5),
        ..._exerciseDb.getRandomExercises(calming, 5),
      ];
      if (restore.isNotEmpty) {
        recs.add({
          'id': 'restore_recharge',
          'title': 'Restore & Recharge (15 min)',
          'description': 'Restorative movements to recharge your body and maintain calmness.',
          'type': 'restorative',
          'durationSeconds': 900,
          'level': 'beginner',
          'benefits': ['Promotes recovery', 'Reduces muscle tension', 'Maintains calm state', 'Improves flexibility'],
          'exercises': restore.map((e) => _exerciseToMap(e, duration: 90)).toList(),
        });
      }

    } else {
      // NEUTRAL: Balanced workouts for all fitness levels
      
      // Plan 1: Beginner Friendly Full Body (20 min)
      final beginnerFull = [
        ..._exerciseDb.getRandomExercises(warmupPool, 3),
        ..._exerciseDb.getRandomExercises(beginnerPool, 10),
      ];
      if (beginnerFull.isNotEmpty) {
        recs.add({
          'id': 'beginner_full_body',
          'title': 'Beginner Friendly Full Body (20 min)',
          'description': 'Perfect introduction to fitness with easy-to-follow bodyweight exercises.',
          'type': 'beginner',
          'durationSeconds': 1200,
          'level': 'beginner',
          'benefits': ['Builds confidence', 'Improves overall fitness', 'Easy to follow', 'Full body workout'],
          'exercises': beginnerFull.map((e) => _exerciseToMap(e, duration: 60)).toList(),
        });
      }

      // Plan 2: Balanced Strength Circuit (25 min)
      final balancedCircuit = [
        ..._exerciseDb.getRandomExercises(warmupPool, 2),
        ..._exerciseDb.getRandomExercises(upperBody.where((e) => e.difficulty == 'beginner').toList(), 4),
        ..._exerciseDb.getRandomExercises(lowerBody.where((e) => e.difficulty == 'beginner').toList(), 4),
        ..._exerciseDb.getRandomExercises(core, 4),
      ];
      if (balancedCircuit.isNotEmpty) {
        recs.add({
          'id': 'balanced_strength_circuit',
          'title': 'Balanced Strength Circuit (25 min)',
          'description': 'Well-rounded workout targeting upper body, lower body, and core.',
          'type': 'circuit',
          'durationSeconds': 1500,
          'level': 'beginner',
          'benefits': ['Balanced development', 'Builds strength evenly', 'Improves coordination', 'Versatile workout'],
          'exercises': balancedCircuit.map((e) => _exerciseToMap(e, duration: 60)).toList(),
        });
      }

      // Plan 3: Intermediate Total Body (30 min)
      final intermediateFull = [
        ..._exerciseDb.getRandomExercises(warmupPool, 2),
        ..._exerciseDb.getRandomExercises(intermediatePool, 12),
        ..._exerciseDb.getRandomExercises(core, 4),
      ];
      if (intermediateFull.isNotEmpty) {
        recs.add({
          'id': 'intermediate_total_body',
          'title': 'Intermediate Total Body (30 min)',
          'description': 'Step up your fitness with intermediate exercises and equipment variations.',
          'type': 'intermediate',
          'durationSeconds': 1800,
          'level': 'intermediate',
          'benefits': ['Challenges muscles', 'Increases intensity', 'Builds endurance', 'Progressive overload'],
          'exercises': intermediateFull.map((e) => _exerciseToMap(e, duration: 60)).toList(),
        });
      }
    }

    _recommendations = recs;
    notifyListeners();
    return recs;
  }

  /// Convenience: detect + generate
  Future<void> detectAndGenerate(List<int> answers) async {
    final mood = detectFromAnswers(answers);
    generateRecommendations(mood);
  }

  /// Detect mood from face-derived features. These probabilities are
  /// typically 0..1 (nullable if not present). This is a heuristic
  /// mapping: high smile -> energetic/calm, low smile + closed eyes ->
  /// tired/stressed, etc.
  String detectFromFaceFeatures({double? smilingProbability, double? leftEyeOpenProbability, double? rightEyeOpenProbability}) {
    double smile = smilingProbability ?? 0.0;
    double left = leftEyeOpenProbability ?? 1.0;
    double right = rightEyeOpenProbability ?? 1.0;

    String mood;
    if (smile > 0.7) {
      // Smiling a lot -> energetic or calm depending on eye openness
      if (left > 0.5 && right > 0.5) {
        mood = 'energetic';
      } else {
        mood = 'calm';
      }
    } else if (smile > 0.4) {
      mood = 'neutral';
    } else {
      // Not smiling much
      if (left < 0.3 && right < 0.3) {
        mood = 'stressed';
      } else {
        mood = 'anxious';
      }
    }

    _detectedMood = mood;
    notifyListeners();
    // Generate recommendations immediately so UI can read them
    generateRecommendations(mood);
    return mood;
  }
}
