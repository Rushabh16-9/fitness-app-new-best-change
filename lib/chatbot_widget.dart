import 'dart:convert';
import 'package:flutter/material.dart';
import 'main.dart' show hydrationReminderService;
import 'pages/exercise_runner_page.dart';
import 'ai_recommendations_page.dart';
import 'marketplace_page.dart';
import 'nutrition_dashboard.dart';
import 'services/local_ai_client.dart';
import 'services/music_service.dart';
import 'services/hydration_service.dart';

class ChatBotWidget extends StatefulWidget {
  const ChatBotWidget({super.key});

  @override
  State<ChatBotWidget> createState() => _ChatBotWidgetState();
}

class ChatMessage {
  final String text;
  final bool fromUser;
  ChatMessage(this.text, {this.fromUser = false});
}

class _ChatBotWidgetState extends State<ChatBotWidget> {
  // Configure your local model endpoint (Android emulator uses 10.0.2.2)
  static const String _aiBaseUrl = 'http://10.0.2.2:8000';
  final LocalAiClient _ai = LocalAiClient(baseUrl: _aiBaseUrl);

  bool _open = false;
  final List<ChatMessage> _messages = [];
  final TextEditingController _ctrl = TextEditingController();
  bool _loading = false;
  String? _systemPrompt;
  final List<String> _quickSuggestions = [
    'How to fix form',
    'I feel pain',
    'Substitute exercise',
    'Warmup & cooldown',
    'Progression tips'
  ];

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _ensurePromptLoaded() async {
    if (_systemPrompt != null) return;
    _systemPrompt = await _ai.loadSystemPrompt();
  }

  Future<void> _send(String text) async {
    if (text.trim().isEmpty) return;
    setState(() {
      _messages.insert(0, ChatMessage(text, fromUser: true));
    });
    _ctrl.clear();
    await _respond(text);
  }

  Future<void> _respond(String input) async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      await _ensurePromptLoaded();
      final res = await _ai.send(systemPrompt: _systemPrompt ?? '', userPrompt: input.trim());
      final pretty = const JsonEncoder.withIndent('  ').convert(res);
      if (!mounted) return;
      setState(() {
        _messages.insert(0, ChatMessage(pretty));
      });
      await _handleAction(res);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _messages.insert(0, ChatMessage('AI error: $e'));
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _handleAction(Map<String, dynamic> payload) async {
    final action = payload['action']?.toString() ?? '';
    if (action.isEmpty) return;

    switch (action) {
      case 'start_workout_runner':
        final totalMinutes = _asInt(payload['duration_minutes']) ?? _asInt(payload['duration']) ?? 15;
        final exercises = _normalizeExercises(payload['exercises'], durationMinutes: totalMinutes);

        if (exercises.isEmpty) {
          _toast('AI did not return exercises to start a workout.');
          return;
        }

        _navigate(() => ExerciseRunnerPage(exercises: exercises, totalMinutes: totalMinutes));
        break;

      case 'play_music':
        await _handleMusic(payload);
        break;

      case 'hydration':
        await _handleHydration(payload);
        break;

      case 'set_reminder':
        await _handleReminder(payload);
        break;

      case 'marketplace_search':
        _navigate(() => MarketplacePage(initialCategory: payload['category']?.toString() ?? 'All'));
        _toast('Opening marketplace for ${payload['product_query'] ?? 'your search'}');
        break;

      case 'diet_plan':
      case 'query_nutrition':
        _navigate(() => const NutritionDashboard());
        _toast('Opening nutrition dashboard');
        break;

      case 'show_exercises':
      case 'mood_workout':
      case 'generate_ai_plan':
      case 'adjust_plan':
        _navigate(() => const AIRecommendationsPage());
        _toast('Loading AI workout recommendations');
        break;

      default:
        // Other actions remain informational for now.
        break;
    }
  }

