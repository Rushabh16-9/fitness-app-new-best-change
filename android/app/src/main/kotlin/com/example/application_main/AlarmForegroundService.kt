package com.example.application_main

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat

/**
 * Foreground service used as a reliable fallback when exact alarms are not permitted.
 * The service receives a trigger time (millis) and sleeps until the time (using a Handler/Thread)
 * then posts a full-screen notification to launch AlarmActivity.
 * Note: This service keeps a visible notification while running and should be used sparingly.
 */
class AlarmForegroundService : Service() {
    companion object {
        const val ACTION_START = "com.example.application_main.ACTION_START_FOREGROUND_ALARM"
        const val ACTION_STOP = "com.example.application_main.ACTION_STOP_FOREGROUND_ALARM"
        const val EXTRA_TRIGGER = "triggerMillis"
        const val EXTRA_PAYLOAD = "payload"
        const val EXTRA_TITLE = "title"
        const val EXTRA_BODY = "body"
        const val EXTRA_REQUEST = "requestCode"
        const val CHANNEL_ID = "alarm_foreground_service"
        const val NOTIF_ID = 5555
    }

    private var workerThread: Thread? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent == null) return START_NOT_STICKY
        val action = intent.action
        if (ACTION_START == action) {
            val trigger = intent.getLongExtra(EXTRA_TRIGGER, 0L)
            val payload = intent.getStringExtra(EXTRA_PAYLOAD) ?: ""
            val title = intent.getStringExtra(EXTRA_TITLE) ?: "Exercise Alarm"
            val body = intent.getStringExtra(EXTRA_BODY) ?: "Time for your scheduled exercise!"
            val request = intent.getIntExtra(EXTRA_REQUEST, 0)
            startForegroundWithNotification(title, body)
            scheduleWorker(trigger, payload, title, body, request)
        } else if (ACTION_STOP == action) {
            stopWorker()
            stopForeground(true)
            stopSelf()
        }
        return START_REDELIVER_INTENT
    }

    private fun startForegroundWithNotification(title: String, body: String) {
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val chan = NotificationChannel(CHANNEL_ID, "Alarm Service", NotificationManager.IMPORTANCE_LOW)
            nm.createNotificationChannel(chan)
        }
        val notif = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText("Waiting to trigger alarm")
            .setSmallIcon(applicationInfo.icon)
            .setOngoing(true)
            .build()
        startForeground(NOTIF_ID, notif)
    }

    private fun scheduleWorker(triggerMillis: Long, payload: String, title: String, body: String, requestCode: Int) {
        // Stop any previous worker thread (legacy)
        stopWorker()

        try {
            val am = getSystemService(Context.ALARM_SERVICE) as android.app.AlarmManager
            val alarmIntent = Intent(this, AlarmReceiver::class.java).apply {
                putExtra("payload", payload)
                putExtra("title", title)
                putExtra("body", body)
            }
            val pending = PendingIntent.getBroadcast(this, requestCode, alarmIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

            // Try to set exact alarm; if denied, fall back to setAlarmClock
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    am.setExactAndAllowWhileIdle(android.app.AlarmManager.RTC_WAKEUP, triggerMillis, pending)
                } else {
                    am.setExact(android.app.AlarmManager.RTC_WAKEUP, triggerMillis, pending)
                }
                Log.d("AlarmForegroundService", "Scheduled exact alarm via AlarmManager for request=$requestCode at $triggerMillis")
            } catch (sec: SecurityException) {
                Log.w("AlarmForegroundService", "Exact alarm permission denied, trying setAlarmClock fallback: ${sec.message}")
                try {
                    val showIntent = Intent(this, AlarmActivity::class.java)
                    val alarmClockInfo = android.app.AlarmManager.AlarmClockInfo(triggerMillis, PendingIntent.getActivity(this, requestCode, showIntent, PendingIntent.FLAG_IMMUTABLE))
                    am.setAlarmClock(alarmClockInfo, pending)
                    Log.d("AlarmForegroundService", "Scheduled alarm via setAlarmClock for request=$requestCode at $triggerMillis")
                } catch (ex: Exception) {
                    Log.e("AlarmForegroundService", "Failed to schedule with setAlarmClock: ${ex.message}")
                    // Last resort: post immediate full-screen notification
                    postImmediateNotification(payload, title, body, requestCode)
                }
            }
        } catch (e: Exception) {
            Log.e("AlarmForegroundService", "Failed to schedule alarm: ${e.message}")
            // Fallback to immediate notification
            postImmediateNotification(payload, title, body, requestCode)
        } finally {
            // No need to keep service running after scheduling
            try { stopForeground(true); stopSelf() } catch (e: Exception) {}
        }
    }

    private fun postImmediateNotification(payload: String, title: String, body: String, requestCode: Int) {
        try {
            val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            val alarmChannelId = "alarm_fullscreen_channel"
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val chan = NotificationChannel(alarmChannelId, "Exercise Alarm", NotificationManager.IMPORTANCE_HIGH).apply {
                    description = "Channel for full-screen exercise alarm"
                    setShowBadge(true)
                }
                nm.createNotificationChannel(chan)
            }
            val alarmIntent = Intent(this, AlarmActivity::class.java).apply { putExtra("payload", payload); flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK }
            val pending = PendingIntent.getActivity(this, requestCode, alarmIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            val alarmSound = android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_ALARM)
            val notifBuilder = NotificationCompat.Builder(this, alarmChannelId)
                .setSmallIcon(applicationInfo.icon)
                .setContentTitle(title)
                .setContentText(body)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setFullScreenIntent(pending, true)
                .setSound(alarmSound)
                .setAutoCancel(true)
            nm.notify(requestCode, notifBuilder.build())
            Log.d("AlarmForegroundService", "Posted immediate full-screen notification for request=$requestCode")
        } catch (e: Exception) {
            Log.e("AlarmForegroundService", "Failed to post immediate notification: ${e.message}")
        }
    }

    private fun stopWorker() {
        workerThread?.interrupt()
        workerThread = null
    }
}
