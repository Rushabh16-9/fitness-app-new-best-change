import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_auth/firebase_auth.dart';

class HydrationService {
  String get _key {
    final uid = FirebaseAuth.instance.currentUser?.uid ?? 'anon';
    final today = DateTime.now();
    final date = '${today.year}-${today.month}-${today.day}';
    return 'hydration_${uid}_$date';
  }

  Future<int> getTodayMl() async {
    final p = await SharedPreferences.getInstance();
    return p.getInt(_key) ?? 0;
  }

  Future<void> addWater(int ml) async {
    final p = await SharedPreferences.getInstance();
    final current = p.getInt(_key) ?? 0;
    await p.setInt(_key, current + ml);
  }

  Future<void> resetToday() async {
    final p = await SharedPreferences.getInstance();
    await p.remove(_key);
  }
}
