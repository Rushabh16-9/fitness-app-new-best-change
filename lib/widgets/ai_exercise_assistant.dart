import 'package:flutter/material.dart';

class AIExerciseAssistant extends StatefulWidget {
  final String exerciseName;
  final List<String> muscleGroups;
  final String exerciseType; // 'strength', 'cardio', 'flexibility'
  
  const AIExerciseAssistant({
    super.key,
    required this.exerciseName,
    required this.muscleGroups,
    required this.exerciseType,
  });

  @override
  State<AIExerciseAssistant> createState() => _AIExerciseAssistantState();
}

class _AIExerciseAssistantState extends State<AIExerciseAssistant> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<ChatMessage> _messages = [];
  bool _isTyping = false;

  @override
  void initState() {
    super.initState();
    _addWelcomeMessage();
  }

  void _addWelcomeMessage() {
    final welcomeMessage = ChatMessage(
      text: "Hi! I'm your AI Exercise Assistant for ${widget.exerciseName}. "
           "I can help you with:\n\n"
           "• Proper form and technique\n"
           "• Common mistakes to avoid\n"
           "• Modifications for your fitness level\n"
           "• Breathing patterns\n"
           "• Safety tips\n\n"
           "What would you like to know about this exercise?",
      isUser: false,
      timestamp: DateTime.now(),
    );
    
    setState(() {
      _messages.add(welcomeMessage);
    });
  }

  void _sendMessage(String text) {
    if (text.trim().isEmpty) return;

    final userMessage = ChatMessage(
      text: text,
      isUser: true,
      timestamp: DateTime.now(),
    );

    setState(() {
      _messages.add(userMessage);
      _isTyping = true;
    });

    _messageController.clear();
    _scrollToBottom();

    // Simulate AI response
    Future.delayed(const Duration(seconds: 1, milliseconds: 500), () {
      final aiResponse = _generateAIResponse(text);
      final aiMessage = ChatMessage(
        text: aiResponse,
        isUser: false,
        timestamp: DateTime.now(),
      );

      setState(() {
        _messages.add(aiMessage);
        _isTyping = false;
      });
      
      _scrollToBottom();
    });
  }

  String _generateAIResponse(String userMessage) {
    final lowerMessage = userMessage.toLowerCase();
    
    // Form-related questions
    if (lowerMessage.contains('form') || lowerMessage.contains('technique') || lowerMessage.contains('how to')) {
      return _getFormAdvice();
    }
    
    // Breathing questions
    if (lowerMessage.contains('breath') || lowerMessage.contains('breathing')) {
      return _getBreathingAdvice();
    }
    
    // Mistake questions
    if (lowerMessage.contains('mistake') || lowerMessage.contains('wrong') || lowerMessage.contains('error')) {
      return _getMistakeAdvice();
    }
    
    // Modification questions
    if (lowerMessage.contains('easier') || lowerMessage.contains('harder') || lowerMessage.contains('modify') || lowerMessage.contains('beginner') || lowerMessage.contains('advanced')) {
      return _getModificationAdvice();
    }
    
    // Pain/injury questions
    if (lowerMessage.contains('pain') || lowerMessage.contains('hurt') || lowerMessage.contains('injury')) {
      return "⚠️ If you're experiencing pain, please stop the exercise immediately. Pain is different from muscle fatigue - it's your body's warning signal. Consider consulting a fitness professional or healthcare provider if pain persists. I can suggest alternative exercises that might be gentler on the affected area.";
    }
    
    // Repetition questions
    if (lowerMessage.contains('reps') || lowerMessage.contains('sets') || lowerMessage.contains('how many')) {
      return _getRepetitionAdvice();
    }
    
    // Equipment questions
    if (lowerMessage.contains('equipment') || lowerMessage.contains('weight') || lowerMessage.contains('dumbbell')) {
      return _getEquipmentAdvice();
    }
    
    // Default response with exercise-specific tips
    return _getGeneralAdvice();
  }

  String _getFormAdvice() {
    final exerciseName = widget.exerciseName.toLowerCase();
    
    if (exerciseName.contains('pushup') || exerciseName.contains('push-up')) {
      return "For proper push-up form:\n\n"
             "🔹 Start in plank position with hands slightly wider than shoulders\n"
             "🔹 Keep your body in a straight line from head to heels\n"
             "🔹 Lower your chest to almost touch the floor\n"
             "🔹 Push back up with control\n"
             "🔹 Keep core engaged throughout the movement\n"
             "🔹 Don't let hips sag or pike up";
    }
    
    if (exerciseName.contains('squat')) {
      return "For proper squat form:\n\n"
             "🔹 Feet shoulder-width apart, toes slightly out\n"
             "🔹 Keep chest up and core engaged\n"
             "🔹 Push hips back first, then bend knees\n"
             "🔹 Lower until thighs are parallel to floor\n"
             "🔹 Drive through heels to return to start\n"
             "🔹 Keep knees tracking over toes";
    }
    
    if (exerciseName.contains('plank')) {
      return "For proper plank form:\n\n"
             "🔹 Start in push-up position, then lower to forearms\n"
             "🔹 Keep body in straight line from head to heels\n"
             "🔹 Engage core muscles actively\n"
             "🔹 Don't let hips sag or pike up\n"
             "🔹 Keep neck neutral, eyes looking down\n"
             "🔹 Breathe steadily throughout hold";
    }
    
    return "For proper form in ${widget.exerciseName}:\n\n"
           "🔹 Start with lighter weight/resistance to master technique\n"
           "🔹 Focus on controlled movements, not speed\n"
           "🔹 Maintain proper alignment throughout\n"
           "🔹 Engage your core for stability\n"
           "🔹 Use full range of motion\n"
           "🔹 Quality over quantity - perfect reps matter more than many reps";
  }

  String _getBreathingAdvice() {
    if (widget.exerciseType == 'strength') {
      return "Breathing for strength exercises:\n\n"
             "🔹 Inhale during the lowering/eccentric phase\n"
             "🔹 Exhale during the lifting/concentric phase\n"
             "🔹 For heavy weights, take a deep breath and hold during the lift\n"
             "🔹 Never hold your breath for extended periods\n"
             "🔹 Breathe steadily to maintain oxygen flow";
    }
    
    if (widget.exerciseType == 'cardio') {
      return "Breathing for cardio exercises:\n\n"
             "🔹 Maintain steady, rhythmic breathing\n"
             "🔹 Breathe through both nose and mouth\n"
             "🔹 Match breathing to movement rhythm when possible\n"
             "🔹 Don't hold your breath\n"
             "🔹 Focus on deep, controlled breaths";
    }
    
    return "General breathing tips:\n\n"
           "🔹 Never hold your breath during exercise\n"
           "🔹 Breathe out during the exertion phase\n"
           "🔹 Breathe in during the relaxation phase\n"
           "🔹 Keep breathing steady and controlled\n"
           "🔹 If you can't breathe comfortably, reduce intensity";
  }

  String _getMistakeAdvice() {
    return "Common mistakes to avoid in ${widget.exerciseName}:\n\n"
           "❌ Rushing through the movement\n"
           "❌ Using too much weight too soon\n"
           "❌ Poor posture or alignment\n"
           "❌ Holding breath during exercise\n"
           "❌ Not warming up properly\n"
           "❌ Ignoring pain signals\n"
           "❌ Inconsistent form between reps\n\n"
           "Remember: Perfect practice makes perfect!";
  }

  String _getModificationAdvice() {
    return "Exercise modifications for ${widget.exerciseName}:\n\n"
           "🟢 EASIER:\n"
           "• Reduce range of motion\n"
           "• Use lighter weight or resistance\n"
           "• Perform fewer repetitions\n"
           "• Take longer rest periods\n\n"
           "🔴 HARDER:\n"
           "• Increase weight or resistance\n"
           "• Add more repetitions\n"
           "• Slow down the tempo\n"
           "• Add instability (balance challenges)\n"
           "• Combine with other movements";
  }

  String _getRepetitionAdvice() {
    return "Repetition guidelines for ${widget.exerciseName}:\n\n"
           "🏃‍♀️ BEGINNERS: 8-12 reps, 1-2 sets\n"
           "🏋️‍♀️ INTERMEDIATE: 12-15 reps, 2-3 sets\n"
           "💪 ADVANCED: 15+ reps, 3-4 sets\n\n"
           "Rest between sets: 30-60 seconds\n\n"
           "Remember: Start conservative and gradually increase as you get stronger. Listen to your body!";
  }

  String _getEquipmentAdvice() {
    return "Equipment tips for ${widget.exerciseName}:\n\n"
           "🏋️‍♀️ WEIGHT SELECTION:\n"
           "• Choose weight where last 2-3 reps feel challenging\n"
           "• You should be able to complete all reps with good form\n"
           "• Increase weight by 2.5-5lbs when current weight feels easy\n\n"
           "🛠️ ALTERNATIVES:\n"
           "• No weights? Use resistance bands or bodyweight\n"
           "• Water bottles can substitute for light dumbbells\n"
           "• Focus on time under tension if no equipment available";
  }

  String _getGeneralAdvice() {
    return "Here are some key tips for ${widget.exerciseName}:\n\n"
           "✅ Start with a proper warm-up\n"
           "✅ Focus on controlled, deliberate movements\n"
           "✅ Maintain good posture throughout\n"
           "✅ Listen to your body - rest when needed\n"
           "✅ Stay hydrated during your workout\n"
           "✅ Cool down and stretch after exercising\n\n"
           "Need specific help with form, breathing, or modifications? Just ask!";
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      decoration: const BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey.shade900,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Row(
              children: [
                const Icon(Icons.smart_toy, color: Colors.red),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'AI Exercise Assistant',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          
          // Chat Messages
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return _buildMessageBubble(message);
              },
            ),
          ),
          
          // Typing Indicator
          if (_isTyping)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  const CircleAvatar(
                    backgroundColor: Colors.red,
                    radius: 12,
                    child: Icon(Icons.smart_toy, color: Colors.white, size: 16),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade800,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'AI is typing...',
                      style: TextStyle(color: Colors.white70, fontStyle: FontStyle.italic),
                    ),
                  ),
                ],
              ),
            ),
          
          // Input Field
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey.shade900,
              borderRadius: const BorderRadius.vertical(bottom: Radius.circular(20)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Ask about form, breathing, modifications...',
                      hintStyle: const TextStyle(color: Colors.white54),
                      filled: true,
                      fillColor: Colors.black,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(25),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                    onSubmitted: _sendMessage,
                  ),
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  backgroundColor: Colors.red,
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.white),
                    onPressed: () => _sendMessage(_messageController.text),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage message) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: message.isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!message.isUser) ...[
            const CircleAvatar(
              backgroundColor: Colors.red,
              radius: 12,
              child: Icon(Icons.smart_toy, color: Colors.white, size: 16),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: message.isUser ? Colors.red : Colors.grey.shade800,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                message.text,
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ),
          if (message.isUser) ...[
            const SizedBox(width: 8),
            const CircleAvatar(
              backgroundColor: Colors.blue,
              radius: 12,
              child: Icon(Icons.person, color: Colors.white, size: 16),
            ),
          ],
        ],
      ),
    );
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
}

class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;

  ChatMessage({
    required this.text,
    required this.isUser,
    required this.timestamp,
  });
}