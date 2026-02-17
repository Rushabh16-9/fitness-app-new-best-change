class DietRecommendation {
  final String patientId;
  final int age;
  final String gender;
  final double weightKg;
  final double heightCm;
  final double bmi;
  final String diseaseType;
  final String severity;
  final String physicalActivityLevel;
  final int dailyCaloricIntake;
  final double cholesterolMgDl;
  final int bloodPressureMmHg;
  final double glucoseMgDl;
  final String dietaryRestrictions;
  final String allergies;
  final String preferredCuisine;
  final double weeklyExerciseHours;
  final double adherenceToDietPlan;
  final double dietaryNutrientImbalanceScore;
  final String dietRecommendation;

  DietRecommendation({
    required this.patientId,
    required this.age,
    required this.gender,
    required this.weightKg,
    required this.heightCm,
    required this.bmi,
    required this.diseaseType,
    required this.severity,
    required this.physicalActivityLevel,
    required this.dailyCaloricIntake,
    required this.cholesterolMgDl,
    required this.bloodPressureMmHg,
    required this.glucoseMgDl,
    required this.dietaryRestrictions,
    required this.allergies,
    required this.preferredCuisine,
    required this.weeklyExerciseHours,
    required this.adherenceToDietPlan,
    required this.dietaryNutrientImbalanceScore,
    required this.dietRecommendation,
  });

  factory DietRecommendation.fromCsv(List<String> values) {
    return DietRecommendation(
      patientId: values[0],
      age: int.tryParse(values[1]) ?? 0,
      gender: values[2],
      weightKg: double.tryParse(values[3]) ?? 0.0,
      heightCm: double.tryParse(values[4]) ?? 0.0,
      bmi: double.tryParse(values[5]) ?? 0.0,
      diseaseType: values[6],
      severity: values[7],
      physicalActivityLevel: values[8],
      dailyCaloricIntake: int.tryParse(values[9]) ?? 0,
      cholesterolMgDl: double.tryParse(values[10]) ?? 0.0,
      bloodPressureMmHg: int.tryParse(values[11]) ?? 0,
      glucoseMgDl: double.tryParse(values[12]) ?? 0.0,
      dietaryRestrictions: values[13],
      allergies: values[14],
      preferredCuisine: values[15],
      weeklyExerciseHours: double.tryParse(values[16]) ?? 0.0,
      adherenceToDietPlan: double.tryParse(values[17]) ?? 0.0,
      dietaryNutrientImbalanceScore: double.tryParse(values[18]) ?? 0.0,
      dietRecommendation: values[19],
    );
  }

  factory DietRecommendation.fromJson(Map<String, dynamic> json) {
    return DietRecommendation(
      patientId: json['Patient_ID']?.toString() ?? '',
      age: json['Age'] is int ? json['Age'] : int.tryParse(json['Age']?.toString() ?? '0') ?? 0,
      gender: json['Gender']?.toString() ?? '',
      weightKg: json['Weight_kg'] is num ? json['Weight_kg'].toDouble() : double.tryParse(json['Weight_kg']?.toString() ?? '0.0') ?? 0.0,
      heightCm: json['Height_cm'] is num ? json['Height_cm'].toDouble() : double.tryParse(json['Height_cm']?.toString() ?? '0.0') ?? 0.0,
      bmi: json['BMI'] is num ? json['BMI'].toDouble() : double.tryParse(json['BMI']?.toString() ?? '0.0') ?? 0.0,
      diseaseType: json['Disease_Type']?.toString() ?? '',
      severity: json['Severity']?.toString() ?? '',
      physicalActivityLevel: json['Physical_Activity_Level']?.toString() ?? '',
      dailyCaloricIntake: json['Daily_Caloric_Intake'] is int ? json['Daily_Caloric_Intake'] : int.tryParse(json['Daily_Caloric_Intake']?.toString() ?? '0') ?? 0,
      cholesterolMgDl: json['Cholesterol_mg/dL'] is num ? json['Cholesterol_mg/dL'].toDouble() : double.tryParse(json['Cholesterol_mg/dL']?.toString() ?? '0.0') ?? 0.0,
      bloodPressureMmHg: json['Blood_Pressure_mmHg'] is int ? json['Blood_Pressure_mmHg'] : int.tryParse(json['Blood_Pressure_mmHg']?.toString() ?? '0') ?? 0,
      glucoseMgDl: json['Glucose_mg/dL'] is num ? json['Glucose_mg/dL'].toDouble() : double.tryParse(json['Glucose_mg/dL']?.toString() ?? '0.0') ?? 0.0,
      dietaryRestrictions: json['Dietary_Restrictions']?.toString() ?? '',
      allergies: json['Allergies']?.toString() ?? '',
      preferredCuisine: json['Preferred_Cuisine']?.toString() ?? '',
      weeklyExerciseHours: json['Weekly_Exercise_Hours'] is num ? json['Weekly_Exercise_Hours'].toDouble() : double.tryParse(json['Weekly_Exercise_Hours']?.toString() ?? '0.0') ?? 0.0,
      adherenceToDietPlan: json['Adherence_to_Diet_Plan'] is num ? json['Adherence_to_Diet_Plan'].toDouble() : double.tryParse(json['Adherence_to_Diet_Plan']?.toString() ?? '0.0') ?? 0.0,
      dietaryNutrientImbalanceScore: json['Dietary_Nutrient_Imbalance_Score'] is num ? json['Dietary_Nutrient_Imbalance_Score'].toDouble() : double.tryParse(json['Dietary_Nutrient_Imbalance_Score']?.toString() ?? '0.0') ?? 0.0,
      dietRecommendation: json['Diet_Recommendation']?.toString() ?? '',
    );
  }
}
