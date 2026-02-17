import 'package:flutter/material.dart';
import 'diet_model.dart';
import 'diet_api_service.dart';

class DietRecommendationPage extends StatefulWidget {
  const DietRecommendationPage({super.key});

  @override
  _DietRecommendationPageState createState() => _DietRecommendationPageState();
}

class _DietRecommendationPageState extends State<DietRecommendationPage> {
  final DietApiService _dietApiService = DietApiService();

  final _formKey = GlobalKey<FormState>();

  // User input fields based on Python API requirements
  int? _age;
  String? _gender;
  double? _heightCm;
  double? _weightKg;
  String? _activity;
  String? _goal;
  int? _mealsPerDay;
  String? _dietType;
  String? _mealType;
  final List<String> _allergies = [];
  final List<String> _dislikes = [];
  final List<String> _includeKeywords = [];
  final List<String> _excludeKeywords = [];
  double? _proteinTargetPerMeal;
  int? _topK;

  // Controllers
  final TextEditingController _ageController = TextEditingController();
  final TextEditingController _heightController = TextEditingController();
  final TextEditingController _weightController = TextEditingController();
  final TextEditingController _mealsController = TextEditingController();
  final TextEditingController _proteinController = TextEditingController();
  final TextEditingController _topKController = TextEditingController();

  List<DietRecommendation> _results = [];
  bool _isSearching = false;
  String? _errorMessage;

  // Dropdown options
  final List<String> _genders = ['Male', 'Female'];
  final List<String> _activities = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
  final List<String> _goals = ['maintain', 'lose', 'gain'];
  final List<String> _dietTypes = ['None', 'vegetarian', 'vegan', 'keto', 'paleo'];
  final List<String> _mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  @override
  void initState() {
    super.initState();
    // Set default values
    _mealsPerDay = 3;
    _topK = 5;
    _activity = 'light';
    _goal = 'maintain';
    _mealsController.text = '3';
    _topKController.text = '5';
  }

  Future<void> _saveRecommendations(List<DietRecommendation> recommendations) async {
    // TODO: Implement saving recommendations to database
    print('Saving ${recommendations.length} recommendations to database');
  }

