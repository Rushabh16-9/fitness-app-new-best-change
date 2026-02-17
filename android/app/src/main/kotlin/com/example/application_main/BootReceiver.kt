package com.example.application_main

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.app.AlarmManager
import android.app.PendingIntent
import android.os.SystemClock
import org.json.JSONObject

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            val prefs = context.getSharedPreferences("exercise_alarms", Context.MODE_PRIVATE)
            val set = prefs.getStringSet("alarms", null)
            if (set != null) {
                val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
                for (s in set) {
                    try {
                        val obj = JSONObject(s)
                        if (obj.has("type") && obj.getString("type") == "daily") {
                            val hour = obj.optInt("hour", -1)
                            val minute = obj.optInt("minute", -1)
                            val requestCode = obj.optInt("requestCode", 0)
                            val payload = obj.optString("payload", "")
                            // schedule repeating daily alarm at hour:minute
                            if (hour >= 0 && minute >= 0) {
                                val now = java.util.Calendar.getInstance()
                                val target = java.util.Calendar.getInstance()
                                target.set(java.util.Calendar.HOUR_OF_DAY, hour)
                                target.set(java.util.Calendar.MINUTE, minute)
                                target.set(java.util.Calendar.SECOND, 0)
                                if (target.before(now)) {
                                    target.add(java.util.Calendar.DAY_OF_MONTH, 1)
                                }
                                val triggerAt = target.timeInMillis
                                val alarmIntent = Intent(context, AlarmReceiver::class.java).apply {
                                    putExtra("payload", payload)
                                    putExtra("requestCode", requestCode)
                                }
                                val pending = PendingIntent.getBroadcast(context, requestCode, alarmIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
                                alarmManager.setRepeating(AlarmManager.RTC_WAKEUP, triggerAt, AlarmManager.INTERVAL_DAY, pending)
                            }
                        } else if (obj.has("type") && obj.getString("type") == "one_time") {
                            val triggerMillis = obj.optLong("triggerMillis", -1)
                            val requestCode = obj.optInt("requestCode", 0)
                            val payload = obj.optString("payload", "")
                            if (triggerMillis > 0) {
                                val alarmIntent = Intent(context, AlarmReceiver::class.java).apply {
                                    putExtra("payload", payload)
                                    putExtra("requestCode", requestCode)
                                }
                                val pending = PendingIntent.getBroadcast(context, requestCode, alarmIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
                                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerMillis, pending)
                            }
                        }
                    } catch (e: Exception) {
                        // ignore
                    }
                }
            }
        }
    }
}
