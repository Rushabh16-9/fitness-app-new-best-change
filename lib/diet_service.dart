import 'package:cloud_firestore/cloud_firestore.dart';

class DietService {
  final CollectionReference dietsCollection = FirebaseFirestore.instance.collection('diets');

  // Get all diets
  Future<List<Map<String, dynamic>>> getAllDiets() async {
    try {
      QuerySnapshot snapshot = await dietsCollection.get();
      return snapshot.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
    } catch (e) {
      print('Error getting diets: $e');
      return [];
    }
  }

  // Get diets by category
  Future<List<Map<String, dynamic>>> getDietsByCategory(String category) async {
    try {
      QuerySnapshot snapshot = await dietsCollection.where('category', isEqualTo: category).get();
      return snapshot.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
    } catch (e) {
      print('Error getting diets by category: $e');
      return [];
    }
  }

  // Get personalized diets based on user preferences
  Future<List<Map<String, dynamic>>> getPersonalizedDiets(String userId) async {
    // This would involve user profile data, for now return all
    return await getAllDiets();
  }

  // Add a new diet (admin function)
  Future<void> addDiet(Map<String, dynamic> dietData) async {
    try {
      await dietsCollection.add(dietData);
    } catch (e) {
      print('Error adding diet: $e');
    }
  }
}