  void _searchRecommendations() async {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();

      print('Starting diet recommendation search...');
      print('Parameters: age=$_age, gender=$_gender, heightCm=$_heightCm, weightKg=$_weightKg');

      setState(() {
        _isSearching = true;
        _errorMessage = null;
      });

      try {
        print('Making API call to diet service...');
        List<DietRecommendation> results = await _dietApiService.getDietRecommendations(
          age: _age!,
          gender: _gender!,
          heightCm: _heightCm!,
          weightKg: _weightKg!,
          activity: _activity!,
          goal: _goal!,
          mealsPerDay: _mealsPerDay!,
          dietType: _dietType,
          mealType: _mealType,
          allergies: _allergies,
          dislikes: _dislikes,
          includeKeywords: _includeKeywords,
          excludeKeywords: _excludeKeywords,
          proteinTargetPerMeal: _proteinTargetPerMeal,
          topK: _topK!,
        );

        print('API call successful. Received ${results.length} recommendations');
        if (results.isNotEmpty) {
          print('First recommendation: ${results[0].dietRecommendation}');
        }

        setState(() {
          _results = results;
          _isSearching = false;
        });

        // Save recommendations to database
        await _saveRecommendations(results);
      } catch (e, stackTrace) {
        print('Error getting diet recommendations: $e');
        print('Stack trace: $stackTrace');
        setState(() {
          _errorMessage = 'Failed to get recommendations: $e';
          _isSearching = false;
        });
      }
    }
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    required FormFieldSetter<String> onSaved,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(labelText: label),
      keyboardType: keyboardType,
      onSaved: onSaved,
      validator: validator,
      style: const TextStyle(color: Colors.white),
    );
  }

  Widget _buildDropdown({
    required String label,
    required String? value,
    required List<String> items,
    required FormFieldSetter<String?> onSaved,
    required ValueChanged<String?> onChanged,
  }) {
    return DropdownButtonFormField<String>(
      initialValue: value,
      decoration: InputDecoration(labelText: label),
      items: items.map((item) => DropdownMenuItem(value: item, child: Text(item))).toList(),
      onChanged: onChanged,
      onSaved: onSaved,
      style: const TextStyle(color: Colors.white),
      dropdownColor: Colors.grey[800],
      validator: (val) => val == null || val.isEmpty ? 'Please select $label' : null,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Diet Recommendations'),
        backgroundColor: Colors.red,
      ),
      backgroundColor: Colors.black,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Form(
              key: _formKey,
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: _buildTextField(
                          label: 'Age',
                          controller: _ageController,
                          keyboardType: TextInputType.number,
                          onSaved: (val) => _age = int.tryParse(val ?? ''),
                          validator: (val) {
                            if (val == null || val.isEmpty) return 'Required';
                            if (int.tryParse(val) == null) return 'Invalid number';
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _buildDropdown(
                          label: 'Gender',
                          value: _gender,
                          items: _genders,
                          onSaved: (val) => _gender = val,
                          onChanged: (val) => setState(() => _gender = val),
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: _buildTextField(
                          label: 'Height (cm)',
                          controller: _heightController,
                          keyboardType: TextInputType.number,
                          onSaved: (val) => _heightCm = double.tryParse(val ?? ''),
                          validator: (val) {
                            if (val == null || val.isEmpty) return 'Required';
                            if (double.tryParse(val) == null) return 'Invalid number';
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _buildTextField(
                          label: 'Weight (kg)',
                          controller: _weightController,
                          keyboardType: TextInputType.number,
                          onSaved: (val) => _weightKg = double.tryParse(val ?? ''),
                          validator: (val) {
                            if (val == null || val.isEmpty) return 'Required';
                            if (double.tryParse(val) == null) return 'Invalid number';
                            return null;
                          },
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: _buildDropdown(
                          label: 'Activity Level',
                          value: _activity,
                          items: _activities,
                          onSaved: (val) => _activity = val,
                          onChanged: (val) => setState(() => _activity = val),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _buildDropdown(
                          label: 'Goal',
                          value: _goal,
                          items: _goals,
                          onSaved: (val) => _goal = val,
                          onChanged: (val) => setState(() => _goal = val),
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: _buildTextField(
                          label: 'Meals/Day',
                          controller: _mealsController,
                          keyboardType: TextInputType.number,
                          onSaved: (val) => _mealsPerDay = int.tryParse(val ?? '3'),
                          validator: (val) {
                            if (val == null || val.isEmpty) return 'Required';
                            if (int.tryParse(val) == null) return 'Invalid number';
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _buildTextField(
                          label: 'Top Results',
                          controller: _topKController,
                          keyboardType: TextInputType.number,
                          onSaved: (val) => _topK = int.tryParse(val ?? '5'),
                          validator: (val) {
                            if (val == null || val.isEmpty) return 'Required';
                            if (int.tryParse(val) == null) return 'Invalid number';
                            return null;
                          },
                        ),
                      ),
                    ],
                  ),
                  _buildDropdown(
                    label: 'Diet Type (Optional)',
                    value: _dietType,
                    items: _dietTypes,
                    onSaved: (val) => _dietType = val,
                    onChanged: (val) => setState(() => _dietType = val),
                  ),
                  _buildDropdown(
                    label: 'Meal Type (Optional)',
                    value: _mealType,
                    items: _mealTypes,
                    onSaved: (val) => _mealType = val,
                    onChanged: (val) => setState(() => _mealType = val),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _isSearching ? null : _searchRecommendations,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      minimumSize: const Size(double.infinity, 50),
                    ),
                    child: _isSearching
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text('Get AI Recommendations'),
                  ),
                ],
              ),
            ),
            if (_errorMessage != null)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Text(
                  _errorMessage!,
                  style: const TextStyle(color: Colors.red),
                ),
              ),
            const SizedBox(height: 24),
            _results.isEmpty && !_isSearching
                ? const Text(
                    'Fill the form and get personalized AI diet recommendations',
                    style: TextStyle(color: Colors.white70),
                  )
                : ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _results.length,
                    itemBuilder: (context, index) {
                      final rec = _results[index];
                      return Card(
                        color: Colors.grey[900],
                        margin: const EdgeInsets.symmetric(vertical: 8),
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Daily Caloric Intake: ${rec.dailyCaloricIntake}',
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                              ),
                              Text(
                                'Cholesterol: ${rec.cholesterolMgDl} mg/dL',
                                style: const TextStyle(color: Colors.white70),
                              ),
                              Text(
                                'Blood Pressure: ${rec.bloodPressureMmHg} mmHg',
                                style: const TextStyle(color: Colors.white70),
                              ),
                              Text(
                                'Glucose: ${rec.glucoseMgDl} mg/dL',
                                style: const TextStyle(color: Colors.white70),
                              ),
                              Text(
                                'Weekly Exercise Hours: ${rec.weeklyExerciseHours}',
                                style: const TextStyle(color: Colors.white70),
                              ),
                              Text(
                                'Adherence to Diet Plan: ${rec.adherenceToDietPlan}%',
                                style: const TextStyle(color: Colors.white70),
                              ),
                              Text(
                                'Nutrient Imbalance Score: ${rec.dietaryNutrientImbalanceScore}',
                                style: const TextStyle(color: Colors.white70),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'AI Diet Recommendation:',
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                              ),
                              Text(
                                rec.dietRecommendation,
                                style: const TextStyle(color: Colors.white70),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _ageController.dispose();
    _heightController.dispose();
    _weightController.dispose();
    _mealsController.dispose();
    _proteinController.dispose();
    _topKController.dispose();
    super.dispose();
  }
}
