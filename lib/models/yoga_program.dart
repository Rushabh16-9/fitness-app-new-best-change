class YogaProgram {
  final String id;
  final String name;
  final String description;
  final String level; // 'beginner', 'intermediate', 'advanced'
  final int durationDays;
  final List<YogaDay> days;
  final String focus; // 'flexibility', 'strength', 'balance', 'relaxation'
  final String imageUrl;

  YogaProgram({
    required this.id,
    required this.name,
    required this.description,
    required this.level,
    required this.durationDays,
    required this.days,
    required this.focus,
    required this.imageUrl,
  });

  factory YogaProgram.fromJson(Map<String, dynamic> json) {
    return YogaProgram(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      level: json['level'] ?? 'beginner',
      durationDays: json['durationDays'] ?? 7,
      days: (json['days'] as List? ?? []).map((e) => YogaDay.fromJson(e)).toList(),
      focus: json['focus'] ?? 'flexibility',
      imageUrl: json['imageUrl'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'level': level,
      'durationDays': durationDays,
      'days': days.map((e) => e.toJson()).toList(),
      'focus': focus,
      'imageUrl': imageUrl,
    };
  }
}

class YogaDay {
  final int day;
  final String theme;
  final List<YogaPose> poses;
  final int estimatedMinutes;
  final String instructions;

  YogaDay({
    required this.day,
    required this.theme,
    required this.poses,
    required this.estimatedMinutes,
    required this.instructions,
  });

  factory YogaDay.fromJson(Map<String, dynamic> json) {
    return YogaDay(
      day: json['day'] ?? 1,
      theme: json['theme'] ?? '',
      poses: (json['poses'] as List? ?? []).map((e) => YogaPose.fromJson(e)).toList(),
      estimatedMinutes: json['estimatedMinutes'] ?? 30,
      instructions: json['instructions'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'day': day,
      'theme': theme,
      'poses': poses.map((e) => e.toJson()).toList(),
      'estimatedMinutes': estimatedMinutes,
      'instructions': instructions,
    };
  }
}

class YogaPose {
  final String name;
  final String sanskritName;
  final String description;
  final int holdSeconds;
  final int repetitions;
  final String difficulty;
  final List<String> benefits;
  final List<String> modifications;
  final String imageAsset;
  final String instructions;

  YogaPose({
    required this.name,
    required this.sanskritName,
    required this.description,
    required this.holdSeconds,
    required this.repetitions,
    required this.difficulty,
    required this.benefits,
    required this.modifications,
    required this.imageAsset,
    required this.instructions,
  });

  factory YogaPose.fromJson(Map<String, dynamic> json) {
    return YogaPose(
      name: json['name'] ?? '',
      sanskritName: json['sanskritName'] ?? '',
      description: json['description'] ?? '',
      holdSeconds: json['holdSeconds'] ?? 30,
      repetitions: json['repetitions'] ?? 1,
      difficulty: json['difficulty'] ?? 'beginner',
      benefits: List<String>.from(json['benefits'] ?? []),
      modifications: List<String>.from(json['modifications'] ?? []),
      imageAsset: json['imageAsset'] ?? '',
      instructions: json['instructions'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'sanskritName': sanskritName,
      'description': description,
      'holdSeconds': holdSeconds,
      'repetitions': repetitions,
      'difficulty': difficulty,
      'benefits': benefits,
      'modifications': modifications,
      'imageAsset': imageAsset,
      'instructions': instructions,
    };
  }
}