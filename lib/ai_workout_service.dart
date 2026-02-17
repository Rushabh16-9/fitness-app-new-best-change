import 'database_service.dart';
import 'services/legacy_exercisedb_service.dart';
import 'models/exercise_model.dart';
import 'asset_resolver.dart';

class AIWorkoutService {
  final DatabaseService databaseService;
  final LegacyExerciseDbService _exerciseDb = LegacyExerciseDbService.instance;
  bool _isInitialized = false;

  AIWorkoutService({required this.databaseService});

  /// Initialize exercise database (call once)
  Future<void> initialize() async {
    if (_isInitialized) return;
    // Ensure asset manifest is loaded so localBestAsset can resolve
    await AssetResolver.init();
    await _exerciseDb.loadExercises();
    _isInitialized = true;
  }

  // Get personalized workout plan (for backward compatibility with tests)
  Future<List<Map<String, dynamic>>> getPersonalizedWorkoutPlan() async {
    return await generatePersonalizedWorkout();
  }

  /// Convert Exercise to workout format using legacy media GIFs
  Map<String, dynamic> _exerciseToWorkoutFormat(Exercise ex) {
    // Use legacy exercisedb media GIFs (1500+ exercises)
    final String imagePath = _exerciseDb.getLocalGifPath(ex);
    // Debug: confirm resolved image path
    // ignore: avoid_print
    print('[AIWorkout] Image for "${ex.displayName}": ${imagePath.isEmpty ? '<missing>' : imagePath}');
    return {
      'name': ex.displayName,
      'duration': 30, // 30 seconds per exercise
      'image': imagePath,
      'instructions': ex.instructions,
      'targetMuscles': ex.targetMuscles,
      'equipment': ex.equipment,
      'difficulty': ex.difficulty,
    };
  }

