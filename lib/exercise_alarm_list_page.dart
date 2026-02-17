import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flutter/services.dart';
import 'main.dart' show hydrationReminderService;

final _service = hydrationReminderService;

class ExerciseAlarmListPage extends StatefulWidget {
  const ExerciseAlarmListPage({super.key});

  @override
  State<ExerciseAlarmListPage> createState() => _ExerciseAlarmListPageState();
}

class _ExerciseAlarmListPageState extends State<ExerciseAlarmListPage> {
  List<Map<String, dynamic>> _alarms = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final list = await _service.getScheduledAlarms();
    setState(() => _alarms = list);
  }

  Future<void> _cancel(int requestCode) async {
    try {
      final channel = const MethodChannel('com.example.application_main/alarm_channel');
      await channel.invokeMethod('cancelExactAlarm', {'requestCode': requestCode});
    } catch (e) {
      debugPrint('Failed to cancel native alarm: $e');
    }
    await _service.removeScheduledAlarmFromStorage(requestCode);
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scheduled Exercise Alarms')),
      body: ListView.builder(
        itemCount: _alarms.length,
        itemBuilder: (context, i) {
          final a = _alarms[i];
          final ts = DateTime.fromMillisecondsSinceEpoch(a['triggerMillis'] as int);
          return ListTile(
            title: Text(a['title'] ?? 'Exercise Alarm'),
            subtitle: Text(DateFormat.yMd().add_jm().format(ts)),
            trailing: IconButton(icon: const Icon(Icons.delete), onPressed: () => _cancel(a['requestCode'] as int)),
          );
        },
      ),
    );
  }
}
