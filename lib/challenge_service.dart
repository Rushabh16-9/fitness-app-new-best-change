import 'dart:convert';
import 'package:flutter/services.dart' show rootBundle;
import 'package:firebase_auth/firebase_auth.dart';
import 'database_service.dart';

class ChallengeService {
  final DatabaseService _databaseService;
  List<Map<String, dynamic>> _availableChallenges = [];

  ChallengeService(String? uid)
      : _databaseService = DatabaseService(uid: uid ?? FirebaseAuth.instance.currentUser?.uid);

  Future<void> _loadChallengesFromAssets() async {
    try {
      final String jsonString = await rootBundle.loadString('assets/challenges.json');
      final List<dynamic> jsonData = json.decode(jsonString);
      _availableChallenges = jsonData.cast<Map<String, dynamic>>();
    } catch (e) {
      // Fallback minimal challenges if asset missing or malformed
      _availableChallenges = [
        {
          'id': 'fallback_streak',
          'title': 'Starter Streak',
            'description': 'Complete 3 workouts in 3 days',
            'difficulty': 'Easy',
            'duration': 3,
            'reward': {'points': 25, 'badge': 'Kickoff'},
            'type': 'streak',
            'category': 'Consistency',
            'image': 'assets/slide1.jpg',
            'requirements': ['Any workout each day'],
            'tips': ['Keep sessions short', 'Focus on form']
        }
      ];
    }
  }

  Future<List<Map<String, dynamic>>> getPersonalizedChallenges({
    required String fitnessLevel,
    required String primaryGoal,
    required List<String> completedChallenges,
  }) async {
    if (_availableChallenges.isEmpty) {
      await _loadChallengesFromAssets();
    }

    List<Map<String, dynamic>> personalized = [];

    for (var challenge in _availableChallenges) {
      if (completedChallenges.contains(challenge['id'])) continue;

      bool suitable = _isChallengeSuitable(challenge, fitnessLevel, primaryGoal);
      if (suitable) {
        personalized.add(challenge);
      }
    }

    return personalized.take(3).toList();
  }

  bool _isChallengeSuitable(Map<String, dynamic> challenge, String fitnessLevel, String goal) {
    String difficulty = challenge['difficulty'];
    String type = challenge['type'];

    if (fitnessLevel == 'Beginner' && difficulty == 'Hard') return false;
    if (fitnessLevel == 'Advanced' && difficulty == 'Easy') return false;

    if (goal == 'Weight Loss' && (type == 'calories' || type == 'streak')) return true;
    if (goal == 'Muscle Gain' && (type == 'strength' || type == 'sessions')) return true;
    if (goal == 'General Fitness' && type == 'streak') return true;

    return true;
  }

  Future<void> startChallenge(String challengeId) async {
    if (_availableChallenges.isEmpty) {
      await _loadChallengesFromAssets();
    }
    final selected = _availableChallenges.firstWhere(
      (c) => c['id'] == challengeId,
      orElse: () => {
        'id': challengeId,
        'title': 'Custom Challenge',
        'duration': 7,
        'reward': {'points': 50, 'badge': 'Custom'},
        'type': 'custom',
        'category': 'General'
      },
    );

    Map<String, dynamic> challengeData = {
      'challengeId': challengeId,
      'title': selected['title'],
      'duration': selected['duration'],
      'type': selected['type'],
      'category': selected['category'],
      'startedAt': DateTime.now().toIso8601String(),
      'progress': 0,
      'status': 'active',
      'reward': selected['reward'],
    };
    // Use upsert to avoid duplicates and preserve existing progress if restarted
    await _databaseService.upsertActiveChallenge(challengeData);
    // Immediately enforce integrity to enrich any missing metadata & dedupe legacy entries
    await ensureIntegrity();
  }

  Future<void> updateChallengeProgress(String challengeId, int progress) async {
    await _databaseService.updateChallengeProgress(challengeId, progress);
  }

  Future<void> completeChallenge(String challengeId) async {
    if (_availableChallenges.isEmpty) {
      await _loadChallengesFromAssets();
    }

    Map<String, dynamic> challenge = _availableChallenges.firstWhere(
      (c) => c['id'] == challengeId,
    );

    await _awardChallengeReward(challenge);
    await _databaseService.completeChallenge(challengeId);
  }

