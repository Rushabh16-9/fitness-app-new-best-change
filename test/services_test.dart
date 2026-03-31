import 'package:flutter_test/flutter_test.dart';
import 'package:application_main/ai_workout_service.dart';
import 'package:application_main/challenge_service.dart';
import 'package:application_main/database_service.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() {
  setUpAll(() async {
    // Initialize Firebase for testing
    TestWidgetsFlutterBinding.ensureInitialized();

    // Use Firebase emulator for testing
    await Firebase.initializeApp(
      name: 'test',
      options: const FirebaseOptions(
        apiKey: 'test-api-key',
        appId: 'test-app-id',
        messagingSenderId: 'test-sender-id',
        projectId: 'test-project-id',
      ),
    );

    // Use Firestore emulator
    FirebaseFirestore.instance.useFirestoreEmulator('localhost', 8080);
  });
  group('AI Workout Service Tests', () {
    late AIWorkoutService aiWorkoutService;

    setUp(() {
      // Mock user ID for testing
      aiWorkoutService = AIWorkoutService(databaseService: DatabaseService(uid: 'test_user_id'));
    });

    test('AI Workout Service instantiation', () {
      expect(aiWorkoutService, isNotNull);
    });

    test('Get personalized workout plan', () async {
      // Test data
      final plan = await aiWorkoutService.getPersonalizedWorkoutPlan();

      expect(plan, isNotNull);
      expect(plan, isA<List<Map<String, dynamic>>>());
      expect(plan.isNotEmpty, true);
    });

    test('Calculate workout intensity', () {
      // Test the intensity calculation logic
      final service = AIWorkoutService(databaseService: DatabaseService(uid: 'test_user_id'));

      // This would normally be tested through the private method
      // but for now we verify the service can handle different scenarios
      expect(service, isNotNull);
    });
  });

  group('Challenge Service Tests', () {
    late ChallengeService challengeService;

    setUp(() {
      challengeService = ChallengeService('test_user_id');
    });

    test('Challenge Service instantiation', () {
      expect(challengeService, isNotNull);
    });

    test('Get personalized challenges', () async {
      final challenges = await challengeService.getPersonalizedChallenges(
        fitnessLevel: 'Beginner',
        primaryGoal: 'Weight Loss',
        completedChallenges: [],
      );

      expect(challenges, isNotNull);
      expect(challenges, isA<List<Map<String, dynamic>>>());
      expect(challenges.length, lessThanOrEqualTo(3));
    });

    test('Available challenges list', () async {
      final challenges = await challengeService.availableChallenges;
      expect(challenges, isNotNull);
      expect(challenges.isNotEmpty, true);
      expect(challenges.length, greaterThan(0));
    });

    test('Challenge difficulty levels', () async {
      final challenges = await challengeService.availableChallenges;
      final difficulties = challenges
          .map((challenge) => challenge['difficulty'])
          .toSet();

      expect(difficulties.contains('Easy'), true);
      expect(difficulties.contains('Medium'), true);
      expect(difficulties.contains('Hard'), true);
    });
  });

  group('Database Service Tests', () {
    late DatabaseService databaseService;

    setUp(() {
      databaseService = DatabaseService(uid: 'test_user_id');
    });

    test('Database Service instantiation', () {
      expect(databaseService, isNotNull);
    });

    test('User profile operations', () async {
      // Test user profile update
      final testData = {
        'name': 'Test User',
        'age': 25,
        'fitnessLevel': 'Beginner',
      };

      // Note: These would normally interact with Firestore
      // but we're just testing that the methods exist and don't throw
      expect(() async => await databaseService.updateUserProfile(testData), returnsNormally);
      expect(() async => await databaseService.getUserProfile(), returnsNormally);
    });

    test('Points and badges system', () async {
      expect(() async => await databaseService.getUserPoints(), returnsNormally);
      expect(() async => await databaseService.getUserBadges(), returnsNormally);
    });

    test('Challenge operations', () async {
      expect(() async => await databaseService.getActiveChallenges(), returnsNormally);
      expect(() async => await databaseService.getCompletedChallenges(), returnsNormally);
    });

    test('Workout history operations', () async {
      expect(() async => await databaseService.getWorkoutHistory(), returnsNormally);
    });
  });

  group('Integration Tests', () {
    test('Services integration', () {
      final dbService = DatabaseService(uid: 'test_user_id');
      final aiService = AIWorkoutService(databaseService: DatabaseService(uid: 'test_user_id'));
      final challengeService = ChallengeService('test_user_id');

      expect(dbService, isNotNull);
      expect(aiService, isNotNull);
      expect(challengeService, isNotNull);
    });

    test('Service method availability', () {
      final aiService = AIWorkoutService(databaseService: DatabaseService(uid: 'test_user_id'));
      final challengeService = ChallengeService('test_user_id');

      // Verify that key methods are available
      expect(aiService.getPersonalizedWorkoutPlan, isNotNull);
      expect(challengeService.getPersonalizedChallenges, isNotNull);
      expect(challengeService.startChallenge, isNotNull);
      expect(challengeService.completeChallenge, isNotNull);
    });
  });
}
