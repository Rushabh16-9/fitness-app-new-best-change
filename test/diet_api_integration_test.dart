import 'package:flutter_test/flutter_test.dart';
import 'package:application_main/diet_api_service.dart';

void main() {
  group('DietApiService Integration Tests', () {
    late DietApiService dietApiService;

    setUp(() {
      // Use real service with local IP
      dietApiService = DietApiService(baseUrl: 'http://192.168.0.188:5001');
    });

    test('Get diet recommendations - real API', () async {
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
      expect(recommendations.length, greaterThan(0));
      expect(recommendations[0].patientId, isNotEmpty);
      expect(recommendations[0].age, isNotNull);
    });
  });
}
