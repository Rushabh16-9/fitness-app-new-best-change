// me_page.dart
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'database_service.dart';
import 'yoga_exercises_page.dart';
import 'leaderboard_page.dart';
import 'equipment_marketplace_page.dart';
import 'main.dart'; // For LoginPage

class MePage extends StatefulWidget {
  final String? uid;
  
  const MePage({super.key, this.uid});
  
  @override
  State<MePage> createState() => _MePageState();
}

class _MePageState extends State<MePage> {
  late DatabaseService _databaseService;
  Map<String, dynamic> _userProfile = {};
  Map<String, dynamic> _workoutSettings = {};
  List<String> _completedWorkouts = [];
  List<Map<String, dynamic>> _dayHistory = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _databaseService = DatabaseService(uid: widget.uid ?? FirebaseAuth.instance.currentUser?.uid);
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      _userProfile = await _databaseService.getUserProfile();
      _workoutSettings = await _databaseService.getWorkoutSettings();
      _completedWorkouts = await _databaseService.getCompletedWorkouts();
      _dayHistory = await _databaseService.getCompletedDayHistory();
      
      // Set default values if not exists
      _userProfile = {
        'name': (_userProfile['name'] ?? FirebaseAuth.instance.currentUser?.displayName ?? 'User').toString(),
        'email': FirebaseAuth.instance.currentUser?.email ?? 'Not logged in',
        'gender': (_userProfile['gender'] ?? 'Male').toString(),
        'weight': (_userProfile['weight'] ?? '153.2').toString(),
        'height': (_userProfile['height'] ?? '60').toString(),
        'dob': (_userProfile['dob'] ?? '2004-09-09').toString(),
      };
      
