import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:fl_chart/fl_chart.dart';
import 'constants.dart';
import 'database_service.dart';

class NutritionDashboard extends StatefulWidget {
  const NutritionDashboard({super.key});

  @override
  State<NutritionDashboard> createState() => _NutritionDashboardState();
}

class _NutritionDashboardState extends State<NutritionDashboard> {
  final DateTime _selectedDate = DateTime.now();
  Map<String, double> _dailyTotals = {
    'calories': 0.0,
    'protein': 0.0,
    'carbs': 0.0,
    'fat': 0.0,
  };
  Map<String, double> _weeklyAverages = {
    'calories': 0.0,
    'protein': 0.0,
    'carbs': 0.0,
    'fat': 0.0,
  };
  List<Map<String, dynamic>> _recentMeals = [];
  Map<String, double> _goals = {
    'calories': 2000.0,
    'protein': 150.0,
    'carbs': 250.0,
    'fat': 67.0,
  };

  @override
  void initState() {
    super.initState();
    _loadNutritionData();
  }

  Future<void> _loadNutritionData() async {
    final databaseService = Provider.of<DatabaseService>(context, listen: false);

    try {
      final userProfile = await databaseService.getUserProfile();
      _goals = Map<String, double>.from(userProfile['nutritionGoals'] ?? _goals);

      // Load daily data
      await _loadDailyData(databaseService);

      // Load weekly data
      await _loadWeeklyData(databaseService);

      // Load recent meals
      await _loadRecentMeals(databaseService);

      setState(() {});
    } catch (e) {
      print('Error loading nutrition data: $e');
    }
  }

  Future<void> _loadDailyData(DatabaseService databaseService) async {
    final dateKey = DateFormat('yyyy-MM-dd').format(_selectedDate);
    final userProfile = await databaseService.getUserProfile();
    final meals = userProfile['meals'] ?? {};
    final dayMeals = meals[dateKey] ?? [];

    double totalCalories = 0.0;
    double totalProtein = 0.0;
    double totalCarbs = 0.0;
    double totalFat = 0.0;

    for (var meal in dayMeals) {
      totalCalories += (meal['calories'] ?? 0.0);
      totalProtein += (meal['protein'] ?? 0.0);
      totalCarbs += (meal['carbs'] ?? 0.0);
      totalFat += (meal['fat'] ?? 0.0);
    }

    _dailyTotals = {
      'calories': totalCalories,
      'protein': totalProtein,
      'carbs': totalCarbs,
      'fat': totalFat,
    };
  }

  Future<void> _loadWeeklyData(DatabaseService databaseService) async {
    final userProfile = await databaseService.getUserProfile();
    final meals = userProfile['meals'] ?? {};

    double totalCalories = 0.0;
    double totalProtein = 0.0;
    double totalCarbs = 0.0;
    double totalFat = 0.0;
    int daysCount = 0;

    // Calculate last 7 days
    for (int i = 0; i < 7; i++) {
      final date = _selectedDate.subtract(Duration(days: i));
      final dateKey = DateFormat('yyyy-MM-dd').format(date);
      final dayMeals = meals[dateKey] ?? [];

      if (dayMeals.isNotEmpty) {
        daysCount++;
        for (var meal in dayMeals) {
          totalCalories += (meal['calories'] ?? 0.0);
          totalProtein += (meal['protein'] ?? 0.0);
          totalCarbs += (meal['carbs'] ?? 0.0);
          totalFat += (meal['fat'] ?? 0.0);
        }
      }
    }

    if (daysCount > 0) {
      _weeklyAverages = {
        'calories': totalCalories / daysCount,
        'protein': totalProtein / daysCount,
        'carbs': totalCarbs / daysCount,
        'fat': totalFat / daysCount,
      };
    }
  }

