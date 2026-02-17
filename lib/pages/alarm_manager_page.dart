import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:flutter/services.dart';
import '../models/alarm_model.dart';
import '../main.dart' show hydrationReminderService;

class AlarmManagerPage extends StatefulWidget {
  const AlarmManagerPage({super.key});

  @override
  State<AlarmManagerPage> createState() => _AlarmManagerPageState();
}

class _AlarmManagerPageState extends State<AlarmManagerPage> {
  List<AlarmModel> _alarms = [];

  final _songOptions = <String>['assets/alarm1.mp3', 'assets/alarm2.mp3', 'assets/alarm3.mp3'];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final list = await hydrationReminderService.getScheduledAlarms();
    setState(() {
      _alarms = list.map((m) => AlarmModel.fromMap(m)).toList();
    });
  }

  Future<void> _delete(AlarmModel alarm) async {
    try {
      final channel = const MethodChannel('com.example.application_main/alarm_channel');
      await channel.invokeMethod('cancelExactAlarm', {'requestCode': alarm.requestCode});
    } catch (e) {
      debugPrint('Failed to cancel native alarm: $e');
    }
    await hydrationReminderService.removeScheduledAlarmFromStorage(alarm.requestCode);
    await _load();
  }

  String _nextRunText(AlarmModel a) {
    if (a.type == 'daily' && a.hour != null && a.minute != null) {
      final now = DateTime.now();
      final target = DateTime(now.year, now.month, now.day, a.hour!, a.minute!);
      final next = target.isBefore(now) ? target.add(const Duration(days: 1)) : target;
      return DateFormat.yMd().add_jm().format(next);
    }
    if (a.triggerMillis != null) {
      return DateFormat.yMd().add_jm().format(DateTime.fromMillisecondsSinceEpoch(a.triggerMillis!));
    }
    return '—';
  }

  Future<void> _showCreateDialog() async {
    TimeOfDay selected = TimeOfDay.now();
    String song = _songOptions.first;
    bool repeatDaily = true;
    final titleCtl = TextEditingController(text: 'Exercise Alarm');
    final bodyCtl = TextEditingController(text: 'Time for your scheduled exercise!');

    final res = await showDialog<bool>(context: context, builder: (ctx) {
      return AlertDialog(
        title: const Text('Create Alarm'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                title: const Text('Time'),
                subtitle: Text(selected.format(context)),
                trailing: IconButton(icon: const Icon(Icons.edit), onPressed: () async {
                  final t = await showTimePicker(context: context, initialTime: selected);
                  if (t != null) {
                    selected = t;
                    setState(() {});
                  }
                }),
              ),
              DropdownButtonFormField<String>(
                initialValue: song,
                items: _songOptions.map((s) => DropdownMenuItem(value: s, child: Text(s.split('/').last))).toList(),
                onChanged: (v) => song = v ?? song,
                decoration: const InputDecoration(labelText: 'Song'),
              ),
              CheckboxListTile(title: const Text('Repeat daily'), value: repeatDaily, onChanged: (v) { repeatDaily = v ?? repeatDaily; }),
              TextField(controller: titleCtl, decoration: const InputDecoration(labelText: 'Title')),
              TextField(controller: bodyCtl, decoration: const InputDecoration(labelText: 'Body')),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(false), child: const Text('Cancel')),
          ElevatedButton(onPressed: () => Navigator.of(ctx).pop(true), child: const Text('Create')),
        ],
      );
    });

    if (res == true) {
      if (repeatDaily) {
        await hydrationReminderService.scheduleClockAlarm(hour: selected.hour, minute: selected.minute, songAsset: song, challengeId: '', title: titleCtl.text, body: bodyCtl.text);
      } else {
        // Build a tz-aware scheduled time using the service helpers
        final tzNow = DateTime.now();
        final scheduled = tz.TZDateTime(tz.local, tzNow.year, tzNow.month, tzNow.day, selected.hour, selected.minute);
        await hydrationReminderService.scheduleOneTimeExerciseAlarm(scheduled: scheduled, songAsset: song, challengeId: '', title: titleCtl.text, body: bodyCtl.text);
      }
      await _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Alarms')),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView.builder(
          itemCount: _alarms.length,
          itemBuilder: (ctx, i) {
            final a = _alarms[i];
            return ListTile(
              leading: Icon(a.type == 'daily' ? Icons.repeat : Icons.alarm),
              title: Text(a.title),
              subtitle: Text(_nextRunText(a)),
              trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                Switch(value: a.enabled, onChanged: (v) async {
                  // toggling: if disabling, cancel; if enabling, reschedule
                  a.enabled = v;
                  setState(() {});
                  if (!v) await _delete(a);
                }),
                IconButton(icon: const Icon(Icons.delete), onPressed: () => _delete(a)),
              ]),
            );
          },
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateDialog,
        child: const Icon(Icons.add),
      ),
    );
  }
}
