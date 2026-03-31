import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';

class OfflineModeService {
  Database? _database;
  final Connectivity _connectivity = Connectivity();

  // Initialize offline database
  Future<void> initializeOfflineDatabase() async {
    final directory = await getApplicationDocumentsDirectory();
    final path = join(directory.path, 'offline_workouts.db');

    _database = await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute(
          'CREATE TABLE workouts (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, exercises TEXT, completed INTEGER)'
        );
        await db.execute(
          'CREATE TABLE meals (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, mealData TEXT)'
        );
      },
    );
  }

  // Check connectivity
  Future<bool> isOnline() async {
    final result = await _connectivity.checkConnectivity();
    return result != ConnectivityResult.none;
  }

  // Save workout offline
  Future<void> saveWorkoutOffline(Map<String, dynamic> workoutData) async {
    if (_database == null) await initializeOfflineDatabase();

    await _database!.insert('workouts', {
      'date': DateTime.now().toIso8601String(),
      'exercises': workoutData['exercises'].toString(),
      'completed': workoutData['completed'] ? 1 : 0,
    });
  }

  // Save meal offline
  Future<void> saveMealOffline(Map<String, dynamic> mealData) async {
    if (_database == null) await initializeOfflineDatabase();

    await _database!.insert('meals', {
      'date': DateTime.now().toIso8601String(),
      'mealData': mealData.toString(),
    });
  }

  // Get offline workouts
  Future<List<Map<String, dynamic>>> getOfflineWorkouts() async {
    if (_database == null) await initializeOfflineDatabase();

    final List<Map<String, dynamic>> maps = await _database!.query('workouts');
    return maps;
  }

  // Get offline meals
  Future<List<Map<String, dynamic>>> getOfflineMeals() async {
    if (_database == null) await initializeOfflineDatabase();

    final List<Map<String, dynamic>> maps = await _database!.query('meals');
    return maps;
  }

  // Sync offline data when online
  Future<void> syncOfflineData(Function(Map<String, dynamic>) onSyncWorkout, Function(Map<String, dynamic>) onSyncMeal) async {
    if (!await isOnline()) return;

    final workouts = await getOfflineWorkouts();
    final meals = await getOfflineMeals();

    for (final workout in workouts) {
      await onSyncWorkout(workout);
    }

    for (final meal in meals) {
      await onSyncMeal(meal);
    }

    // Clear offline data after sync
    await _database!.delete('workouts');
    await _database!.delete('meals');
  }

  // Close database
  Future<void> closeDatabase() async {
    await _database?.close();
  }
}
