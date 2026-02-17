import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SmartRemindersService {
  final FlutterLocalNotificationsPlugin _notifications = FlutterLocalNotificationsPlugin();

  Future<void> initialize() async {
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const InitializationSettings initializationSettings =
        InitializationSettings(android: initializationSettingsAndroid);

    await _notifications.initialize(initializationSettings);
  }

  // Show immediate notification
  Future<void> showNotification(String title, String body) async {
    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
      'immediate_notifications',
      'Immediate Notifications',
      channelDescription: 'Immediate notifications',
      importance: Importance.max,
      priority: Priority.high,
      showWhen: false,
    );

    const NotificationDetails platformChannelSpecifics =
        NotificationDetails(android: androidPlatformChannelSpecifics);

    await _notifications.show(0, title, body, platformChannelSpecifics);
  }

  // Schedule daily workout reminder
  Future<void> scheduleDailyWorkoutReminder() async {
    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
      'workout_reminders',
      'Workout Reminders',
      channelDescription: 'Daily workout reminders',
      importance: Importance.max,
      priority: Priority.high,
    );

    const NotificationDetails platformChannelSpecifics =
        NotificationDetails(android: androidPlatformChannelSpecifics);

    // Schedule for 7 AM daily using periodic notification
    await _notifications.periodicallyShow(
      1,
      'Time to Workout!',
      'Start your daily fitness routine',
      RepeatInterval.daily,
      platformChannelSpecifics,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
    );
  }

  // Schedule meal reminder
  Future<void> scheduleMealReminder(String mealType, int hour) async {
    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
      'meal_reminders',
      'Meal Reminders',
      channelDescription: 'Meal time reminders',
      importance: Importance.max,
      priority: Priority.high,
    );

    const NotificationDetails platformChannelSpecifics =
        NotificationDetails(android: androidPlatformChannelSpecifics);

    // Use periodic notification for daily reminders
    await _notifications.periodicallyShow(
      2,
      'Meal Time!',
      'Time for your $mealType',
      RepeatInterval.daily,
      platformChannelSpecifics,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
    );
  }

  // Cancel all reminders
  Future<void> cancelAllReminders() async {
    await _notifications.cancelAll();
  }

  // Save reminder preferences
  Future<void> saveReminderPreferences(Map<String, bool> preferences) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('workout_reminders', preferences['workout'] ?? true);
    await prefs.setBool('meal_reminders', preferences['meal'] ?? true);
    await prefs.setBool('hydration_reminders', preferences['hydration'] ?? true);
  }

  // Get reminder preferences
  Future<Map<String, bool>> getReminderPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    return {
      'workout': prefs.getBool('workout_reminders') ?? true,
      'meal': prefs.getBool('meal_reminders') ?? true,
      'hydration': prefs.getBool('hydration_reminders') ?? true,
    };
  }
}
