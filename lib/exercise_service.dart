import 'package:cloud_firestore/cloud_firestore.dart';

class ExerciseService {
  final CollectionReference exercisesCollection = FirebaseFirestore.instance.collection('exercises');

  // Get all exercises
  Future<List<Map<String, dynamic>>> getAllExercises() async {
    try {
      QuerySnapshot snapshot = await exercisesCollection.get();
      return snapshot.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
    } catch (e) {
      print('Error getting exercises: $e');
      return [];
    }
  }

  // Get exercises by muscle group
  Future<List<Map<String, dynamic>>> getExercisesByMuscleGroup(String muscleGroup) async {
    try {
      QuerySnapshot snapshot = await exercisesCollection.where('muscleGroup', isEqualTo: muscleGroup).get();
      return snapshot.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
    } catch (e) {
      print('Error getting exercises by muscle group: $e');
      return [];
    }
  }

  // Get exercises by equipment
  Future<List<Map<String, dynamic>>> getExercisesByEquipment(String equipment) async {
    try {
      QuerySnapshot snapshot = await exercisesCollection.where('equipment', isEqualTo: equipment).get();
      return snapshot.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
    } catch (e) {
      print('Error getting exercises by equipment: $e');
      return [];
    }
  }

  // Get exercises by difficulty
  Future<List<Map<String, dynamic>>> getExercisesByDifficulty(String difficulty) async {
    try {
      QuerySnapshot snapshot = await exercisesCollection.where('difficulty', isEqualTo: difficulty).get();
      return snapshot.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
    } catch (e) {
      print('Error getting exercises by difficulty: $e');
      return [];
    }
  }

  // Add a new exercise (admin function)
  Future<void> addExercise(Map<String, dynamic> exerciseData) async {
    try {
      await exercisesCollection.add(exerciseData);
    } catch (e) {
      print('Error adding exercise: $e');
    }
  }

  // Get exercise by ID
  Future<Map<String, dynamic>?> getExerciseById(String exerciseId) async {
    try {
      DocumentSnapshot doc = await exercisesCollection.doc(exerciseId).get();
      return doc.data() as Map<String, dynamic>?;
    } catch (e) {
      print('Error getting exercise by ID: $e');
      return null;
    }
  }
}
