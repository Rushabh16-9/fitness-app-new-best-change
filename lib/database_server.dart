// database_service.dart
import 'package:shared_preferences/shared_preferences.dart';

class DatabaseService {
  static final DatabaseService _instance = DatabaseService._internal();
  factory DatabaseService() => _instance;
  DatabaseService._internal();

  late SharedPreferences _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // User profile methods
  Map<String, dynamic> getUserProfile() {
    return {
      'name': _prefs.getString('name') ?? 'John Doe',
      'gender': _prefs.getString('gender') ?? 'Male',
      'weight': _prefs.getString('weight') ?? '153.2',
      'height': _prefs.getString('height') ?? '60',
      'dob': _prefs.getString('dob') ?? '2004-09-09',
    };
  }

  Future<void> updateUserProfile(Map<String, dynamic> newData) async {
    for (var key in newData.keys) {
      await _prefs.setString(key, newData[key].toString());
    }
  }

  // Workout settings methods
  Map<String, dynamic> getWorkoutSettings() {
    return {
      'soundEnabled': _prefs.getBool('soundEnabled') ?? true,
      'soundVolume': _prefs.getDouble('soundVolume') ?? 0.7,
    };
  }

  Future<void> updateWorkoutSettings(Map<String, dynamic> newSettings) async {
    for (var key in newSettings.keys) {
      if (newSettings[key] is bool) {
        await _prefs.setBool(key, newSettings[key]);
      } else if (newSettings[key] is double) {
        await _prefs.setDouble(key, newSettings[key]);
      } else {
        await _prefs.setString(key, newSettings[key].toString());
      }
    }
  }

  // Completed workouts methods
  List<String> getCompletedWorkouts() {
    return _prefs.getStringList('completedWorkouts') ?? [];
  }

  Future<void> addCompletedWorkout(String workout) async {
    final workouts = getCompletedWorkouts();
    workouts.add(workout);
    await _prefs.setStringList('completedWorkouts', workouts);
  }
}