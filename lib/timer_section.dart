import 'package:flutter/material.dart';

class TimerSection extends StatefulWidget {
  final int seconds;
  const TimerSection({super.key, required this.seconds});

  @override
  State<TimerSection> createState() => _TimerSectionState();
}

class _TimerSectionState extends State<TimerSection> {
  late int remaining;
  bool running = false;

  @override
  void initState() {
    super.initState();
    remaining = widget.seconds;
  }

  void startTimer() {
    if (running || remaining == 0) return;
    running = true;
    Future.doWhile(() async {
      await Future.delayed(Duration(seconds: 1));
      if (!mounted) return false;
      setState(() {
        if (remaining > 0) remaining--;
      });
      if (remaining == 0) {
        running = false;
        return false;
      }
      return true;
    });
  }

  void pauseTimer() {
    running = false;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          '${remaining.toString().padLeft(2, '0')}:00',
          style: TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: Colors.white),
        ),
        SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            IconButton(
              icon: Icon(Icons.play_arrow, color: Colors.red, size: 32),
              onPressed: remaining > 0 ? startTimer : null,
            ),
            IconButton(
              icon: Icon(Icons.pause, color: Colors.white, size: 32),
              onPressed: running ? pauseTimer : null,
            ),
          ],
        ),
      ],
    );
  }
}