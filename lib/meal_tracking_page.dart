import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'constants.dart';
import 'database_service.dart';
import 'barcode_scanner_page.dart';

class MealTrackingPage extends StatefulWidget {
  const MealTrackingPage({super.key});

  @override
  State<MealTrackingPage> createState() => _MealTrackingPageState();
}

class _MealTrackingPageState extends State<MealTrackingPage> {
  final TextEditingController _foodController = TextEditingController();
  final TextEditingController _caloriesController = TextEditingController();
  final TextEditingController _proteinController = TextEditingController();
  final TextEditingController _carbsController = TextEditingController();
  final TextEditingController _fatController = TextEditingController();

  DateTime _selectedDate = DateTime.now();
  String _selectedMealType = 'Breakfast';
  List<Map<String, dynamic>> _todayMeals = [];
  Map<String, double> _dailyTotals = {
    'calories': 0.0,
    'protein': 0.0,
    'carbs': 0.0,
    'fat': 0.0,
  };

  final List<String> _mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  @override
  void initState() {
    super.initState();
    _loadTodayMeals();
  }

  Future<void> _loadTodayMeals() async {
    final databaseService = Provider.of<DatabaseService>(context, listen: false);
    final dateKey = DateFormat('yyyy-MM-dd').format(_selectedDate);

    try {
      final userProfile = await databaseService.getUserProfile();
      final meals = userProfile['meals'] ?? {};
      final dayMeals = meals[dateKey] ?? [];

      setState(() {
        _todayMeals = List<Map<String, dynamic>>.from(dayMeals);
        _calculateDailyTotals();
      });
    } catch (e) {
      print('Error loading meals: $e');
    }
  }

  void _calculateDailyTotals() {
    double totalCalories = 0.0;
    double totalProtein = 0.0;
    double totalCarbs = 0.0;
    double totalFat = 0.0;

    for (var meal in _todayMeals) {
      totalCalories += (meal['calories'] ?? 0.0);
      totalProtein += (meal['protein'] ?? 0.0);
      totalCarbs += (meal['carbs'] ?? 0.0);
      totalFat += (meal['fat'] ?? 0.0);
    }

    setState(() {
      _dailyTotals = {
        'calories': totalCalories,
        'protein': totalProtein,
        'carbs': totalCarbs,
        'fat': totalFat,
      };
    });
  }

  Future<void> _addMeal() async {
    if (_foodController.text.isEmpty || _caloriesController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter food name and calories')),
      );
      return;
    }

    final meal = {
      'name': _foodController.text,
      'mealType': _selectedMealType,
      'calories': double.tryParse(_caloriesController.text) ?? 0.0,
      'protein': double.tryParse(_proteinController.text) ?? 0.0,
      'carbs': double.tryParse(_carbsController.text) ?? 0.0,
      'fat': double.tryParse(_fatController.text) ?? 0.0,
      'timestamp': DateTime.now().toIso8601String(),
    };

    final databaseService = Provider.of<DatabaseService>(context, listen: false);
    final dateKey = DateFormat('yyyy-MM-dd').format(_selectedDate);

