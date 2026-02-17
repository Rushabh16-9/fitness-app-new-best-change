import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'constants.dart';
import 'ai_workout_service.dart';
import 'database_service.dart';

class PersonalizedWorkoutPage extends StatefulWidget {
  const PersonalizedWorkoutPage({super.key});

  @override
  State<PersonalizedWorkoutPage> createState() => _PersonalizedWorkoutPageState();
}

class _PersonalizedWorkoutPageState extends State<PersonalizedWorkoutPage> {
  late AIWorkoutService _aiService;
  List<Map<String, dynamic>> _personalizedWorkouts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initializeService();
  }

  Future<void> _initializeService() async {
    final databaseService = Provider.of<DatabaseService>(context, listen: false);
    _aiService = AIWorkoutService(databaseService: databaseService);
    await _loadPersonalizedWorkouts();
  }

  Future<void> _loadPersonalizedWorkouts() async {
    setState(() => _isLoading = true);
    try {
      final workouts = await _aiService.generatePersonalizedWorkout();
      setState(() {
        _personalizedWorkouts = workouts;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading workouts: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConstants.darkBackground,
      appBar: AppBar(
        title: Text('AI Workout Plans', style: AppConstants.titleLarge),
        backgroundColor: AppConstants.primaryRed,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppConstants.primaryRed),
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadPersonalizedWorkouts,
              child: ListView(
                padding: const EdgeInsets.all(AppConstants.paddingMedium),
                children: [
                  _buildHeader(),
                  const SizedBox(height: AppConstants.paddingLarge),
                  ..._personalizedWorkouts.map((workout) => _buildWorkoutCard(workout)),
                  const SizedBox(height: AppConstants.paddingLarge),
                  _buildRegenerateButton(),
                ],
              ),
            ),
    );
  }

  Widget _buildHeader() {
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
            children: [
              Icon(
                AppConstants.featureIcons['workouts'],
                color: AppConstants.textPrimary,
                size: 32,
              ),
              const SizedBox(width: AppConstants.paddingMedium),
              Text(
                'Your Personalized Plan',
                style: AppConstants.headlineSmall,
              ),
            ],
          ),
          const SizedBox(height: AppConstants.paddingMedium),
          Text(
            'AI-generated workouts based on your fitness level, goals, and preferences.',
            style: AppConstants.bodyLarge,
          ),
        ],
      ),
    );
  }

  Widget _buildWorkoutCard(Map<String, dynamic> workout) {
    return Card(
      color: AppConstants.cardBackground,
      margin: const EdgeInsets.only(bottom: AppConstants.paddingMedium),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusMedium),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppConstants.primaryRed.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
                  ),
                  child: Icon(
                    Icons.fitness_center,
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
                        workout['name'] ?? 'Workout',
                        style: AppConstants.titleMedium,
                      ),
                      Text(
                        '${workout['duration'] ?? 30} minutes • ${workout['difficulty'] ?? 'Beginner'}',
                        style: AppConstants.bodyMedium,
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => _startWorkout(workout),
                  icon: Icon(
                    Icons.play_arrow,
                    color: AppConstants.primaryRed,
                    size: 28,
                  ),
                ),
              ],
            ),
            if (workout['exercises'] != null) ...[
              const SizedBox(height: AppConstants.paddingMedium),
              Text(
                'Exercises:',
                style: AppConstants.bodyLarge.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: AppConstants.paddingSmall),
              ...(workout['exercises'] as List<dynamic>).map((exercise) => Padding(
                padding: const EdgeInsets.only(bottom: AppConstants.paddingSmall),
                child: Row(
                  children: [
                    Icon(
                      Icons.circle,
                      size: 8,
                      color: AppConstants.textSecondary,
                    ),
                    const SizedBox(width: AppConstants.paddingSmall),
                    Text(
                      exercise.toString(),
                      style: AppConstants.bodyMedium,
                    ),
                  ],
                ),
              )),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildRegenerateButton() {
    return ElevatedButton.icon(
      onPressed: _loadPersonalizedWorkouts,
      icon: const Icon(Icons.refresh),
      label: const Text('Generate New Plan'),
      style: ElevatedButton.styleFrom(
        backgroundColor: AppConstants.primaryRed,
        foregroundColor: AppConstants.textPrimary,
        minimumSize: const Size(double.infinity, 50),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConstants.borderRadiusMedium),
        ),
      ),
    );
  }

  void _startWorkout(Map<String, dynamic> workout) {
    // Navigate to workout execution page
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Starting ${workout['name']} workout...')),
    );
  }
}
