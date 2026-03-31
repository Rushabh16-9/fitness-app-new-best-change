import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'database_service.dart';
import 'ai_workout_service.dart';
import 'pages/exercise_runner_page.dart';
import 'package:shimmer/shimmer.dart';

class AIRecommendationsPage extends StatefulWidget {
  final String? uid;

  const AIRecommendationsPage({super.key, this.uid});

  @override
  State<AIRecommendationsPage> createState() => _AIRecommendationsPageState();
}

class _AIRecommendationsPageState extends State<AIRecommendationsPage> {
  List<Map<String, dynamic>> recommendations = [];
  List<Map<String, dynamic>> filteredRecommendations = [];
  bool isLoading = true;
  String? errorMessage;
  String searchQuery = '';
  String selectedDifficulty = 'All';
  String selectedMuscleGroup = 'All';
  String selectedDuration = 'All';
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _loadRecommendations();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadRecommendations() async {
    try {
      final databaseService = DatabaseService(uid: widget.uid ?? FirebaseAuth.instance.currentUser?.uid);
      final aiService = AIWorkoutService(databaseService: databaseService);

      // Initialize exercise database
      await aiService.initialize();

      final userProfile = await databaseService.getUserProfile();
      final bmi = _calculateBMI(userProfile);

      // Generate comprehensive AI-powered recommendations
      final workouts = await aiService.generatePersonalizedWorkout();

      // Add BMI-specific customizations
      List<Map<String, dynamic>> customizedWorkouts = workouts.map((w) {
        Map<String, dynamic> workout = Map<String, dynamic>.from(w);
        
        if (bmi < 18.5) {
          // Underweight - emphasize strength building
          workout['bmiNote'] = 'Focus on building muscle mass';
          workout['nutritionTip'] = 'Increase protein and calorie intake';
        } else if (bmi >= 25 && bmi < 30) {
          // Overweight - add cardio emphasis
          workout['bmiNote'] = 'Cardio-focused for weight management';
          workout['calories'] = (workout['calories'] as int) + 50;
        } else if (bmi >= 30) {
          // Obese - high priority on fat loss
          workout['bmiNote'] = 'High-intensity for maximum fat burn';
          workout['calories'] = (workout['calories'] as int) + 100;
        }
        
        return workout;
      }).toList();

      setState(() {
        recommendations = customizedWorkouts;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        errorMessage = 'Failed to load recommendations: $e';
        isLoading = false;
      });
    }
  }

  double _calculateBMI(Map<String, dynamic> userProfile) {
    final heightRaw = userProfile['height'] ?? 170; // cm
    final weightRaw = userProfile['weight'] ?? 70; // kg

    double height;
    double weight;

    if (heightRaw is String) {
      height = double.tryParse(heightRaw) ?? 170;
    } else if (heightRaw is num) {
      height = heightRaw.toDouble();
    } else {
      height = 170;
    }

    if (weightRaw is String) {
      weight = double.tryParse(weightRaw) ?? 70;
    } else if (weightRaw is num) {
      weight = weightRaw.toDouble();
    } else {
      weight = 70;
    }

    return weight / ((height / 100) * (height / 100));
  }

  void _filterRecommendations() {
    setState(() {
      filteredRecommendations = recommendations.where((workout) {
        final matchesSearch = searchQuery.isEmpty ||
            workout['name'].toString().toLowerCase().contains(searchQuery.toLowerCase()) ||
            workout['muscleGroups'].toString().toLowerCase().contains(searchQuery.toLowerCase());

        final matchesDifficulty = selectedDifficulty == 'All' ||
            workout['difficulty'].toString().toLowerCase() == selectedDifficulty.toLowerCase();

        final matchesMuscleGroup = selectedMuscleGroup == 'All' ||
            (workout['muscleGroups'] as List<dynamic>).contains(selectedMuscleGroup);

        final duration = workout['duration'] as int;
        final matchesDuration = selectedDuration == 'All' ||
            (selectedDuration == '15-20 min' && duration >= 15 && duration <= 20) ||
            (selectedDuration == '20-30 min' && duration > 20 && duration <= 30) ||
            (selectedDuration == '30+ min' && duration > 30);

        return matchesSearch && matchesDifficulty && matchesMuscleGroup && matchesDuration;
      }).toList();
    });
  }