    try {
      final userProfile = await databaseService.getUserProfile();
      final meals = userProfile['meals'] ?? {};
      final dayMeals = List<Map<String, dynamic>>.from(meals[dateKey] ?? []);
      dayMeals.add(meal);

      meals[dateKey] = dayMeals;

      await databaseService.updateUserProfile({'meals': meals});

      setState(() {
        _todayMeals = dayMeals;
        _calculateDailyTotals();
      });

      _clearForm();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Meal added successfully!')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error adding meal: $e')),
      );
    }
  }

  void _clearForm() {
    _foodController.clear();
    _caloriesController.clear();
    _proteinController.clear();
    _carbsController.clear();
    _fatController.clear();
  }

  Future<void> _scanBarcode() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const BarcodeScannerPage()),
    );

    if (result != null && result is Map<String, dynamic>) {
      // Populate the form with scanned data
      setState(() {
        _foodController.text = result['name'] ?? '';
        _caloriesController.text = result['calories']?.toString() ?? '';
        _proteinController.text = result['protein']?.toString() ?? '';
        _carbsController.text = result['carbs']?.toString() ?? '';
        _fatController.text = result['fat']?.toString() ?? '';
      });

      // Optionally, automatically add the meal
      // await _addMeal();
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
      _loadTodayMeals();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConstants.darkBackground,
      appBar: AppBar(
        title: Text('Meal Tracking', style: AppConstants.titleLarge),
        backgroundColor: AppConstants.primaryRed,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_today),
            onPressed: () => _selectDate(context),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppConstants.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDateHeader(),
            const SizedBox(height: AppConstants.paddingLarge),
            _buildDailySummary(),
            const SizedBox(height: AppConstants.paddingLarge),
            _buildAddMealForm(),
            const SizedBox(height: AppConstants.paddingLarge),
            _buildMealsList(),
          ],
        ),
      ),
    );
  }

  Widget _buildDateHeader() {
    return Container(
      padding: const EdgeInsets.all(AppConstants.paddingMedium),
      decoration: BoxDecoration(
        color: AppConstants.cardBackground,
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusMedium),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            DateFormat('EEEE, MMMM d').format(_selectedDate),
            style: AppConstants.titleMedium,
          ),
          Text(
            DateFormat('yyyy').format(_selectedDate),
            style: AppConstants.bodyMedium,
          ),
        ],
      ),
    );
  }

  Widget _buildDailySummary() {
    return Container(
      padding: const EdgeInsets.all(AppConstants.paddingLarge),
      decoration: BoxDecoration(
        gradient: AppConstants.primaryGradient,
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusLarge),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Daily Summary',
            style: AppConstants.headlineSmall,
          ),
          const SizedBox(height: AppConstants.paddingMedium),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNutrientCard('Calories', '${_dailyTotals['calories']?.toInt()}', 'kcal'),
              _buildNutrientCard('Protein', '${_dailyTotals['protein']?.toInt()}', 'g'),
              _buildNutrientCard('Carbs', '${_dailyTotals['carbs']?.toInt()}', 'g'),
              _buildNutrientCard('Fat', '${_dailyTotals['fat']?.toInt()}', 'g'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNutrientCard(String label, String value, String unit) {
    return Column(
      children: [
        Text(
          value,
          style: AppConstants.headlineMedium.copyWith(
            color: AppConstants.textPrimary,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          unit,
          style: AppConstants.bodySmall.copyWith(color: AppConstants.textSecondary),
        ),
        Text(
          label,
          style: AppConstants.bodySmall.copyWith(color: AppConstants.textSecondary),
        ),
      ],
    );
  }

  Widget _buildAddMealForm() {
    return Card(
      color: AppConstants.cardBackground,
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Add Meal',
              style: AppConstants.titleMedium,
            ),
            const SizedBox(height: AppConstants.paddingMedium),

            // Meal Type Dropdown
            DropdownButtonFormField<String>(
              initialValue: _selectedMealType,
              decoration: InputDecoration(
                labelText: 'Meal Type',
                labelStyle: TextStyle(color: AppConstants.textSecondary),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
                ),
                filled: true,
                fillColor: AppConstants.darkBackground,
              ),
              dropdownColor: AppConstants.cardBackground,
              style: TextStyle(color: AppConstants.textPrimary),
              items: _mealTypes.map((type) {
                return DropdownMenuItem(
                  value: type,
                  child: Text(type),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedMealType = value!;
                });
              },
            ),

            const SizedBox(height: AppConstants.paddingMedium),

            // Food Name
            TextField(
              controller: _foodController,
              style: TextStyle(color: AppConstants.textPrimary),
              decoration: InputDecoration(
                labelText: 'Food Name',
                labelStyle: TextStyle(color: AppConstants.textSecondary),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
                ),
                filled: true,
                fillColor: AppConstants.darkBackground,
              ),
            ),

            const SizedBox(height: AppConstants.paddingMedium),

            // Nutrition Facts Row
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _caloriesController,
                    keyboardType: TextInputType.number,
                    style: TextStyle(color: AppConstants.textPrimary),
                    decoration: InputDecoration(
                      labelText: 'Calories',
                      labelStyle: TextStyle(color: AppConstants.textSecondary),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
                      ),
                      filled: true,
                      fillColor: AppConstants.darkBackground,
                    ),
                  ),
                ),
                const SizedBox(width: AppConstants.paddingSmall),
                Expanded(
                  child: TextField(
                    controller: _proteinController,
                    keyboardType: TextInputType.number,
                    style: TextStyle(color: AppConstants.textPrimary),
                    decoration: InputDecoration(
                      labelText: 'Protein (g)',
                      labelStyle: TextStyle(color: AppConstants.textSecondary),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
                      ),
                      filled: true,
                      fillColor: AppConstants.darkBackground,
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: AppConstants.paddingMedium),

            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _carbsController,
                    keyboardType: TextInputType.number,
                    style: TextStyle(color: AppConstants.textPrimary),
                    decoration: InputDecoration(
                      labelText: 'Carbs (g)',
                      labelStyle: TextStyle(color: AppConstants.textSecondary),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
                      ),
                      filled: true,
                      fillColor: AppConstants.darkBackground,
                    ),
                  ),
                ),
                const SizedBox(width: AppConstants.paddingSmall),
                Expanded(
                  child: TextField(
                    controller: _fatController,
                    keyboardType: TextInputType.number,
                    style: TextStyle(color: AppConstants.textPrimary),
                    decoration: InputDecoration(
                      labelText: 'Fat (g)',
                      labelStyle: TextStyle(color: AppConstants.textSecondary),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
                      ),
                      filled: true,
                      fillColor: AppConstants.darkBackground,
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: AppConstants.paddingLarge),

            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _addMeal,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppConstants.primaryRed,
                      foregroundColor: AppConstants.textPrimary,
                      minimumSize: const Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppConstants.borderRadiusMedium),
                      ),
                    ),
                    child: const Text('Add Meal'),
                  ),
                ),
                const SizedBox(width: AppConstants.paddingMedium),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _scanBarcode,
                    icon: const Icon(Icons.qr_code_scanner),
                    label: const Text('Scan Barcode'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppConstants.primaryRed,
                      side: BorderSide(color: AppConstants.primaryRed),
                      minimumSize: const Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppConstants.borderRadiusMedium),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMealsList() {
    if (_todayMeals.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(AppConstants.paddingLarge),
          child: Column(
            children: [
              Icon(
                Icons.restaurant,
                size: 64,
                color: AppConstants.textSecondary,
              ),
              const SizedBox(height: AppConstants.paddingMedium),
              Text(
                'No meals logged today',
                style: AppConstants.titleMedium.copyWith(color: AppConstants.textSecondary),
              ),
              const SizedBox(height: AppConstants.paddingSmall),
              Text(
                'Add your first meal to get started!',
                style: AppConstants.bodyMedium.copyWith(color: AppConstants.textSecondary),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Today\'s Meals',
          style: AppConstants.titleLarge,
        ),
        const SizedBox(height: AppConstants.paddingMedium),
        ..._todayMeals.map((meal) => _buildMealCard(meal)),
      ],
    );
  }

  Widget _buildMealCard(Map<String, dynamic> meal) {
    return Card(
      color: AppConstants.cardBackground,
      margin: const EdgeInsets.only(bottom: AppConstants.paddingSmall),
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.paddingMedium),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppConstants.primaryRed.withOpacity(0.2),
                borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
              ),
              child: Icon(
                Icons.restaurant,
                color: AppConstants.primaryRed,
                size: 24,
              ),
            ),
            const SizedBox(width: AppConstants.paddingMedium),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    meal['name'] ?? 'Unknown Food',
                    style: AppConstants.bodyLarge,
                  ),
                  Text(
                    meal['mealType'] ?? 'Meal',
                    style: AppConstants.bodyMedium.copyWith(color: AppConstants.textSecondary),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '${meal['calories']?.toInt() ?? 0} kcal',
                  style: AppConstants.bodyLarge.copyWith(
                    color: AppConstants.primaryRed,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'P: ${meal['protein']?.toInt() ?? 0}g C: ${meal['carbs']?.toInt() ?? 0}g F: ${meal['fat']?.toInt() ?? 0}g',
                  style: AppConstants.bodySmall.copyWith(color: AppConstants.textSecondary),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
