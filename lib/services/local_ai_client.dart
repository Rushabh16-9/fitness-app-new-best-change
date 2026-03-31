import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/services.dart' show rootBundle;

/// Lightweight client for a local LLM endpoint.
class LocalAiClient {
  LocalAiClient({required this.baseUrl});

  /// Base URL of your local model server, e.g. http://10.0.2.2:8000
  final String baseUrl;

  /// Load the system prompt from assets/AI.txt (declared in pubspec).
  Future<String> loadSystemPrompt() async {
    return await rootBundle.loadString('assets/AI.txt');
  }

  /// Send a chat request. Expects the model to return JSON text.
  Future<Map<String, dynamic>> send({required String systemPrompt, required String userPrompt}) async {
    final uri = Uri.parse('$baseUrl/chat');
    final resp = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'system': systemPrompt,
        'user': userPrompt,
      }),
    );

    if (resp.statusCode != 200) {
      throw Exception('Local AI error ${resp.statusCode}: ${resp.body}');
    }

    final text = resp.body.trim();
    try {
      final decoded = jsonDecode(text);
      if (decoded is Map<String, dynamic>) return decoded;
      throw Exception('Response is not a JSON object');
    } catch (e) {
      throw Exception('Failed to parse JSON: $e\n$text');
    }
  }
}
