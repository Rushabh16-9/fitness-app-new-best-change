import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'dart:async';

/// Simple wrapper around flutter_local_notifications to schedule hydration reminders.
/// Schedules notifications at fixed times between startHour and endHour based on intervalMinutes.
class HydrationReminderService {
  HydrationReminderService(this._plugin);

  final FlutterLocalNotificationsPlugin _plugin;

  static const int _baseId = 2000; // base id range for hydration notifications
  static const String _channelId = 'hydration_reminders';
  static const String _channelName = 'Hydration Reminders';
  static const String _channelDesc = 'Regular notifications to drink water';

  String get _uid => FirebaseAuth.instance.currentUser?.uid ?? 'anon';

  Future<void> ensureInitialized() async {
    // tz initialization should be safe to call multiple times
    try {
      tz.initializeTimeZones();
      final localName = DateTime.now().timeZoneName;
      // Fallback to local if available; if not, default to UTC
      tz.setLocalLocation(tz.getLocation(localName));
    } catch (_) {
      tz.setLocalLocation(tz.UTC);
    }
  }

  AndroidNotificationDetails get _androidDetails => const AndroidNotificationDetails(
        _channelId,
        _channelName,
        channelDescription: _channelDesc,
        importance: Importance.high,
        priority: Priority.high,
        playSound: true,
      );

  NotificationDetails get _details => NotificationDetails(android: _androidDetails);

  // Exercise-specific Android details: use fullScreenIntent and max importance so devices
  // may present a full-screen alarm UI when the notification fires.
  AndroidNotificationDetails get _exerciseAndroidDetails => const AndroidNotificationDetails(
        _channelId,
        _channelName,
        channelDescription: _channelDesc,
        importance: Importance.max,
        priority: Priority.high,
        playSound: true,
        fullScreenIntent: true,
        category: AndroidNotificationCategory.alarm,
      );

  NotificationDetails get _exerciseDetails => NotificationDetails(android: _exerciseAndroidDetails);

  Future<void> requestPermissionsIfNeeded() async {
    final androidImpl = _plugin.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
    await androidImpl?.requestNotificationsPermission();
    // Request camera permission (for push-up photo) and POST_NOTIFICATIONS for Android 13+
    if (defaultTargetPlatform == TargetPlatform.android) {
      try {
        final status = await Permission.camera.status;
        if (!status.isGranted) await Permission.camera.request();
        if (await Permission.notification.isDenied) {
          // request notification permission on Android 13+
          await Permission.notification.request();
        }
      } catch (e) {
        if (kDebugMode) print('Permission request failed: $e');
      }
    }
  }

  /// Show an immediate hydration notification (useful for testing)
  Future<void> showImmediateHydrationNotification({String? title, String? body, String? songAsset, String? challengeId}) async {
    await ensureInitialized();
    await requestPermissionsIfNeeded();
    final payload = ['hydration', songAsset ?? '', challengeId ?? ''].join('|');
    try {
      await _plugin.show(
        _scopedId(0),
        title ?? 'Hydration reminder',
        body ?? 'Time to drink some water 💧',
        _details,
        payload: payload,
      );
    } catch (e) {
      if (kDebugMode) print('Failed to show immediate hydration notification: $e');
    }
  }

  /// Show an immediate exercise notification (useful for testing exercise alarm flow)
  Future<void> showImmediateExerciseNotification({String? title, String? body, String? songAsset, String? challengeId}) async {
    await ensureInitialized();
    await requestPermissionsIfNeeded();
    final payload = ['exercise', songAsset ?? '', challengeId ?? ''].join('|');
    try {
      // On Android, prefer to show a native full-screen notification via MethodChannel so it can target AlarmActivity
      if (defaultTargetPlatform == TargetPlatform.android) {
        const channel = MethodChannel('com.example.application_main/alarm_channel');
        await channel.invokeMethod('showFullScreenAlarm', {
          'title': title ?? 'Exercise Alarm',
          'body': body ?? 'Time for your scheduled exercise!',
          'payload': payload,
        });
      } else {
        await _plugin.show(
          _exerciseScopedId(0),
          title ?? 'Exercise Alarm',
          body ?? 'Time for your scheduled exercise!',
          _exerciseDetails,
          payload: payload,
        );
      }
    } catch (e) {
      if (kDebugMode) print('Failed to show immediate exercise notification: $e');
    }
  }

