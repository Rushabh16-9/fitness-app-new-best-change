import 'package:flutter/foundation.dart';

class AppState extends ChangeNotifier {
  bool _isDarkMode = true;
  bool get isDarkMode => _isDarkMode;

  void toggleTheme() {
    _isDarkMode = !_isDarkMode;
    notifyListeners();
  }

  // Example: store user profile data
  Map<String, dynamic> userProfile = {};
}
