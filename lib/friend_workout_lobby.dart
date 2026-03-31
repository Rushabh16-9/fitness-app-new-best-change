import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import 'database_service.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'friend_workout_session.dart';

class FriendWorkoutLobby extends StatefulWidget {
  const FriendWorkoutLobby({super.key});

  @override
  State<FriendWorkoutLobby> createState() => _FriendWorkoutLobbyState();
}

class _FriendWorkoutLobbyState extends State<FriendWorkoutLobby> {
  final _db = DatabaseService(uid: FirebaseAuth.instance.currentUser?.uid);
  String? _code;
  final _joinController = TextEditingController();
  bool _creating = false;
  bool _joining = false;
  String _sessionMode = 'inapp'; // 'inapp' or 'video'

  @override
  void dispose() {
    _joinController.dispose();
    super.dispose();
  }

  Future<void> _createLobby() async {
    setState(() => _creating = true);
    try {
      final code = Uuid().v4().substring(0, 6).toUpperCase();
      // Create session record in DB, persist selected mode
      final session = await _db.createFriendSession(code: code, metadata: {'createdAt': DateTime.now().toIso8601String(), 'mode': _sessionMode});
      setState(() {
        _code = code;
      });
      // Navigate to session page as host
      if (!mounted) return;
      Navigator.push(context, MaterialPageRoute(builder: (_) => FriendWorkoutSession(sessionId: session['id'], code: code, isHost: true)));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to create lobby')));
    } finally {
      if (mounted) setState(() => _creating = false);
    }
  }

  Future<void> _joinLobby() async {
    final code = _joinController.text.trim().toUpperCase();
    if (code.isEmpty) return;
    setState(() => _joining = true);
    try {
  final session = await _db.joinFriendSession(code);
      if (session == null) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Session not found')));
      } else {
        if (!mounted) return;
        Navigator.push(context, MaterialPageRoute(builder: (_) => FriendWorkoutSession(sessionId: session['id'], code: code, isHost: false)));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to join lobby')));
    } finally {
      if (mounted) setState(() => _joining = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(backgroundColor: Colors.black, title: const Text('Workout with Friend')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Create a lobby and share the code with your friend', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 12),
            // Mode selector (use wrapping to avoid overflow on small screens)
            Row(
              children: [
                const Text('Session mode: ', style: TextStyle(color: Colors.white70)),
                const SizedBox(width: 8),
                // allow chips to wrap onto next line when space is tight
                Expanded(
                  child: Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      ChoiceChip(
                        label: const Text('In-app Workout'),
                        selected: _sessionMode == 'inapp',
                        onSelected: (s) => setState(() => _sessionMode = 'inapp'),
                      ),
                      ChoiceChip(
                        label: const Text('Video Call'),
                        selected: _sessionMode == 'video',
                        onSelected: (s) => setState(() => _sessionMode = 'video'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _creating ? null : _createLobby,
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                    child: _creating ? const CircularProgressIndicator(color: Colors.white) : const Text('Create Lobby'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            if (_code != null) ...[
              Text('Lobby Code: $_code', style: const TextStyle(color: Colors.white70, fontSize: 16)),
              const SizedBox(height: 12),
              const Text('Share this code with your friend. When they join, start the workout together from the session screen.', style: TextStyle(color: Colors.white54)),
              const SizedBox(height: 16),
            ],
            const Divider(color: Colors.white12),
            const SizedBox(height: 12),
            const Text('Join a lobby', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              controller: _joinController,
              decoration: InputDecoration(
                hintText: 'Enter lobby code',
                hintStyle: const TextStyle(color: Colors.white38),
                filled: true,
                fillColor: Colors.grey.shade900,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                prefixIcon: const Icon(Icons.vpn_key, color: Colors.white38),
              ),
              style: const TextStyle(color: Colors.white),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _joining ? null : _joinLobby,
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                    child: _joining ? const CircularProgressIndicator(color: Colors.white) : const Text('Join Lobby'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            const Text('Notes', style: TextStyle(color: Colors.white70)),
            const SizedBox(height: 8),
            const Text('- Both users must be online to synchronize start', style: TextStyle(color: Colors.white54)),
            const Text('- Video call integration is a placeholder: you can integrate WebRTC or a service of your choice', style: TextStyle(color: Colors.white54)),
          ],
        ),
      ),
    );
  }
}
