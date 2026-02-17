package com.example.application_main

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.WindowManager
import io.flutter.embedding.android.FlutterActivity

/**
 * Native full-screen alarm activity. It launches FlutterActivity and passes the notification payload
 * as an extra so Flutter can route to the ExerciseAlarmPage. This activity is declared as full-screen
 * and will be used as the target of the full-screen intent.
 */
class AlarmActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Make the activity full-screen / show on lock screen
        window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD)

        // Forward to FlutterActivity with payload in extras
        val payload = intent?.getStringExtra("payload")
        val launchIntent = FlutterActivity
            .withNewEngine()
            .initialRoute("/alarm?payload=${payload ?: ""}")
            .build(this)
        startActivity(launchIntent)
        // Finish the native activity so only Flutter UI remains
        finish()
    }
}
