import 'package:flutter/material.dart';
import 'dart:async';
import 'package:url_launcher/url_launcher.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'database_service.dart';
import 'home_page.dart' show dayPlans;
import 'friend_workout_player.dart';

class FriendWorkoutSession extends StatefulWidget {
  final String sessionId;
  final String code;
  final bool isHost;
  const FriendWorkoutSession({super.key, required this.sessionId, required this.code, required this.isHost});

  @override
  State<FriendWorkoutSession> createState() => _FriendWorkoutSessionState();
}

class _FriendWorkoutSessionState extends State<FriendWorkoutSession> {
  final _db = DatabaseService(uid: FirebaseAuth.instance.currentUser?.uid);
  Map<String, dynamic>? _session;
  StreamSubscription? _sub;
  bool _starting = false;
  int? _selectedDayIndex;
  DateTime? _scheduledStart;
  Timer? _countdownTimer;
  int _secondsLeft = 0;
  String? _currentUid;

  @override
  void initState() {
    super.initState();
    _currentUid = FirebaseAuth.instance.currentUser?.uid;
    _listen();
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }

  void _listen() {
    // Prefer realtime Firestore snapshot listener
    _sub = _db.streamFriendSession(widget.sessionId).listen((s) {
      if (s == null) return;
      setState(() {
        _session = s;
        // If the session recorded a selected day, reflect it
        _selectedDayIndex = s['selectedDay'] is int ? s['selectedDay'] as int : _selectedDayIndex;
      });
      // If session has scheduled startAt, use it to show synchronized countdown
      if (s['startAt'] != null) {
        final serverStart = DateTime.tryParse(s['startAt']);
        if (serverStart != null) {
          _scheduledStart = serverStart;
          _startCountdownTo(serverStart);
        }
      } else if (s['started'] == true) {
        _showStarted();
      }
      // If session indicates started and has a selected day, navigate to player
      if (s['started'] == true && s['selectedDay'] != null) {
        final dayIndex = s['selectedDay'] as int;
        _navigateToPlayer(dayIndex);
      }
    });
  }

  // start handled inline by host button

