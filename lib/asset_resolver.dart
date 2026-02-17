import 'dart:convert';
import 'package:flutter/services.dart' show rootBundle;

/// Caches the app's AssetManifest to quickly verify if an asset exists.
class AssetResolver {
  static Set<String>? _assets;

  /// Load the AssetManifest once.
  static Future<void> init() async {
    if (_assets != null) return;
    final manifestJson = await rootBundle.loadString('AssetManifest.json');
    final Map<String, dynamic> manifestMap = json.decode(manifestJson) as Map<String, dynamic>;
    _assets = manifestMap.keys.map((k) => k.toString()).toSet();
    // Debug: Log basic stats for troubleshooting asset issues
    try {
      final total = _assets!.length;
      final yogaCount = _assets!.where((k) => k.startsWith('assets/yoga/')).length;
      // A few specific checks we've seen fail on-device
      final probes = [
        'assets/yoga/dancer_pose/download.jpeg',
        'assets/yoga/triangle_pose/triangle1.jpg',
        'assets/yoga/warrior_pose/Veerabhadrasana_10.jpg',
        'assets/yoga/downward_dog/downward_dog1.jpg',
        'assets/coach.jpg',
      ];
      // Use print to ensure logs appear even without importing Flutter foundation
      print('[AssetResolver] Manifest loaded: total=$total, yoga=$yogaCount');
      for (final p in probes) {
        print('[AssetResolver] exists($p) => ${_assets!.contains(p)}');
      }
    } catch (_) {
      // ignore logging errors
    }
  }

  /// Returns true if the exact asset path exists in the asset bundle.
  static bool exists(String path) {
    final set = _assets;
    if (set == null) return false;
    return set.contains(path);
  }

  /// Lists all asset paths that start with the given prefix.
  /// Optionally filter by allowed file extensions (e.g., ['.mp3', '.jpg']).
  static List<String> list({required String prefix, List<String>? extensions}) {
    final set = _assets;
    if (set == null) return [];
    final lowerExts = extensions?.map((e) => e.toLowerCase()).toList();
    return set.where((p) {
      final okPrefix = p.startsWith(prefix);
      if (!okPrefix) return false;
      if (lowerExts == null || lowerExts.isEmpty) return true;
      final dot = p.lastIndexOf('.');
      final ext = dot == -1 ? '' : p.substring(dot).toLowerCase();
      return lowerExts.contains(ext);
    }).toList()
      ..sort();
  }
}
