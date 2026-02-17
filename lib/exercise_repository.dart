import 'dart:convert';
import 'package:flutter/services.dart';
import 'exercise_model.dart';

class ExerciseRepository {
  // Load the manifest of all assets in the directory
  Future<List<String>> _getExerciseFilePaths() async {
    final manifestContent = await rootBundle.loadString('AssetManifest.json');
    final Map<String, dynamic> manifest = json.decode(manifestContent);
    // Filter for files inside the exercises folder and are JSONs
    List<String> exercisePaths = manifest.keys
        .where((String key) => key.contains('free-exercise-db-main/exercises/') && key.endsWith('.json'))
        .toList();
    // Debug summary (reduced logging to avoid flooding output)
    if (exercisePaths.isEmpty) {
      print('No exercise JSON files found in assets!');
    } else {
      print('Found ${exercisePaths.length} exercise JSON assets. (Logging suppressed to avoid spam)');
    }
    return exercisePaths;
  }

  // Load asset manifest and return all asset paths
  Future<Set<String>> _allAssetPaths() async {
    final manifestContent = await rootBundle.loadString('AssetManifest.json');
    final Map<String, dynamic> manifest = json.decode(manifestContent);
    final keys = manifest.keys.map((k) => k.replaceAll('\\', '/')).toSet();
    // Debug: if a known problematic exercise is missing, print matches
    const probe = 'Car_Drivers';
    final matches = keys.where((k) => k.contains(probe)).toList();
    if (matches.isEmpty) {
      // ignore: avoid_print
      print('[AssetResolver] No manifest entries found for $probe');
    } else {
      // ignore: avoid_print
      print('[AssetResolver] Manifest entries for $probe: ${matches.length}');
      for (final m in matches.take(20)) {
        // ignore: avoid_print
        print('[AssetResolver]   $m');
      }
    }
    return keys;
  }

  // Load a single exercise from a file path
  Future<Exercise> _loadExercise(String path) async {
    // Extract the ID from the path (e.g., 'ab_roller_advanced' from 'assets/.../ab_roller_advanced.json')
    String id = path.split('/').last.split('.').first;
    try {
      final String jsonString = await rootBundle.loadString(path);
      final Map<String, dynamic> jsonData = json.decode(jsonString);
      final ex = Exercise.fromJson(jsonData, id);
      // Try to resolve any image listed into a concrete asset path
      final assets = await _allAssetPaths();
      String? resolved;
      for (final rawImg in ex.images) {
        final candidateRaw = rawImg.replaceAll('\\', '/');
        // If the JSON already contains a path starting with 'assets' or 'data', try variants
        final variants = <String>[];
        if (candidateRaw.startsWith('assets/')) {
          variants.add(candidateRaw);
        } else if (candidateRaw.startsWith('data/')) {
          variants.add('assets/$candidateRaw');
        } else {
          variants.add('assets/data/free-exercise-db-main/exercises/$candidateRaw');
          // Legacy dataset path removed; prefer free-exercise-db pack only
          variants.add('assets/$candidateRaw');
        }

        // Also try the candidate as-is under exercises (handles subfolders like Push-Up_Wide/0.jpg)
        variants.add('assets/data/free-exercise-db-main/exercises/$candidateRaw');

        for (final v in variants) {
          if (assets.contains(v)) {
            resolved = v;
            break;
          }
        }
        if (resolved != null) break;
      }
      return ex.copyWith(assetImage: resolved);
    } catch (e) {
      print('Error loading exercise from $path: $e');
      rethrow;
    }
  }

  // Load all exercises
  Future<List<Exercise>> loadAllExercises() async {
    List<String> filePaths = await _getExerciseFilePaths();
  print('Loading ${filePaths.length} exercise files...');
    List<Exercise> exercises = [];

    for (String path in filePaths) {
      try {
        Exercise exercise = await _loadExercise(path);
        exercises.add(exercise);
      } catch (e) {
        print('Failed to load exercise from $path: $e');
      }
    }
    // Also, ensure music list is discoverable by callers by caching asset list somewhere if needed
  print('Finished loading ${exercises.length} exercises.');
    return exercises;
  }

  // Get bundled music tracks from manifest
  Future<List<String>> discoverMusicTracks() async {
    final assets = await _allAssetPaths();
    final music = assets.where((p) => p.contains('/data/music/') && (p.endsWith('.mp3') || p.endsWith('.wav'))).toList();
    // Normalize to asset-relative paths
    final normalized = music.map((m) => m.replaceAll('\\', '/')).toList();
    return normalized;
  }

  // Get exercises by primary muscle (Bonus Feature)
  Future<List<Exercise>> getExercisesByMuscle(String muscle) async {
    final allExercises = await loadAllExercises();
    return allExercises.where((exercise) => exercise.primaryMuscles.any((m) => m.toLowerCase() == muscle.toLowerCase())).toList();
  }

  // Get exercises by category (Bonus Feature)
  Future<List<Exercise>> getExercisesByCategory(String category) async {
    final allExercises = await loadAllExercises();
    return allExercises.where((exercise) => exercise.category.toLowerCase() == category.toLowerCase()).toList();
  }
}