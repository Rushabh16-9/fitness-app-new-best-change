import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import 'package:provider/provider.dart';
import '../services/mood_service.dart';

class FaceMoodCapturePage extends StatefulWidget {
  const FaceMoodCapturePage({super.key});

  @override
  State<FaceMoodCapturePage> createState() => _FaceMoodCapturePageState();
}

class _FaceMoodCapturePageState extends State<FaceMoodCapturePage> {
  final ImagePicker _picker = ImagePicker();
  bool _processing = false;
  String? _info;

  Future<void> _takePhotoAndDetect() async {
    setState(() { _processing = true; _info = null; });
    try {
      final XFile? file = await _picker.pickImage(source: ImageSource.camera, imageQuality: 80);
      if (file == null) {
        setState(() { _processing = false; _info = 'No photo taken.'; });
        return;
      }

      final inputImage = InputImage.fromFilePath(file.path);
      final options = FaceDetectorOptions(enableClassification: true, enableLandmarks: false, enableTracking: false);
      final detector = FaceDetector(options: options);
      final faces = await detector.processImage(inputImage);
      await detector.close();

      if (faces.isEmpty) {
        setState(() { _processing = false; _info = 'No face detected. Try again.'; });
        return;
      }

      final Face face = faces.first;
      final smile = face.smilingProbability;
      final left = face.leftEyeOpenProbability;
      final right = face.rightEyeOpenProbability;

      final moodSvc = Provider.of<MoodService>(context, listen: false);
      final mood = moodSvc.detectFromFaceFeatures(
        smilingProbability: smile,
        leftEyeOpenProbability: left,
        rightEyeOpenProbability: right,
      );

      setState(() { _processing = false; _info = 'Detected mood: $mood'; });
      // Close after a short delay so the user sees the result
      await Future.delayed(const Duration(milliseconds: 800));
      if (mounted) Navigator.pop(context);
    } catch (e) {
      setState(() { _processing = false; _info = 'Error detecting face: $e'; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Selfie Mood Detect'), backgroundColor: Colors.red),
      backgroundColor: Colors.black,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Text('Take a quick selfie so we can detect your mood.', style: TextStyle(color: Colors.white70), textAlign: TextAlign.center),
            const SizedBox(height: 16),
            _processing ? const CircularProgressIndicator(color: Colors.red) : ElevatedButton.icon(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              onPressed: _takePhotoAndDetect,
              icon: const Icon(Icons.camera_alt),
              label: const Text('Take Selfie'),
            ),
            const SizedBox(height: 12),
            if (_info != null) Text(_info!, style: const TextStyle(color: Colors.white70), textAlign: TextAlign.center),
          ]),
        ),
      ),
    );
  }
}