  Future<void> _loadRecentMeals(DatabaseService databaseService) async {
    final userProfile = await databaseService.getUserProfile();
    final meals = userProfile['meals'] ?? {};

    List<Map<String, dynamic>> allMeals = [];

    // Get meals from last 3 days
    for (int i = 0; i < 3; i++) {
      final date = _selectedDate.subtract(Duration(days: i));
      final dateKey = DateFormat('yyyy-MM-dd').format(date);
      final dayMeals = meals[dateKey] ?? [];

      for (var meal in dayMeals) {
        allMeals.add({
          ...meal,
          'date': date,
        });
      }
    }

    // Sort by timestamp (most recent first)
    allMeals.sort((a, b) => (b['timestamp'] ?? '').compareTo(a['timestamp'] ?? ''));

    _recentMeals = allMeals.take(10).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConstants.darkBackground,
      appBar: AppBar(
        title: Text('Nutrition Dashboard', style: AppConstants.titleLarge),
        backgroundColor: AppConstants.primaryRed,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: _showGoalsDialog,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadNutritionData,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppConstants.paddingMedium),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildDailyOverview(),
              const SizedBox(height: AppConstants.paddingLarge),
              _buildWeeklyChart(),
              const SizedBox(height: AppConstants.paddingLarge),
              _buildMacroBreakdown(),
              const SizedBox(height: AppConstants.paddingLarge),
              _buildRecentMeals(),
              const SizedBox(height: AppConstants.paddingLarge),
              _buildQuickActions(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDailyOverview() {
    return Container(
      padding: const EdgeInsets.all(AppConstants.paddingLarge),
      decoration: BoxDecoration(
        gradient: AppConstants.primaryGradient,
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusLarge),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Today\'s Intake',
                style: AppConstants.headlineSmall,
              ),
              Text(
                DateFormat('MMM d').format(_selectedDate),
                style: AppConstants.bodyMedium,
              ),
            ],
          ),
          const SizedBox(height: AppConstants.paddingMedium),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNutrientProgress('Calories', _dailyTotals['calories']!, _goals['calories']!, 'kcal'),
              _buildNutrientProgress('Protein', _dailyTotals['protein']!, _goals['protein']!, 'g'),
              _buildNutrientProgress('Carbs', _dailyTotals['carbs']!, _goals['carbs']!, 'g'),
              _buildNutrientProgress('Fat', _dailyTotals['fat']!, _goals['fat']!, 'g'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNutrientProgress(String label, double current, double goal, String unit) {
    final percentage = goal > 0 ? (current / goal).clamp(0.0, 1.0) : 0.0;
    final color = percentage > 1.0 ? Colors.red : AppConstants.primaryRed;

    return Column(
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            SizedBox(
              width: 60,
              height: 60,
              child: CircularProgressIndicator(
                value: percentage,
                backgroundColor: AppConstants.cardBackground,
                valueColor: AlwaysStoppedAnimation<Color>(color),
                strokeWidth: 6,
              ),
            ),
            Text(
              '${(percentage * 100).toInt()}%',
              style: AppConstants.bodySmall.copyWith(
                color: AppConstants.textPrimary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: AppConstants.paddingSmall),
        Text(
          '${current.toInt()}/$goal',
          style: AppConstants.bodySmall.copyWith(color: AppConstants.textSecondary),
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

  Widget _buildWeeklyChart() {
    return Card(
      color: AppConstants.cardBackground,
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Weekly Averages',
              style: AppConstants.titleMedium,
            ),
            const SizedBox(height: AppConstants.paddingMedium),
            SizedBox(
              height: 200,
              child: BarChart(
                BarChartData(
                  alignment: BarChartAlignment.spaceAround,
                  maxY: _goals['calories']! * 1.2,
                  barGroups: [
                    _buildBarGroup(0, _weeklyAverages['calories']!, 'Cal'),
                    _buildBarGroup(1, _weeklyAverages['protein']!, 'Pro'),
                    _buildBarGroup(2, _weeklyAverages['carbs']!, 'Carb'),
                    _buildBarGroup(3, _weeklyAverages['fat']!, 'Fat'),
                  ],
                  titlesData: FlTitlesData(
                    show: true,
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, meta) {
                          const titles = ['Cal', 'Pro', 'Carb', 'Fat'];
                          return Text(
                            titles[value.toInt()],
                            style: AppConstants.bodySmall,
                          );
                        },
                      ),
                    ),
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, meta) {
                          return Text(
                            value.toInt().toString(),
                            style: AppConstants.bodySmall,
                          );
                        },
                      ),
                    ),
                    topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  ),
                  gridData: FlGridData(show: false),
                  borderData: FlBorderData(show: false),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  BarChartGroupData _buildBarGroup(int x, double y, String label) {
    return BarChartGroupData(
      x: x,
      barRods: [
        BarChartRodData(
          toY: y,
          color: AppConstants.primaryRed,
          width: 20,
          borderRadius: BorderRadius.circular(4),
        ),
      ],
    );
  }

  Widget _buildMacroBreakdown() {
    return Card(
      color: AppConstants.cardBackground,
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Macro Breakdown',
              style: AppConstants.titleMedium,
            ),
            const SizedBox(height: AppConstants.paddingMedium),
            _buildMacroProgress('Protein', _dailyTotals['protein']!, _goals['protein']!, Colors.blue),
            const SizedBox(height: AppConstants.paddingSmall),
            _buildMacroProgress('Carbohydrates', _dailyTotals['carbs']!, _goals['carbs']!, Colors.green),
            const SizedBox(height: AppConstants.paddingSmall),
            _buildMacroProgress('Fat', _dailyTotals['fat']!, _goals['fat']!, Colors.orange),
          ],
        ),
      ),
    );
  }

