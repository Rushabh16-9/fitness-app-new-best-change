package com.example.application_main

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat

/**
 * AlarmReceiver receives AlarmManager broadcasts and shows a full-screen notification
 * that launches AlarmActivity with the payload.
 */
class AlarmReceiver : BroadcastReceiver() {
    // Use same channel id as MainActivity for consistency
    private val CHANNEL = "com.example.application_main/alarm_channel"

    override fun onReceive(context: Context, intent: Intent) {
        val payload = intent.getStringExtra("payload") ?: ""
        val title = intent.getStringExtra("title") ?: "Exercise Alarm"
        val body = intent.getStringExtra("body") ?: "Time for your scheduled exercise!"

        Log.d("AlarmReceiver", "onReceive: payload=$payload title=$title body=$body")

        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val chan = NotificationChannel(CHANNEL, "Alarm Channel", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "Channel for exercise alarm"
                setShowBadge(true)
            }
            nm.createNotificationChannel(chan)
        }

        val forward = Intent(context, AlarmActivity::class.java).apply {
            putExtra("payload", payload)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pending = PendingIntent.getActivity(context, 0, forward, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

        val alarmSound = android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_ALARM)
        val notification = NotificationCompat.Builder(context, CHANNEL)
            .setSmallIcon(context.applicationInfo.icon)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setFullScreenIntent(pending, true)
            .setSound(alarmSound)
            .setAutoCancel(true)
            .build()

        nm.notify((System.currentTimeMillis() % Int.MAX_VALUE).toInt(), notification)

        // Try to start AlarmActivity directly as a fallback on devices where full-screen intent
        // may not be honored. This may or may not work depending on OEM restrictions.
        try {
            Log.d("AlarmReceiver", "Attempting to start AlarmActivity directly")
            context.startActivity(forward)
        } catch (e: Exception) {
            Log.w("AlarmReceiver", "Failed to start AlarmActivity directly: ${e.message}")
        }
    }
}
