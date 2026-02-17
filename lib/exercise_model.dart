class Exercise {
  final String id;
  final String name;
  final String force;
  final String level;
  final String mechanic;
  final String equipment;
  final String category;
  final List<String> primaryMuscles;
  final List<String> secondaryMuscles;
  final List<String> instructions;
  final List<String> images;
  // Resolved asset path for the primary image (if found in AssetManifest)
  final String? assetImage;

  Exercise({
    required this.id,
    required this.name,
    required this.force,
    required this.level,
    required this.mechanic,
    required this.equipment,
    required this.category,
    required this.primaryMuscles,
    required this.secondaryMuscles,
    required this.instructions,
    required this.images,
    this.assetImage,
  });

  factory Exercise.fromJson(Map<String, dynamic> json, String id) {
    return Exercise(
      id: id, // We pass the filename as the ID
      name: json['name'] ?? 'No Name',
      force: json['force'] ?? 'N/A',
      level: json['level'] ?? 'N/A',
      mechanic: json['mechanic'] ?? 'N/A',
      equipment: json['equipment'] ?? 'N/A',
      category: json['category'] ?? 'N/A',
      primaryMuscles: List<String>.from(json['primaryMuscles'] ?? []),
      secondaryMuscles: List<String>.from(json['secondaryMuscles'] ?? []),
      instructions: List<String>.from(json['instructions'] ?? []),
      images: List<String>.from(json['images'] ?? []),
      assetImage: null,
    );
  }

  Exercise copyWith({String? assetImage}) {
    return Exercise(
      id: id,
      name: name,
      force: force,
      level: level,
      mechanic: mechanic,
      equipment: equipment,
      category: category,
      primaryMuscles: primaryMuscles,
      secondaryMuscles: secondaryMuscles,
      instructions: instructions,
      images: images,
      assetImage: assetImage ?? this.assetImage,
    );
  }

  // A helper method to get the path for the first image
  String get imagePath {
    if (images.isEmpty) return 'assets/abs.png'; // Use a local placeholder
    String img = images[0];
    // Convert nested path to flat structure: "ExerciseName/0.jpg" -> "ExerciseName_0.jpg"
    String flatPath = img.replaceAll('/', '_');
    return 'assets/data/exercise_images/$flatPath';
  }
}
