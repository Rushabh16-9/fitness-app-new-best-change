

import 'package:flutter/material.dart';
import 'day_exercise_page.dart';

class MePage extends StatelessWidget {
  const MePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        title: Text('ME', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Row(
              children: [
                Icon(Icons.emoji_events, color: Colors.red, size: 28),
                SizedBox(width: 8),
                Text('PREMIUM', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ],
      ),
      body: ListView(
        padding: EdgeInsets.all(16),
        children: [
          Container(
            decoration: BoxDecoration(
              color: Colors.grey[900],
              borderRadius: BorderRadius.circular(16),
            ),
            padding: EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text('Backup & Restore', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 22)),
                    SizedBox(width: 8),
                    Icon(Icons.sync, color: Colors.red),
                    Spacer(),
                    Icon(Icons.g_mobiledata, color: Colors.white, size: 32),
                  ],
                ),
                SizedBox(height: 8),
                Text('Synchronize your data', style: TextStyle(color: Colors.white54, fontSize: 16)),
              ],
            ),
          ),
          SizedBox(height: 24),
          Container(
            decoration: BoxDecoration(
              color: Colors.grey[900],
              borderRadius: BorderRadius.circular(16),
            ),
            padding: EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('SETTINGS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                SizedBox(height: 16),
                ListTile(
                  leading: Icon(Icons.emoji_emotions, color: Colors.orange, size: 32),
                  title: Text('My Profile', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
                ListTile(
                  leading: Icon(Icons.favorite, color: Colors.red, size: 32),
                  title: Text('My Workouts', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
                ListTile(
                  leading: Icon(Icons.opacity, color: Colors.green, size: 32),
                  title: Text('Workout Settings', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
                ListTile(
                  leading: Icon(Icons.settings, color: Colors.blue, size: 32),
                  title: Text('General Settings', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
                ListTile(
                  leading: Icon(Icons.language, color: Colors.purple, size: 32),
                  title: Text('Language options', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  subtitle: Text('System default', style: TextStyle(color: Colors.white54)),
                ),
              ],
            ),
          ),
          SizedBox(height: 24),
          Container(
            decoration: BoxDecoration(
              color: Colors.grey[900],
              borderRadius: BorderRadius.circular(16),
            ),
            padding: EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ListTile(
                  leading: Icon(Icons.star, color: Colors.white70, size: 32),
                  title: Text('Rate Us', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
                ListTile(
                  leading: Icon(Icons.edit, color: Colors.white70, size: 32),
                  title: Text('Feedback', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
          SizedBox(height: 24),
          Center(
            child: Text('Version 1.4.08', style: TextStyle(color: Colors.white54)),
          ),
        ],
      ),
    );
  }
}
// import removed: day_exercise_page.dart

// Removed unused imports
// Helper functions for day titles and muscles
String getDayTitle(int i) {
  const titles = [
    'Biceps & Forearms', 'Calves & Middle Back', 'Abdominals & Chest', 'Lats & Triceps', 'Shoulders',
    'Rest', 'Quads & Hamstrings', 'Chest & Triceps', 'Back & Biceps', 'Legs',
    'Shoulders', 'Abs', 'Rest', 'Biceps & Forearms', 'Calves & Middle Back',
    'Abdominals & Chest', 'Lats & Triceps', 'Shoulders', 'Quads & Hamstrings', 'Chest & Triceps',
    'Back & Biceps', 'Legs', 'Shoulders', 'Abs', 'Rest',
    'Biceps & Forearms', 'Calves & Middle Back', 'Abdominals & Chest', 'Lats & Triceps', 'Shoulders',
  ];
  return titles[i % titles.length];
}

List<String> getDayMuscles(int i) {
  const plans = [
    ['biceps', 'forearms'], ['calves', 'middle back'], ['abdominals', 'chest'], ['lats', 'triceps'], ['shoulders'],
    [], ['quads', 'hamstrings'], ['chest', 'triceps'], ['back', 'biceps'], ['legs'],
    ['shoulders'], ['abs'], [], ['biceps', 'forearms'], ['calves', 'middle back'],
    ['abdominals', 'chest'], ['lats', 'triceps'], ['shoulders'], ['quads', 'hamstrings'], ['chest', 'triceps'],
    ['back', 'biceps'], ['legs'], ['shoulders'], ['abs'], [],
    ['biceps', 'forearms'], ['calves', 'middle back'], ['abdominals', 'chest'], ['lats', 'triceps'], ['shoulders'],
  ];
  return List<String>.from(plans[i % plans.length]);
}


void main() {
  runApp(MaterialApp(
    debugShowCheckedModeBanner: false,
    home: MainHomePage(),
  ));
}
// Removed misplaced widget code from top-level
// --- Move these classes to top-level ---
class MainHomePage extends StatefulWidget {
  const MainHomePage({super.key});

  @override
  State<MainHomePage> createState() => _MainHomePageState();
}

class _MainHomePageState extends State<MainHomePage> {
  int _selectedIndex = 1;

  final List<Widget> _pages = [
    DailyPage(),
    MePage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: Colors.black,
        selectedItemColor: Colors.red,
        unselectedItemColor: Colors.white,
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today),
            label: 'DAILY',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'ME',
          ),
        ],
      ),
    );
  }
}

class DailyPage extends StatelessWidget {
  const DailyPage({super.key});

  @override
  Widget build(BuildContext context) {
    return DayExercisePage(
      day: 1,
      title: 'All Day Exercises',
      muscleGroups: ['all'],
    );
  }
}