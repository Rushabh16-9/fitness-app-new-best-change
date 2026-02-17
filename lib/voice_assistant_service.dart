// Stub VoiceAssistantService.
// Original implementation depended on the speech_to_text package which is not included.
// This stub avoids analyzer errors while keeping the interface minimal so future
// integration can be re-added without touching callers.

class VoiceAssistantService {
  bool _isListening = false;
  String recognizedText = '';

  Future<bool> initialize() async {
    // Always 'initialized' in stub.
    return true;
  }

  void startListening(Function(String) onResult) {
    // Emit a placeholder result once.
    if (_isListening) return;
    _isListening = true;
    recognizedText = '';
    Future.microtask(() => onResult(recognizedText));
  }

  void stopListening() {
    _isListening = false;
  }

  bool get isListening => _isListening;
}