  /// Cancel all previously scheduled hydration notifications for the current user.
  Future<void> clearAll() async {
    // We use a predictable id range; clear those.
    for (var i = 0; i < 200; i++) {
      await _plugin.cancel(_scopedId(i));
    }
  }

  int _scopedId(int index) => _baseId + (index % 200) + _uid.hashCode.abs() % 1000;

  /// Schedule notifications every [intervalMinutes] between [startHour] and [endHour] local time.
  /// Example: startHour=9, endHour=21, intervalMinutes=60 schedules at 9:00, 10:00, ..., 21:00.
  Future<void> scheduleDaily({required int intervalMinutes, int startHour = 9, int endHour = 21, String? songAsset, String? challengeId}) async {
    if (intervalMinutes <= 0) return;
    await ensureInitialized();
    await requestPermissionsIfNeeded();
    await clearAll();

    // Build times for a single day and set to repeat daily using matchDateTimeComponents: time
    final now = tz.TZDateTime.now(tz.local);
    final List<tz.TZDateTime> times = [];
    for (int hour = startHour; hour <= endHour; hour++) {
      for (int minute = 0; minute < 60; minute += intervalMinutes) {
        if (minute >= 60) break;
        final t = tz.TZDateTime(tz.local, now.year, now.month, now.day, hour, minute);
        times.add(t);
      }
    }

    int idx = 0;
    for (final time in times) {
      final scheduled = time.isBefore(now) ? time.add(const Duration(days: 1)) : time;
      try {
        final payloadParts = ['hydration', songAsset ?? '', challengeId ?? ''];
        final payload = payloadParts.join('|');
        await _plugin.zonedSchedule(
          _scopedId(idx++),
          'Hydration reminder',
          'Time to drink some water 💧',
          scheduled,
          _details,
          payload: payload,
          androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
          matchDateTimeComponents: DateTimeComponents.time,
        );
      } catch (e) {
        if (kDebugMode) {
          print('Failed to schedule hydration notification: $e');
        }
      }
    }
  }

  // ---------------------- Exercise alarm helpers ----------------------
  static const int _exerciseBaseId = 3000;

  static const int int32Max = 0x7fffffff;

  // In-app timers so alarms can fire while the app is running
  final Map<int, Timer> _inAppTimers = {};

  int _exerciseScopedId(int index) => _exerciseBaseId + (index % 100) + _uid.hashCode.abs() % 1000;

