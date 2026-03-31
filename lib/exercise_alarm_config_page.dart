import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:timezone/timezone.dart' as tz;
import 'main.dart' show hydrationReminderService;
import 'exercise_alarm_list_page.dart';

class ExerciseAlarmConfigPage extends StatefulWidget {
  const ExerciseAlarmConfigPage({super.key});

  @override
  State<ExerciseAlarmConfigPage> createState() => _ExerciseAlarmConfigPageState();
}

class _ExerciseAlarmConfigPageState extends State<ExerciseAlarmConfigPage> {
  TimeOfDay? _picked;
  String _song = '';
  bool _requirePushups = true;
  bool _repeatDaily = false;
  final List<String> _availableSongs = [
    'alarm.mp3',
    'alarm.wav',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(title: const Text('Schedule Exercise Alarm'), backgroundColor: Colors.black),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            ListTile(
              title: Text(_picked == null ? 'No time selected' : DateFormat.jm().format(DateTime(0,0,0,_picked!.hour,_picked!.minute)), style: const TextStyle(color: Colors.white)),
              trailing: ElevatedButton(
                onPressed: () async {
                  final t = await showTimePicker(context: context, initialTime: TimeOfDay.now());
                  if (t != null) setState(() => _picked = t);
                },
                child: const Text('Pick Time'),
              ),
            ),
            const SizedBox(height: 12),
            // Song picker dropdown
            DropdownButtonFormField<String>(
              initialValue: _song.isEmpty ? (_availableSongs.isNotEmpty ? _availableSongs.first : '') : _song,
              dropdownColor: Colors.black,
              decoration: const InputDecoration(labelText: 'Song (asset)', labelStyle: TextStyle(color: Colors.white70)),
              items: _availableSongs.map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(color: Colors.white)))).toList(),
              onChanged: (v) => setState(() => _song = v ?? ''),
            ),
            const SizedBox(height: 12),
            Row(children: [
              Checkbox(value: _requirePushups, onChanged: (v) => setState(() => _requirePushups = v ?? true)),
              const SizedBox(width: 8),
              const Expanded(child: Text('Require push-ups photo to stop alarm', style: TextStyle(color: Colors.white70))),
            ]),
            Row(children: [
              Checkbox(value: _repeatDaily, onChanged: (v) => setState(() => _repeatDaily = v ?? false)),
              const SizedBox(width: 8),
              const Expanded(child: Text('Repeat daily at selected time', style: TextStyle(color: Colors.white70))),
            ]),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _picked == null ? null : () async {
                final now = tz.TZDateTime.now(tz.local);
                final selected = tz.TZDateTime(tz.local, now.year, now.month, now.day, _picked!.hour, _picked!.minute);
                // pass challenge id to indicate pushup requirement
                final challengeId = _requirePushups ? 'pushups' : '';
                if (_repeatDaily) {
                  await hydrationReminderService.scheduleClockAlarm(hour: _picked!.hour, minute: _picked!.minute, songAsset: _song, challengeId: challengeId);
                } else {
                  await hydrationReminderService.scheduleOneTimeExerciseAlarm(scheduled: selected, songAsset: _song, challengeId: challengeId);
                }
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Exercise alarm scheduled')));
                  Navigator.pop(context);
                }
              },
              child: const Text('Schedule Alarm'),
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: () async {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const ExerciseAlarmListPage()));
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.blueGrey[800]),
              child: const Text('View Alarms'),
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: () async {
                // Immediate exercise notification for quick testing
                final challengeId = _requirePushups ? 'pushups' : '';
                await hydrationReminderService.showImmediateExerciseNotification(songAsset: _song, challengeId: challengeId);
                if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Test exercise notification sent')));
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.green[700]),
              child: const Text('Test Exercise Notification'),
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: () async {
                await hydrationReminderService.clearExerciseAlarms();
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Exercise alarms cleared')));
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.grey[800]),
              child: const Text('Clear Alarms'),
            ),
          ],
        ),
      ),
    );
  }
}
