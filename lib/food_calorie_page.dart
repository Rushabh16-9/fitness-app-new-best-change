import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:google_ml_kit/google_ml_kit.dart';

/// Simple researched calorie table (kcal per 100g or per typical serving)
/// Values are approximate; for production consider linking to a verified nutrition API.
const Map<String, double> _calPer100g = {
  'apple': 52.0,
  'banana': 89.0,
  'bread': 265.0,
  'rice': 130.0,
  'egg': 155.0, // per 100g (whole egg)
  'chicken breast': 165.0,
  'salmon': 208.0,
  'potato': 77.0,
  'avocado': 160.0,
  'cheese': 402.0,
  'broccoli': 34.0,
  'oatmeal': 379.0,
  'yogurt': 59.0,
  'almonds': 579.0,
  'pizza': 266.0,
  'burger': 295.0,
  'pasta': 131.0,
  'salad': 20.0,
  'orange': 47.0,
  'milk': 42.0,
};

class FoodCaloriePage extends StatefulWidget {
  const FoodCaloriePage({super.key});

  @override
  State<FoodCaloriePage> createState() => _FoodCaloriePageState();
}

class _FoodCaloriePageState extends State<FoodCaloriePage> {
  final ImagePicker _picker = ImagePicker();
  File? _image;
  List<ImageLabel> _labels = [];
  String _detected = '';
  final TextEditingController _nameCtrl = TextEditingController();
  final TextEditingController _gramsCtrl = TextEditingController(text: '100');
  double? _calculated;
  String _advice = '';

  @override
  void dispose() {
    _nameCtrl.dispose();
    _gramsCtrl.dispose();
    super.dispose();
  }

  Future<void> _pick(ImageSource src) async {
    final XFile? f = await _picker.pickImage(source: src, maxWidth: 1200, maxHeight: 1200, imageQuality: 85);
    if (f == null) return;
    setState(() { _image = File(f.path); _labels = []; _detected = ''; _calculated = null; _advice = ''; });
    await _runImageLabeler(f.path);
  }

  Future<void> _runImageLabeler(String path) async {
    final inputImage = InputImage.fromFilePath(path);
    final labeler = GoogleMlKit.vision.imageLabeler();
    try {
      final labels = await labeler.processImage(inputImage);
      setState(() {
        _labels = labels;
        if (labels.isNotEmpty) {
          _detected = labels.first.label.toLowerCase();
          // If detected matches our map, prefill name
          final key = _findBestMatch(_detected);
          if (key != null) _nameCtrl.text = key;
        }
      });
    } catch (e) {
      // ignore
    } finally {
      labeler.close();
    }
  }

  String? _findBestMatch(String label) {
    // simple contains match
    for (final k in _calPer100g.keys) {
      if (label.contains(k) || k.contains(label)) return k;
    }
    // fallback: check tokens
    final toks = label.split(RegExp(r'\W+'));
    for (final t in toks) {
      for (final k in _calPer100g.keys) {
        if (k.contains(t) || t.contains(k)) return k;
      }
    }
    return null;
  }

  void _calculateFromName() {
    final name = _nameCtrl.text.trim().toLowerCase();
    if (name.isEmpty) {
      setState(() { _calculated = null; _advice = 'Please enter a food name or pick an image.'; });
      return;
    }
    final grams = double.tryParse(_gramsCtrl.text) ?? 100.0;
    // find best match in the table
    String? found;
    for (final k in _calPer100g.keys) {
      if (name == k || name.contains(k) || k.contains(name)) { found = k; break; }
    }
    // try fuzzy via tokens
    found ??= _findBestMatch(name);
    if (found == null) {
      setState(() { _calculated = null; _advice = 'Food not found in built database. Try a more common name (e.g., "apple", "chicken breast")'; });
      return;
    }
    final per100 = _calPer100g[found]!;
    final calories = per100 * (grams / 100.0);
    setState(() {
      _calculated = calories;
      _advice = _buildAdvice(found!, calories, grams);
    });
  }