  /// Schedule a one-time exercise alarm at [scheduled] local tz time.
  Future<void> scheduleOneTimeExerciseAlarm({required tz.TZDateTime scheduled, String? songAsset, String? challengeId, String? title, String? body}) async {
    await ensureInitialized();
    await requestPermissionsIfNeeded();
    final now = tz.TZDateTime.now(tz.local);
    final target = scheduled.isBefore(now) ? scheduled.add(const Duration(days: 1)) : scheduled;
    final payload = ['exercise', songAsset ?? '', challengeId ?? ''].join('|');
    try {
      // Prefer native AlarmManager scheduling on Android for exact alarms
      if (defaultTargetPlatform == TargetPlatform.android) {
        const channel = MethodChannel('com.example.application_main/alarm_channel');
        final triggerMillis = target.millisecondsSinceEpoch;
        final requestCode = (triggerMillis % int32Max).toInt();
        try {
          await channel.invokeMethod('scheduleExactAlarm', {
            'triggerMillis': triggerMillis,
            'payload': payload,
            'title': title ?? 'Exercise Alarm',
            'body': body ?? 'Time for your scheduled exercise!',
            'requestCode': requestCode,
          });
          // persist scheduled alarm so we can show it in UI and cancel later
          await _saveScheduledAlarm(requestCode, triggerMillis, payload, title ?? 'Exercise Alarm', body ?? 'Time for your scheduled exercise!', type: 'one_time');
          try {
            final alarmMap = {
              'type': 'one_time',
              'requestCode': requestCode,
              'triggerMillis': triggerMillis,
              'payload': payload,
              'title': title ?? 'Exercise Alarm',
              'body': body ?? 'Time for your scheduled exercise!'
            };
            await channel.invokeMethod('persistAlarmAndroid', {'alarm': alarmMap});
          } catch (e) {
            // ignore native persist failure
          }
        } catch (e) {
          // Native exact alarm scheduling failed (permission or OEM restriction).
          if (kDebugMode) print('Native exact alarm failed, will fallback to plugin scheduling: $e');
          // Try starting a foreground service that will wake the device and fire the alarm at triggerMillis.
          try {
            await channel.invokeMethod('startForegroundAlarmService', {
              'triggerMillis': triggerMillis,
              'payload': payload,
              'title': title ?? 'Exercise Alarm',
              'body': body ?? 'Time for your scheduled exercise!',
              'requestCode': requestCode,
            });
          } catch (se) {
            if (kDebugMode) print('Failed to start foreground service fallback: $se');
          }
        }

        // Always schedule with plugin as a fallback if native scheduling unavailable
        try {
          await _plugin.zonedSchedule(
            _exerciseScopedId(0),
            title ?? 'Exercise Alarm',
            body ?? 'Time for your scheduled exercise!',
            target,
            _exerciseDetails,
            payload: payload,
            androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
          );
        } catch (e) {
          if (kDebugMode) print('Plugin scheduling failed as well: $e');
        }
        // In-app fallback timer while the app is alive
        final remaining = triggerMillis - DateTime.now().millisecondsSinceEpoch;
        final delay = Duration(milliseconds: remaining > 0 ? remaining : 0);
        if (remaining <= 0) {
          // Fire immediately (app is running)
          showImmediateExerciseNotification(title: title, body: body, songAsset: songAsset, challengeId: challengeId);
        } else {
          _inAppTimers[requestCode]?.cancel();
          _inAppTimers[requestCode] = Timer(delay, () {
            showImmediateExerciseNotification(title: title, body: body, songAsset: songAsset, challengeId: challengeId);
            _inAppTimers.remove(requestCode);
          });
        }
      } else {
        await _plugin.zonedSchedule(
          _exerciseScopedId(0),
          title ?? 'Exercise Alarm',
          body ?? 'Time for your scheduled exercise!',
          target,
          _exerciseDetails,
          payload: payload,
          androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        );
      }
    } catch (e) {
      if (kDebugMode) print('Failed to schedule exercise alarm: $e');
    }
  }

  /// Schedule a repeating daily clock-style alarm at [hour]:[minute]
  Future<void> scheduleClockAlarm({required int hour, required int minute, String? songAsset, String? challengeId, String? title, String? body}) async {
    await ensureInitialized();
    await requestPermissionsIfNeeded();
    final payload = ['exercise', songAsset ?? '', challengeId ?? ''].join('|');
    try {
      if (defaultTargetPlatform == TargetPlatform.android) {
        const channel = MethodChannel('com.example.application_main/alarm_channel');
        final requestCode = ((hour * 60 + minute) % int32Max).toInt();
        await channel.invokeMethod('scheduleDailyAlarm', {
          'hour': hour,
          'minute': minute,
          'payload': payload,
          'title': title ?? 'Exercise Alarm',
          'body': body ?? 'Time for your scheduled exercise!',
          'requestCode': requestCode,
        });
        await _saveScheduledAlarm(requestCode, DateTime.now().millisecondsSinceEpoch, payload, title ?? 'Exercise Alarm', body ?? 'Time for your scheduled exercise!', type: 'daily', hour: hour, minute: minute);
        try {
          const channel = MethodChannel('com.example.application_main/alarm_channel');
          final alarmMap = {
            'type': 'daily',
            'requestCode': requestCode,
            'hour': hour,
            'minute': minute,
            'payload': payload,
            'title': title ?? 'Exercise Alarm',
            'body': body ?? 'Time for your scheduled exercise!'
          };
          await channel.invokeMethod('persistAlarmAndroid', {'alarm': alarmMap});
        } catch (e) {
          // ignore
        }
      } else {
        // Fallback: schedule daily using plugin
        final now = tz.TZDateTime.now(tz.local);
        final scheduled = tz.TZDateTime(tz.local, now.year, now.month, now.day, hour, minute);
        await _plugin.zonedSchedule(
          _exerciseScopedId(0),
          title ?? 'Exercise Alarm',
          body ?? 'Time for your scheduled exercise!',
          scheduled,
          _exerciseDetails,
          payload: payload,
          androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
          matchDateTimeComponents: DateTimeComponents.time,
        );
      }
    } catch (e) {
      if (kDebugMode) print('Failed to schedule clock alarm: $e');
    }
  }

