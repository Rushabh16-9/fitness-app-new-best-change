import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:application_main/widgets/ai_exercise_assistant.dart';

void main() {
  group('AI Exercise Assistant Tests', () {
    testWidgets('AI Assistant displays welcome message', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AIExerciseAssistant(
              exerciseName: 'Push-ups',
              muscleGroups: ['chest', 'arms'],
              exerciseType: 'strength',
            ),
          ),
        ),
      );

      // Verify welcome message is displayed
      expect(find.text('AI Exercise Assistant'), findsOneWidget);
      expect(find.textContaining('Hi! I\'m your AI Exercise Assistant'), findsOneWidget);
      expect(find.textContaining('Push-ups'), findsOneWidget);
    });

    testWidgets('AI Assistant can send and receive messages', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AIExerciseAssistant(
              exerciseName: 'Squats',
              muscleGroups: ['legs'],
              exerciseType: 'strength',
            ),
          ),
        ),
      );

      // Find the text input field
      final textFieldFinder = find.byType(TextField);
      expect(textFieldFinder, findsOneWidget);

      // Enter a message about form
      await tester.enterText(textFieldFinder, 'How do I maintain proper form?');
      await tester.pump();

      // Tap send button
      final sendButtonFinder = find.byIcon(Icons.send);
      expect(sendButtonFinder, findsOneWidget);
      await tester.tap(sendButtonFinder);
      await tester.pump();

      // Verify user message appears
      expect(find.text('How do I maintain proper form?'), findsOneWidget);

      // Wait for AI response (simulate delay)
      await tester.pump(const Duration(seconds: 2));

      // Verify AI response appears with form advice
      expect(find.textContaining('proper squat form'), findsOneWidget);
    });

    testWidgets('AI Assistant responds to breathing questions', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AIExerciseAssistant(
              exerciseName: 'Deadlifts',
              muscleGroups: ['back', 'legs'],
              exerciseType: 'strength',
            ),
          ),
        ),
      );

      // Ask about breathing
      final textFieldFinder = find.byType(TextField);
      await tester.enterText(textFieldFinder, 'How should I breathe during this exercise?');
      await tester.tap(find.byIcon(Icons.send));
      await tester.pump(const Duration(seconds: 2));

      // Verify breathing advice appears
      expect(find.textContaining('Breathing for strength exercises'), findsOneWidget);
      expect(find.textContaining('Exhale during the lifting'), findsOneWidget);
    });

    testWidgets('AI Assistant responds to modification requests', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AIExerciseAssistant(
              exerciseName: 'Push-ups',
              muscleGroups: ['chest', 'arms'],
              exerciseType: 'strength',
            ),
          ),
        ),
      );

      // Ask for easier modifications
      final textFieldFinder = find.byType(TextField);
      await tester.enterText(textFieldFinder, 'Can you make this exercise easier for a beginner?');
      await tester.tap(find.byIcon(Icons.send));
      await tester.pump(const Duration(seconds: 2));

      // Verify modification advice appears
      expect(find.textContaining('EASIER'), findsOneWidget);
      expect(find.textContaining('Reduce range of motion'), findsOneWidget);
    });

    testWidgets('AI Assistant handles pain/injury questions appropriately', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AIExerciseAssistant(
              exerciseName: 'Squats',
              muscleGroups: ['legs'],
              exerciseType: 'strength',
            ),
          ),
        ),
      );

      // Ask about pain
      final textFieldFinder = find.byType(TextField);
      await tester.enterText(textFieldFinder, 'I feel pain in my knee during this exercise');
      await tester.tap(find.byIcon(Icons.send));
      await tester.pump(const Duration(seconds: 2));

      // Verify safety advice appears
      expect(find.textContaining('stop the exercise immediately'), findsOneWidget);
      expect(find.textContaining('consulting a fitness professional'), findsOneWidget);
    });
  });
}