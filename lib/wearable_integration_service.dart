import 'package:health/health.dart';
import 'package:permission_handler/permission_handler.dart';

class WearableIntegrationService {
  final Health health = Health();

  // Request permissions for health data
  Future<bool> requestPermissions() async {
    final permissions = [
      Permission.activityRecognition,
      Permission.location,
    ];

    for (final permission in permissions) {
      final status = await permission.request();
      if (status.isDenied) {
        return false;
      }
    }

    // Request health permissions
    final healthPermissions = [
      HealthDataType.STEPS,
      HealthDataType.ACTIVE_ENERGY_BURNED,
      HealthDataType.HEART_RATE,
      HealthDataType.WORKOUT,
    ];

    final hasPermissions = await health.requestAuthorization(healthPermissions);
    return hasPermissions;
  }

  // Get steps data
  Future<int?> getSteps(DateTime startDate, DateTime endDate) async {
    try {
      final steps = await health.getTotalStepsInInterval(startDate, endDate);
      return steps;
    } catch (e) {
      print('Error getting steps: $e');
      return null;
    }
  }

  // Get heart rate data
  Future<List<HealthDataPoint>> getHeartRate(DateTime startDate, DateTime endDate) async {
    try {
      final heartRate = await health.getHealthDataFromTypes(types: [HealthDataType.HEART_RATE], startTime: startDate, endTime: endDate);
      return heartRate;
    } catch (e) {
      print('Error getting heart rate: $e');
      return [];
    }
  }

  // Get active energy burned
  Future<List<HealthDataPoint>> getActiveEnergy(DateTime startDate, DateTime endDate) async {
    try {
      final energy = await health.getHealthDataFromTypes(types: [HealthDataType.ACTIVE_ENERGY_BURNED], startTime: startDate, endTime: endDate);
      return energy;
    } catch (e) {
      print('Error getting active energy: $e');
      return [];
    }
  }

  // Get workout data
  Future<List<HealthDataPoint>> getWorkouts(DateTime startDate, DateTime endDate) async {
    try {
      final workouts = await health.getHealthDataFromTypes(types: [HealthDataType.WORKOUT], startTime: startDate, endTime: endDate);
      return workouts;
    } catch (e) {
      print('Error getting workouts: $e');
      return [];
    }
  }

  // Sync data to Firebase (to be called from database service)
  Future<Map<String, dynamic>> getWearableDataForSync() async {
    final now = DateTime.now();
    final startDate = now.subtract(const Duration(days: 1));

    final steps = await getSteps(startDate, now);
    final heartRate = await getHeartRate(startDate, now);
    final energy = await getActiveEnergy(startDate, now);
    final workouts = await getWorkouts(startDate, now);

    return {
      'steps': steps,
      'heartRate': heartRate.map((point) => {
        'value': point.value,
        'date': point.dateTo,
      }).toList(),
      'activeEnergy': energy,
      'workouts': workouts.map((point) => {
        'value': point.value,
        'date': point.dateTo,
      }).toList(),
      'lastSync': now.toIso8601String(),
    };
  }
}
