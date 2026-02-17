import 'package:flutter/material.dart';
import '../services/diet_plan_service.dart';
import '../models/diet_plan.dart';
import 'diet_plan_detail_page.dart';

class DietPlanPage extends StatefulWidget {
  const DietPlanPage({super.key});

  @override
  State<DietPlanPage> createState() => _DietPlanPageState();
}

class _DietPlanPageState extends State<DietPlanPage> {
  final DietPlanService _service = DietPlanService();
  final TextEditingController _searchController = TextEditingController();
  List<DietPlan> _filteredPlans = [];
  String _selectedCategory = 'all';
  String _selectedDietaryType = 'all';
  String _selectedRegion = 'all';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadDietPlans();
  }

  Future<void> _loadDietPlans() async {
    await _service.load();
    setState(() {
      _filteredPlans = _service.allPlans;
      _loading = false;
    });
  }

  void _filterPlans() {
    setState(() {
      List<DietPlan> plans = _service.allPlans;
      
      if (_selectedCategory != 'all') {
        plans = plans.where((plan) => plan.category == _selectedCategory).toList();
      }
      
      if (_selectedDietaryType != 'all') {
        plans = plans.where((plan) => plan.dietaryType == _selectedDietaryType).toList();
      }
      
      if (_selectedRegion != 'all') {
        plans = plans.where((plan) => plan.region == _selectedRegion).toList();
      }
      
      if (_searchController.text.isNotEmpty) {
        final searchQuery = _searchController.text.toLowerCase();
        plans = plans.where((plan) =>
          plan.name.toLowerCase().contains(searchQuery) ||
          plan.description.toLowerCase().contains(searchQuery) ||
          plan.tags.any((tag) => tag.toLowerCase().contains(searchQuery)) ||
          plan.dietaryType.toLowerCase().contains(searchQuery) ||
          plan.region.toLowerCase().contains(searchQuery)
        ).toList();
      }
      
      _filteredPlans = plans;
    });
  }

  @override
  Widget build(BuildContext context) {
  // responsive aspect ratio for diet plan cards
  final screenWidth = MediaQuery.of(context).size.width;
  // make cards taller on typical phone widths to avoid inner Column overflow
  final childAspectRatio = screenWidth < 450 ? 1.6 : 2.6;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text('Diet Plans', style: TextStyle(color: Colors.white)),
        elevation: 0,
      ),
    body: _loading
      ? const Center(child: CircularProgressIndicator(color: Colors.red))
      : SafeArea(
        child: Column(
              children: [
                // Search Bar
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (_) => _filterPlans(),
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Search diet plans...',
                      hintStyle: const TextStyle(color: Colors.white54, fontSize: 13),
                      prefixIcon: const Icon(Icons.search, color: Colors.red, size: 18),
                      filled: true,
                      fillColor: Colors.grey.shade900,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                
                // Filter Options
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Goal Category Filter
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text('Goal', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                    ),
                    const SizedBox(height: 6),
                    SizedBox(
                      height: 40,
                      child: ListView(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        scrollDirection: Axis.horizontal,
                        children: [
                          _buildCategoryChip('all', 'All Goals'),
                          const SizedBox(width: 6),
                          _buildCategoryChip('weight_loss', 'Weight Loss'),
                          const SizedBox(width: 6),
                          _buildCategoryChip('muscle_gain', 'Muscle Gain'),
                          const SizedBox(width: 6),
                          _buildCategoryChip('keto', 'Keto'),
                          const SizedBox(width: 6),
                          _buildCategoryChip('maintenance', 'Maintenance'),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Dietary Preference Filter
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text('Dietary Preference', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                    ),
                    const SizedBox(height: 6),
                    SizedBox(
                      height: 40,
                      child: ListView(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        scrollDirection: Axis.horizontal,
                        children: [
                          _buildDietaryTypeChip('all', 'All Types'),
                          const SizedBox(width: 6),
                          _buildDietaryTypeChip('jain', 'Jain'),
                          const SizedBox(width: 6),
                          _buildDietaryTypeChip('veg', 'Vegetarian'),
                          const SizedBox(width: 6),
                          _buildDietaryTypeChip('vegan', 'Vegan'),
                          const SizedBox(width: 6),
                          _buildDietaryTypeChip('non_veg', 'Non-Veg'),
                          const SizedBox(width: 6),
                          _buildDietaryTypeChip('pescatarian', 'Pescatarian'),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Region Filter
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text('Cuisine', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                    ),
                    const SizedBox(height: 6),
                    SizedBox(
                      height: 40,
                      child: ListView(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        scrollDirection: Axis.horizontal,
                        children: [
                          _buildRegionChip('all', 'All Cuisines'),
                          const SizedBox(width: 6),
                          _buildRegionChip('indian', 'Indian'),
                          const SizedBox(width: 6),
                          _buildRegionChip('mediterranean', 'Mediterranean'),
                          const SizedBox(width: 6),
                          _buildRegionChip('asian', 'Asian'),
                          const SizedBox(width: 6),
                          _buildRegionChip('american', 'American'),
                          const SizedBox(width: 6),
                          _buildRegionChip('international', 'International'),
                        ],
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 16),
                
                // Diet Plans Grid
                Expanded(
                  child: _filteredPlans.isEmpty
                      ? const Center(
                          child: Text(
                            'No diet plans found',
                            style: TextStyle(color: Colors.white54, fontSize: 16),
                          ),
                        )
                      : GridView.builder(
                          padding: EdgeInsets.only(left: 16, right: 16, top: 8, bottom: 16 + MediaQuery.of(context).padding.bottom),
                          gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
                            // reduce max width per tile so cards get more vertical room on phones
                            maxCrossAxisExtent: 420,
                            childAspectRatio: childAspectRatio,
                            mainAxisSpacing: 12,
                            crossAxisSpacing: 12,
                          ),
                          itemCount: _filteredPlans.length,
                          itemBuilder: (context, index) {
                            final plan = _filteredPlans[index];
                            return _buildDietPlanCard(plan);
                          },
                        ),
                ),
              ],
            ),
          ),
    );
  }

  Widget _buildCategoryChip(String value, String label) {
    final isSelected = _selectedCategory == value;
    return FilterChip(
      label: Text(
        label,
        style: TextStyle(
          color: isSelected ? Colors.black : Colors.white,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          fontSize: 12,
        ),
      ),
      selected: isSelected,
      onSelected: (selected) {
        setState(() {
          _selectedCategory = value;
        });
        _filterPlans();
      },
      backgroundColor: Colors.grey.shade800,
      selectedColor: Colors.red,
      checkmarkColor: Colors.black,
    );
  }

  Widget _buildDietaryTypeChip(String value, String label) {
    final isSelected = _selectedDietaryType == value;
    return FilterChip(
      label: Text(
        label,
        style: TextStyle(
          color: isSelected ? Colors.black : Colors.white,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          fontSize: 12,
        ),
      ),
      selected: isSelected,
      onSelected: (selected) {
        setState(() {
          _selectedDietaryType = value;
        });
        _filterPlans();
      },
      backgroundColor: Colors.grey.shade800,
      selectedColor: Colors.green,
      checkmarkColor: Colors.black,
    );
  }

  Widget _buildRegionChip(String value, String label) {
    final isSelected = _selectedRegion == value;
    return FilterChip(
      label: Text(
        label,
        style: TextStyle(
          color: isSelected ? Colors.black : Colors.white,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          fontSize: 12,
        ),
      ),
      selected: isSelected,
      onSelected: (selected) {
        setState(() {
          _selectedRegion = value;
        });
        _filterPlans();
      },
      backgroundColor: Colors.grey.shade800,
      selectedColor: Colors.orange,
      checkmarkColor: Colors.black,
    );
  }

  Widget _buildDietPlanCard(DietPlan plan) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => DietPlanDetailPage(plan: plan),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: _getCategoryGradient(plan.category),
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      plan.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                      overflow: TextOverflow.ellipsis,
                      maxLines: 1,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${plan.calories} cal',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              
              // Diet type and region badges
              Wrap(
                spacing: 6,
                runSpacing: 3,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                    decoration: BoxDecoration(
                      color: _getDietaryTypeColor(plan.dietaryType),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      _getDietaryTypeLabel(plan.dietaryType),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      plan.region.toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 8),
              Text(
                plan.description,
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              
              // Duration and difficulty info
              Wrap(
                spacing: 16,
                runSpacing: 4,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.schedule, color: Colors.white70, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        '${plan.duration} days',
                        style: const TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                    ],
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.trending_up, color: Colors.white70, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        plan.difficulty,
                        style: const TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
              
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: plan.tags.take(3).map((tag) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    tag,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                    ),
                  ),
                )).toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getDietaryTypeColor(String dietaryType) {
    switch (dietaryType) {
      case 'jain':
        return Colors.yellow.shade700;
      case 'veg':
        return Colors.green.shade600;
      case 'vegan':
        return Colors.lightGreen.shade600;
      case 'non_veg':
        return Colors.red.shade600;
      case 'pescatarian':
        return Colors.blue.shade600;
      default:
        return Colors.grey.shade600;
    }
  }

  String _getDietaryTypeLabel(String dietaryType) {
    switch (dietaryType) {
      case 'jain':
        return 'JAIN';
      case 'veg':
        return 'VEG';
      case 'vegan':
        return 'VEGAN';
      case 'non_veg':
        return 'NON-VEG';
      case 'pescatarian':
        return 'PESCATARIAN';
      default:
        return 'ALL';
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

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}