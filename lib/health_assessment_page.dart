import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'database_service.dart';
import 'yoga_exercises_page.dart';

class HealthAssessmentPage extends StatefulWidget {
  const HealthAssessmentPage({super.key});

  @override
  State<HealthAssessmentPage> createState() => _HealthAssessmentPageState();
}

class _HealthAssessmentPageState extends State<HealthAssessmentPage> {
  final DatabaseService _databaseService = DatabaseService(uid: FirebaseAuth.instance.currentUser?.uid);
  final TextEditingController _ageController = TextEditingController();
  final TextEditingController _otherConditionsController = TextEditingController();

  List<String> selectedConditions = [];
  String selectedFitnessLevel = 'Beginner';
  String selectedGoal = 'General Health';

  final List<String> healthConditions = [
    'Back Pain',
    'Neck Pain',
    'Shoulder Pain',
    'Knee Pain',
    'Hip Pain',
    'Arthritis',
    'High Blood Pressure',
    'Diabetes',
    'Asthma',
    'Anxiety',
    'Depression',
    'Insomnia',
    'Digestive Issues',
    'Thyroid Problems',
    'Pregnancy',
    'Postpartum',
    'Menopause',
    'PCOS',
    'Sports Injury',
    'Chronic Fatigue',
    'Fibromyalgia',
    'Migraine',
    'Stress',
    'Weight Management',
    'Flexibility Issues',
    'Balance Problems',
    'Joint Pain',
    'Muscle Tension',
    'Poor Posture'
  ];

  final List<String> fitnessLevels = [
    'Beginner',
    'Intermediate',
    'Advanced'
  ];

  final List<String> goals = [
    'General Health',
    'Weight Loss',
    'Muscle Building',
    'Flexibility',
    'Stress Relief',
    'Better Sleep',
    'Pain Management',
    'Sports Performance',
    'Rehabilitation'
  ];

  @override
  void initState() {
    super.initState();
    _loadExistingAssessment();
  }

  Future<void> _loadExistingAssessment() async {
    final assessment = await _databaseService.getHealthAssessment();
    if (assessment != null) {
      setState(() {
        selectedConditions = List<String>.from(assessment['conditions'] ?? []);
        selectedFitnessLevel = assessment['fitnessLevel'] ?? 'Beginner';
        selectedGoal = assessment['goal'] ?? 'General Health';
        _ageController.text = assessment['age']?.toString() ?? '';
        _otherConditionsController.text = assessment['otherConditions'] ?? '';
      });
    }
  }

  Future<void> _saveAssessment() async {
    final assessment = {
      'conditions': selectedConditions,
      'fitnessLevel': selectedFitnessLevel,
      'goal': selectedGoal,
      'age': int.tryParse(_ageController.text) ?? 0,
      'otherConditions': _otherConditionsController.text,
      'assessmentDate': DateTime.now().toIso8601String(),
    };

    await _databaseService.saveHealthAssessment(assessment);

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Health assessment saved successfully!')),
    );

    // Navigate to yoga exercises page after saving
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const YogaExercisesPage()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Health Assessment'),
        backgroundColor: Colors.black,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            const Text(
              'Tell us about your health',
              style: TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'This helps us create personalized yoga recommendations for you.',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 24),

            // Age
            const Text(
              'Age',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _ageController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Enter your age',
                hintStyle: const TextStyle(color: Colors.white70),
                filled: true,
                fillColor: Colors.grey[900],
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 24),

            // Fitness Level
            const Text(
              'Fitness Level',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.grey[900],
                borderRadius: BorderRadius.circular(12),
              ),
              child: DropdownButton<String>(
                value: selectedFitnessLevel,
                dropdownColor: Colors.grey[900],
                style: const TextStyle(color: Colors.white),
                isExpanded: true,
                underline: const SizedBox(),
                items: fitnessLevels.map((level) {
                  return DropdownMenuItem(
                    value: level,
                    child: Text(level),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    selectedFitnessLevel = value!;
                  });
                },
              ),
            ),
            const SizedBox(height: 24),

            // Goal
            const Text(
              'Primary Goal',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.grey[900],
                borderRadius: BorderRadius.circular(12),
              ),
              child: DropdownButton<String>(
                value: selectedGoal,
                dropdownColor: Colors.grey[900],
                style: const TextStyle(color: Colors.white),
                isExpanded: true,
                underline: const SizedBox(),
                items: goals.map((goal) {
                  return DropdownMenuItem(
                    value: goal,
                    child: Text(goal),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    selectedGoal = value!;
                  });
                },
              ),
            ),
            const SizedBox(height: 24),

            // Health Conditions
            const Text(
              'Health Conditions (Select all that apply)',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: healthConditions.map((condition) {
                final isSelected = selectedConditions.contains(condition);
                return FilterChip(
                  label: Text(condition),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() {
                      if (selected) {
                        selectedConditions.add(condition);
                      } else {
                        selectedConditions.remove(condition);
                      }
                    });
                  },
                  backgroundColor: Colors.grey[800],
                  selectedColor: Colors.red,
                  checkmarkColor: Colors.white,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : Colors.white70,
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),

            // Other Conditions
            const Text(
              'Other Conditions or Notes',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _otherConditionsController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Any other health conditions or special notes...',
                hintStyle: const TextStyle(color: Colors.white70),
                filled: true,
                fillColor: Colors.grey[900],
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 32),

            // Save Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _saveAssessment,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Save Assessment',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
