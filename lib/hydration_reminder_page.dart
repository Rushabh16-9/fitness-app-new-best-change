import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'main.dart' show hydrationReminderService;

class HydrationReminderPage extends StatelessWidget {
  const HydrationReminderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(title: const Text('Hydration Reminder'), backgroundColor: Colors.black),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Hydration reminders', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            const Text('Hydration reminders will notify you to drink water. Tap below to stop all active reminders.', style: TextStyle(color: Colors.white70)),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () async {
                // stop reminders (clear scheduled)
                await hydrationReminderService.clearAll();
                final p = await SharedPreferences.getInstance();
                await p.setInt('hydration_interval_min', 0);
                if (context.mounted) Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              child: const Text('Stop Reminders'),
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () async {
                // Reschedule using persisted prefs
                final p = await SharedPreferences.getInstance();
                final interval = p.getInt('hydration_interval_min') ?? 120;
                final start = p.getInt('hydration_start_hour') ?? 9;
                final end = p.getInt('hydration_end_hour') ?? 21;
                await hydrationReminderService.scheduleDaily(intervalMinutes: interval, startHour: start, endHour: end);
                if (context.mounted) Navigator.pop(context);
              },
              child: const Text('Reschedule Reminders'),
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () async {
                // Show an immediate notification for testing
                await hydrationReminderService.showImmediateHydrationNotification();
                if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Test hydration notification sent')));
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.blueGrey),
              child: const Text('Test Notification'),
            ),
          ],
        ),
      ),
    );
  }
}
