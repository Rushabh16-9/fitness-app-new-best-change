import 'package:cloud_firestore/cloud_firestore.dart';

class EquipmentService {
  final CollectionReference equipmentCollection = FirebaseFirestore.instance.collection('equipment');

  // Get all equipment
  Future<List<Map<String, dynamic>>> getAllEquipment() async {
    try {
      QuerySnapshot snapshot = await equipmentCollection.get();
      return snapshot.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
    } catch (e) {
      print('Error getting equipment: $e');
      return [];
    }
  }

  // Get equipment by muscle targeted
  Future<List<Map<String, dynamic>>> getEquipmentByMuscleTargeted(String muscleTargeted) async {
    try {
      QuerySnapshot snapshot = await equipmentCollection.where('muscleTargeted', isEqualTo: muscleTargeted).get();
      return snapshot.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
    } catch (e) {
      print('Error getting equipment by muscle targeted: $e');
      return [];
    }
  }

  // Get equipment by ID
  Future<Map<String, dynamic>?> getEquipmentById(String id) async {
    try {
      DocumentSnapshot doc = await equipmentCollection.doc(id).get();
      return doc.data() as Map<String, dynamic>?;
    } catch (e) {
      print('Error getting equipment by ID: $e');
      return null;
    }
  }

  // Add new equipment (for admin)
  Future<void> addEquipment(Map<String, dynamic> equipmentData) async {
    try {
      await equipmentCollection.add(equipmentData);
    } catch (e) {
      print('Error adding equipment: $e');
    }
  }

  // Update equipment
  Future<void> updateEquipment(String id, Map<String, dynamic> equipmentData) async {
    try {
      await equipmentCollection.doc(id).update(equipmentData);
    } catch (e) {
      print('Error updating equipment: $e');
    }
  }

  // Delete equipment
  Future<void> deleteEquipment(String id) async {
    try {
      await equipmentCollection.doc(id).delete();
    } catch (e) {
      print('Error deleting equipment: $e');
    }
  }
}
