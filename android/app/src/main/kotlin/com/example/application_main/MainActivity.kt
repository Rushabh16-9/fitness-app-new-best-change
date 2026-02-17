package com.example.application_main

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import io.flutter.embedding.android.FlutterActivity
import io.flutter.plugin.common.MethodChannel
import android.content.SharedPreferences
import android.content.Context.MODE_PRIVATE
import org.json.JSONObject
import java.util.HashSet

class MainActivity : FlutterActivity() {
	private val CHANNEL = "com.example.application_main/alarm_channel"

	override fun configureFlutterEngine(flutterEngine: io.flutter.embedding.engine.FlutterEngine) {
		super.configureFlutterEngine(flutterEngine)

		MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
			when (call.method) {
				"showFullScreenAlarm" -> {
					val title = call.argument<String>("title") ?: "Exercise Alarm"
					val body = call.argument<String>("body") ?: "Time for your scheduled exercise!"
					val payload = call.argument<String>("payload") ?: ""
					showFullScreenNotification(title, body, payload)
					result.success(true)
				}
				"scheduleExactAlarm" -> {
					val triggerMillis = call.argument<Long>("triggerMillis") ?: 0L
					val payload = call.argument<String>("payload") ?: ""
					val title = call.argument<String>("title") ?: "Exercise Alarm"
					val body = call.argument<String>("body") ?: "Time for your scheduled exercise!"
					val requestCode = call.argument<Int>("requestCode") ?: ((triggerMillis % Int.MAX_VALUE).toInt())
					scheduleExactAlarm(triggerMillis, payload, title, body, requestCode)
					result.success(true)
				}
				"cancelExactAlarm" -> {
					val requestCode = call.argument<Int>("requestCode") ?: 0
					cancelExactAlarm(requestCode)
					result.success(true)
				}
				"scheduleDailyAlarm" -> {
					val hour = call.argument<Int>("hour") ?: 0
					val minute = call.argument<Int>("minute") ?: 0
					val payload = call.argument<String>("payload") ?: ""
					val title = call.argument<String>("title") ?: "Exercise Alarm"
					val body = call.argument<String>("body") ?: "Time for your scheduled exercise!"
					val requestCode = call.argument<Int>("requestCode") ?: ((hour * 60 + minute) % Int.MAX_VALUE)
					scheduleDailyAlarm(hour, minute, payload, title, body, requestCode)
					result.success(true)
				}
				"persistAlarmAndroid" -> {
					val map = call.argument<Map<String, Any>>("alarm")
					if (map != null) {
						persistAlarmAndroid(map)
						result.success(true)
					} else {
						result.error("no_alarm", "No alarm map provided", null)
					}
				}
				"requestExactAlarmPermission" -> {
					// Try to open system settings where the user can allow exact alarms for this app
					try {
						val intent = Intent(android.provider.Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
							flags = Intent.FLAG_ACTIVITY_NEW_TASK
						}
						startActivity(intent)
						result.success(true)
					} catch (e: Exception) {
						result.error("settings_failed", "Failed to open exact alarm settings: ${e.message}", null)
					}
				}
				"removePersistedAlarm" -> {
					val requestCode = call.argument<Int>("requestCode") ?: 0
					removePersistedAlarm(requestCode)
					result.success(true)
				}
				"startForegroundAlarmService" -> {
					val triggerMillis = call.argument<Long>("triggerMillis") ?: 0L
					val payload = call.argument<String>("payload") ?: ""
					val title = call.argument<String>("title") ?: "Exercise Alarm"
					val body = call.argument<String>("body") ?: "Time for your scheduled exercise!"
					val requestCode = call.argument<Int>("requestCode") ?: ((triggerMillis % Int.MAX_VALUE).toInt())
					startForegroundAlarmService(triggerMillis, payload, title, body, requestCode)
					result.success(true)
				}
				"stopForegroundAlarmService" -> {
					val requestCode = call.argument<Int>("requestCode") ?: 0
					stopForegroundAlarmService(requestCode)
					result.success(true)
				}
				else -> result.notImplemented()
			}
		}
	}

	private fun showFullScreenNotification(title: String, body: String, payload: String) {
		val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
			val chan = NotificationChannel(CHANNEL, "Alarm Channel", NotificationManager.IMPORTANCE_HIGH).apply {
				description = "Channel for exercise alarm"
				setShowBadge(true)
			}
			nm.createNotificationChannel(chan)
		}

		// Pending intent to launch AlarmActivity which forwards to FlutterActivity
		val intent = Intent(this, AlarmActivity::class.java).apply {
			putExtra("payload", payload)
			flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
		}

		val pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

		val notification = NotificationCompat.Builder(this, CHANNEL)
			.setSmallIcon(applicationInfo.icon)
			.setContentTitle(title)
			.setContentText(body)
			.setPriority(NotificationCompat.PRIORITY_MAX)
			.setCategory(NotificationCompat.CATEGORY_ALARM)
			.setFullScreenIntent(pendingIntent, true)
			.setAutoCancel(true)
			.build()

		nm.notify(9999, notification)
	}

	private fun scheduleExactAlarm(triggerMillis: Long, payload: String, title: String, body: String, requestCode: Int) {
		android.util.Log.d("MainActivity", "scheduleExactAlarm: triggerMillis=$triggerMillis requestCode=$requestCode payload=$payload")
		val am = getSystemService(Context.ALARM_SERVICE) as android.app.AlarmManager
		val intent = Intent(this, AlarmReceiver::class.java).apply {
			putExtra("payload", payload)
			putExtra("title", title)
			putExtra("body", body)
		}
		val pending = PendingIntent.getBroadcast(this, requestCode, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

		try {
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
				// Use exact alarm API when available
				am.setExactAndAllowWhileIdle(android.app.AlarmManager.RTC_WAKEUP, triggerMillis, pending)
			} else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
				am.setExactAndAllowWhileIdle(android.app.AlarmManager.RTC_WAKEUP, triggerMillis, pending)
			} else {
				am.setExact(android.app.AlarmManager.RTC_WAKEUP, triggerMillis, pending)
			}
		} catch (se: SecurityException) {
			// If the platform denies exact alarms, try setAlarmClock as a last resort
			android.util.Log.w("MainActivity", "Exact alarm denied, attempting setAlarmClock fallback: ${se.message}")
			try {
				val alarmInfo = android.app.AlarmManager.AlarmClockInfo(triggerMillis, pending)
				am.setAlarmClock(alarmInfo, pending)
				android.util.Log.d("MainActivity", "setAlarmClock fallback scheduled")
				// also start a foreground service fallback to guarantee delivery on restrictive OEMs
				try {
					startForegroundAlarmService(triggerMillis, payload, title, body, requestCode)
					android.util.Log.d("MainActivity", "Started foreground service fallback for requestCode=$requestCode")
				} catch (svcEx: Exception) {
					android.util.Log.e("MainActivity", "Failed to start foreground service fallback: ${svcEx.message}")
				}
			} catch (e: Exception) {
				android.util.Log.e("MainActivity", "Failed to schedule alarm fallback: ${e.message}")
			}
		}
	}

	private fun cancelExactAlarm(requestCode: Int) {
		val am = getSystemService(Context.ALARM_SERVICE) as android.app.AlarmManager
		val intent = Intent(this, AlarmReceiver::class.java)
		val pending = PendingIntent.getBroadcast(this, requestCode, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
		am.cancel(pending)
	}

	private fun scheduleDailyAlarm(hour: Int, minute: Int, payload: String, title: String, body: String, requestCode: Int) {
		val am = getSystemService(Context.ALARM_SERVICE) as android.app.AlarmManager
		val now = java.util.Calendar.getInstance()
		val trigger = java.util.Calendar.getInstance()
		trigger.set(java.util.Calendar.HOUR_OF_DAY, hour)
		trigger.set(java.util.Calendar.MINUTE, minute)
		trigger.set(java.util.Calendar.SECOND, 0)
		trigger.set(java.util.Calendar.MILLISECOND, 0)
		if (trigger.before(now)) {
			trigger.add(java.util.Calendar.DAY_OF_YEAR, 1)
		}

		val intent = Intent(this, AlarmReceiver::class.java).apply {
			putExtra("payload", payload)
			putExtra("title", title)
			putExtra("body", body)
		}
		val pending = PendingIntent.getBroadcast(this, requestCode, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

		// setRepeating is simpler and acts like a clock alarm; use RTC_WAKEUP to wake device
		am.setRepeating(android.app.AlarmManager.RTC_WAKEUP, trigger.timeInMillis, android.app.AlarmManager.INTERVAL_DAY, pending)
	}

	private fun persistAlarmAndroid(map: Map<String, Any>) {
		try {
			val prefs = getSharedPreferences("exercise_alarms", MODE_PRIVATE)
			val set = prefs.getStringSet("alarms", HashSet<String>())?.toMutableSet() ?: mutableSetOf()
			val json = JSONObject(map as Map<*, *>).toString()
			set.add(json)
			prefs.edit().putStringSet("alarms", set).apply()
		} catch (e: Exception) {
			e.printStackTrace()
		}
	}

	private fun removePersistedAlarm(requestCode: Int) {
		try {
			val prefs = getSharedPreferences("exercise_alarms", MODE_PRIVATE)
			val set = prefs.getStringSet("alarms", HashSet<String>())?.toMutableSet() ?: mutableSetOf()
			val iterator = set.iterator()
			while (iterator.hasNext()) {
				val s = iterator.next()
				try {
					val obj = JSONObject(s)
					if (obj.has("requestCode") && obj.getInt("requestCode") == requestCode) {
						iterator.remove()
					}
				} catch (e: Exception) {
					// ignore malformed
				}
			}
			prefs.edit().putStringSet("alarms", set).apply()
		} catch (e: Exception) {
			e.printStackTrace()
		}
	}

	private fun startForegroundAlarmService(triggerMillis: Long, payload: String, title: String, body: String, requestCode: Int) {
		try {
			val intent = Intent(this, AlarmForegroundService::class.java).apply {
				action = AlarmForegroundService.ACTION_START
				putExtra(AlarmForegroundService.EXTRA_TRIGGER, triggerMillis)
				putExtra(AlarmForegroundService.EXTRA_PAYLOAD, payload)
				putExtra(AlarmForegroundService.EXTRA_TITLE, title)
				putExtra(AlarmForegroundService.EXTRA_BODY, body)
				putExtra(AlarmForegroundService.EXTRA_REQUEST, requestCode)
			}
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
				startForegroundService(intent)
			} else {
				startService(intent)
			}
		} catch (e: Exception) {
			android.util.Log.e("MainActivity", "Failed to start foreground service: ${e.message}")
		}
	}

	private fun stopForegroundAlarmService(requestCode: Int) {
		try {
			val intent = Intent(this, AlarmForegroundService::class.java).apply {
				action = AlarmForegroundService.ACTION_STOP
				putExtra(AlarmForegroundService.EXTRA_REQUEST, requestCode)
			}
			stopService(intent)
		} catch (e: Exception) {
			android.util.Log.e("MainActivity", "Failed to stop foreground service: ${e.message}")
		}
	}
}