      _workoutSettings = {
        'soundEnabled': _workoutSettings['soundEnabled'] ?? true,
        'soundVolume': _workoutSettings['soundVolume'] ?? 0.7,
      };
    } catch (e) {
      print('Error loading data: $e');
      _userProfile = {
        'name': FirebaseAuth.instance.currentUser?.displayName ?? 'User',
        'email': FirebaseAuth.instance.currentUser?.email ?? 'Not logged in',
        'gender': 'Male',
        'weight': '153.2',
        'height': '60',
        'dob': '2004-09-09',
      };
      
      _workoutSettings = {
        'soundEnabled': true,
        'soundVolume': 0.7,
      };
      
      _completedWorkouts = [];
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final userName = _userProfile['name']?.toString() ?? 'User';
    final userEmail = _userProfile['email']?.toString() ?? '';
    
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Profile', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 24)),
        backgroundColor: Colors.black,
        elevation: 0,
        centerTitle: false,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.red))
          : SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Profile Header Card
                  Container(
                    margin: const EdgeInsets.all(16),
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Colors.red.shade900, Colors.red.shade700, Colors.orange.shade800],
                      ),
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.red.withOpacity(0.3),
                          blurRadius: 20,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        // Avatar with glow effect
                        Container(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.white.withOpacity(0.3),
                                blurRadius: 20,
                                spreadRadius: 5,
                              ),
                            ],
                          ),
                          child: CircleAvatar(
                            radius: 50,
                            backgroundColor: Colors.white,
                            child: Text(
                              userName.isNotEmpty ? userName[0].toUpperCase() : 'U',
                              style: const TextStyle(fontSize: 42, fontWeight: FontWeight.bold, color: Colors.red),
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        Text(
                          userName,
                          style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold, letterSpacing: 1),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          userEmail,
                          style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 14),
                        ),
                        const SizedBox(height: 24),
                        // Action Buttons Row with enhanced design
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            _buildActionButton('Edit Profile', Icons.edit_rounded, () => _showProfileDialog()),
                            _buildActionButton('Marketplace', Icons.shopping_bag_rounded, () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => const EquipmentMarketplacePage()),
                              );
                            }),
                            _buildActionButton('Yoga', Icons.self_improvement_rounded, () => _showYogaExerciseEntry()),
                          ],
                        ),
                      ],
                    ),
                  ),
                  
                  // Settings Section
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.grey[900],
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white.withOpacity(0.1), width: 1),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.settings_rounded, color: Colors.red, size: 20),
                            const SizedBox(width: 8),
                            const Text(
                              'SETTINGS',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16, letterSpacing: 1.5),
                            ),
                            const Spacer(),
                            Container(
                              height: 1,
                              width: 60,
                              color: Colors.red.withOpacity(0.5),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        _buildModernSettingsItem('My Profile', Icons.person_rounded, Colors.orange, _showProfileDialog),
                        _buildModernSettingsItem('My Workouts', Icons.fitness_center_rounded, Colors.red, _showWorkoutsDialog),
                        _buildModernSettingsItem('Workout Settings', Icons.tune_rounded, Colors.blue, _showWorkoutSettingsDialog),
                        _buildModernSettingsItem('Yoga Exercises', Icons.self_improvement_rounded, Colors.green, _showYogaExerciseEntry),
                        _buildModernSettingsItem('Leaderboard', Icons.leaderboard_rounded, Colors.indigo, _showLeaderboardDialog),
                        _buildModernSettingsItem('Language', Icons.language_rounded, Colors.purple, _showLanguageDialog, subtitle: 'System default'),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Community & Feedback Section
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.grey[900],
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white.withOpacity(0.1), width: 1),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.people_rounded, color: Colors.teal, size: 20),
                            const SizedBox(width: 8),
                            const Text(
                              'COMMUNITY',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16, letterSpacing: 1.5),
                            ),
                            const Spacer(),
                            Container(
                              height: 1,
                              width: 60,
                              color: Colors.teal.withOpacity(0.5),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        _buildModernSettingsItem('Rate Us', Icons.star_rounded, Colors.amber, _showRateUsDialog),
                        _buildModernSettingsItem('Send Feedback', Icons.feedback_rounded, Colors.teal, () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Feedback form coming soon!'), backgroundColor: Colors.blue),
                          );
                        }),
                        _buildModernSettingsItem('Share App', Icons.share_rounded, Colors.lightBlue, _shareApp),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Logout Button with enhanced design
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: _handleLogout,
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [Colors.red.shade700, Colors.red.shade900],
                            ),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.red.withOpacity(0.3),
                                blurRadius: 15,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              Icon(Icons.logout_rounded, color: Colors.white, size: 24),
                              SizedBox(width: 12),
                              Text(
                                'Logout',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  
                  // Version Info
                  Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Center(
                      child: Text(
                        'Version 1.4.08',
                        style: TextStyle(color: Colors.grey[600], fontSize: 14),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildActionButton(String label, IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.15),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.3), width: 1.5),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: Colors.white, size: 26),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildModernSettingsItem(String title, IconData icon, Color iconColor, VoidCallback onTap, {String? subtitle, bool isDestructive = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(14),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white.withOpacity(0.05), width: 1),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(11),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [iconColor, iconColor.withOpacity(0.7)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: iconColor.withOpacity(0.3),
                        blurRadius: 8,
                        spreadRadius: 1,
                      ),
                    ],
                  ),
                  child: Icon(icon, color: Colors.white, size: 22),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          color: isDestructive ? Colors.red : Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      if (subtitle != null) ...[
                        const SizedBox(height: 3),
                        Text(
                          subtitle,
                          style: TextStyle(color: Colors.grey[500], fontSize: 12),
                        ),
                      ],
                    ],
                  ),
                ),
                if (!isDestructive)
                  Icon(Icons.arrow_forward_ios_rounded, color: Colors.grey[600], size: 18),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _shareApp() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Share functionality coming soon!'),
        backgroundColor: Colors.blue,
        duration: Duration(seconds: 2),
      ),
    );
  }

  Future<void> _handleLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[900],
        title: const Text('Logout', style: TextStyle(color: Colors.white)),
        content: const Text(
          'Are you sure you want to logout?',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel', style: TextStyle(color: Colors.white70)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Logout', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await FirebaseAuth.instance.signOut();
        if (mounted) {
          // Navigate to login page and clear navigation stack
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (_) => const LoginPage()),
            (route) => false,
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Logout failed: $e'), backgroundColor: Colors.red),
          );
        }
      }
    }
  }

  void _showProfileDialog() {
    final TextEditingController nameController = TextEditingController(text: _userProfile['name']);
    final TextEditingController emailController = TextEditingController(text: _userProfile['email']);
    final TextEditingController genderController = TextEditingController(text: _userProfile['gender']);
    final TextEditingController weightController = TextEditingController(text: _userProfile['weight']);
    final TextEditingController heightController = TextEditingController(text: _userProfile['height']);
    final TextEditingController dobController = TextEditingController(text: _userProfile['dob']);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.black,
        title: const Text(
          'MY PROFILE',
          style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircleAvatar(
                radius: 40,
                backgroundColor: Colors.red,
                child: Icon(Icons.person, size: 50, color: Colors.white),
              ),
              const SizedBox(height: 16),
              _buildEditableProfileField('Name', nameController),
              _buildEditableProfileField('Email', emailController, readOnly: true),
              _buildEditableProfileField('Gender', genderController),
              _buildEditableProfileField('Weight (lbs)', weightController, isNumeric: true),
              _buildEditableProfileField('Height (")', heightController, isNumeric: true),
              _buildEditableProfileField('Date of Birth (YYYY-MM-DD)', dobController),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.white70)),
          ),
          TextButton(
            onPressed: () async {
              final updatedData = {
                'name': nameController.text,
                'gender': genderController.text,
                'weight': weightController.text,
                'height': heightController.text,
                'dob': dobController.text,
              };
              await _databaseService.updateUserProfile(updatedData);
              setState(() {
                _userProfile.addAll(updatedData);
              });
              Navigator.pop(context);
            },
            child: const Text('Save', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  Widget _buildEditableProfileField(String label, TextEditingController controller, {bool isNumeric = false, bool readOnly = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: TextField(
        controller: controller,
        readOnly: readOnly,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Colors.white70),
          enabledBorder: const UnderlineInputBorder(
            borderSide: BorderSide(color: Colors.grey),
          ),
          focusedBorder: const UnderlineInputBorder(
            borderSide: BorderSide(color: Colors.red),
          ),
        ),
        keyboardType: isNumeric ? TextInputType.number : TextInputType.text,
      ),
    );
  }

  void _showWorkoutsDialog() async {
    _completedWorkouts = await _databaseService.getCompletedWorkouts();
    _dayHistory = await _databaseService.getCompletedDayHistory();
    setState(() {});

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => WorkoutHistoryPage(
          completedWorkouts: _completedWorkouts,
          dayHistory: _dayHistory,
          onReset: () async {
            await _databaseService.fullResetDayProgress();
            _completedWorkouts = await _databaseService.getCompletedWorkouts();
            _dayHistory = await _databaseService.getCompletedDayHistory();
            if (mounted) setState(() {});
          },
        ),
      ),
    );
  }

  void _showWorkoutSettingsDialog() {
    bool soundEnabled = _workoutSettings['soundEnabled'];
    double soundVolume = _workoutSettings['soundVolume'];

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) {
          return AlertDialog(
            backgroundColor: Colors.black,
            title: const Text(
              'WORKOUT SETTINGS',
              style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Sound', style: TextStyle(color: Colors.white)),
                    Switch(
                      value: soundEnabled,
                      onChanged: (val) {
                        setState(() {
                          soundEnabled = val;
                        });
                      },
                      activeThumbColor: Colors.red,
                    ),
                  ],
                ),
                if (soundEnabled) ...[
                  const SizedBox(height: 16),
                  const Text('Volume', style: TextStyle(color: Colors.white)),
                  Slider(
                    value: soundVolume,
                    onChanged: (val) {
                      setState(() {
                        soundVolume = val;
                      });
                    },
                    activeColor: Colors.red,
                  ),
                ],
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel', style: TextStyle(color: Colors.white70)),
              ),
              TextButton(
                onPressed: () async {
                  final newSettings = {
                    'soundEnabled': soundEnabled,
                    'soundVolume': soundVolume,
                  };
                  await _databaseService.updateWorkoutSettings(newSettings);
                  this.setState(() {
                    _workoutSettings = newSettings;
                  });
                  Navigator.pop(context);
                },
                child: const Text('Save', style: TextStyle(color: Colors.red)),
              ),
            ],
          );
        },
      ),
    );
  }

  void _showLanguageDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[900],
        title: const Text(
          'LANGUAGE OPTIONS',
          style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
        content: const Text('Language selection would go here', style: TextStyle(color: Colors.white)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
  
  void _showRateUsDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.black,
        title: const Text(
          'RATE US',
          style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.star, color: Colors.yellow, size: 48),
            const SizedBox(height: 16),
            const Text(
              'We are working hard for a better user experience.',
              style: TextStyle(color: Colors.white70),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text(
              'We\'d greatly appreciate if you can rate us.',
              style: TextStyle(color: Colors.white70),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text(
              'The best we can get :)',
              style: TextStyle(color: Colors.white70, fontStyle: FontStyle.italic),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                return const Icon(Icons.star, color: Colors.yellow, size: 32);
              }),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Maybe Later', style: TextStyle(color: Colors.white70)),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
            },
            child: const Text('Rate Now', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _showLeaderboardDialog() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => LeaderboardPage()),
    );
  }

  void _showYogaExerciseEntry() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const YogaExercisesPage()),
    );
  }
}

