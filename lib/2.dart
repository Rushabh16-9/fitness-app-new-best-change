// This file has been renamed to onboarding.dart for clarity.
import 'package:application_main/home_page.dart';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';

Future<void> saveWorkoutHistory(String planName, {double? caloriesBurned}) async {
  try {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    await FirebaseFirestore.instance.collection('workoutHistory').add({
      'userId': user.uid,
      'planName': planName,
      'timestamp': FieldValue.serverTimestamp(),
      'caloriesBurned': caloriesBurned ?? 150.0, // Default 150 calories if not provided
    });
    
    print('✅ Workout saved with ${caloriesBurned ?? 150.0} calories');
  } catch (e) {
    print('❌ Error saving workout history: $e');
  }
}



class PlanScreen extends StatefulWidget {
  const PlanScreen({super.key});

  @override
  State<PlanScreen> createState() => _PlanScreenState();
}

class _PlanScreenState extends State<PlanScreen> {
  String? startedPlanTitle;
  bool _isLoading = true;
  List<Map<String, dynamic>> plans = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    await _loadPlansFromFirestore();
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      startedPlanTitle = prefs.getString('startedPlan');
      _isLoading = false;
    });
  }

  Future<void> _loadPlansFromFirestore() async {
    try {
      final snapshot = await FirebaseFirestore.instance
          .collection('workoutPlans')
          .get();

      setState(() {
        plans = snapshot.docs.map((doc) {
          final data = doc.data();
          return {
            'title': data['title'] ?? 'Untitled Plan',
            'duration': data['duration'] ?? 'No duration',
            'image': data['image'] ?? 'assets/placeholder.png',
            'difficulty': data['difficulty'] ?? 'Intermediate',
            'planId': doc.id,
            'exercises': data['exercises'] ?? [],
          };
        }).toList();
      });
    } catch (e) {
      // Fallback to local plans
      setState(() {
        plans = [
          {
            "title": "IMMUNE SYSTEM BOOSTER",
            "duration": "3 levels · 7-15 min",
            "image": "assets/widepushup.png",
            "difficulty": "Beginner",
            "exercises": [],
          },
          // ... other default plans
        ];
      });
    }
  }

  Future<void> _saveStartedPlan(String planId, String title) async {
    final prefs = await SharedPreferences.getInstance();
    final user = FirebaseAuth.instance.currentUser;
    
    if (user != null) {
      await FirebaseFirestore.instance
          .collection('userWorkouts')
          .doc(user.uid)
          .update({
            'activePlan': {
              'planId': planId,
              'startedAt': FieldValue.serverTimestamp(),
            }
          });
    }
    
    await prefs.setString('startedPlan', title);
    setState(() => startedPlanTitle = title);
  }

  Future<void> _showPlanDetails(Map<String, dynamic> plan) async {
    await showModalBottomSheet(
      context: context,
      backgroundColor: Colors.grey[900],
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 5,
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: Colors.grey,
                    borderRadius: BorderRadius.circular(5),
                  ),
                ),
              ),
              Text(
                plan['title'],
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Icon(Icons.timer_outlined, color: Colors.white70, size: 16),
                  const SizedBox(width: 5),
                  Text(
                    plan['duration'],
                    style: const TextStyle(color: Colors.white70),
                  ),
                  const SizedBox(width: 15),
                  Icon(Icons.star, color: Colors.yellow[700], size: 16),
                  const SizedBox(width: 5),
                  Text(
                    plan['difficulty'],
                    style: const TextStyle(color: Colors.white70),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              const Text(
                "Exercises Included:",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 10),
              ..._buildExerciseList(plan['exercises']),
              const SizedBox(height: 30),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () {
                    Navigator.pop(context);
                    _startPlan(plan);
                  },
                  child: Text(
                    plan['title'] == startedPlanTitle 
                        ? "CONTINUE PLAN" 
                        : "START PLAN",
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  List<Widget> _buildExerciseList(List<dynamic> exercises) {
    if (exercises.isEmpty) {
      return [
        const Text(
          "No exercises details available",
          style: TextStyle(color: Colors.white70),
        ),
      ];
    }
    
    return exercises.map((exercise) => Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.grey[800],
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.fitness_center, color: Colors.white),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  exercise['name'] ?? 'Unknown Exercise',
                  style: const TextStyle(color: Colors.white),
                ),
                Text(
                  '${exercise['sets'] ?? 0} sets · ${exercise['reps'] ?? 0} reps',
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    )).toList();
  }

  Future<void> _startPlan(Map<String, dynamic> plan) async {
    await _saveStartedPlan(plan['planId'] ?? '', plan['title']);
    await saveWorkoutHistory(plan['title']);
    
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => HomePage(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final displayPlans = List<Map<String, dynamic>>.from(plans);
    if (startedPlanTitle != null) {
      final startedIndex = displayPlans.indexWhere(
        (plan) => plan["title"] == startedPlanTitle,
      );
      if (startedIndex != -1) {
        final startedPlan = displayPlans.removeAt(startedIndex);
        displayPlans.insert(0, startedPlan);
      }
    }

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.red,
        title: const Text("Workout Plans", style: TextStyle(color: Colors.white)),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings, color: Colors.white),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const AccountSettingsPage()),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          if (startedPlanTitle != null) ...[
            _buildActivePlanCard(),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Divider(color: Colors.grey),
            ),
            const Padding(
              padding: EdgeInsets.all(16),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  "All Workout Plans",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.only(bottom: 20),
              itemCount: displayPlans.length,
              itemBuilder: (context, index) {
                final plan = displayPlans[index];
                final isStarted = plan["title"] == startedPlanTitle;
                return _buildPlanCard(plan, isStarted);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActivePlanCard() {
    final activePlan = plans.firstWhere(
      (plan) => plan["title"] == startedPlanTitle,
    );

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "ACTIVE PLAN",
            style: TextStyle(
              color: Colors.white70,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          GestureDetector(
            onTap: () => _showPlanDetails(activePlan),
            child: Container(
              height: 180,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                image: DecorationImage(
                  image: AssetImage(activePlan["image"]),
                  fit: BoxFit.cover,
                  colorFilter: ColorFilter.mode(
                    Colors.black.withOpacity(0.4),
                    BlendMode.darken,
                  ),
                ),
              ),
              child: Stack(
                children: [
                  Positioned(
                    bottom: 16,
                    left: 16,
                    right: 16,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          activePlan["title"],
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          activePlan["duration"],
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.red,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                ),
                              ),
                              onPressed: () => _startPlan(activePlan),
                              child: const Text(
                                "CONTINUE",
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ),
                            const SizedBox(width: 10),
                            TextButton(
                              style: TextButton.styleFrom(
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                side: const BorderSide(color: Colors.white),
                              ),
                              onPressed: () => _showPlanDetails(activePlan),
                              child: const Text("DETAILS"),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlanCard(Map<String, dynamic> plan, bool isStarted) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () => _showPlanDetails(plan),
          child: Container(
            height: 150,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              image: DecorationImage(
                image: AssetImage(plan["image"]),
                fit: BoxFit.cover,
                colorFilter: ColorFilter.mode(
                  Colors.black.withOpacity(0.4),
                  BlendMode.darken,
                ),
              ),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Flexible(
                        child: Text(
                          plan["title"],
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      if (isStarted)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.red,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text(
                            "ACTIVE",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    plan["duration"],
                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(
                        Icons.star,
                        color: Colors.yellow[700],
                        size: 16,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        plan["difficulty"],
                        style: const TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                      const Spacer(),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        ),
                        onPressed: () => _startPlan(plan),
                        child: Text(
                          isStarted ? "CONTINUE" : "START",
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}




class AccountSettingsPage extends StatefulWidget {
  const AccountSettingsPage({super.key});

  @override
  State<AccountSettingsPage> createState() => _AccountSettingsPageState();
}

class _AccountSettingsPageState extends State<AccountSettingsPage> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _heightController;
  late TextEditingController _weightController;
  bool _isEditing = false;
  Map<String, dynamic>? _userData;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _heightController = TextEditingController();
    _weightController = TextEditingController();
    _fetchUserData();
  }

  Future<void> _fetchUserData() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    final doc = await FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .get();

    if (doc.exists) {
      setState(() {
        _userData = doc.data();
        _nameController.text = _userData?['name'] ?? '';
        _heightController.text = (_userData?['height'] ?? 0).toString();
        _weightController.text = (_userData?['weight'] ?? 0).toString();
      });
    }
  }

  Future<void> _saveChanges() async {
    if (!_formKey.currentState!.validate()) return;

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    try {
      await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .update({
        'name': _nameController.text,
        'height': double.parse(_heightController.text),
        'weight': double.parse(_weightController.text),
        'bmi': double.parse(_weightController.text) / 
              (double.parse(_heightController.text) * 
               double.parse(_heightController.text)),
        'lastUpdated': FieldValue.serverTimestamp(),
      });

      setState(() {
        _isEditing = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile updated successfully!')),
      );
      await _fetchUserData();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error updating profile: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Account Settings'),
        backgroundColor: Colors.red,
        actions: [
          if (!_isEditing && _userData != null)
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () => setState(() => _isEditing = true),
            ),
        ],
      ),
      body: _userData == null
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildInfoTile('Email', _userData!['email'] ?? 'Not set'),
                    const SizedBox(height: 20),
                    _buildEditableField(
                      'Name',
                      _nameController,
                      _isEditing,
                      Icons.person,
                    ),
                    const SizedBox(height: 20),
                    _buildEditableField(
                      'Height (m)',
                      _heightController,
                      _isEditing,
                      Icons.height,
                      isNumeric: true,
                    ),
                    const SizedBox(height: 20),
                    _buildEditableField(
                      'Weight (kg)',
                      _weightController,
                      _isEditing,
                      Icons.monitor_weight,
                      isNumeric: true,
                    ),
                    const SizedBox(height: 20),
                    _buildInfoTile(
                      'BMI',
                      _userData!['bmi']?.toStringAsFixed(1) ?? 'Not calculated',
                    ),
                    const SizedBox(height: 20),
                    _buildInfoTile(
                      'Fitness Goal',
                      _userData!['goal'] ?? 'Not set',
                    ),
                    const SizedBox(height: 20),
                    _buildInfoTile(
                      'Fitness Level',
                      _getFitnessLevelDescription(_userData!['fitnessLevel']),
                    ),
                    if (_isEditing) ...[
                      const SizedBox(height: 30),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          TextButton(
                            onPressed: () => setState(() => _isEditing = false),
                            child: const Text('Cancel'),
                          ),
                          const SizedBox(width: 10),
                          ElevatedButton(
                            onPressed: _saveChanges,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red,
                            ),
                            child: const Text('Save Changes'),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildInfoTile(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Colors.grey,
            fontSize: 14,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
          ),
        ),
        const Divider(color: Colors.grey),
      ],
    );
  }

  Widget _buildEditableField(
    String label,
    TextEditingController controller,
    bool isEditing,
    IconData icon, {
    bool isNumeric = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Colors.grey,
            fontSize: 14,
          ),
        ),
        const SizedBox(height: 4),
        isEditing
            ? TextFormField(
                controller: controller,
                style: const TextStyle(color: Colors.white),
                keyboardType:
                    isNumeric ? TextInputType.number : TextInputType.text,
                decoration: InputDecoration(
                  prefixIcon: Icon(icon, color: Colors.grey),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter $label';
                  }
                  if (isNumeric && double.tryParse(value) == null) {
                    return 'Please enter a valid number';
                  }
                  return null;
                },
              )
            : Container(
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 12),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    Icon(icon, color: Colors.grey),
                    const SizedBox(width: 10),
                    Text(
                      controller.text,
                      style: const TextStyle(color: Colors.white, fontSize: 16),
                    ),
                  ],
                ),
              ),
      ],
    );
  }

  String _getFitnessLevelDescription(int? level) {
    switch (level) {
      case 0:
        return 'Beginner';
      case 1:
        return 'Light';
      case 2:
        return 'Moderate';
      case 3:
        return 'Active';
      case 4:
        return 'Athlete';
      default:
        return 'Not set';
    }
  }
}

