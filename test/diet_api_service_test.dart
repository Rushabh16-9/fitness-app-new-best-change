import 'package:flutter_test/flutter_test.dart';
import 'package:application_main/diet_api_service.dart';
import 'package:application_main/diet_model.dart';

void main() {
  group('DietApiService Tests', () {
    late DietApiService dietApiService;

    setUp(() {
      dietApiService = DietApiService();
    });

    test('Service instantiation', () {
      expect(dietApiService, isNotNull);
    });

    test('Get diet recommendations - success', () async {
      final recommendations = await dietApiService.getDietRecommendations(
        age: 25,
        gender: 'male',
        heightCm: 175.0,
        weightKg: 70.0,
        activity: 'moderate',
        goal: 'maintain',
        mealsPerDay: 3,
        topK: 5,
      );

      expect(recommendations, isNotNull);
      expect(recommendations.length, 5);
      expect(recommendations[0].patientId, 'MOCK_1');
      expect(recommendations[0].age, 25);
      expect(recommendations[0].gender, 'male');
      expect(recommendations[0].dailyCaloricIntake, 2594);
      expect(recommendations[0].dietRecommendation, contains('balanced'));
    });

    test('Get diet recommendations - with optional parameters', () async {
      final recommendations = await dietApiService.getDietRecommendations(
        age: 25,
        gender: 'male',
        heightCm: 175.0,
        weightKg: 70.0,
        activity: 'moderate',
        goal: 'maintain',
        mealsPerDay: 3,
        dietType: 'vegetarian',
        mealType: 'lunch',
        allergies: ['peanuts'],
        dislikes: ['spinach'],
        includeKeywords: ['healthy'],
        excludeKeywords: ['sugar'],
        proteinTargetPerMeal: 25.0,
        topK: 5,
      );

      expect(recommendations, isNotNull);
      expect(recommendations.length, 5);
    });


  });

  group('DietRecommendation Model Tests', () {
    test('fromJson - valid data', () {
      final json = {
        "Patient_ID": "P001",
        "Age": 25,
        "Gender": "male",
        "Weight_kg": 70.0,
        "Height_cm": 175.0,
        "BMI": 22.9,
        "Disease_Type": "None",
        "Severity": "None",
        "Physical_Activity_Level": "moderate",
        "Daily_Caloric_Intake": 2200,
        "Cholesterol_mg/dL": 180.0,
        "Blood_Pressure_mmHg": 120,
        "Glucose_mg/dL": 90.0,
        "Dietary_Restrictions": "None",
        "Allergies": "None",
        "Preferred_Cuisine": "Mediterranean",
        "Weekly_Exercise_Hours": 5.0,
        "Adherence_to_Diet_Plan": 85.0,
        "Dietary_Nutrient_Imbalance_Score": 2.1,
        "Diet_Recommendation": "Focus on balanced Mediterranean diet..."
      };

      final recommendation = DietRecommendation.fromJson(json);

      expect(recommendation.patientId, 'P001');
      expect(recommendation.age, 25);
      expect(recommendation.gender, 'male');
      expect(recommendation.weightKg, 70.0);
      expect(recommendation.heightCm, 175.0);
      expect(recommendation.bmi, 22.9);
      expect(recommendation.dailyCaloricIntake, 2200);
      expect(recommendation.dietRecommendation, contains('Mediterranean'));
    });

    test('fromJson - missing required fields', () {
      final json = {
        "Patient_ID": "P001",
        // Missing other required fields - model provides defaults
      };

      final recommendation = DietRecommendation.fromJson(json);

      expect(recommendation.patientId, 'P001');
      expect(recommendation.age, 0); // Default value
      expect(recommendation.gender, ''); // Default value
    });

    test('fromJson - null values handling', () {
      final json = {
        "Patient_ID": "P001",
        "Age": null,
        "Gender": null,
        "Weight_kg": null,
        "Height_cm": null,
        "BMI": null,
        "Disease_Type": null,
        "Severity": null,
        "Physical_Activity_Level": null,
        "Daily_Caloric_Intake": null,
        "Cholesterol_mg/dL": null,
        "Blood_Pressure_mmHg": null,
        "Glucose_mg/dL": null,
        "Dietary_Restrictions": null,
        "Allergies": null,
        "Preferred_Cuisine": null,
        "Weekly_Exercise_Hours": null,
        "Adherence_to_Diet_Plan": null,
        "Dietary_Nutrient_Imbalance_Score": null,
        "Diet_Recommendation": null
      };

      final recommendation = DietRecommendation.fromJson(json);

      expect(recommendation.patientId, 'P001');
      expect(recommendation.age, 0); // Default for null
      expect(recommendation.dietRecommendation, ''); // Default for null
    });
  });
}