  String _buildAdvice(String name, double calories, double grams) {
    final daily = 2000.0; // generic daily reference
    final pct = (calories / daily) * 100.0;
    final buf = StringBuffer();
    buf.writeln('Estimated calories: ${calories.toStringAsFixed(0)} kcal for ${grams.toStringAsFixed(0)} g of $name.');
    buf.writeln('That is ${pct.toStringAsFixed(1)}% of a ${daily.toInt()} kcal reference daily intake.');
    if (pct > 40) {
      buf.writeln('This is a large portion — consider reducing serving size or pairing with vegetables.');
    } else if (pct > 15) buf.writeln('Moderate portion — balance with low-calorie sides (salad, vegetables).');
    else buf.writeln('Light portion. Good for snacks or as part of a meal.');
    // suggest lower cal alternative
  final refPer100 = _calPer100g[name] ?? 9999.0;
  final lower = _calPer100g.entries.where((e) => e.value < refPer100).take(3).map((e) => '${e.key} (${e.value.toInt()} kcal/100g)').join(', ');
    if (lower.isNotEmpty) buf.writeln('Lower-cal alternatives per 100g: $lower.');
    buf.writeln('Tip: track portions and prefer whole foods; consult a registered dietitian for personalized plans.');
    return buf.toString();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Food Calorie Estimator')),
      backgroundColor: Colors.black,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.grey[900], borderRadius: BorderRadius.circular(12)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text('Scan or enter food', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    AspectRatio(
                      aspectRatio: 16 / 9,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: _image != null
                            ? Image.file(_image!, fit: BoxFit.cover)
                            : Container(color: Colors.black26, child: const Center(child: Icon(Icons.camera_alt, color: Colors.white38, size: 48))),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                            onPressed: () => _pick(ImageSource.camera),
                            icon: const Icon(Icons.camera_alt),
                            label: const Text('Camera'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.grey[800]),
                            onPressed: () => _pick(ImageSource.gallery),
                            icon: const Icon(Icons.photo_library),
                            label: const Text('Gallery'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    if (_labels.isNotEmpty) ...[
                      const Text('Detected labels', style: TextStyle(color: Colors.white70)),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        children: _labels.map((l) => ActionChip(
                          label: Text('${l.label} (${(l.confidence*100).toStringAsFixed(0)}%)', style: const TextStyle(color: Colors.white)),
                          backgroundColor: Colors.grey[800],
                          onPressed: () { setState(() { _nameCtrl.text = l.label.toLowerCase(); }); },
                        )).toList(),
                      ),
                    ],
                    const SizedBox(height: 12),
                    TextField(
                      controller: _nameCtrl,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(hintText: 'Type food name (e.g. Milkshake)', hintStyle: TextStyle(color: Colors.white54), filled: true, fillColor: Colors.black26, border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none)),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _gramsCtrl,
                            keyboardType: TextInputType.numberWithOptions(decimal: true),
                            style: const TextStyle(color: Colors.white),
                            decoration: InputDecoration(hintText: 'Grams (e.g. 150)', hintStyle: TextStyle(color: Colors.white54), filled: true, fillColor: Colors.black26, border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none)),
                          ),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                          onPressed: _calculateFromName,
                          child: const Text('Calculate'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              if (_calculated != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: Colors.grey[900], borderRadius: BorderRadius.circular(12)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text('Result', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text('${_calculated!.toStringAsFixed(0)} kcal', style: TextStyle(color: Colors.red[300], fontSize: 28, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text(_advice, style: TextStyle(color: Colors.white70)),
                    ],
                  ),
                ),
              ] else if (_advice.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: Colors.grey[900], borderRadius: BorderRadius.circular(12)),
                  child: Text(_advice, style: TextStyle(color: Colors.white70)),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
