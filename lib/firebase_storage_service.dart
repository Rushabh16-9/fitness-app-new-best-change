import 'dart:io';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:image_picker/image_picker.dart';

class FirebaseStorageService {
  final FirebaseStorage _storage = FirebaseStorage.instance;

  // Upload profile image
  Future<String?> uploadProfileImage(String userId, XFile imageFile) async {
    try {
      final ref = _storage.ref().child('profile_images/$userId.jpg');
      await ref.putFile(File(imageFile.path));
      return await ref.getDownloadURL();
    } catch (e) {
      print('Error uploading profile image: $e');
      return null;
    }
  }

  // Upload diet image
  Future<String?> uploadDietImage(String dietId, XFile imageFile) async {
    try {
      final ref = _storage.ref().child('diet_images/$dietId.jpg');
      await ref.putFile(File(imageFile.path));
      return await ref.getDownloadURL();
    } catch (e) {
      print('Error uploading diet image: $e');
      return null;
    }
  }

  // Upload exercise image
  Future<String?> uploadExerciseImage(String exerciseId, XFile imageFile) async {
    try {
      final ref = _storage.ref().child('exercise_images/$exerciseId.jpg');
      await ref.putFile(File(imageFile.path));
      return await ref.getDownloadURL();
    } catch (e) {
      print('Error uploading exercise image: $e');
      return null;
    }
  }

  // Upload equipment image
  Future<String?> uploadEquipmentImage(String equipmentId, XFile imageFile) async {
    try {
      final ref = _storage.ref().child('equipment_images/$equipmentId.jpg');
      await ref.putFile(File(imageFile.path));
      return await ref.getDownloadURL();
    } catch (e) {
      print('Error uploading equipment image: $e');
      return null;
    }
  }

  // Delete image
  Future<void> deleteImage(String imageUrl) async {
    try {
      final ref = _storage.refFromURL(imageUrl);
      await ref.delete();
    } catch (e) {
      print('Error deleting image: $e');
    }
  }
}
