import 'package:flutter/material.dart';

class AppConstants {
  // Colors - Red and Black Theme
  static const Color primaryRed = Color(0xFFD32F2F);
  static const Color primaryRedLight = Color(0xFFFF6659);
  static const Color primaryRedDark = Color(0xFF9A0007);
  static const Color accentRed = Color(0xFFFF5722);
  static const Color darkBackground = Color(0xFF121212);
  static const Color cardBackground = Color(0xFF1E1E1E);
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFB3B3B3);
  static const Color dividerColor = Color(0xFF333333);

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryRed, primaryRedDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient accentGradient = LinearGradient(
    colors: [accentRed, primaryRed],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  // Text Styles
  static const TextStyle headlineLarge = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: textPrimary,
    letterSpacing: -0.5,
  );

  static const TextStyle headlineMedium = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.w600,
    color: textPrimary,
  );

  static const TextStyle headlineSmall = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w600,
    color: textPrimary,
  );

  static const TextStyle titleLarge = TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.w500,
    color: textPrimary,
  );

  static const TextStyle titleMedium = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w500,
    color: textPrimary,
  );

  static const TextStyle bodyLarge = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.normal,
    color: textPrimary,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    color: textSecondary,
  );

  static const TextStyle bodySmall = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    color: textSecondary,
  );

  // Spacing
  static const double paddingSmall = 8.0;
  static const double paddingMedium = 16.0;
  static const double paddingLarge = 24.0;
  static const double paddingXLarge = 32.0;

  // Border Radius
  static const double borderRadiusSmall = 8.0;
  static const double borderRadiusMedium = 12.0;
  static const double borderRadiusLarge = 16.0;
  static const double borderRadiusXLarge = 24.0;

  // Shadows
  static const BoxShadow cardShadow = BoxShadow(
    color: Colors.black26,
    blurRadius: 8.0,
    offset: Offset(0, 4),
  );

  static const BoxShadow elevatedShadow = BoxShadow(
    color: Colors.black38,
    blurRadius: 12.0,
    offset: Offset(0, 6),
  );

  // Animation Durations
  static const Duration animationFast = Duration(milliseconds: 200);
  static const Duration animationMedium = Duration(milliseconds: 300);
  static const Duration animationSlow = Duration(milliseconds: 500);

  // App Strings
  static const String appName = 'SmartFit';
  static const String appTagline = 'Your AI Fitness Companion';

  // Feature Icons
  static const Map<String, IconData> featureIcons = {
    'workouts': Icons.fitness_center,
    'nutrition': Icons.restaurant,
    'challenges': Icons.emoji_events,
    'progress': Icons.trending_up,
    'trainer': Icons.visibility,
    'wearables': Icons.watch,
    'social': Icons.people,
    'voice': Icons.mic,
    'music': Icons.music_note,
    'recovery': Icons.spa,
    'offline': Icons.cloud_off,
    'reminders': Icons.notifications,
    'marketplace': Icons.shopping_cart,
    'customization': Icons.palette,
  };

  // Navigation Items
  static const List<Map<String, dynamic>> navigationItems = [
    {
      'title': 'Home',
      'icon': Icons.home,
      'route': '/home',
    },
    {
      'title': 'Workouts',
      'icon': Icons.fitness_center,
      'route': '/workouts',
    },
    {
      'title': 'Nutrition',
      'icon': Icons.restaurant,
      'route': '/nutrition',
    },
    {
      'title': 'Progress',
      'icon': Icons.trending_up,
      'route': '/progress',
    },
    {
      'title': 'Profile',
      'icon': Icons.person,
      'route': '/profile',
    },
  ];

  // API Endpoints
  static const String dietApiBaseUrl = 'http://localhost:5000';
  static const String dietApiEndpoint = '/api/diet-recommendations';

  // Local Storage Keys
  static const String userPreferencesKey = 'user_preferences';
  static const String workoutHistoryKey = 'workout_history';
  static const String nutritionHistoryKey = 'nutrition_history';
  static const String challengeProgressKey = 'challenge_progress';
  static const String offlineDataKey = 'offline_data';

  // Notification Channels
  static const String workoutRemindersChannel = 'workout_reminders';
  static const String nutritionRemindersChannel = 'nutrition_reminders';
  static const String challengeRemindersChannel = 'challenge_reminders';
  static const String motivationalChannel = 'motivational';

  // Default Values
  static const int defaultWorkoutDuration = 30;
  static const int defaultRestTime = 60;
  static const double defaultCalorieGoal = 2000.0;
  static const int defaultWaterGoal = 8;

  // Limits
  static const int maxWorkoutHistory = 1000;
  static const int maxNutritionEntries = 500;
  static const int maxProgressPhotos = 50;
}