  Widget _buildMacroProgress(String label, double current, double goal, Color color) {
    final percentage = goal > 0 ? (current / goal).clamp(0.0, 1.0) : 0.0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: AppConstants.bodyMedium,
            ),
            Text(
              '${current.toInt()} / ${goal.toInt()}g',
              style: AppConstants.bodyMedium.copyWith(color: AppConstants.textSecondary),
            ),
          ],
        ),
        const SizedBox(height: AppConstants.paddingSmall),
        LinearProgressIndicator(
          value: percentage,
          backgroundColor: AppConstants.dividerColor,
          valueColor: AlwaysStoppedAnimation<Color>(color),
        ),
      ],
    );
  }

  Widget _buildRecentMeals() {
    return Card(
      color: AppConstants.cardBackground,
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Recent Meals',
                  style: AppConstants.titleMedium,
                ),
                TextButton(
                  onPressed: () {
                    // Navigate to full meal tracking page
                  },
                  child: Text(
                    'View All',
                    style: TextStyle(color: AppConstants.primaryRed),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppConstants.paddingMedium),
            if (_recentMeals.isEmpty)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(AppConstants.paddingLarge),
                  child: Text(
                    'No recent meals',
                    style: AppConstants.bodyMedium.copyWith(color: AppConstants.textSecondary),
                  ),
                ),
              )
            else
              ..._recentMeals.take(5).map((meal) => _buildRecentMealItem(meal)),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentMealItem(Map<String, dynamic> meal) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppConstants.paddingSmall),
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
              size: 20,
            ),
          ),
          const SizedBox(width: AppConstants.paddingMedium),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  meal['name'] ?? 'Unknown Food',
                  style: AppConstants.bodyMedium,
                ),
                Text(
                  '${meal['mealType'] ?? 'Meal'} • ${DateFormat('MMM d').format(meal['date'] ?? DateTime.now())}',
                  style: AppConstants.bodySmall.copyWith(color: AppConstants.textSecondary),
                ),
              ],
            ),
          ),
          Text(
            '${meal['calories']?.toInt() ?? 0} kcal',
            style: AppConstants.bodyMedium.copyWith(
              color: AppConstants.primaryRed,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Row(
      children: [
        Expanded(
          child: _buildQuickActionButton(
            'Add Meal',
            Icons.add,
            () {
              // Navigate to meal tracking page
            },
          ),
        ),
        const SizedBox(width: AppConstants.paddingMedium),
        Expanded(
          child: _buildQuickActionButton(
            'Scan Food',
            Icons.qr_code_scanner,
            () {
              // Navigate to barcode scanner
            },
          ),
        ),
        const SizedBox(width: AppConstants.paddingMedium),
        Expanded(
          child: _buildQuickActionButton(
            'Get Recipe',
            Icons.restaurant_menu,
            () {
              // Navigate to diet recommendations
            },
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActionButton(String label, IconData icon, VoidCallback onPressed) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: AppConstants.cardBackground,
        foregroundColor: AppConstants.textPrimary,
        padding: const EdgeInsets.symmetric(vertical: AppConstants.paddingMedium),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConstants.borderRadiusMedium),
        ),
      ),
      child: Column(
        children: [
          Icon(icon, size: 24),
          const SizedBox(height: AppConstants.paddingSmall),
          Text(
            label,
            style: AppConstants.bodySmall,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  void _showGoalsDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppConstants.cardBackground,
        title: Text(
          'Set Nutrition Goals',
          style: AppConstants.titleMedium,
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildGoalInput('Daily Calories', 'calories'),
              const SizedBox(height: AppConstants.paddingMedium),
              _buildGoalInput('Protein (g)', 'protein'),
              const SizedBox(height: AppConstants.paddingMedium),
              _buildGoalInput('Carbs (g)', 'carbs'),
              const SizedBox(height: AppConstants.paddingMedium),
              _buildGoalInput('Fat (g)', 'fat'),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(
              'Cancel',
              style: TextStyle(color: AppConstants.textSecondary),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              final databaseService = Provider.of<DatabaseService>(context, listen: false);
              await databaseService.updateUserProfile({'nutritionGoals': _goals});
              Navigator.of(context).pop();
              _loadNutritionData();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppConstants.primaryRed,
            ),
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  Widget _buildGoalInput(String label, String key) {
    return TextField(
      keyboardType: TextInputType.number,
      style: TextStyle(color: AppConstants.textPrimary),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: AppConstants.textSecondary),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
        ),
        filled: true,
        fillColor: AppConstants.darkBackground,
      ),
      controller: TextEditingController(text: _goals[key]?.toString() ?? ''),
      onChanged: (value) {
        _goals[key] = double.tryParse(value) ?? _goals[key]!;
      },
    );
  }
}