  // Generate AI-powered workout using comprehensive exercise database
  Future<List<Map<String, dynamic>>> generatePersonalizedWorkout() async {
    if (!_isInitialized) {
      await initialize();
    }

    // Get user profile data
    final userProfile = await databaseService.getUserProfile();
    final fitnessLevel = userProfile['fitnessLevel'] ?? 'Beginner';
    
    // Calculate BMI for personalization
    final heightRaw = userProfile['height'] ?? 170;
    final weightRaw = userProfile['weight'] ?? 70;
    
    double height = (heightRaw is num) ? heightRaw.toDouble() : double.tryParse(heightRaw.toString()) ?? 170;
    double weight = (weightRaw is num) ? weightRaw.toDouble() : double.tryParse(weightRaw.toString()) ?? 70;
    final bmi = weight / ((height / 100) * (height / 100));

    List<Map<String, dynamic>> workouts = [];

    // Generate workouts based on fitness level and BMI
    if (fitnessLevel == 'Beginner' || bmi < 18.5) {
      // BEGINNER WORKOUTS - Focus on foundational strength
      
      // Workout 1: Gentle Full Body (20 min)
      final beginnerFullBody = _exerciseDb.getRandomExercises(_exerciseDb.allExercises.where((e) => 
        e.equipments.any((eq) => eq.toLowerCase().contains('body weight'))
      ).toList(), 10);
      if (beginnerFullBody.isNotEmpty) {
        workouts.add({
          'name': 'Beginner Full Body Strength',
          'duration': 20,
          'difficulty': 'Beginner',
          'exercises': beginnerFullBody.map((e) => _exerciseToWorkoutFormat(e)).toList(),
          'exerciseNames': beginnerFullBody.map((e) => '${e.displayName}: 30 seconds').toList(),
          'calories': 150,
          'muscleGroups': ['Full Body'],
          'focus': 'Building foundation',
          'benefits': ['Builds confidence', 'Improves overall fitness', 'Low impact'],
        });
      }

      // Workout 2: Core Stability (15 min)
      final coreStability = [
        ..._exerciseDb.getRandomExercises(_exerciseDb.warmupExercises, 3),
        ..._exerciseDb.getRandomExercises(_exerciseDb.coreExercises.where((e) => e.difficulty == 'beginner').toList(), 5),
      ];
      if (coreStability.isNotEmpty) {
        workouts.add({
          'name': 'Core & Stability',
          'duration': 15,
          'difficulty': 'Beginner',
          'exercises': coreStability.map((e) => _exerciseToWorkoutFormat(e)).toList(),
          'exerciseNames': coreStability.map((e) => '${e.displayName}: 30 seconds').toList(),
          'calories': 100,
          'muscleGroups': ['Core', 'Abs'],
          'focus': 'Core strength',
          'benefits': ['Improves posture', 'Strengthens core', 'Reduces back pain'],
        });
      }

      // Workout 3: Upper Body Introduction (18 min)
      final upperBodyIntro = _exerciseDb.getRandomExercises(
        _exerciseDb.upperBodyExercises.where((e) => e.difficulty == 'beginner').toList(), 8
      );
      if (upperBodyIntro.isNotEmpty) {
        workouts.add({
          'name': 'Upper Body Basics',
          'duration': 18,
          'difficulty': 'Beginner',
          'exercises': upperBodyIntro.map((e) => _exerciseToWorkoutFormat(e)).toList(),
          'exerciseNames': upperBodyIntro.map((e) => '${e.displayName}: 30 seconds').toList(),
          'calories': 120,
          'muscleGroups': ['Chest', 'Back', 'Arms'],
          'focus': 'Upper body strength',
          'benefits': ['Builds arm strength', 'Improves push/pull movements', 'Tones upper body'],
        });
      }

    } else if (fitnessLevel == 'Intermediate' || (bmi >= 18.5 && bmi < 25)) {
      // INTERMEDIATE WORKOUTS - Balanced intensity
      
      // Workout 1: Full Body Power (30 min)
      final fullBodyPower = [
        ..._exerciseDb.getRandomExercises(_exerciseDb.warmupExercises, 2),
        ..._exerciseDb.getRandomExercises(_exerciseDb.upperBodyExercises.where((e) => e.difficulty == 'intermediate').toList(), 5),
        ..._exerciseDb.getRandomExercises(_exerciseDb.lowerBodyExercises.where((e) => e.difficulty == 'intermediate').toList(), 5),
        ..._exerciseDb.getRandomExercises(_exerciseDb.coreExercises, 3),
      ];
      if (fullBodyPower.isNotEmpty) {
        workouts.add({
          'name': 'Full Body Power Training',
          'duration': 30,
          'difficulty': 'Intermediate',
          'exercises': fullBodyPower.map((e) => _exerciseToWorkoutFormat(e)).toList(),
          'exerciseNames': fullBodyPower.map((e) => '${e.displayName}: 40 seconds').toList(),
          'calories': 250,
          'muscleGroups': ['Full Body'],
          'focus': 'Strength and endurance',
          'benefits': ['Balanced development', 'Builds muscle', 'Increases metabolism', 'Total body conditioning'],
        });
      }

      // Workout 2: HIIT Cardio Blast (25 min)
      final hiitCardio = [
        ..._exerciseDb.getRandomExercises(_exerciseDb.energyBoostExercises, 10),
        ..._exerciseDb.getRandomExercises(_exerciseDb.coreExercises, 4),
      ];
      if (hiitCardio.isNotEmpty) {
        workouts.add({
          'name': 'HIIT Cardio Blast',
          'duration': 25,
          'difficulty': 'Intermediate',
          'exercises': hiitCardio.map((e) => _exerciseToWorkoutFormat(e)).toList(),
          'exerciseNames': hiitCardio.map((e) => '${e.displayName}: 45 seconds').toList(),
          'calories': 300,
          'muscleGroups': ['Cardio', 'Core'],
          'focus': 'Fat burning',
          'benefits': ['Burns calories fast', 'Boosts metabolism', 'Improves cardiovascular health', 'Builds endurance'],
        });
      }

      // Workout 3: Upper/Lower Split (28 min)
      final upperLowerSplit = [
        ..._exerciseDb.getRandomExercises(_exerciseDb.upperBodyExercises.where((e) => e.difficulty != 'beginner').toList(), 6),
        ..._exerciseDb.getRandomExercises(_exerciseDb.lowerBodyExercises.where((e) => e.difficulty != 'beginner').toList(), 6),
      ];
      if (upperLowerSplit.isNotEmpty) {
        workouts.add({
          'name': 'Upper/Lower Body Split',
          'duration': 28,
          'difficulty': 'Intermediate',
          'exercises': upperLowerSplit.map((e) => _exerciseToWorkoutFormat(e)).toList(),
          'exerciseNames': upperLowerSplit.map((e) => '${e.displayName}: 40 seconds').toList(),
          'calories': 220,
          'muscleGroups': ['Upper Body', 'Lower Body'],
          'focus': 'Muscle building',
          'benefits': ['Balanced muscle development', 'Strength gains', 'Progressive overload'],
        });
      }

    } else {
      // ADVANCED / HIGH BMI WORKOUTS - High intensity for fat loss
      
      // Workout 1: Fat Burning HIIT (30 min)
      final fatBurningHIIT = [
        ..._exerciseDb.getRandomExercises(_exerciseDb.warmupExercises, 2),
        ..._exerciseDb.getRandomExercises(_exerciseDb.energyBoostExercises, 12),
        ..._exerciseDb.getRandomExercises(_exerciseDb.coreExercises, 4),
      ];
      if (fatBurningHIIT.isNotEmpty) {
        workouts.add({
          'name': 'Fat Burning HIIT Circuit',
          'duration': 30,
          'difficulty': 'Intermediate',
          'exercises': fatBurningHIIT.map((e) => _exerciseToWorkoutFormat(e)).toList(),
          'exerciseNames': fatBurningHIIT.map((e) => '${e.displayName}: 45 seconds').toList(),
          'calories': 350,
          'muscleGroups': ['Full Body', 'Cardio'],
          'focus': 'Maximum fat burn',
          'benefits': ['Burns maximum calories', 'Accelerates weight loss', 'Boosts metabolism for hours', 'Improves heart health'],
        });
      }

      // Workout 2: Cardio Core Crusher (28 min)
      final cardioCore = [
        ..._exerciseDb.getRandomExercises(_exerciseDb.energyBoostExercises, 10),
        ..._exerciseDb.getRandomExercises(_exerciseDb.coreExercises, 8),
      ];
      if (cardioCore.isNotEmpty) {
        workouts.add({
          'name': 'Cardio Core Crusher',
          'duration': 28,
          'difficulty': 'Intermediate',
          'exercises': cardioCore.map((e) => _exerciseToWorkoutFormat(e)).toList(),
          'exerciseNames': cardioCore.map((e) => '${e.displayName}: 40 seconds').toList(),
          'calories': 320,
          'muscleGroups': ['Cardio', 'Core', 'Abs'],
          'focus': 'Cardio and core',
          'benefits': ['Shreds belly fat', 'Strengthens core', 'High calorie burn', 'Improves athletic performance'],
        });
      }

      // Workout 3: Total Body Strength & Cardio (35 min)
      final totalBody = [
        ..._exerciseDb.getRandomExercises(_exerciseDb.warmupExercises, 2),
        ..._exerciseDb.getRandomExercises(_exerciseDb.intermediateExercises, 8),
        ..._exerciseDb.getRandomExercises(_exerciseDb.energyBoostExercises, 6),
        ..._exerciseDb.getRandomExercises(_exerciseDb.coreExercises, 4),
      ];
      if (totalBody.isNotEmpty) {
        workouts.add({
          'name': 'Total Body Strength & Cardio',
          'duration': 35,
          'difficulty': 'Intermediate',
          'exercises': totalBody.map((e) => _exerciseToWorkoutFormat(e)).toList(),
          'exerciseNames': totalBody.map((e) => '${e.displayName}: 45 seconds').toList(),
          'calories': 380,
          'muscleGroups': ['Full Body'],
          'focus': 'Strength and cardio combined',
          'benefits': ['Complete workout', 'Builds lean muscle', 'Burns fat', 'Improves overall fitness'],
        });
      }
    }

    return workouts;
  }

