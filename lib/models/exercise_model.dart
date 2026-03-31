import '../asset_resolver.dart';

class Exercise {
  final String id;
  final String name;
  final String gifUrl;
  final List<String> targetMuscles;
  final List<String> bodyParts;
  final List<String> equipments;
  final List<String> secondaryMuscles;
  final List<String> instructions;
  
  Exercise({
    required this.id,
    required this.name,
    required this.gifUrl,
    required this.targetMuscles,
    required this.bodyParts,
    required this.equipments,
    required this.secondaryMuscles,
    required this.instructions,
  });
  
  factory Exercise.fromJson(Map<String, dynamic> json) {
    return Exercise(
      id: json['id'] ?? json['exerciseId'] ?? '',
      name: json['name'] ?? '',
      gifUrl: json['gifUrl'] ?? '',
      targetMuscles: List<String>.from(json['primaryMuscles'] ?? json['targetMuscles'] ?? []),
      bodyParts: List<String>.from(json['bodyParts'] ?? []),
      equipments: List<String>.from(json['equipment'] != null ? [json['equipment']] : json['equipments'] ?? []),
      secondaryMuscles: List<String>.from(json['secondaryMuscles'] ?? []),
      instructions: List<String>.from(json['instructions'] ?? []),
    );
  }
  
  // Legacy GIF path (kept for backward compatibility), but prefer localBestAsset for display
  String get localGifPath => 'assets/data/free-exercise-db-main/exercises/$id.gif';

  // Best-effort local asset (prefers new free-exercise-db images; falls back to legacy GIF)
  String get localBestAsset {
    // Ensure AssetResolver is initialized somewhere early (e.g., page init)
    final String nameSlug = _slugify(name);
    
    // First try: direct folder path matching the ID from the JSON
    final List<String> candidates = [
      'assets/data/free-exercise-db-main/exercises/$id/0.jpg',
      'assets/data/free-exercise-db-main/exercises/$id/0.png',
      'assets/data/free-exercise-db-main/exercises/$id/0.gif',
      'assets/data/free-exercise-db-main/exercises/$id/1.jpg',
      'assets/data/free-exercise-db-main/exercises/$id/1.png',
      'assets/data/free-exercise-db-main/exercises/$id/1.gif',
    ];
    for (final p in candidates) {
      if (AssetResolver.exists(p)) return p;
    }
    
    // Heuristic search: look for any asset under exercises/ matching id or name slug
    final exts = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    final all = AssetResolver.list(prefix: 'assets/data/free-exercise-db-main/exercises/', extensions: exts);
    if (all.isNotEmpty) {
      final lowerId = id.toLowerCase();
      final lowerSlug = nameSlug.toLowerCase();
      
      // Prefer exact-folder matches first (e.g., /3_4_Sit-Up/)
      final byFolder = all.firstWhere(
        (p) => p.toLowerCase().contains('/$lowerId/'),
        orElse: () => '',
      );
      if (byFolder.isNotEmpty) return byFolder;

      // Try slug-based folder match
      final bySlugFolder = all.firstWhere(
        (p) => p.toLowerCase().contains('/$lowerSlug/'),
        orElse: () => '',
      );
      if (bySlugFolder.isNotEmpty) return bySlugFolder;

      // Then filenames containing id or slug
      final byName = all.firstWhere(
        (p) {
          final lp = p.toLowerCase();
          final file = lp.substring(lp.lastIndexOf('/') + 1);
          return file.contains(lowerId) || file.contains(lowerSlug);
        },
        orElse: () => '',
      );
      if (byName.isNotEmpty) return byName;
    }

    // Final fallback: if gifUrl points to a known media filename we bundle offline, use it
    if (gifUrl.isNotEmpty) {
      try {
        final uri = Uri.parse(gifUrl);
        final file = uri.pathSegments.isNotEmpty ? uri.pathSegments.last : '';
        if (file.isNotEmpty) {
          final legacy = 'assets/data/exercise vidio/exercisedb-api-main/media/$file';
          if (AssetResolver.exists(legacy)) return legacy;
        }
      } catch (_) {}
    }

    return '';
  }

  String _slugify(String input) {
    return input
        .toLowerCase()
        .replaceAll(RegExp(r"[^a-z0-9]+"), '_')
        .replaceAll(RegExp(r"_+"), '_')
        .replaceAll(RegExp(r"^_|_$"), '');
  }
  
  String get displayName {
    return name.split(' ').map((word) => 
      word.isNotEmpty ? word[0].toUpperCase() + word.substring(1) : ''
    ).join(' ');
  }
  
  String get equipment => equipments.isNotEmpty ? equipments[0] : 'body weight';
  String get primaryMuscle => targetMuscles.isNotEmpty ? targetMuscles[0] : '';
  String get bodyPart => bodyParts.isNotEmpty ? bodyParts[0] : '';
  
  // Difficulty estimation based on equipment and complexity
  String get difficulty {
    if (equipments.contains('body weight')) {
      if (name.contains('planche') || name.contains('archer') || name.contains('full')) {
        return 'advanced';
      }
      return 'beginner';
    } else if (equipments.contains('dumbbell') || equipments.contains('kettlebell')) {
      return 'intermediate';
    } else if (equipments.contains('barbell') || equipments.contains('cable') || 
               equipments.contains('leverage machine')) {
      return 'advanced';
    }
    return 'intermediate';
  }
  
  // Intensity estimation for mood matching
  String get intensity {
    if (name.contains('stretch') || name.contains('yoga') || name.contains('cobra') ||
        name.contains('bridge') && equipments.contains('body weight')) {
      return 'low';
    } else if (name.contains('burpee') || name.contains('jump') || name.contains('sprint') ||
               name.contains('jack') || name.contains('hiit')) {
      return 'high';
    }
    return 'moderate';
  }
}

class WorkoutPlan {
  final String title;
  final String description;
  final List<Exercise> exercises;
  final int estimatedDuration; // in minutes
  final String level;
  final List<String> benefits;
  
  WorkoutPlan({
    required this.title,
    required this.description,
    required this.exercises,
    required this.estimatedDuration,
    required this.level,
    required this.benefits,
  });
  
  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'description': description,
      'exercises': exercises.map((e) => {
        'name': e.displayName,
        'duration': 30, // default 30 seconds per exercise
  'image': e.localBestAsset,
        'instructions': e.instructions,
        'targetMuscles': e.targetMuscles,
        'equipment': e.equipment,
      }).toList(),
      'duration': estimatedDuration,
      'level': level,
      'benefits': benefits,
    };
  }
}