  void _navigate(Widget Function() builder) {
    if (!mounted) return;
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => builder()));
  }

  Future<void> _handleMusic(Map<String, dynamic> payload) async {
    final action = payload['music_action']?.toString() ?? '';
    final vol = payload['volume'];
    final music = MusicService.I;
    await music.ensureLoaded();

    switch (action) {
      case 'play':
      case 'pause':
        await music.playPause();
        break;
      case 'next':
        await music.next();
        break;
      case 'prev':
        await music.previous();
        break;
      case 'volume':
        final v = _asDouble(vol);
        if (v != null) await music.setVolume(v.clamp(0.0, 1.0));
        break;
      case 'track':
        final idx = _asInt(payload['track_index'] ?? payload['index'] ?? payload['track']);
        if (idx != null) await music.playIndex(idx);
        break;
      default:
        await music.playPause();
    }

    _toast('Music: ${action.isEmpty ? 'toggled' : action}');
  }

  Future<void> _handleHydration(Map<String, dynamic> payload) async {
    final ml = _asInt(payload['hydration_ml']) ?? _asInt(payload['amount']) ?? 0;
    if (ml > 0) {
      await HydrationService().addWater(ml);
      _toast('Logged $ml ml water');
    } else {
      _toast('Hydration request received');
    }
  }

  Future<void> _handleReminder(Map<String, dynamic> payload) async {
    final type = payload['reminder_type']?.toString() ?? '';
    if (type == 'hydration') {
      await hydrationReminderService.showImmediateHydrationNotification();
      _toast('Hydration reminder sent');
      return;
    }
    if (type == 'workout') {
      await hydrationReminderService.showImmediateExerciseNotification();
      _toast('Workout reminder sent');
      return;
    }
    _toast('Reminder noted');
  }

  List<Map<String, dynamic>> _normalizeExercises(dynamic raw, {required int durationMinutes}) {
    if (raw is! List) return [];
    final items = <Map<String, dynamic>>[];

    for (final e in raw) {
      if (e is Map) {
        final m = <String, dynamic>{};
        e.forEach((key, value) => m[key.toString()] = value);
        items.add(m);
      }
    }

    if (items.isEmpty) return [];
    final perExerciseSeconds = ((durationMinutes * 60) / items.length).round().clamp(1, 3600);

    for (final m in items) {
      m['name'] = m['name'] ?? m['title'] ?? 'Exercise';
      m['duration'] = _asInt(m['duration']) ?? _asInt(m['duration_seconds']) ?? perExerciseSeconds;
    }

    return items;
  }

  int? _asInt(dynamic value) {
    if (value is int) return value;
    if (value is double) return value.round();
    if (value is String) return int.tryParse(value);
    return null;
  }

  double? _asDouble(dynamic value) {
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }

  void _toast(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  Widget _buildChatPanel() {
    return Material(
      color: Colors.transparent,
      child: Container(
        width: 360,
        height: 420,
        decoration: BoxDecoration(
          color: Colors.grey[900],
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black54, blurRadius: 12)],
        ),
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              ),
              child: Row(
                children: [
                  const CircleAvatar(backgroundColor: Colors.red, child: Icon(Icons.smart_toy, color: Colors.white)),
                  const SizedBox(width: 8),
                  const Expanded(child: Text('SmartFit Assistant', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white70),
                    onPressed: () => setState(() => _open = false),
                  ),
                ],
              ),
            ),
            // Messages
            Expanded(
              child: Column(
                children: [
                  // Quick suggestion chips
                  if (_messages.isEmpty) ...[
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 12.0),
                      child: Wrap(
                        spacing: 8,
                        runSpacing: 6,
                        children: _quickSuggestions.map((s) => ActionChip(
                          backgroundColor: Colors.grey[800],
                          label: Text(s, style: TextStyle(color: Colors.white)),
                          onPressed: () => _send(s),
                        )).toList(),
                      ),
                    ),
                  ],
                  Expanded(
                    child: _messages.isEmpty
                        ? const Center(child: Text('Ask me anything about the app...', style: TextStyle(color: Colors.white54)))
                        : ListView.builder(
                            reverse: true,
                            itemCount: _messages.length,
                            padding: const EdgeInsets.all(12),
                            itemBuilder: (context, index) {
                              final m = _messages[index];
                              return Align(
                                alignment: m.fromUser ? Alignment.centerRight : Alignment.centerLeft,
                                child: Container(
                                  margin: const EdgeInsets.symmetric(vertical: 6),
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                  decoration: BoxDecoration(
                                    color: m.fromUser ? Colors.red[400] : Colors.grey[800],
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(m.text, style: const TextStyle(color: Colors.white)),
                                ),
                              );
                            },
                          ),
                  ),
                ],
              ),
            ),
            // Input
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _ctrl,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        hintText: 'Type a question, e.g. "How to start Day 1"',
                        hintStyle: TextStyle(color: Colors.white54),
                        filled: true,
                        fillColor: Colors.black26,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      ),
                      onSubmitted: (t) => _send(t),
                    ),
                  ),
                  const SizedBox(width: 8),
                  FloatingActionButton(
                    mini: true,
                    backgroundColor: Colors.red,
                    onPressed: _loading ? null : () => _send(_ctrl.text),
                    child: _loading
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.send, size: 18),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (_open)
          Padding(
            padding: const EdgeInsets.only(bottom: 12.0),
            child: _buildChatPanel(),
          ),
        FloatingActionButton(
          heroTag: 'smartfit_chat',
          onPressed: () => setState(() => _open = !_open),
          backgroundColor: Colors.red,
          child: const Icon(Icons.chat_bubble_outline),
        ),
      ],
    );
  }
}