// WorkoutHistoryPage (keeping existing implementation)
class WorkoutHistoryPage extends StatefulWidget {
  final List<String> completedWorkouts;
  final List<Map<String, dynamic>> dayHistory;
  final Future<void> Function()? onReset;

  const WorkoutHistoryPage({super.key, required this.completedWorkouts, required this.dayHistory, this.onReset});

  @override
  State<WorkoutHistoryPage> createState() => _WorkoutHistoryPageState();
}

class _WorkoutHistoryPageState extends State<WorkoutHistoryPage> {
  late List<String> _completedWorkouts;
  late List<Map<String, dynamic>> _dayHistory;

  @override
  void initState() {
    super.initState();
    _completedWorkouts = List.from(widget.completedWorkouts);
    _dayHistory = List.from(widget.dayHistory);
  }

  void _showRestartConfirmation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.black,
        title: const Text(
          'RESTART WORKOUT PLAN',
          style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
        content: const Text(
          'This will clear day completion progress and history logs. Are you sure you want to start over from Day 1? (This action cannot be undone)',
          style: TextStyle(color: Colors.white70),
          textAlign: TextAlign.center,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.white70)),
          ),
          TextButton(
            onPressed: () async {
              if (widget.onReset != null) {
                await widget.onReset!();
              }
              setState(() {
                _completedWorkouts.clear();
                _dayHistory.clear();
              });
              Navigator.pop(context);
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Workout plan restarted successfully'), backgroundColor: Colors.green),
              );
            },
            child: const Text('Restart', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('MY WORKOUTS'),
        backgroundColor: Colors.black,
        elevation: 0,
        actions: [
          if (_completedWorkouts.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.refresh, color: Colors.red),
              onPressed: _showRestartConfirmation,
              tooltip: 'Restart Workout Plan',
            ),
        ],
      ),
      body: (_completedWorkouts.isEmpty && _dayHistory.isEmpty)
          ? const Center(
              child: Text(
                'No days completed yet',
                style: TextStyle(color: Colors.white70, fontSize: 18),
                textAlign: TextAlign.center,
              ),
            )
          : Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: ElevatedButton.icon(
                    onPressed: _showRestartConfirmation,
                    icon: const Icon(Icons.refresh, color: Colors.white),
                    label: const Text('Reset Progress'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    ),
                  ),
                ),
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      if (_completedWorkouts.isNotEmpty) ...[
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 16.0),
                          child: Text(
                            'Completed Days:',
                            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                        ),
                        ..._completedWorkouts.map((workout) => Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          decoration: BoxDecoration(
                            color: Colors.grey[900],
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.green.withOpacity(0.3)),
                          ),
                          child: ListTile(
                            leading: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.green.withOpacity(0.2),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.check_circle, color: Colors.green, size: 24),
                            ),
                            title: Text(
                              workout,
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                            ),
                          ),
                        )),
                      ],
                      if (_dayHistory.isNotEmpty) ...[
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 16.0),
                          child: Text(
                            'History:',
                            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                        ),
                        ..._dayHistory.map((entry) => Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          decoration: BoxDecoration(
                            color: Colors.grey[900],
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.blue.withOpacity(0.3)),
                          ),
                          child: ListTile(
                            leading: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.blue.withOpacity(0.2),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.history, color: Colors.blue, size: 24),
                            ),
                            title: Text(
                              entry['day']?.toString() ?? 'Day',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                            ),
                            subtitle: Text(
                              entry['timestamp']?.toString() ?? '',
                              style: const TextStyle(color: Colors.white70, fontSize: 12),
                            ),
                          ),
                        )),
                      ],
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}
