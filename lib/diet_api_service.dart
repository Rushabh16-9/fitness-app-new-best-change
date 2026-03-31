import 'package:http/http.dart' as http;
import 'diet_model.dart';

class DietApiService {
  final String baseUrl;

  DietApiService({this.baseUrl = 'http://192.168.0.188:5001', http.Client? client});

  Future<List<DietRecommendation>> getDietRecommendations({
    required int age,
    required String gender,
    required double heightCm,
    required double weightKg,
    String activity = 'light',
    String goal = 'maintain',
    int mealsPerDay = 3,
    String? dietType,
    String? mealType,
    List<String> allergies = const [],
    List<String> dislikes = const [],
    List<String> includeKeywords = const [],
    List<String> excludeKeywords = const [],
    double? proteinTargetPerMeal,
    int topK = 5,
  }) async {
    // Return mock data instead of making HTTP request
    return _getMockDietRecommendations(
      age: age,
      gender: gender,
      heightCm: heightCm,
      weightKg: weightKg,
      activity: activity,
      goal: goal,
      mealsPerDay: mealsPerDay,
      dietType: dietType,
      mealType: mealType,
      allergies: allergies,
      dislikes: dislikes,
      includeKeywords: includeKeywords,
      excludeKeywords: excludeKeywords,
      proteinTargetPerMeal: proteinTargetPerMeal,
      topK: topK,
    );
  }

  List<DietRecommendation> _getMockDietRecommendations({
    required int age,
    required String gender,
    required double heightCm,
    required double weightKg,
    String activity = 'light',
    String goal = 'maintain',
    int mealsPerDay = 3,
    String? dietType,
    String? mealType,
    List<String> allergies = const [],
    List<String> dislikes = const [],
    List<String> includeKeywords = const [],
    List<String> excludeKeywords = const [],
    double? proteinTargetPerMeal,
    int topK = 5,
  }) {
    // Calculate BMI
    double bmi = weightKg / ((heightCm / 100) * (heightCm / 100));

    // Generate personalized recommendations based on user input
    List<DietRecommendation> recommendations = [];

    // Base recommendations
    String baseRecommendation = _generateBaseRecommendation(goal, dietType, allergies);

    // Create multiple recommendations
    for (int i = 0; i < topK; i++) {
      recommendations.add(DietRecommendation(
        patientId: 'MOCK_${i + 1}',
        age: age,
        gender: gender,
        weightKg: weightKg,
        heightCm: heightCm,
        bmi: bmi,
        diseaseType: 'None',
        severity: 'Low',
        physicalActivityLevel: activity,
        dailyCaloricIntake: _calculateDailyCalories(age, gender, heightCm, weightKg, activity, goal),
        cholesterolMgDl: 180.0,
        bloodPressureMmHg: 120,
        glucoseMgDl: 90.0,
        dietaryRestrictions: dietType ?? 'None',
        allergies: allergies.join(', '),
        preferredCuisine: 'Mixed',
        weeklyExerciseHours: activity == 'active' ? 7.0 : activity == 'moderate' ? 5.0 : 3.0,
        adherenceToDietPlan: 0.8,
        dietaryNutrientImbalanceScore: 0.2,
        dietRecommendation: '$baseRecommendation - Option ${i + 1}',
      ));
    }

    return recommendations;
  }

  String _generateBaseRecommendation(String goal, String? dietType, List<String> allergies) {
    String recommendation = '';

    // Goal-based recommendation
    switch (goal) {
      case 'lose':
        recommendation = 'Focus on calorie deficit with nutrient-dense foods. Include plenty of vegetables, lean proteins, and whole grains.';
        break;
      case 'gain':
        recommendation = 'Focus on calorie surplus with balanced macronutrients. Include healthy fats, complex carbs, and quality proteins.';
        break;
      case 'maintain':
        recommendation = 'Maintain balanced nutrition with appropriate portion sizes. Focus on whole foods and regular meal timing.';
        break;
      default:
        recommendation = 'Follow a balanced diet with variety of nutrients.';
    }

    // Diet type consideration
    if (dietType != null && dietType.isNotEmpty) {
      recommendation += ' Following $dietType dietary guidelines.';
    }

    // Allergy consideration
    if (allergies.isNotEmpty) {
      recommendation += ' Avoid: ${allergies.join(", ")}.';
    }

    return recommendation;
  }

  int _calculateDailyCalories(int age, String gender, double heightCm, double weightKg, String activity, String goal) {
    // Basic BMR calculation
    double bmr;
    if (gender.toLowerCase() == 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }

    // Activity multiplier
    double activityMultiplier;
    switch (activity) {
      case 'sedentary':
        activityMultiplier = 1.2;
        break;
      case 'light':
        activityMultiplier = 1.375;
        break;
      case 'moderate':
        activityMultiplier = 1.55;
        break;
      case 'active':
        activityMultiplier = 1.725;
        break;
      case 'very_active':
        activityMultiplier = 1.9;
        break;
      default:
        activityMultiplier = 1.375;
    }

    double maintenance = bmr * activityMultiplier;

    // Goal adjustment
    switch (goal) {
      case 'lose':
        return (maintenance - 500).round();
      case 'gain':
        return (maintenance + 300).round();
      default:
        return maintenance.round();
    }
  }
}
