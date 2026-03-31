import 'package:flutter/material.dart';
import '../models/diet_plan.dart';

class DietPlanDetailPage extends StatefulWidget {
  final DietPlan plan;
  
  const DietPlanDetailPage({super.key, required this.plan});

  @override
  State<DietPlanDetailPage> createState() => _DietPlanDetailPageState();
}

class _DietPlanDetailPageState extends State<DietPlanDetailPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _selectedDay = 1;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        title: Text(
          widget.plan.name,
          style: const TextStyle(color: Colors.white),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.red,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white54,
          tabs: const [
            Tab(text: 'Overview'),
            Tab(text: 'Daily Meals'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOverviewTab(),
          _buildDailyMealsTab(),
        ],
      ),
    );
  }

  Widget _buildOverviewTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Plan Info Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: _getCategoryGradient(widget.plan.category),
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.plan.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                Text(
                  widget.plan.description,
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _buildInfoChip('${widget.plan.calories} cal/day', Icons.local_fire_department),
                    const SizedBox(width: 12),
                    _buildInfoChip('${widget.plan.days.length} days', Icons.calendar_today),
                  ],
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 20),
          
          // Tags
          const Text(
            'Tags',
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
            children: widget.plan.tags.map((tag) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.grey.shade800,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                tag,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                ),
              ),
            )).toList(),
          ),
          
          const SizedBox(height: 20),
          
          // Macros Overview (from first day)
          if (widget.plan.days.isNotEmpty)
            _buildMacrosOverview(),
          
          const SizedBox(height: 20),
          
          // Start Plan Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                // TODO: Implement start plan functionality
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Diet plan started! Track your progress.'),
                    backgroundColor: Colors.green,
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'Start This Plan',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDailyMealsTab() {
    return Column(
      children: [
        // Day Selector: use wrap when many days to avoid horizontal overflow
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Wrap(
            spacing: 8,
            runSpacing: 8,
            children: List.generate(widget.plan.days.length, (index) {
              final day = index + 1;
              final isSelected = day == _selectedDay;
              return GestureDetector(
                onTap: () => setState(() => _selectedDay = day),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected ? Colors.red : Colors.grey.shade800,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Center(
                    child: Text(
                      'Day $day',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
        
        // Meals List
        Expanded(
          child: _buildMealsList(),
        ),
      ],
    );
  }

  Widget _buildMealsList() {
    final dayMeal = widget.plan.days.firstWhere(
      (d) => d.day == _selectedDay,
      orElse: () => widget.plan.days.first,
    );

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: dayMeal.meals.length,
      itemBuilder: (context, index) {
        final meal = dayMeal.meals[index];
        return _buildMealCard(meal);
      },
    );
  }

  Widget _buildMealCard(Meal meal) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.grey.shade900,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  _getMealIcon(meal.type),
                  color: Colors.red,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    meal.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Text(
                  '${meal.calories} cal',
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              meal.description,
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 13,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 12),
            
            // Macros
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: [
                _buildMacroChip('P: ${meal.macros['protein']?.toInt() ?? 0}g', Colors.blue),
                _buildMacroChip('C: ${meal.macros['carbs']?.toInt() ?? 0}g', Colors.orange),
                _buildMacroChip('F: ${meal.macros['fat']?.toInt() ?? 0}g', Colors.green),
              ],
            ),
            
            if (meal.ingredients.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Text(
                'Ingredients:',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                meal.ingredients.join(', '),
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 11,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInfoChip(String text, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.3),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.white, size: 16),
          const SizedBox(width: 4),
          Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMacroChip(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color, width: 1),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildMacrosOverview() {
    final firstDay = widget.plan.days.first;
    double totalProtein = 0, totalCarbs = 0, totalFat = 0;
    
    for (final meal in firstDay.meals) {
      totalProtein += meal.macros['protein'] ?? 0;
      totalCarbs += meal.macros['carbs'] ?? 0;
      totalFat += meal.macros['fat'] ?? 0;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Daily Macros (approx)',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildMacroCard('Protein', '${totalProtein.toInt()}g', Colors.blue),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildMacroCard('Carbs', '${totalCarbs.toInt()}g', Colors.orange),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildMacroCard('Fat', '${totalFat.toInt()}g', Colors.green),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildMacroCard(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade900,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  IconData _getMealIcon(String mealType) {
    switch (mealType.toLowerCase()) {
      case 'breakfast':
        return Icons.wb_sunny;
      case 'lunch':
        return Icons.wb_sunny_outlined;
      case 'dinner':
        return Icons.nights_stay;
      case 'snack':
        return Icons.coffee;
      default:
        return Icons.restaurant;
    }
  }

  List<Color> _getCategoryGradient(String category) {
    switch (category) {
      case 'weight_loss':
        return [Colors.green.shade600, Colors.green.shade800];
      case 'muscle_gain':
        return [Colors.blue.shade600, Colors.blue.shade800];
      case 'keto':
        return [Colors.purple.shade600, Colors.purple.shade800];
      case 'vegan':
        return [Colors.orange.shade600, Colors.orange.shade800];
      default:
        return [Colors.red.shade600, Colors.red.shade800];
    }
  }
}