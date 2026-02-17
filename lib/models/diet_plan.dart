class DietPlan {
  final String id;
  final String name;
  final String description;
  final String category; // 'weight_loss', 'muscle_gain', 'maintenance', 'vegan', 'keto'
  final String dietaryType; // 'jain', 'veg', 'vegan', 'non_veg', 'pescatarian', 'all'
  final String region; // 'indian', 'mediterranean', 'asian', 'american', 'international'
  final int calories;
  final List<DayMeal> days;
  final List<String> tags;
  final String imageUrl;
  final String difficulty; // 'beginner', 'intermediate', 'advanced'
  final int duration; // in days
  final String cookingTime; // 'quick', 'moderate', 'extended'

  DietPlan({
    required this.id,
    required this.name,
    required this.description,
    required this.category,
    required this.dietaryType,
    required this.region,
    required this.calories,
    required this.days,
    required this.tags,
    required this.imageUrl,
    this.difficulty = 'beginner',
    this.duration = 7,
    this.cookingTime = 'moderate',
  });

  factory DietPlan.fromJson(Map<String, dynamic> json) {
    return DietPlan(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      dietaryType: json['dietaryType'] ?? 'all',
      region: json['region'] ?? 'international',
      calories: json['calories'] ?? 0,
      days: (json['days'] as List? ?? []).map((e) => DayMeal.fromJson(e)).toList(),
      tags: List<String>.from(json['tags'] ?? []),
      imageUrl: json['imageUrl'] ?? '',
      difficulty: json['difficulty'] ?? 'beginner',
      duration: json['duration'] ?? 7,
      cookingTime: json['cookingTime'] ?? 'moderate',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'category': category,
      'dietaryType': dietaryType,
      'region': region,
      'calories': calories,
      'days': days.map((e) => e.toJson()).toList(),
      'tags': tags,
      'imageUrl': imageUrl,
      'difficulty': difficulty,
      'duration': duration,
      'cookingTime': cookingTime,
    };
  }
}

class DayMeal {
  final int day;
  final List<Meal> meals;

  DayMeal({required this.day, required this.meals});

  factory DayMeal.fromJson(Map<String, dynamic> json) {
    return DayMeal(
      day: json['day'] ?? 1,
      meals: (json['meals'] as List? ?? []).map((e) => Meal.fromJson(e)).toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'day': day,
      'meals': meals.map((e) => e.toJson()).toList(),
    };
  }
}

class Meal {
  final String type; // 'breakfast', 'lunch', 'dinner', 'snack'
  final String name;
  final String description;
  final int calories;
  final Map<String, double> macros; // 'protein', 'carbs', 'fat'
  final List<String> ingredients;
  final String? imageUrl;
  final String? recipe;

  Meal({
    required this.type,
    required this.name,
    required this.description,
    required this.calories,
    required this.macros,
    required this.ingredients,
    this.imageUrl,
    this.recipe,
  });

  factory Meal.fromJson(Map<String, dynamic> json) {
    return Meal(
      type: json['type'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      calories: json['calories'] ?? 0,
      macros: Map<String, double>.from(json['macros'] ?? {}),
      ingredients: List<String>.from(json['ingredients'] ?? []),
      imageUrl: json['imageUrl'],
      recipe: json['recipe'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'name': name,
      'description': description,
      'calories': calories,
      'macros': macros,
      'ingredients': ingredients,
      'imageUrl': imageUrl,
      'recipe': recipe,
    };
  }
}