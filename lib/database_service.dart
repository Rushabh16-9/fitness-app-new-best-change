import 'package:cloud_firestore/cloud_firestore.dart';

class DatabaseService {
  final String? uid;

  DatabaseService({this.uid});

  // Collection reference
  final CollectionReference userCollection = FirebaseFirestore.instance.collection('users');
  final CollectionReference settingsCollection = FirebaseFirestore.instance.collection('settings');
  final CollectionReference challengesCollection = FirebaseFirestore.instance.collection('challenges');

  // Update user profile
  Future<void> updateUserProfile(Map<String, dynamic> userData) async {
    if (uid != null) {
      return await userCollection.doc(uid).set(userData, SetOptions(merge: true));
    }
  }

  // Get user profile
  Future<Map<String, dynamic>> getUserProfile() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      return doc.data() as Map<String, dynamic>? ?? {};
    }
    return {};
  }

  // Update workout settings
  Future<void> updateWorkoutSettings(Map<String, dynamic> settings) async {
    if (uid != null) {
      return await settingsCollection.doc(uid).set(settings, SetOptions(merge: true));
    }
  }

  // Get workout settings
  Future<Map<String, dynamic>> getWorkoutSettings() async {
    if (uid != null) {
      DocumentSnapshot doc = await settingsCollection.doc(uid).get();
      return doc.data() as Map<String, dynamic>? ?? {};
    }
    return {};
  }

  // Get completed workouts
  Future<List<String>> getCompletedWorkouts() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      List<dynamic> workouts = data['completedWorkouts'] ?? [];
      return workouts.cast<String>();
    }
    return [];
  }

  // Add completed workout
  Future<void> addCompletedWorkout(String workout) async {
    if (uid != null) {
      // Get current workouts
      List<String> currentWorkouts = await getCompletedWorkouts();
      // Add new workout if not already exists
      if (!currentWorkouts.contains(workout)) {
        currentWorkouts.add(workout);
        return await userCollection.doc(uid).update({
          'completedWorkouts': currentWorkouts
        });
      }
    }
  }

  // Reset progress (clear completed workouts but keep history)
  Future<void> resetProgress() async {
    if (uid != null) {
      return await userCollection.doc(uid).update({
        'completedWorkouts': []
      });
    }
  }

  // --- New Workout Day History Helpers ---
  // Store a structured entry for a completed day in workoutHistoryDays
  Future<void> addCompletedDay(int dayNumber) async {
    if (uid == null) return;
    final docRef = userCollection.doc(uid);
    final doc = await docRef.get();
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
    List<dynamic> history = data['workoutHistoryDays'] ?? [];

    // Avoid duplicating same day entry
    bool alreadyLogged = history.any((h) => (h is Map && h['day'] == dayNumber));
    if (!alreadyLogged) {
      history.add({
        'day': dayNumber,
        'completedAt': DateTime.now().toIso8601String(),
      });
      await docRef.set({'workoutHistoryDays': history}, SetOptions(merge: true));
    }
  }

  Future<List<Map<String, dynamic>>> getCompletedDayHistory() async {
    if (uid == null) return [];
    final doc = await userCollection.doc(uid).get();
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
    List<dynamic> history = data['workoutHistoryDays'] ?? [];
    return history.cast<Map<String, dynamic>>();
  }

  // Full reset: clears completedWorkouts and day history
  Future<void> fullResetDayProgress() async {
    if (uid == null) return;
    await userCollection.doc(uid).update({
      'completedWorkouts': [],
      'workoutHistoryDays': [],
    });
  }

  // Yoga-related methods
  Future<void> saveHealthAssessment(Map<String, dynamic> assessment) async {
    if (uid != null) {
      return await userCollection.doc(uid).set({
        'healthAssessment': assessment,
        'assessmentDate': DateTime.now().toIso8601String(),
      }, SetOptions(merge: true));
    }
  }

  Future<Map<String, dynamic>?> getHealthAssessment() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      return data['healthAssessment'] as Map<String, dynamic>?;
    }
    return null;
  }

  Future<bool> hasPremiumAccess() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      return data['hasPremium'] ?? false;
    }
    return false;
  }

  Future<void> saveCompletedYogaSession(String poseId, int duration) async {
    if (uid != null) {
      final session = {
        'poseId': poseId,
        'duration': duration,
        'completedAt': DateTime.now().toIso8601String(),
      };

      // Get current yoga sessions
      List<dynamic> currentSessions = await getCompletedYogaSessions();
      currentSessions.add(session);

      return await userCollection.doc(uid).set({
        'completedYogaSessions': currentSessions
      }, SetOptions(merge: true));
    }
  }

  Future<List<Map<String, dynamic>>> getCompletedYogaSessions() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      List<dynamic> sessions = data['completedYogaSessions'] ?? [];
      return sessions.cast<Map<String, dynamic>>();
    }
    return [];
  }

  // AI Workout Plan methods
  Future<void> saveWorkoutPlan(List<Map<String, dynamic>> plan, String goal) async {
    if (uid != null) {
      return await userCollection.doc(uid).set({
        'currentWorkoutPlan': plan,
        'workoutGoal': goal,
        'planCreatedAt': DateTime.now().toIso8601String(),
      }, SetOptions(merge: true));
    }
  }

  Future<List<Map<String, dynamic>>> getWorkoutHistory() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      List<dynamic> history = data['workoutHistory'] ?? [];
      return history.cast<Map<String, dynamic>>();
    }
    return [];
  }

  Future<void> updateWorkoutPreferences(Map<String, dynamic> feedback) async {
    if (uid != null) {
      return await userCollection.doc(uid).set({
        'workoutPreferences': feedback,
        'preferencesUpdatedAt': DateTime.now().toIso8601String(),
      }, SetOptions(merge: true));
    }
  }

  // Save completed workout session
  Future<void> saveCompletedWorkoutSession(Map<String, dynamic> session) async {
    if (uid != null) {
      // Get current workout history
      List<Map<String, dynamic>> currentHistory = await getWorkoutHistory();
      currentHistory.add(session);

      return await userCollection.doc(uid).set({
        'workoutHistory': currentHistory
      }, SetOptions(merge: true));
    }
  }

  // Challenge-related methods
  Future<void> upsertActiveChallenge(Map<String, dynamic> challengeData) async {
    if (uid == null) return;
    List<Map<String, dynamic>> active = await getActiveChallenges();
    final id = challengeData['challengeId'];
    bool replaced = false;
    for (int i = 0; i < active.length; i++) {
      if (active[i]['challengeId'] == id) {
        // Preserve existing dayProgress & progress if present
        final existingDay = active[i]['dayProgress'];
        final existingProgress = active[i]['progress'];
        if (challengeData['dayProgress'] == null && existingDay != null) {
          challengeData['dayProgress'] = existingDay;
        }
        if (challengeData['progress'] == null && existingProgress != null) {
          challengeData['progress'] = existingProgress;
        }
        active[i] = {
          ...challengeData,
        };
        replaced = true;
        break;
      }
    }
    if (!replaced) {
      active.add(challengeData);
    }
    await userCollection.doc(uid).set({'activeChallenges': active}, SetOptions(merge: true));
  }

  Future<void> ensureActiveChallengesIntegrity(List<Map<String, dynamic>> referenceList) async {
    if (uid == null) return;
    List<Map<String, dynamic>> active = await getActiveChallenges();
    if (active.isEmpty) return;

    final refById = {for (var c in referenceList) c['id']: c};
    final seen = <String>{};
    List<Map<String, dynamic>> cleaned = [];
    for (final c in active) {
      final cid = c['challengeId'] ?? c['id'];
      if (cid == null) continue;
      if (seen.contains(cid)) continue; // drop duplicate
      seen.add(cid);
      final ref = refById[cid];
      if (ref != null) {
        // Merge missing presentation fields
        c['title'] = c['title'] ?? ref['title'];
        c['type'] = c['type'] ?? ref['type'];
        c['category'] = c['category'] ?? ref['category'];
        c['duration'] = c['duration'] ?? ref['duration'];
        c['reward'] = c['reward'] ?? ref['reward'];
        c['image'] = c['image'] ?? ref['image'];
      }
      // Ensure progress derived from dayProgress if inconsistent
      if (c['dayProgress'] != null && c['dayProgress'] is Map) {
        final dp = Map<String, dynamic>.from(c['dayProgress']);
        final completedDays = dp.values.where((v) => v is Map && v['completed'] == true).length;
        if (c['progress'] == null || (c['progress'] is int && c['progress'] < completedDays)) {
          c['progress'] = completedDays;
        }
      }
      if (c['status'] == null) c['status'] = 'active';
      cleaned.add(c);
    }
    await userCollection.doc(uid).set({'activeChallenges': cleaned}, SetOptions(merge: true));
  }

  // Restart (or reset) a challenge: if it's active, clear progress & dayProgress; if completed, move it back to active fresh
  Future<void> restartChallenge(String challengeId, {Map<String, dynamic>? metadata}) async {
    if (uid == null) return;
    final docRef = userCollection.doc(uid);
    final snapshot = await docRef.get();
    final data = snapshot.data() as Map<String, dynamic>? ?? {};
    List<dynamic> activeRaw = data['activeChallenges'] ?? [];
    List<dynamic> completedRaw = data['completedChallenges'] ?? [];
    List<Map<String, dynamic>> active = activeRaw.cast<Map<String, dynamic>>();
    List<Map<String, dynamic>> completed = completedRaw.cast<Map<String, dynamic>>();

    Map<String, dynamic>? found;
    // Try active list first
    for (int i = 0; i < active.length; i++) {
      if ((active[i]['challengeId'] ?? active[i]['id']) == challengeId) {
        found = active[i];
        // Reset fields
        active[i] = {
          ...active[i],
          if (metadata != null) ...metadata,
          'challengeId': challengeId,
          'progress': 0,
          'status': 'active',
          'dayProgress': {},
          'startedAt': DateTime.now().toIso8601String(),
          'completedAt': null,
        };
        break;
      }
    }

    // If not in active, look in completed and move it
    if (found == null) {
      for (int i = 0; i < completed.length; i++) {
        if ((completed[i]['challengeId'] ?? completed[i]['id']) == challengeId) {
          found = completed.removeAt(i);
          break;
        }
      }
      if (found != null) {
        final restarted = {
          ...found,
            if (metadata != null) ...metadata,
          'challengeId': challengeId,
          'progress': 0,
          'status': 'active',
          'dayProgress': {},
          'startedAt': DateTime.now().toIso8601String(),
          'completedAt': null,
        };
        // Ensure only one instance (remove duplicates with same id from active)
        active.removeWhere((c) => (c['challengeId'] ?? c['id']) == challengeId);
        active.add(restarted);
      }
    }

    await docRef.set({
      'activeChallenges': active,
      'completedChallenges': completed,
    }, SetOptions(merge: true));
  }
  Future<void> saveActiveChallenge(Map<String, dynamic> challengeData) async {
    if (uid != null) {
      return await userCollection.doc(uid).set({
        'activeChallenges': FieldValue.arrayUnion([challengeData])
      }, SetOptions(merge: true));
    }
  }

  Future<void> updateChallengeProgress(String challengeId, int progress) async {
    if (uid != null) {
      // Get current active challenges
      List<Map<String, dynamic>> activeChallenges = await getActiveChallenges();

      // Find and update the specific challenge
      for (int i = 0; i < activeChallenges.length; i++) {
        if (activeChallenges[i]['challengeId'] == challengeId) {
          activeChallenges[i]['progress'] = progress;
          break;
        }
      }

      return await userCollection.doc(uid).set({
        'activeChallenges': activeChallenges
      }, SetOptions(merge: true));
    }
  }

  Future<void> completeChallenge(String challengeId) async {
    if (uid != null) {
      // Get current active challenges
      List<Map<String, dynamic>> activeChallenges = await getActiveChallenges();
      List<Map<String, dynamic>> completedChallenges = await getCompletedChallenges();

      // Find and move challenge from active to completed
      Map<String, dynamic>? completedChallenge;
      activeChallenges.removeWhere((challenge) {
        if (challenge['challengeId'] == challengeId) {
          completedChallenge = {
            ...challenge,
            'completedAt': DateTime.now().toIso8601String(),
          };
          return true;
        }
        return false;
      });

      if (completedChallenge != null) {
        completedChallenges.add(completedChallenge!);

        await userCollection.doc(uid).set({
          'activeChallenges': activeChallenges,
          'completedChallenges': completedChallenges,
        }, SetOptions(merge: true));
      }
    }
  }

  Future<List<Map<String, dynamic>>> getActiveChallenges() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      List<dynamic> challenges = data['activeChallenges'] ?? [];
      return challenges.cast<Map<String, dynamic>>();
    }
    return [];
  }

  Future<List<Map<String, dynamic>>> getCompletedChallenges() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      List<dynamic> challenges = data['completedChallenges'] ?? [];
      return challenges.cast<Map<String, dynamic>>();
    }
    return [];
  }

  // Points and badges system
  Future<void> addUserPoints(int points) async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      int currentPoints = data['points'] ?? 0;

      return await userCollection.doc(uid).set({
        'points': currentPoints + points
      }, SetOptions(merge: true));
    }
  }

  Future<int> getUserPoints() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      return data['points'] ?? 0;
    }
    return 0;
  }

  Future<void> addUserBadge(String badge) async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      List<dynamic> currentBadges = data['badges'] ?? [];

      if (!currentBadges.contains(badge)) {
        currentBadges.add(badge);
        return await userCollection.doc(uid).set({
          'badges': currentBadges
        }, SetOptions(merge: true));
      }
    }
  }

  Future<List<String>> getUserBadges() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      List<dynamic> badges = data['badges'] ?? [];
      return badges.cast<String>();
    }
    return [];
  }

  // Group challenges
  Future<void> createGroupChallenge(Map<String, dynamic> challengeData) async {
    await challengesCollection.add({
      ...challengeData,
      'createdBy': uid,
      'createdAt': DateTime.now().toIso8601String(),
      'participants': [uid],
    });
  }

  Future<void> joinGroupChallenge(String challengeId) async {
    if (uid != null) {
      return await challengesCollection.doc(challengeId).update({
        'participants': FieldValue.arrayUnion([uid])
      });
    }
  }

  Future<List<Map<String, dynamic>>> getGroupChallenges() async {
    QuerySnapshot snapshot = await challengesCollection.get();
    return snapshot.docs.map((doc) {
      return {
        'id': doc.id,
        ...doc.data() as Map<String, dynamic>,
      };
    }).toList();
  }

  // Progress tracking methods
  Future<void> saveWorkoutProgress(Map<String, dynamic> progressData) async {
    if (uid != null) {
      return await userCollection.doc(uid).set({
        'workoutProgress': FieldValue.arrayUnion([progressData])
      }, SetOptions(merge: true));
    }
  }

  Future<List<Map<String, dynamic>>> getWorkoutProgressHistory() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      List<dynamic> progress = data['workoutProgress'] ?? [];
      return progress.cast<Map<String, dynamic>>();
    }
    return [];
  }

  Future<void> saveBodyMeasurements(Map<String, dynamic> measurements) async {
    if (uid != null) {
      return await userCollection.doc(uid).set({
        'bodyMeasurements': FieldValue.arrayUnion([measurements])
      }, SetOptions(merge: true));
    }
  }

  Future<List<Map<String, dynamic>>> getBodyMeasurementsHistory() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      List<dynamic> measurements = data['bodyMeasurements'] ?? [];
      return measurements.cast<Map<String, dynamic>>();
    }
    return [];
  }

  Future<void> saveProgressPhotos(List<String> photoUrls) async {
    if (uid != null) {
      return await userCollection.doc(uid).set({
        'progressPhotos': photoUrls
      }, SetOptions(merge: true));
    }
  }

  Future<List<String>> getProgressPhotos() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      List<dynamic> photos = data['progressPhotos'] ?? [];
      return photos.cast<String>();
    }
    return [];
  }

  // Challenge progress photos methods
  Future<void> saveChallengeProgressPhoto(String challengeId, String photoUrl, int day) async {
    if (uid != null) {
      final progressPhoto = {
        'challengeId': challengeId,
        'photoUrl': photoUrl,
        'day': day,
        'uploadedAt': DateTime.now().toIso8601String(),
      };

      return await userCollection.doc(uid).set({
        'challengeProgressPhotos': FieldValue.arrayUnion([progressPhoto])
      }, SetOptions(merge: true));
    }
  }

  Future<List<Map<String, dynamic>>> getChallengeProgressPhotos(String challengeId) async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      List<dynamic> photos = data['challengeProgressPhotos'] ?? [];
      List<Map<String, dynamic>> challengePhotos = photos.cast<Map<String, dynamic>>();
      return challengePhotos.where((photo) => photo['challengeId'] == challengeId).toList();
    }
    return [];
  }

  Future<void> updateChallengeDayProgress(String challengeId, int day, bool completed, {String? photoUrl}) async {
    if (uid != null) {
      // Get current active challenges
      List<Map<String, dynamic>> activeChallenges = await getActiveChallenges();

      // Find and update the specific challenge
      for (int i = 0; i < activeChallenges.length; i++) {
        if (activeChallenges[i]['challengeId'] == challengeId) {
          // Initialize dayProgress if it doesn't exist
          if (activeChallenges[i]['dayProgress'] == null) {
            activeChallenges[i]['dayProgress'] = {};
          }

          // Update day progress
          Map<String, dynamic> dayProgress = Map<String, dynamic>.from(activeChallenges[i]['dayProgress']);
          dayProgress[day.toString()] = {
            'completed': completed,
            'completedAt': completed ? DateTime.now().toIso8601String() : null,
            'photoUrl': photoUrl,
          };

          activeChallenges[i]['dayProgress'] = dayProgress;

          // Update overall progress
          int completedDays = dayProgress.values.where((day) => day['completed'] == true).length;
          activeChallenges[i]['progress'] = completedDays;

          break;
        }
      }

      return await userCollection.doc(uid).set({
        'activeChallenges': activeChallenges
      }, SetOptions(merge: true));
    }
  }

  Future<Map<String, dynamic>?> getChallengeDayProgress(String challengeId, int day) async {
    if (uid != null) {
      List<Map<String, dynamic>> activeChallenges = await getActiveChallenges();
      Map<String, dynamic>? challenge = activeChallenges.firstWhere(
        (c) => c['challengeId'] == challengeId,
        orElse: () => {},
      );

      if (challenge.isNotEmpty && challenge['dayProgress'] != null) {
        Map<String, dynamic> dayProgress = Map<String, dynamic>.from(challenge['dayProgress']);
        return dayProgress[day.toString()] as Map<String, dynamic>?;
      }
    }
    return null;
  }

  // Leaderboard methods
  Future<List<Map<String, dynamic>>> getGlobalLeaderboard() async {
    QuerySnapshot snapshot = await userCollection
        .orderBy('points', descending: true)
        .limit(50)
        .get();

    return snapshot.docs.map((doc) {
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
      return {
        'uid': doc.id,
        'name': data['name'] ?? 'Anonymous',
        'points': data['points'] ?? 0,
        'badges': data['badges'] ?? [],
        'level': _calculateUserLevel(data['points'] ?? 0),
      };
    }).toList();
  }

  Future<List<Map<String, dynamic>>> getFriendsLeaderboard(List<String> friendIds) async {
    if (friendIds.isEmpty) return [];

    QuerySnapshot snapshot = await userCollection
        .where(FieldPath.documentId, whereIn: friendIds.take(10).toList())
        .orderBy('points', descending: true)
        .get();

    return snapshot.docs.map((doc) {
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
      return {
        'uid': doc.id,
        'name': data['name'] ?? 'Anonymous',
        'points': data['points'] ?? 0,
        'badges': data['badges'] ?? [],
        'level': _calculateUserLevel(data['points'] ?? 0),
      };
    }).toList();
  }

  int _calculateUserLevel(int points) {
    if (points < 1000) return 1;
    if (points < 2500) return 2;
    if (points < 5000) return 3;
    if (points < 10000) return 4;
    return 5;
  }

  // Wearable Integration Methods
  Future<void> saveWearableData(Map<String, dynamic> wearableData) async {
    if (uid != null) {
      return await userCollection.doc(uid).set({
        'wearableData': FieldValue.arrayUnion([wearableData])
      }, SetOptions(merge: true));
    }
  }

  Future<List<Map<String, dynamic>>> getWearableDataHistory() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      List<dynamic> wearableData = data['wearableData'] ?? [];
      return wearableData.cast<Map<String, dynamic>>();
    }
    return [];
  }

  Future<void> updateWearableSyncStatus(bool synced) async {
    if (uid != null) {
      return await userCollection.doc(uid).set({
        'wearableSynced': synced,
        'lastWearableSync': DateTime.now().toIso8601String(),
      }, SetOptions(merge: true));
    }
  }

  // Social Features Methods
  Future<void> addFriend(String friendId) async {
    if (uid != null) {
      await userCollection.doc(uid).update({
        'friends': FieldValue.arrayUnion([friendId])
      });
      await userCollection.doc(friendId).update({
        'friends': FieldValue.arrayUnion([uid])
      });
    }
  }

  Future<void> removeFriend(String friendId) async {
    if (uid != null) {
      await userCollection.doc(uid).update({
        'friends': FieldValue.arrayRemove([friendId])
      });
      await userCollection.doc(friendId).update({
        'friends': FieldValue.arrayRemove([uid])
      });
    }
  }

  Future<List<String>> getFriendsList() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      List<dynamic> friends = data['friends'] ?? [];
      return friends.cast<String>();
    }
    return [];
  }

  Future<void> sendFriendRequest(String recipientId) async {
    if (uid != null) {
      await userCollection.doc(recipientId).update({
        'friendRequests': FieldValue.arrayUnion([uid])
      });
    }
  }

  Future<void> acceptFriendRequest(String senderId) async {
    if (uid != null) {
      await userCollection.doc(uid).update({
        'friendRequests': FieldValue.arrayRemove([senderId])
      });
      await addFriend(senderId);
    }
  }

  Future<List<String>> getFriendRequests() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      List<dynamic> requests = data['friendRequests'] ?? [];
      return requests.cast<String>();
    }
    return [];
  }

  // Offline Data Sync Methods
  Future<void> saveOfflineWorkoutData(Map<String, dynamic> workoutData) async {
    if (uid != null) {
      return await userCollection.doc(uid).set({
        'offlineWorkouts': FieldValue.arrayUnion([workoutData])
      }, SetOptions(merge: true));
    }
  }

  Future<void> saveOfflineMealData(Map<String, dynamic> mealData) async {
    if (uid != null) {
      return await userCollection.doc(uid).set({
        'offlineMeals': FieldValue.arrayUnion([mealData])
      }, SetOptions(merge: true));
    }
  }

  Future<List<Map<String, dynamic>>> getOfflineWorkouts() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      List<dynamic> workouts = data['offlineWorkouts'] ?? [];
      return workouts.cast<Map<String, dynamic>>();
    }
    return [];
  }

  Future<List<Map<String, dynamic>>> getOfflineMeals() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      List<dynamic> meals = data['offlineMeals'] ?? [];
      return meals.cast<Map<String, dynamic>>();
    }
    return [];
  }

  Future<void> clearOfflineData() async {
    if (uid != null) {
      return await userCollection.doc(uid).update({
        'offlineWorkouts': [],
        'offlineMeals': [],
      });
    }
  }

  // Marketplace Purchase Tracking
  Future<void> recordPurchase(Map<String, dynamic> purchaseData) async {
    if (uid != null) {
      return await userCollection.doc(uid).set({
        'purchases': FieldValue.arrayUnion([purchaseData])
      }, SetOptions(merge: true));
    }
  }

  // Friend workout session helpers (lightweight)
  // Creates a friend session record and returns a minimal map with id/code
  Future<Map<String, dynamic>> createFriendSession({required String code, Map<String, dynamic>? metadata}) async {
    if (uid == null) return {'id': code, 'code': code};
    final docRef = userCollection.doc();
    final session = {
      'code': code,
      'host': uid,
      'participants': [uid],
      'metadata': metadata ?? {},
      'started': false,
      'createdAt': DateTime.now().toIso8601String(),
    };
    await userCollection.doc(docRef.id).set({'friendSession': session});
    // Also write under a top-level sessions collection if desired
    try {
      await FirebaseFirestore.instance.collection('friendSessions').doc(docRef.id).set(session);
    } catch (_) {}
    return {'id': docRef.id, 'code': code};
  }

  // Join by code: simple lookup in `friendSessions` top-level collection
  Future<Map<String, dynamic>?> joinFriendSession(String code) async {
    try {
      final q = await FirebaseFirestore.instance.collection('friendSessions').where('code', isEqualTo: code).limit(1).get();
      if (q.docs.isEmpty) return null;
      final doc = q.docs.first;
      final data = Map<String, dynamic>.from(doc.data() as Map);
      final participants = List<String>.from(data['participants'] ?? []);
      if (uid != null && !participants.contains(uid)) participants.add(uid!);
      await FirebaseFirestore.instance.collection('friendSessions').doc(doc.id).update({'participants': participants});
      return {'id': doc.id, ...data};
    } catch (e) {
      return null;
    }
  }

  Future<Map<String, dynamic>?> getFriendSession(String sessionId) async {
    try {
      final doc = await FirebaseFirestore.instance.collection('friendSessions').doc(sessionId).get();
      if (!doc.exists) return null;
      final data = Map<String, dynamic>.from(doc.data() as Map);
      return {'id': doc.id, ...data};
    } catch (e) {
      return null;
    }
  }

  // Save a generated plan to the user's document under 'generatedPlans'
  Future<void> saveGeneratedPlan(String uid, Map<String, dynamic> planMeta, List<Map<String, dynamic>> days) async {
    try {
      final docRef = userCollection.doc(uid);
      final entry = {
        'meta': planMeta,
        'days': days,
        'createdAt': DateTime.now().toIso8601String(),
      };
      await docRef.set({
        'generatedPlans': FieldValue.arrayUnion([entry])
      }, SetOptions(merge: true));
    } catch (e) {
      // ignore
    }
  }

  // Retrieve the latest generated plan (most recent) for a user
  Future<Map<String, dynamic>?> getLatestGeneratedPlan() async {
    if (uid == null) return null;
    final doc = await userCollection.doc(uid).get();
    final data = doc.data() as Map<String, dynamic>? ?? {};
    final List<dynamic> plans = data['generatedPlans'] ?? [];
    if (plans.isEmpty) return null;
    // Return the most recent by createdAt if present, else last
    try {
      plans.sort((a, b) {
        final aT = a['createdAt'] ?? '';
        final bT = b['createdAt'] ?? '';
        return aT.toString().compareTo(bT.toString());
      });
    } catch (_) {}
    return Map<String, dynamic>.from(plans.last as Map<String, dynamic>);
  }

  Future<void> updateFriendSessionStart(String sessionId, bool started, {DateTime? startAt, Map<String,dynamic>? metadata}) async {
    try {
      final update = <String, dynamic>{'started': started};
      if (startAt != null) update['startAt'] = startAt.toIso8601String();
      if (metadata != null) update['metadata'] = metadata;
      if (started && startAt == null) update['startedAt'] = DateTime.now().toIso8601String();
      await FirebaseFirestore.instance.collection('friendSessions').doc(sessionId).update(update);
    } catch (e) {
      // ignore
    }
  }

  // Update arbitrary friend session fields (e.g., selectedWorkout, metadata)
  Future<void> updateFriendSession(String sessionId, Map<String, dynamic> update) async {
    try {
      await FirebaseFirestore.instance.collection('friendSessions').doc(sessionId).update(update);
    } catch (e) {
      // ignore errors silently for now
    }
  }

  // Stream a friend session document for realtime updates
  Stream<Map<String, dynamic>?> streamFriendSession(String sessionId) {
    final docRef = FirebaseFirestore.instance.collection('friendSessions').doc(sessionId);
    return docRef.snapshots().map((snap) {
      if (!snap.exists) return null;
      return {'id': snap.id, ...snap.data() as Map<String, dynamic>};
    });
  }

  Future<List<Map<String, dynamic>>> getPurchaseHistory() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      List<dynamic> purchases = data['purchases'] ?? [];
      return purchases.cast<Map<String, dynamic>>();
    }
    return [];
  }

  Future<void> updatePremiumStatus(bool hasPremium) async {
    if (uid != null) {
      return await userCollection.doc(uid).set({
        'hasPremium': hasPremium,
        'premiumUpdatedAt': DateTime.now().toIso8601String(),
      }, SetOptions(merge: true));
    }
  }

  // Customization Preferences Storage
  Future<void> saveCustomizationPreferences(Map<String, dynamic> preferences) async {
    if (uid != null) {
      return await userCollection.doc(uid).set({
        'customization': preferences,
        'customizationUpdatedAt': DateTime.now().toIso8601String(),
      }, SetOptions(merge: true));
    }
  }

  Future<Map<String, dynamic>> getCustomizationPreferences() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      return data['customization'] as Map<String, dynamic>? ?? {};
    }
    return {};
  }

  // Voice Assistant Data
  Future<void> saveVoiceCommand(String command, String response) async {
    if (uid != null) {
      final voiceData = {
        'command': command,
        'response': response,
        'timestamp': DateTime.now().toIso8601String(),
      };
      return await userCollection.doc(uid).set({
        'voiceHistory': FieldValue.arrayUnion([voiceData])
      }, SetOptions(merge: true));
    }
  }

  Future<List<Map<String, dynamic>>> getVoiceHistory() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      List<dynamic> history = data['voiceHistory'] ?? [];
      return history.cast<Map<String, dynamic>>();
    }
    return [];
  }

  // Music Integration Preferences
  Future<void> saveMusicPreferences(Map<String, dynamic> preferences) async {
    if (uid != null) {
      return await userCollection.doc(uid).set({
        'musicPreferences': preferences,
      }, SetOptions(merge: true));
    }
  }

  Future<Map<String, dynamic>> getMusicPreferences() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      return data['musicPreferences'] as Map<String, dynamic>? ?? {};
    }
    return {};
  }

  // Smart Reminders Preferences
  Future<void> saveReminderPreferences(Map<String, bool> preferences) async {
    if (uid != null) {
      return await userCollection.doc(uid).set({
        'reminderPreferences': preferences,
      }, SetOptions(merge: true));
    }
  }

  Future<Map<String, bool>> getReminderPreferences() async {
    if (uid != null) {
      DocumentSnapshot doc = await userCollection.doc(uid).get();
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
      Map<String, dynamic> prefs = data['reminderPreferences'] as Map<String, dynamic>? ?? {};
      return prefs.map((key, value) => MapEntry(key, value as bool));
    }
    return {};
  }

  // ---------------------------------
  // Referrals: Invite & Earn points
  // ---------------------------------
  // Ensures the current user has a referralCode set and returns it.
  // The code is a short uppercase token derived from uid to keep it simple.
  Future<String> ensureReferralCode() async {
    if (uid == null) return '';
    final docRef = userCollection.doc(uid);
    final snap = await docRef.get();
    final data = snap.data() as Map<String, dynamic>? ?? {};
    String? code = (data['referralCode'] as String?)?.trim();
    if (code != null && code.isNotEmpty) return code;

    // Generate a simple, mostly unique code from uid
    final base = uid!.replaceAll(RegExp(r'[^A-Za-z0-9]'), '');
    code = (base.length >= 8 ? base.substring(0, 8) : base).toUpperCase();
    if (code.isEmpty) {
      // Fallback random 8-char alnum
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      code = List.generate(8, (i) => chars[(DateTime.now().millisecondsSinceEpoch + i) % chars.length]).join();
    }
    await docRef.set({'referralCode': code}, SetOptions(merge: true));
    return code;
  }

  // Attempt to claim a referral using a referrer's code.
  // Awards points to both referrer and the current user exactly once per user.
  // Returns: true if applied, false if invalid or already claimed.
  Future<bool> claimReferralByCode(String code, {int rewardPoints = 100}) async {
    if (uid == null) return false;
    final trimmed = code.trim();
    if (trimmed.isEmpty) return false;

    // Load current user first to check if already referred
    final meRef = userCollection.doc(uid);
    final meSnap = await meRef.get();
    final meData = meSnap.data() as Map<String, dynamic>? ?? {};
    if ((meData['referredBy'] as String?)?.isNotEmpty == true) {
      return false; // already claimed
    }

    // Find referrer by referralCode
    final q = await userCollection.where('referralCode', isEqualTo: trimmed).limit(1).get();
    if (q.docs.isEmpty) return false;
    final refDoc = q.docs.first;
    final refUid = refDoc.id;
    if (refUid == uid) return false; // cannot refer self

    // Use a transaction to apply points atomically
    return await FirebaseFirestore.instance.runTransaction<bool>((txn) async {
      final meSnapshot = await txn.get(meRef);
      final me = meSnapshot.data() as Map<String, dynamic>? ?? {};
      if ((me['referredBy'] as String?)?.isNotEmpty == true) {
        return false; // idempotency
      }

      final refRef = userCollection.doc(refUid);
      final refSnapshot = await txn.get(refRef);
      if (!refSnapshot.exists) return false;
      final refData = refSnapshot.data() as Map<String, dynamic>? ?? {};

      final int mePoints = (me['points'] ?? 0) as int;
      final int refPoints = (refData['points'] ?? 0) as int;
      final int refCount = (refData['referralCount'] ?? 0) as int;

      txn.set(meRef, {
        'referredBy': refUid,
        'referralClaimedAt': DateTime.now().toIso8601String(),
        'points': mePoints + rewardPoints,
      }, SetOptions(merge: true));

      txn.set(refRef, {
        'points': refPoints + rewardPoints,
        'referralCount': refCount + 1,
        'referralHistory': FieldValue.arrayUnion([
          {
            'referee': uid,
            'code': trimmed,
            'reward': rewardPoints,
            'timestamp': DateTime.now().toIso8601String(),
          }
        ]),
      }, SetOptions(merge: true));

      return true;
    });
  }
}