  // Generate workout plan for a specific goal
  Future<List<Map<String, dynamic>>> generateWorkoutForGoal(String goal) async {
    final baseWorkouts = await generatePersonalizedWorkout();

    // Customize based on goal
    switch (goal.toLowerCase()) {
      case 'weight loss':
        return baseWorkouts.map((workout) {
          return {
            ...workout,
            'focus': 'High-intensity cardio',
            'calories': (workout['calories'] as int) + 50,
          };
        }).toList();

      case 'muscle gain':
        return baseWorkouts.map((workout) {
          return {
            ...workout,
            'focus': 'Strength training',
            'sets': '4-5 sets per exercise',
          };
        }).toList();

      case 'endurance':
        return baseWorkouts.map((workout) {
          return {
            ...workout,
            'focus': 'Longer duration',
            'duration': (workout['duration'] as int) + 10,
          };
        }).toList();

      default:
        return baseWorkouts;
    }
  }

  // Adjust workout based on user feedback
  Future<void> adjustWorkoutBasedOnFeedback(String workoutId, String feedback) async {
    // In a real implementation, this would send feedback to AI model
    // For now, just store it in user preferences
    final userPrefs = await databaseService.getUserProfile();
    final workoutFeedback = userPrefs['workoutFeedback'] ?? {};
    workoutFeedback[workoutId] = feedback;

    await databaseService.updateUserProfile({
      'workoutFeedback': workoutFeedback,
    });
  }

  // Get workout recommendations based on user history
  Future<List<String>> getWorkoutRecommendations() async {
    final userProfile = await databaseService.getUserProfile();
    final completedWorkouts = userProfile['completedWorkouts'] ?? [];

    // Simple recommendation logic
    if (completedWorkouts.isEmpty) {
      return ['Beginner Full Body', 'Core & Abs'];
    }

    // Recommend variety
    final workoutTypes = ['Upper Body', 'Lower Body', 'Full Body', 'Core'];
    final completedTypes = completedWorkouts.map((w) => w['type']).toSet();

    return workoutTypes.where((type) => !completedTypes.contains(type)).toList();
  }
}