  Widget _buildSkeletonLoader() {
    return Shimmer.fromColors(
      baseColor: Colors.grey[800]!,
      highlightColor: Colors.grey[600]!,
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: 5,
        itemBuilder: (context, index) {
          return Card(
            color: Colors.grey[900],
            margin: const EdgeInsets.symmetric(vertical: 8),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          height: 24,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Container(
                        width: 80,
                        height: 40,
                        color: Colors.white,
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Container(width: 60, height: 20, color: Colors.white),
                      const SizedBox(width: 8),
                      Container(width: 80, height: 20, color: Colors.white),
                      const SizedBox(width: 8),
                      Container(width: 70, height: 20, color: Colors.white),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(height: 16, color: Colors.white),
                  const SizedBox(height: 8),
                  Container(height: 12, width: 200, color: Colors.white),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSearchAndFilters() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[900],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          // Search Bar
          TextField(
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: 'Search workouts...',
              hintStyle: const TextStyle(color: Colors.white70),
              prefixIcon: const Icon(Icons.search, color: Colors.white70),
              filled: true,
              fillColor: Colors.black.withOpacity(0.3),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
            onChanged: (value) {
              searchQuery = value;
              _filterRecommendations();
            },
          ),
          const SizedBox(height: 16),

          // Filter Chips
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              // Difficulty Filter
              _buildFilterChip('Difficulty: $selectedDifficulty', () {
                _showFilterDialog('Difficulty', ['All', 'Beginner', 'Intermediate', 'Advanced'], (value) {
                  setState(() => selectedDifficulty = value);
                  _filterRecommendations();
                });
              }),

              // Muscle Group Filter
              _buildFilterChip('Muscle: $selectedMuscleGroup', () {
                _showFilterDialog('Muscle Group', ['All', 'Full Body', 'Upper Body', 'Lower Body', 'Core', 'Cardio'], (value) {
                  setState(() => selectedMuscleGroup = value);
                  _filterRecommendations();
                });
              }),

              // Duration Filter
              _buildFilterChip('Duration: $selectedDuration', () {
                _showFilterDialog('Duration', ['All', '15-20 min', '20-30 min', '30+ min'], (value) {
                  setState(() => selectedDuration = value);
                  _filterRecommendations();
                });
              }),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.red.withOpacity(0.2),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.red.withOpacity(0.5), width: 1),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(label, style: const TextStyle(color: Colors.red, fontSize: 12)),
            const SizedBox(width: 4),
            const Icon(Icons.arrow_drop_down, color: Colors.red, size: 16),
          ],
        ),
      ),
    );
  }

  void _showFilterDialog(String title, List<String> options, Function(String) onSelected) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[900],
        title: Text(title, style: const TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: options.map((option) => ListTile(
            title: Text(option, style: const TextStyle(color: Colors.white)),
            onTap: () {
              onSelected(option);
              Navigator.of(context).pop();
            },
          )).toList(),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('AI Exercise Recommendations'),
        backgroundColor: Colors.red,
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          setState(() {
            isLoading = true;
            errorMessage = null;
          });
          await _loadRecommendations();
        },
        color: Colors.red,
        child: isLoading
            ? _buildSkeletonLoader()
            : errorMessage != null
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.error_outline, color: Colors.red, size: 64),
                        const SizedBox(height: 16),
                        Text(
                          errorMessage!,
                          style: const TextStyle(color: Colors.white),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () {
                            setState(() {
                              isLoading = true;
                              errorMessage = null;
                            });
                            _loadRecommendations();
                          },
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  )
                : recommendations.isEmpty
                    ? const Center(
                        child: Text(
                          'No recommendations available',
                          style: TextStyle(color: Colors.white70),
                        ),
                      )
                    : CustomScrollView(
                        controller: _scrollController,
                        slivers: [
                          SliverToBoxAdapter(
                            child: Padding(
                              padding: const EdgeInsets.all(12),
                              child: _buildSearchAndFilters(),
                            ),
                          ),
                          SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (context, index) {
                                final workout = filteredRecommendations.isEmpty ? recommendations[index] : filteredRecommendations[index];
                                return TweenAnimationBuilder(
                                  tween: Tween<double>(begin: 0, end: 1),
                                  duration: Duration(milliseconds: 300 + (index * 100)),
                                  builder: (context, value, child) {
                                    return Transform.translate(
                                      offset: Offset(0, 50 * (1 - value)),
                                      child: Opacity(
                                        opacity: value,
                                        child: child,
                                      ),
                                    );
                                  },
                                  child: _buildWorkoutCard(workout),
                                );
                              },
                              childCount: filteredRecommendations.isEmpty ? recommendations.length : filteredRecommendations.length,
                            ),
                          ),
                        ],
                      ),
      ),
    );
  }

  Widget _buildWorkoutCard(Map<String, dynamic> workout) {
    final benefits = workout['benefits'] as List<dynamic>? ?? [];
    final muscleGroups = workout['muscleGroups'] as List<dynamic>? ?? [];
    final exercises = workout['exercises'] as List<dynamic>? ?? [];
    final exerciseNames = workout['exerciseNames'] as List<dynamic>? ?? [];
    bool isExpanded = false;

    return StatefulBuilder(
      builder: (context, setState) => Card(
        elevation: 8,
        shadowColor: Colors.red.withOpacity(0.3),
        color: Colors.grey[900],
        margin: const EdgeInsets.symmetric(vertical: 8),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Colors.red.withOpacity(0.3), width: 1),
        ),
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Colors.grey[900]!,
                Colors.grey[800]!,
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title and Action Buttons Row
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        workout['name'],
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    Row(
                      children: [
                        IconButton(
                          icon: Icon(
                            Icons.favorite_border,
                            color: Colors.red,
                            size: 24,
                          ),
                          onPressed: () {
                            // TODO: Implement favorite functionality
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Added to favorites!')),
                            );
                          },
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          onPressed: exercises.isNotEmpty
                              ? () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => ExerciseRunnerPage(
                                        exercises: exercises.cast<Map<String, dynamic>>(),
                                        totalMinutes: workout['duration'] ?? 20,
                                      ),
                                    ),
                                  );
                                }
                              : null,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red,
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text('Start', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Info Chips with enhanced styling
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _buildInfoChip(Icons.timer, '${workout['duration']} min', Colors.red),
                    _buildInfoChip(Icons.trending_up, workout['difficulty'], Colors.blue),
                    _buildInfoChip(Icons.local_fire_department, '${workout['calories']} cal', Colors.orange),
                    if (exercises.isNotEmpty)
                      _buildInfoChip(Icons.fitness_center, '${exercises.length} exercises', Colors.purple),
                  ],
                ),

                const SizedBox(height: 12),

                // Progress Bar (placeholder for now)
                Container(
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[700],
                    borderRadius: BorderRadius.circular(2),
                  ),
                  child: FractionallySizedBox(
                    alignment: Alignment.centerLeft,
                    widthFactor: 0.0, // TODO: Calculate based on user progress
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.green,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Not started yet',
                  style: TextStyle(color: Colors.white70, fontSize: 12),
                ),

                const SizedBox(height: 12),

                // Focus and BMI Note
                if (workout['focus'] != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 16),
                        const SizedBox(width: 6),
                        Text(
                          'Focus: ${workout['focus']}',
                          style: const TextStyle(color: Colors.white70, fontSize: 14),
                        ),
                      ],
                    ),
                  ),

                if (workout['bmiNote'] != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.blue.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.blue.withOpacity(0.5), width: 1),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.max,
                        children: [
                          const Icon(Icons.info_outline, color: Colors.blue, size: 16),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              workout['bmiNote'],
                              style: const TextStyle(color: Colors.blue, fontSize: 12),
                              softWrap: true,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                // Muscle Groups
                if (muscleGroups.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    'Targets: ${muscleGroups.join(", ")}',
                    style: const TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                ],

                // Benefits
                if (benefits.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  const Text(
                    'Benefits:',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: benefits.take(4).map((benefit) => Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.green.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.green.withOpacity(0.3), width: 1),
                      ),
                      child: Text(
                        '✓ $benefit',
                        style: const TextStyle(color: Colors.green, fontSize: 11),
                      ),
                    )).toList(),
                  ),
                ],

                // Expandable Exercise List
                if (exerciseNames.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  InkWell(
                    onTap: () => setState(() => isExpanded = !isExpanded),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              'Exercise List (${exerciseNames.length} exercises)',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                          ),
                          Icon(
                            isExpanded ? Icons.expand_less : Icons.expand_more,
                            color: Colors.red,
                          ),
                        ],
                      ),
                    ),
                  ),
                  AnimatedCrossFade(
                    duration: const Duration(milliseconds: 300),
                    crossFadeState: isExpanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
                    firstChild: const SizedBox.shrink(),
                    secondChild: Container(
                      margin: const EdgeInsets.only(top: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: exerciseNames.map((exercise) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 3),
                          child: Row(
                            children: [
                              const Icon(Icons.fiber_manual_record, color: Colors.red, size: 8),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  exercise,
                                  style: const TextStyle(color: Colors.white70, fontSize: 13),
                                ),
                              ),
                            ],
                          ),
                        )).toList(),
                      ),
                    ),
                  ),
                ],

                // Nutrition Tip (if present)
                if (workout['nutritionTip'] != null) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.amber.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.amber.withOpacity(0.3), width: 1),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.restaurant, color: Colors.amber, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            workout['nutritionTip'],
                            style: const TextStyle(color: Colors.amber, fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                // Quick Actions
                const SizedBox(height: 12),
                Row(
                  children: [
                    _buildQuickActionButton(Icons.share, 'Share', () {
                      // TODO: Implement share functionality
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Share functionality coming soon!')),
                      );
                    }),
                    const SizedBox(width: 8),
                    _buildQuickActionButton(Icons.bookmark_border, 'Save', () {
                      // TODO: Implement save functionality
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Saved to bookmarks!')),
                      );
                    }),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildQuickActionButton(IconData icon, String label, VoidCallback onPressed) {
    return Expanded(
      child: InkWell(
        onTap: onPressed,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: Colors.red.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.red.withOpacity(0.3), width: 1),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: Colors.red, size: 16),
              const SizedBox(width: 4),
              Text(label, style: const TextStyle(color: Colors.red, fontSize: 12)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