  static const Int32Max = 0x7fffffff;

  Future<void> _saveScheduledAlarm(int requestCode, int triggerMillis, String payload, String title, String body, {String? type, int? hour, int? minute}) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final key = 'scheduled_exercise_alarms';
      final raw = prefs.getStringList(key) ?? <String>[];
      final entry = json.encode({
        'requestCode': requestCode,
        'triggerMillis': triggerMillis,
        'payload': payload,
        'title': title,
        'body': body,
        if (type != null) 'type': type,
        if (hour != null) 'hour': hour,
        if (minute != null) 'minute': minute,
      });
      raw.add(entry);
      await prefs.setStringList(key, raw);
    } catch (e) {
      if (kDebugMode) print('Failed to persist scheduled alarm: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getScheduledAlarms() async {
    final prefs = await SharedPreferences.getInstance();
    final key = 'scheduled_exercise_alarms';
    final raw = prefs.getStringList(key) ?? <String>[];
    final out = <Map<String, dynamic>>[];
    for (final s in raw) {
      try {
        final m = json.decode(s) as Map<String, dynamic>;
        out.add(m);
      } catch (_) {}
    }
    return out;
  }

  Future<void> removeScheduledAlarmFromStorage(int requestCode) async {
    final prefs = await SharedPreferences.getInstance();
    final key = 'scheduled_exercise_alarms';
    final raw = prefs.getStringList(key) ?? <String>[];
    raw.removeWhere((s) {
      try {
        final m = json.decode(s) as Map<String, dynamic>;
        return m['requestCode'] == requestCode;
      } catch (_) {
        return false;
      }
    });
    await prefs.setStringList(key, raw);
    // Also instruct native side to remove persisted alarm for reboot reschedule
    try {
      const channel = MethodChannel('com.example.application_main/alarm_channel');
      await channel.invokeMethod('removePersistedAlarm', {'requestCode': requestCode});
      // Also stop any foreground service associated with this requestCode
      try {
        await channel.invokeMethod('stopForegroundAlarmService', {'requestCode': requestCode});
      } catch (e) {
        if (kDebugMode) print('Failed to stop foreground service during remove: $e');
      }
    } catch (e) {
      if (kDebugMode) print('Failed to remove native persisted alarm: $e');
    }
  }

  /// Clear all exercise alarms scheduled by this service.
  Future<void> clearExerciseAlarms() async {
    for (var i = 0; i < 100; i++) {
      await _plugin.cancel(_exerciseScopedId(i));
      try {
        final channel = MethodChannel('com.example.application_main/alarm_channel');
  await channel.invokeMethod('cancelExactAlarm', {'requestCode': _exerciseScopedId(i)});
  // also try stopping foreground service if any
  try { await channel.invokeMethod('stopForegroundAlarmService', {'requestCode': _exerciseScopedId(i)}); } catch (e) {}
      } catch (e) {
        if (kDebugMode) print('Failed to cancel native alarm: $e');
      }
    }
  }
}