  void _startCountdownTo(DateTime startAt) {
    _countdownTimer?.cancel();
    final now = DateTime.now();
    final seconds = startAt.difference(now).inSeconds;
    setState(() => _secondsLeft = seconds.clamp(0, 9999));
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      final left = startAt.difference(DateTime.now()).inSeconds;
      if (left <= 0) {
        t.cancel();
        setState(() => _secondsLeft = 0);
        // Trigger local start action
        _showStarted();
        return;
      }
      setState(() => _secondsLeft = left);
    });
  }

  void _showStarted() {
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: Colors.grey.shade900,
        title: const Text('Session Started', style: TextStyle(color: Colors.white)),
        content: const Text('Both participants can now begin the synchronized workout.', style: TextStyle(color: Colors.white70)),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('OK', style: TextStyle(color: Colors.red)))
        ],
      ),
    );
  }

  void _navigateToPlayer(int dayIndex) {
    // Avoid duplicate navigation
    if (!mounted) return;
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => FriendWorkoutPlayer(dayIndex: dayIndex, sessionId: widget.sessionId)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(backgroundColor: Colors.black, title: Text('Session ${widget.code}')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top summary card
            Card(
              color: Colors.grey.shade900,
              margin: EdgeInsets.zero,
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Lobby: ${widget.code}', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    if (_session != null) ...[
                      Row(children: [
                        Chip(label: Text('Mode: ${_session!['metadata'] != null && _session!['metadata']['mode'] != null ? _session!['metadata']['mode'] : (_session!['mode'] ?? 'inapp') }')),
                        const SizedBox(width: 8),
                        Chip(label: Text('Started: ${_session!['started'] == true ? 'Yes' : 'No'}')),
                        const SizedBox(width: 8),
                        if (_session!['paused'] == true) Chip(label: Text('Paused')),
                      ]),
                    ] else ...[
                      const Text('Loading session...', style: TextStyle(color: Colors.white70)),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            // Participants
            Card(
              color: Colors.grey.shade900,
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Participants', style: TextStyle(color: Colors.white70, fontSize: 16)),
                  const SizedBox(height: 8),
                  if (_session != null) ...[ 
                    Wrap(
                      spacing: 8,
                      children: ((_session!['participants'] ?? []) as List<dynamic>).map((p) {
                        final pid = p as String;
                        return Chip(
                          avatar: CircleAvatar(child: Text(pid.isNotEmpty ? pid[0].toUpperCase() : '?')),
                          label: Text(pid, style: const TextStyle(color: Colors.white70)),
                        );
                      }).toList(),
                    ),
                  ] else const SizedBox.shrink(),
                ]),
              ),
            ),
            const SizedBox(height: 12),
            const SizedBox(height: 24),
            const SizedBox(height: 12),
            // Day selector (persist the day index so full plan can be shared)
            const Text('Select Day plan for this session', style: TextStyle(color: Colors.white70)),
            const SizedBox(height: 8),
            DropdownButtonFormField<int>(
              initialValue: _selectedDayIndex,
              dropdownColor: Colors.grey.shade900,
              decoration: InputDecoration(filled: true, fillColor: Colors.grey.shade900, border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none)),
              items: List.generate(dayPlans.length, (i) => DropdownMenuItem(value: i, child: Text('Day ${i + 1} - ${dayPlans[i]['subtitle']}'))).toList(),
              onChanged: (v) async {
                setState(() => _selectedDayIndex = v);
                if (v != null) {
                  // Persist selected day (and expanded plan) to session doc
                  final selectedPlan = dayPlans[v];
                  await _db.updateFriendSession(widget.sessionId, {'selectedDay': v, 'selectedPlan': selectedPlan});
                }
              },
              hint: const Text('Choose Day plan', style: TextStyle(color: Colors.white70)),
            ),
            const SizedBox(height: 12),
            if (_session != null && (_session!['host'] == _currentUid)) ...[
              // Start / Pause / Resume single control
              Row(children: [
                Expanded(child: ElevatedButton(
                  onPressed: _starting ? null : () async {
                    if (_session!['started'] != true) {
                      // Start scheduled start
                      setState(() => _starting = true);
                      try {
                        final startAt = DateTime.now().add(const Duration(seconds: 5));
                        final metadata = {'selectedDay': _selectedDayIndex, 'selectedWorkout': _selectedDayIndex != null ? dayPlans[_selectedDayIndex!]['title'] : null};
                        await _db.updateFriendSessionStart(widget.sessionId, true, startAt: startAt, metadata: metadata);
                      } catch (e) {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to start session')));
                      } finally {
                        if (mounted) setState(() => _starting = false);
                      }
                    } else {
                      // already started: toggle pause state
                      final paused = _session!['paused'] == true;
                      await _db.updateFriendSession(widget.sessionId, {'paused': !paused});
                    }
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                  child: _starting ? const CircularProgressIndicator(color: Colors.white) : Text(_session!['started'] == true ? (_session!['paused'] == true ? 'Resume' : 'Pause') : 'Start'),
                )),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: () async {
                    // Restart for everyone: reset pause and schedule a fresh start in 5s
                    final startAt = DateTime.now().add(const Duration(seconds: 5));
                    await _db.updateFriendSession(widget.sessionId, {'paused': false});
                    await _db.updateFriendSessionStart(widget.sessionId, true, startAt: startAt, metadata: _session != null ? _session!['metadata'] : null);
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
                  child: const Text('Restart'),
                )
              ]),
            ],
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: () async {
                // Set mode to video and open Jitsi meeting; persist mode
                await _db.updateFriendSession(widget.sessionId, {'mode': 'video'});
                final room = 'smartfit-${widget.code}';
                final url = Uri.parse('https://meet.jit.si/$room');
                if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not open video call')));
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
              child: const Text('Start Video Call (Jitsi)'),
            ),
            const SizedBox(height: 16),
            if (_session != null) ...[
              const Text('Participants', style: TextStyle(color: Colors.white70, fontSize: 16)),
              const SizedBox(height: 8),
              Column(
                children: ((_session!['participants'] ?? []) as List<dynamic>).map((p) {
                  final pid = p as String;
                  final isHost = _session!['host'] == pid;
                  return ListTile(
                    title: Text(pid, style: const TextStyle(color: Colors.white70)),
                    trailing: (_session != null && (_session!['host'] == _currentUid)) && pid != _currentUid ? ElevatedButton(
                      onPressed: () async {
                        // Promote participant to host
                        await _db.updateFriendSession(widget.sessionId, {'host': pid});
                      },
                      child: const Text('Promote')) : isHost ? const Text('Host', style: TextStyle(color: Colors.red)) : null,
                  );
                }).toList(),
              ),
            ],
            ElevatedButton(
              onPressed: () async {
                // Open a Jitsi meet URL (simple integration using url_launcher)
                final room = 'smartfit-${widget.code}';
                final url = Uri.parse('https://meet.jit.si/$room');
                if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not open video call')));
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
              child: const Text('Start Video Call (Jitsi)'),
            ),
            const SizedBox(height: 12),
            if (_scheduledStart != null) ...[
              Text('Synchronized start in: $_secondsLeft s', style: const TextStyle(color: Colors.white70, fontSize: 18)),
            ] else ...[
              const Text('Waiting for the host to start the synchronized workout...', style: TextStyle(color: Colors.white54)),
            ],
          ],
        ),
      ),
    );
  }
}