// Enhanced Dashboard Page
class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Dashboard'),
        backgroundColor: Colors.red,
      ),
      body: StreamBuilder<DocumentSnapshot>(
        stream: FirebaseFirestore.instance
            .collection('users')
            .doc(FirebaseAuth.instance.currentUser?.uid)
            .snapshots(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }

          final userData = snapshot.data!.data() as Map<String, dynamic>?;

          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                Card(
                  color: Colors.grey[900],
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        const Text(
                          'Your Stats',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildStatCard('Height', '${userData?['height'] ?? 0}m'),
                            _buildStatCard('Weight', '${userData?['weight'] ?? 0}kg'),
                            _buildStatCard('BMI', userData?['bmi']?.toStringAsFixed(1) ?? '0'),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Expanded(
                  child: GridView.count(
                    crossAxisCount: 2,
                    childAspectRatio: 1.5,
                    children: [
                      _buildDashboardCard(
                        context,
                        'Workouts',
                        Icons.fitness_center,
                        Colors.blue,
                        () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const PlanScreen(),
                          ),
                        ),
                      ),
                      _buildDashboardCard(
                        context,
                        'Progress',
                        Icons.trending_up,
                        Colors.green,
                        () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const ProgressPage(),
                          ),
                        ),
                      ),
                      _buildDashboardCard(
                        context,
                        'Nutrition',
                        Icons.restaurant,
                        Colors.orange,
                        () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const NutritionPage(),
                          ),
                        ),
                      ),
                      _buildDashboardCard(
                        context,
                        'Goals',
                        Icons.flag,
                        Colors.purple,
                        () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const GoalsPage(),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatCard(String title, String value) {
    return Column(
      children: [
        Text(
          title,
          style: const TextStyle(color: Colors.grey),
        ),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildDashboardCard(
    BuildContext context,
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return Card(
      color: Colors.grey[900],
      child: InkWell(
        onTap: onTap,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 40, color: color),
              const SizedBox(height: 10),
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}


class ProgressPage extends StatelessWidget {
  const ProgressPage({super.key});

  @override
  Widget build(BuildContext context) {
    final userId = FirebaseAuth.instance.currentUser?.uid;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Your Progress'),
        backgroundColor: Colors.red,
      ),
      body: userId == null
          ? const Center(
              child: Text(
                'Please log in to view your progress',
                style: TextStyle(color: Colors.white),
              ),
            )
          : StreamBuilder<DocumentSnapshot>(
              stream: FirebaseFirestore.instance
                  .collection('userProgress')
                  .doc(userId)
                  .snapshots(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (!snapshot.hasData || !snapshot.data!.exists) {
                  return const Center(
                    child: Text(
                      'No progress data available',
                      style: TextStyle(color: Colors.white)),
                  );
                }

                final progressData = snapshot.data!.data() as Map<String, dynamic>;
                final weightData = progressData['weightProgress'] ?? [];
                final workoutData = progressData['workoutProgress'] ?? [];

                return SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Weight Progress',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        height: 200,
                        child: weightData.isEmpty
                            ? const Center(
                                child: Text(
                                  'No weight data recorded',
                                  style: TextStyle(color: Colors.white70),
                                ),
                              )
                            : LineChart(
                                LineChartData(
                                  lineBarsData: [
                                    LineChartBarData(
                                      spots: List.generate(
                                        weightData.length,
                                        (index) => FlSpot(
                                          index.toDouble(),
                                          (weightData[index]['weight'] as num).toDouble(),
                                        ),
                                      ),
                                      isCurved: true,
                                      color: Colors.red,
                                      belowBarData: BarAreaData(show: false),
                                    ),
                                  ],
                                  titlesData: FlTitlesData(
                                    bottomTitles: AxisTitles(
                                      sideTitles: SideTitles(
                                        showTitles: true,
                                        getTitlesWidget: (value, meta) {
                                          if (value.toInt() < weightData.length) {
                                            final date = (weightData[value.toInt()]['date'] as Timestamp).toDate();
                                            return Text(
                                              '${date.day}/${date.month}',
                                              style: const TextStyle(
                                                color: Colors.white70,
                                                fontSize: 10,
                                              ),
                                            );
                                          }
                                          return const Text('');
                                        },
                                      ),
                                    ),
                                    leftTitles: AxisTitles(
                                      sideTitles: SideTitles(
                                        showTitles: true,
                                        getTitlesWidget: (value, meta) {
                                          return Text(
                                            '${value.toInt()}kg',
                                            style: const TextStyle(
                                              color: Colors.white70,
                                              fontSize: 10,
                                            ),
                                          );
                                        },
                                      ),
                                    ),
                                  ),
                                  borderData: FlBorderData(show: false),
                                ),
                              ),
                      ),
                      const SizedBox(height: 32),
                      const Text(
                        'Workout Progress',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      workoutData.isEmpty
                          ? const Center(
                              child: Text(
                                'No workout data recorded',
                                style: TextStyle(color: Colors.white70),
                              ),
                            )
                          : Column(
                              children: List.generate(
                                workoutData.length,
                                (index) => ListTile(
                                  title: Text(
                                    workoutData[index]['workoutName'],
                                    style: const TextStyle(color: Colors.white),
                                  ),
                                  subtitle: Text(
                                    '${workoutData[index]['completedSets']}/${workoutData[index]['totalSets']} sets',
                                    style: const TextStyle(color: Colors.white70),
                                  ),
                                  trailing: Text(
                                    '${workoutData[index]['progress']}%',
                                    style: TextStyle(
                                      color: _getProgressColor(
                                          workoutData[index]['progress']),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                    ],
                  ),
                );
              },
            ),
    );
  }

  static Color _getProgressColor(int progress) {
    if (progress < 30) return Colors.red;
    if (progress < 70) return Colors.orange;
    return Colors.green;
  }
}



class NutritionPage extends StatefulWidget {
  const NutritionPage({super.key});

  @override
  State<NutritionPage> createState() => _NutritionPageState();
}

class _NutritionPageState extends State<NutritionPage> {
  final List<Map<String, dynamic>> _meals = [];
  final TextEditingController _mealController = TextEditingController();
  final TextEditingController _caloriesController = TextEditingController();
  DateTime _selectedDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    _loadNutritionData();
  }

  Future<void> _loadNutritionData() async {
    final userId = FirebaseAuth.instance.currentUser?.uid;
    if (userId == null) return;

    final snapshot = await FirebaseFirestore.instance
        .collection('nutrition')
        .doc(userId)
        .collection('meals')
        .where('date', isEqualTo: Timestamp.fromDate(_selectedDate))
        .get();

    setState(() {
      _meals.clear();
      _meals.addAll(snapshot.docs.map((doc) => doc.data()));
    });
  }

  Future<void> _addMeal() async {
    if (_mealController.text.isEmpty || _caloriesController.text.isEmpty) return;

    final userId = FirebaseAuth.instance.currentUser?.uid;
    if (userId == null) return;

    try {
      await FirebaseFirestore.instance
          .collection('nutrition')
          .doc(userId)
          .collection('meals')
          .add({
        'mealName': _mealController.text,
        'calories': int.parse(_caloriesController.text),
        'date': Timestamp.fromDate(_selectedDate),
        'timestamp': FieldValue.serverTimestamp(),
      });

      _mealController.clear();
      _caloriesController.clear();
      await _loadNutritionData();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error adding meal: $e')),
      );
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
      await _loadNutritionData();
    }
  }

  @override
  Widget build(BuildContext context) {
    final totalCalories = _meals.fold(0, (sum, meal) => sum + (meal['calories'] as int));

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Nutrition Tracker'),
        backgroundColor: Colors.red,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.chevron_left, color: Colors.white),
                  onPressed: () {
                    setState(() {
                      _selectedDate = _selectedDate.subtract(const Duration(days: 1));
                    });
                    _loadNutritionData();
                  },
                ),
                TextButton(
                  onPressed: () => _selectDate(context),
                  child: Text(
                    DateFormat('MMMM d, y').format(_selectedDate),
                    style: const TextStyle(color: Colors.white, fontSize: 16),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.chevron_right, color: Colors.white),
                  onPressed: () {
                    if (_selectedDate.isBefore(DateTime.now())) {
                      setState(() {
                        _selectedDate = _selectedDate.add(const Duration(days: 1));
                      });
                      _loadNutritionData();
                    }
                  },
                ),
              ],
            ),
            const SizedBox(height: 20),
            Card(
              color: Colors.grey[900],
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    const Text(
                      'Daily Summary',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      '$totalCalories calories',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                      ),
                    ),
                    const SizedBox(height: 10),
                    LinearProgressIndicator(
                      value: totalCalories / 2000, // Assuming 2000 is daily goal
                      backgroundColor: Colors.grey[800],
                      valueColor: const AlwaysStoppedAnimation<Color>(Colors.red),
                    ),
                    const SizedBox(height: 5),
                    const Text(
                      'of daily goal',
                      style: TextStyle(color: Colors.white70),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Add Meal',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _mealController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Meal Name',
                labelStyle: TextStyle(color: Colors.white70),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _caloriesController,
              style: const TextStyle(color: Colors.white),
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Calories',
                labelStyle: TextStyle(color: Colors.white70),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: _addMeal,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
              ),
              child: const Text('Add Meal'),
            ),
            const SizedBox(height: 20),
            const Text(
              'Meal History',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            _meals.isEmpty
                ? const Center(
                    child: Text(
                      'No meals recorded for this day',
                      style: TextStyle(color: Colors.white70),
                    ),
                  )
                : Column(
                    children: _meals.map((meal) => ListTile(
                      title: Text(
                        meal['mealName'],
                        style: const TextStyle(color: Colors.white),
                      ),
                      subtitle: Text(
                        '${meal['calories']} calories',
                        style: const TextStyle(color: Colors.white70),
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete, color: Colors.red),
                        onPressed: () async {
                          // Implement delete functionality
                        },
                      ),
                    )).toList(),
                  ),
          ],
        ),
      ),
    );
  }
}


