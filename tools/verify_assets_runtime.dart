import 'dart:io';

/// Simple utility script to verify assets at runtime.
/// Run this from the repository root: `dart run tools/verify_assets_runtime.dart`.

String normalize(String p) => p.replaceAll('\\', '/');

Future<void> main() async {
  final root = Directory.current.path;
  final assetsDir = Directory('\$root${Platform.pathSeparator}assets');
  if (!assetsDir.existsSync()) {
    print('assets/ directory not found at: \\${assetsDir.path}');
    return;
  }

  final assetFiles = <String>{};
  await for (final entity in assetsDir.list(recursive: true, followLinks: false)) {
    if (entity is File) {
      final rel = normalize(entity.path.replaceFirst('${normalize(root)}/', ''));
      assetFiles.add(rel);
    }
  }

  print('Collected \\${assetFiles.length} asset files.');

  // Show a few sample assets
  final samples = assetFiles.take(20).toList();
  for (final s in samples) {
    print(' - \\$s');
  }
}
