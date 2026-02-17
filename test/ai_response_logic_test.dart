import 'package:flutter_test/flutter_test.dart';

void main() {
  group('AI Assistant Response Logic Tests', () {
    test('AI generates form advice for form-related questions', () {
      final responses = [
        _generateAIResponse('how do I maintain proper form?'),
        _generateAIResponse('what is the correct technique?'),
        _generateAIResponse('How to do this exercise properly?'),
      ];
      
      for (final response in responses) {
        expect(response.toLowerCase(), contains('form'));
        expect(response.length, greaterThan(50)); // Ensure substantive response
      }
    });

    test('AI generates breathing advice for breathing questions', () {
      final responses = [
        _generateAIResponse('how should I breathe?'),
        _generateAIResponse('what is the correct breathing pattern?'),
        _generateAIResponse('breathing technique for this exercise'),
      ];
      
      for (final response in responses) {
        expect(response.toLowerCase(), anyOf([
          contains('breathing'),
          contains('breathe'),
          contains('inhale'),
          contains('exhale')
        ]));
      }
    });

    test('AI generates modification advice for difficulty questions', () {
      final responses = [
        _generateAIResponse('make this exercise easier'),
        _generateAIResponse('I need modifications for beginners'),
        _generateAIResponse('how to make this harder?'),
      ];
      
      for (final response in responses) {
        expect(response.toLowerCase(), anyOf([
          contains('easier'),
          contains('harder'), 
          contains('modification'),
          contains('beginner'),
          contains('advanced')
        ]));
      }
    });

    test('AI provides safety advice for pain-related questions', () {
      final responses = [
        _generateAIResponse('I feel pain during this exercise'),
        _generateAIResponse('this hurts my back'),
        _generateAIResponse('injury prevention tips'),
      ];
      
      for (final response in responses) {
        expect(response.toLowerCase(), anyOf([
          contains('stop'),
          contains('pain'),
          contains('injury'),
          contains('healthcare'),
          contains('professional')
        ]));
      }
    });

    test('AI provides repetition guidance for rep-related questions', () {
      final responses = [
        _generateAIResponse('how many reps should I do?'),
        _generateAIResponse('what is the right number of sets?'),
        _generateAIResponse('repetition guidelines'),
      ];
      
      for (final response in responses) {
        expect(response.toLowerCase(), anyOf([
          contains('reps'),
          contains('sets'),
          contains('beginner'),
          contains('repetition')
        ]));
      }
    });

    test('AI provides equipment advice for equipment questions', () {
      final responses = [
        _generateAIResponse('what weight should I use?'),
        _generateAIResponse('equipment recommendations'),
        _generateAIResponse('alternatives without weights'),
      ];
      
      for (final response in responses) {
        expect(response.toLowerCase(), anyOf([
          contains('weight'),
          contains('equipment'),
          contains('alternative'),
          contains('resistance')
        ]));
      }
    });

    test('AI provides general advice for unspecific questions', () {
      final response = _generateAIResponse('general fitness tips');
      
      expect(response.toLowerCase(), anyOf([
        contains('warm-up'),
        contains('posture'),
        contains('hydrated'),
        contains('form'),
        contains('breathing')
      ]));
      expect(response.length, greaterThan(100)); // Ensure comprehensive response
    });

    test('AI responses are context-aware for specific exercises', () {
      final pushupAdvice = _getFormAdviceForExercise('push-up');
      final squatAdvice = _getFormAdviceForExercise('squat');
      final plankAdvice = _getFormAdviceForExercise('plank');
      
      expect(pushupAdvice.toLowerCase(), contains('plank position'));
      expect(squatAdvice.toLowerCase(), contains('feet shoulder-width'));
      expect(plankAdvice.toLowerCase(), contains('straight line'));
    });
  });
}

// Copy the response generation logic from the AI Assistant widget
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
  return "For proper form in exercises:\n\n"
         "🔹 Start with lighter weight/resistance to master technique\n"
         "🔹 Focus on controlled movements, not speed\n"
         "🔹 Maintain proper alignment throughout\n"
         "🔹 Engage your core for stability\n"
         "🔹 Use full range of motion\n"
         "🔹 Quality over quantity - perfect reps matter more than many reps";
}

String _getFormAdviceForExercise(String exerciseName) {
  final lowerName = exerciseName.toLowerCase();
  
  if (lowerName.contains('pushup') || lowerName.contains('push-up')) {
    return "For proper push-up form:\n\n"
           "🔹 Start in plank position with hands slightly wider than shoulders\n"
           "🔹 Keep your body in a straight line from head to heels\n"
           "🔹 Lower your chest to almost touch the floor\n"
           "🔹 Push back up with control\n"
           "🔹 Keep core engaged throughout the movement\n"
           "🔹 Don't let hips sag or pike up";
  }
  
  if (lowerName.contains('squat')) {
    return "For proper squat form:\n\n"
           "🔹 Feet shoulder-width apart, toes slightly out\n"
           "🔹 Keep chest up and core engaged\n"
           "🔹 Push hips back first, then bend knees\n"
           "🔹 Lower until thighs are parallel to floor\n"
           "🔹 Drive through heels to return to start\n"
           "🔹 Keep knees tracking over toes";
  }
  
  if (lowerName.contains('plank')) {
    return "For proper plank form:\n\n"
           "🔹 Start in push-up position, then lower to forearms\n"
           "🔹 Keep body in straight line from head to heels\n"
           "🔹 Engage core muscles actively\n"
           "🔹 Don't let hips sag or pike up\n"
           "🔹 Keep neck neutral, eyes looking down\n"
           "🔹 Breathe steadily throughout hold";
  }
  
  return _getFormAdvice();
}

String _getBreathingAdvice() {
  return "Breathing for strength exercises:\n\n"
         "🔹 Inhale during the lowering/eccentric phase\n"
         "🔹 Exhale during the lifting/concentric phase\n"
         "🔹 For heavy weights, take a deep breath and hold during the lift\n"
         "🔹 Never hold your breath for extended periods\n"
         "🔹 Breathe steadily to maintain oxygen flow";
}

String _getMistakeAdvice() {
  return "Common mistakes to avoid in exercises:\n\n"
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
  return "Exercise modifications:\n\n"
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
  return "Repetition guidelines:\n\n"
         "🏃‍♀️ BEGINNERS: 8-12 reps, 1-2 sets\n"
         "🏋️‍♀️ INTERMEDIATE: 12-15 reps, 2-3 sets\n"
         "💪 ADVANCED: 15+ reps, 3-4 sets\n\n"
         "Rest between sets: 30-60 seconds\n\n"
         "Remember: Start conservative and gradually increase as you get stronger. Listen to your body!";
}

String _getEquipmentAdvice() {
  return "Equipment tips:\n\n"
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
  return "Here are some key fitness tips:\n\n"
         "✅ Start with a proper warm-up\n"
         "✅ Focus on controlled, deliberate movements\n"
         "✅ Maintain good posture throughout\n"
         "✅ Listen to your body - rest when needed\n"
         "✅ Stay hydrated during your workout\n"
         "✅ Cool down and stretch after exercising\n\n"
         "Need specific help with form, breathing, or modifications? Just ask!";
}