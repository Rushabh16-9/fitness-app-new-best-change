class AlarmModel {
  final int requestCode;
  final String type; // 'one_time' or 'daily'
  final int? triggerMillis;
  final int? hour;
  final int? minute;
  final String payload;
  final String title;
  final String body;
  bool enabled;

  AlarmModel({
    required this.requestCode,
    required this.type,
    this.triggerMillis,
    this.hour,
    this.minute,
    required this.payload,
    required this.title,
    required this.body,
    this.enabled = true,
  });

  factory AlarmModel.fromMap(Map<String, dynamic> m) {
    return AlarmModel(
      requestCode: m['requestCode'] as int,
      type: (m['type'] as String?) ?? 'one_time',
      triggerMillis: m['triggerMillis'] as int?,
      hour: m['hour'] as int?,
      minute: m['minute'] as int?,
      payload: (m['payload'] as String?) ?? '',
      title: (m['title'] as String?) ?? 'Exercise Alarm',
      body: (m['body'] as String?) ?? 'Time for your scheduled exercise!',
      enabled: m['enabled'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'requestCode': requestCode,
      'type': type,
      if (triggerMillis != null) 'triggerMillis': triggerMillis,
      if (hour != null) 'hour': hour,
      if (minute != null) 'minute': minute,
      'payload': payload,
      'title': title,
      'body': body,
      'enabled': enabled,
    };
  }
}