  Future<void> _awardChallengeReward(Map<String, dynamic> challenge) async {
    Map<String, dynamic> reward = challenge['reward'];

    await _databaseService.addUserPoints(reward['points']);
    await _databaseService.addUserBadge(reward['badge']);
  }

  Future<List<Map<String, dynamic>>> getActiveChallenges() async {
    return await _databaseService.getActiveChallenges();
  }

  // Public integrity helper so UI can trigger cleanup before rendering
  Future<void> ensureIntegrity() async {
    if (_availableChallenges.isEmpty) {
      await _loadChallengesFromAssets();
    }
    await _databaseService.ensureActiveChallengesIntegrity(_availableChallenges);
  }

  Future<List<Map<String, dynamic>>> getCompletedChallenges() async {
    return await _databaseService.getCompletedChallenges();
  }

  Future<void> restartChallenge(String challengeId) async {
    if (_availableChallenges.isEmpty) {
      await _loadChallengesFromAssets();
    }
    final selected = _availableChallenges.firstWhere(
      (c) => c['id'] == challengeId,
      orElse: () => {'id': challengeId, 'title': 'Custom Challenge', 'duration': 7, 'type': 'custom', 'category': 'General', 'reward': {'points': 50, 'badge': 'Custom'}},
    );
    final meta = {
      'title': selected['title'],
      'duration': selected['duration'],
      'type': selected['type'],
      'category': selected['category'],
      'reward': selected['reward'],
      'image': selected['image'],
    };
    await _databaseService.restartChallenge(challengeId, metadata: meta);
    await ensureIntegrity();
  }

  Future<Map<String, dynamic>> getUserAchievements() async {
    int points = await _databaseService.getUserPoints();
    List<String> badges = await _databaseService.getUserBadges();

    return {
      'points': points,
      'badges': badges,
      'level': _calculateUserLevel(points),
    };
  }

  int _calculateUserLevel(int points) {
    if (points < 1000) return 1;
    if (points < 2500) return 2;
    if (points < 5000) return 3;
    if (points < 10000) return 4;
    return 5;
  }

  Future<void> createGroupChallenge(Map<String, dynamic> challengeData) async {
    await _databaseService.createGroupChallenge(challengeData);
  }

  Future<void> joinGroupChallenge(String challengeId) async {
    await _databaseService.joinGroupChallenge(challengeId);
  }

  Future<List<Map<String, dynamic>>> getGroupChallenges() async {
    return await _databaseService.getGroupChallenges();
  }

  // Getter for available challenges (loads from assets if not loaded)
  Future<List<Map<String, dynamic>>> get availableChallenges async {
    if (_availableChallenges.isEmpty) {
      await _loadChallengesFromAssets();
    }
    return _availableChallenges;
  }

  // Photo sharing and progress methods
  Future<void> shareChallengeProgressPhoto(String challengeId, String photoUrl, int day) async {
    await _databaseService.saveChallengeProgressPhoto(challengeId, photoUrl, day);
    await _databaseService.updateChallengeDayProgress(challengeId, day, true, photoUrl: photoUrl);
  }

  Future<List<Map<String, dynamic>>> getChallengeProgressPhotos(String challengeId) async {
    return await _databaseService.getChallengeProgressPhotos(challengeId);
  }

  Future<void> markDayChallengeComplete(String challengeId, int day, {String? photoUrl}) async {
    await _databaseService.updateChallengeDayProgress(challengeId, day, true, photoUrl: photoUrl);
    // After updating, check if challenge should be completed
    final active = await _databaseService.getActiveChallenges();
    final match = active.firstWhere(
      (c) => c['challengeId'] == challengeId,
      orElse: () => {},
    );
    if (match.isNotEmpty) {
      final duration = match['duration'] ?? match['target'] ?? 0;
      final progress = match['progress'] ?? 0;
      if (duration != 0 && progress >= duration) {
        await completeChallenge(challengeId);
      }
    }
  }

  Future<Map<String, dynamic>?> getChallengeDayProgress(String challengeId, int day) async {
    return await _databaseService.getChallengeDayProgress(challengeId, day);
  }

  // Photo matching logic (simplified version)
  Future<bool> verifyChallengePhoto(String challengeId, String photoUrl) async {
    // This is a simplified version - in a real app, you would use AI/ML to verify
    // if the photo matches the challenge requirements
    // For now, we'll just check if a photo was uploaded
    return photoUrl.isNotEmpty;
  }
}