class GoalsPage extends StatefulWidget {
  const GoalsPage({super.key});

  @override
  State<GoalsPage> createState() => _GoalsPageState();
}

class _GoalsPageState extends State<GoalsPage> {
  final TextEditingController _goalController = TextEditingController();
  final TextEditingController _targetValueController = TextEditingController();
  final TextEditingController _deadlineController = TextEditingController();
  DateTime? _selectedDeadline;
  String _selectedGoalType = 'Weight Loss';

  final List<String> _goalTypes = [
    'Weight Loss',
    'Muscle Gain',
    'Endurance',
    'Flexibility',
    'Strength'
  ];

  @override
  void dispose() {
    _goalController.dispose();
    _targetValueController.dispose();
    _deadlineController.dispose();
    super.dispose();
  }

  Future<void> _selectDeadline(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDeadline ?? DateTime.now().add(const Duration(days: 30)),
      firstDate: DateTime.now(),
      lastDate: DateTime(DateTime.now().year + 2),
    );
    
    if (picked != null) {
      setState(() {
        _selectedDeadline = picked;
        _deadlineController.text = DateFormat('yyyy-MM-dd').format(picked);
      });
    }
  }

  Future<void> _addGoal() async {
    if (_goalController.text.isEmpty || 
        _targetValueController.text.isEmpty || 
        _selectedDeadline == null) {
      return;
    }

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    try {
      await FirebaseFirestore.instance
          .collection('userGoals')
          .doc(user.uid)
          .collection('goals')
          .add({
        'title': _goalController.text,
        'type': _selectedGoalType,
        'targetValue': double.parse(_targetValueController.text),
        'currentValue': 0.0,
        'deadline': Timestamp.fromDate(_selectedDeadline!),
        'createdAt': FieldValue.serverTimestamp(),
        'isCompleted': false,
      });

      _goalController.clear();
      _targetValueController.clear();
      _deadlineController.clear();
      setState(() => _selectedDeadline = null);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error adding goal: $e')),
      );
    }
  }

  Future<void> _updateGoalProgress(String goalId, double newValue) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    await FirebaseFirestore.instance
        .collection('userGoals')
        .doc(user.uid)
        .collection('goals')
        .doc(goalId)
        .update({
          'currentValue': newValue,
          'lastUpdated': FieldValue.serverTimestamp(),
        });
  }

  Future<void> _toggleGoalCompletion(String goalId, bool isCompleted) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    await FirebaseFirestore.instance
        .collection('userGoals')
        .doc(user.uid)
        .collection('goals')
        .doc(goalId)
        .update({'isCompleted': !isCompleted});
  }

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('My Goals'),
        backgroundColor: Colors.red,
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showAddGoalDialog(context),
          ),
        ],
      ),
      body: user == null
          ? const Center(
              child: Text(
                'Please log in to view your goals',
                style: TextStyle(color: Colors.white),
              ),
            )
          : StreamBuilder<QuerySnapshot>(
              stream: FirebaseFirestore.instance
                  .collection('userGoals')
                  .doc(user.uid)
                  .collection('goals')
                  .orderBy('deadline')
                  .snapshots(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text(
                          'No goals set yet',
                          style: TextStyle(color: Colors.white70),
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton(
                          onPressed: () => _showAddGoalDialog(context),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red,
                          ),
                          child: const Text('Add Your First Goal'),
                        ),
                      ],
                    ),
                  );
                }

                final goals = snapshot.data!.docs;

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: goals.length,
                  itemBuilder: (context, index) {
                    final goal = goals[index];
                    final data = goal.data() as Map<String, dynamic>;
                    final deadline = (data['deadline'] as Timestamp).toDate();
                    final progress = data['currentValue'] / data['targetValue'];
                    final daysRemaining = deadline.difference(DateTime.now()).inDays;

                    return Card(
                      color: Colors.grey[900],
                      margin: const EdgeInsets.only(bottom: 16),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  data['title'],
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                IconButton(
                                  icon: Icon(
                                    data['isCompleted']
                                        ? Icons.check_circle
                                        : Icons.check_circle_outline,
                                    color: data['isCompleted']
                                        ? Colors.green
                                        : Colors.grey,
                                  ),
                                  onPressed: () => _toggleGoalCompletion(
                                    goal.id,
                                    data['isCompleted'],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Target: ${data['targetValue']} ${_getUnitForGoalType(data['type'])}',
                              style: const TextStyle(color: Colors.white70),
                            ),
                            Text(
                              'Current: ${data['currentValue']} ${_getUnitForGoalType(data['type'])}',
                              style: const TextStyle(color: Colors.white70),
                            ),
                            Text(
                              'Deadline: ${DateFormat('MMM d, y').format(deadline)} '
                              '($daysRemaining days remaining)',
                              style: TextStyle(
                                color: daysRemaining < 0
                                    ? Colors.red
                                    : Colors.white70,
                              ),
                            ),
                            const SizedBox(height: 12),
                            LinearProgressIndicator(
                              value: progress > 1 ? 1 : progress,
                              backgroundColor: Colors.grey[800],
                              valueColor: AlwaysStoppedAnimation<Color>(
                                progress >= 1
                                    ? Colors.green
                                    : Colors.red,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: Slider(
                                    value: data['currentValue'].toDouble(),
                                    min: 0,
                                    max: data['targetValue'].toDouble(),
                                    onChanged: (value) {
                                      _updateGoalProgress(goal.id, value);
                                    },
                                    activeColor: Colors.red,
                                    inactiveColor: Colors.grey,
                                  ),
                                ),
                                Text(
                                  '${(progress * 100).toStringAsFixed(1)}%',
                                  style: const TextStyle(color: Colors.white),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
    );
  }

  String _getUnitForGoalType(String type) {
    switch (type) {
      case 'Weight Loss':
      case 'Muscle Gain':
        return 'kg';
      case 'Endurance':
        return 'min';
      case 'Strength':
        return 'kg lifted';
      case 'Flexibility':
        return 'cm';
      default:
        return '';
    }
  }

  Future<void> _showAddGoalDialog(BuildContext context) async {
    return showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: Colors.grey[900],
          title: const Text(
            'Add New Goal',
            style: TextStyle(color: Colors.white),
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: _goalController,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: 'Goal Title',
                    labelStyle: TextStyle(color: Colors.white70),
                  ),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  initialValue: _selectedGoalType,
                  items: _goalTypes.map((type) {
                    return DropdownMenuItem(
                      value: type,
                      child: Text(
                        type,
                        style: const TextStyle(color: Colors.white),
                      ),
                    );
                  }).toList(),
                  onChanged: (value) {
                    if (value != null) {
                      setState(() => _selectedGoalType = value);
                    }
                  },
                  dropdownColor: Colors.grey[800],
                  decoration: const InputDecoration(
                    labelText: 'Goal Type',
                    labelStyle: TextStyle(color: Colors.white70),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _targetValueController,
                  style: const TextStyle(color: Colors.white),
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Target Value (${_getUnitForGoalType(_selectedGoalType)})',
                    labelStyle: const TextStyle(color: Colors.white70),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _deadlineController,
                  style: const TextStyle(color: Colors.white),
                  readOnly: true,
                  onTap: () => _selectDeadline(context),
                  decoration: const InputDecoration(
                    labelText: 'Deadline',
                    labelStyle: TextStyle(color: Colors.white70),
                    suffixIcon: Icon(Icons.calendar_today, color: Colors.white70),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                _addGoal();
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
              ),
              child: const Text('Add Goal'),
            ),
          ],
        );
      },
    );
  }
}

// Enhanced Privacy Policy Page
class PrivacyPolicyPage extends StatelessWidget {
  const PrivacyPolicyPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Privacy Policy'),
        backgroundColor: Colors.red,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Privacy Policy',
              style: TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Last Updated: August 2023',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 30),
            _buildPolicySection(
              '1. Information We Collect',
              'We collect personal information you provide when you create an account, including your name, email, height, weight, and fitness goals. We also collect workout data you input.',
            ),
            _buildPolicySection(
              '2. How We Use Your Information',
              'Your information is used to provide personalized fitness recommendations, track your progress, and improve our services. We do not sell your personal data.',
            ),
            _buildPolicySection(
              '3. Data Security',
              'We implement industry-standard security measures to protect your data. All data is encrypted in transit and at rest.',
            ),
            _buildPolicySection(
              '4. Your Rights',
              'You can access, update, or delete your personal information at any time through your account settings.',
            ),
            _buildPolicySection(
              '5. Contact Us',
              'For any privacy-related questions, please contact us at privacy@fitnessapp.com',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPolicySection(String title, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }
}