import 'dart:convert';
import 'dart:io';

// Scanner: inspects assets and exercise JSONs and reports per-exercise image resolution

void main() async {
  final project = Directory.current.path;
  final base = Directory('$project${Platform.pathSeparator}assets${Platform.pathSeparator}data${Platform.pathSeparator}free-exercise-db-main${Platform.pathSeparator}exercises');
  final mediaDir = Directory('$project${Platform.pathSeparator}assets${Platform.pathSeparator}data${Platform.pathSeparator}exercise vidio${Platform.pathSeparator}exercisedb-api-main${Platform.pathSeparator}media');
  final assetsRoot = Directory('$project${Platform.pathSeparator}assets');
  final musicDir = Directory('$project${Platform.pathSeparator}assets${Platform.pathSeparator}data${Platform.pathSeparator}music');

  if (!base.existsSync()) {
    print('Exercises folder not found: ${base.path}');
    return;
  }

  // collect asset files (normalized to forward slashes, relative to project root)
  final allFiles = <String>{};
  if (assetsRoot.existsSync()) {
    for (final f in assetsRoot.listSync(recursive: true)) {
      if (f is File) {
        final rel = f.path.replaceFirst('$project${Platform.pathSeparator}', '');
        allFiles.add(rel.replaceAll('\\', '/'));
      }
    }
  }
  if (mediaDir.existsSync()) {
    for (final f in mediaDir.listSync(recursive: true)) {
      if (f is File) {
        final rel = f.path.replaceFirst('$project${Platform.pathSeparator}', '');
        allFiles.add(rel.replaceAll('\\', '/'));
      }
    }
  }
  if (musicDir.existsSync()) {
    for (final f in musicDir.listSync(recursive: true)) {
      if (f is File) {
        final rel = f.path.replaceFirst('$project${Platform.pathSeparator}', '');
        allFiles.add(rel.replaceAll('\\', '/'));
      }
    }
  }

  print('Collected ${allFiles.length} asset files.');

  final missing = <String, List<String>>{};
  final perExerciseResolved = <String, String>{};

  // walk exercises directory: it contains per-exercise dirs with a .json each
  for (final entry in base.listSync()) {
    if (entry is Directory) {
      final dir = entry;
      final jsons = dir.listSync().whereType<File>().where((f) => f.path.endsWith('.json'));
      for (final jf in jsons) {
        try {
          final Map<String, dynamic> map = json.decode(jf.readAsStringSync());
          final name = (map['name'] ?? jf.path).toString();
          if (map.containsKey('images')) {
            final images = (map['images'] as List).cast<String>();
            if (images.isNotEmpty) {
              final img = images.first;
              final candidate = 'assets/data/free-exercise-db-main/exercises/${dir.path.split(Platform.pathSeparator).last}/$img'.replaceAll('\\', '/');
              final candidate2 = 'assets/data/exercise vidio/exercisedb-api-main/media/$img'.replaceAll('\\', '/');
              final candidate3 = 'assets/$img'.replaceAll('\\', '/');
              String resolved;
              if (allFiles.contains(candidate)) {
                resolved = candidate;
              } else if (allFiles.contains(candidate2)) resolved = candidate2;
              else if (allFiles.contains(candidate3)) resolved = candidate3;
              else {
                resolved = 'MISSING';
                missing.putIfAbsent(name, () => []).add(img);
              }
              perExerciseResolved[name] = resolved;
            } else {
              perExerciseResolved[name] = 'NO_IMAGES_LISTED';
            }
          } else {
            perExerciseResolved[name] = 'NO_IMAGES_KEY';
          }
        } catch (e) {
          perExerciseResolved[jf.path] = 'ERROR_READING_JSON: $e';
        }
      }
    }
  }

  // Print per-exercise resolution
  final buffer = StringBuffer();
  buffer.writeln('Per-exercise image resolution (first image only):');
  final sortedKeys = perExerciseResolved.keys.toList()..sort();
  for (final name in sortedKeys) {
    buffer.writeln(' - $name -> ${perExerciseResolved[name]}');
  }

  if (missing.isEmpty) {
    buffer.writeln('\nNo missing images found.');
  } else {
    buffer.writeln('\nMissing images report:');
    for (final k in missing.keys) {
      buffer.writeln('- $k:');
      for (final img in missing[k]!) {
        buffer.writeln('    - $img');
      }
    }
  }

  // list music files found
  final musicFound = allFiles.where((p) => p.contains('/data/music/') && (p.endsWith('.mp3') || p.endsWith('.wav'))).toList();
  buffer.writeln('\nMusic files found (${musicFound.length}):');
  for (final m in musicFound) {
    buffer.writeln(' - $m');
  }

  print(buffer.toString());

  // write concise report
  final reportFile = File('$project${Platform.pathSeparator}tools${Platform.pathSeparator}asset_report.txt');
  reportFile.writeAsStringSync(buffer.toString());
  print('\nReport written to ${reportFile.path}');
}
