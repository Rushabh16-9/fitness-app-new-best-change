import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import 'services/music_service.dart';

/// ExerciseAlarmPage: Advanced alarm for exercise with song selection and challenge to stop.
class ExerciseAlarmPage extends StatefulWidget {
  final String? songAsset;
  final String? challengeId;
  const ExerciseAlarmPage({super.key, this.songAsset, this.challengeId});

  @override
  State<ExerciseAlarmPage> createState() => _ExerciseAlarmPageState();
}

class _ExerciseAlarmPageState extends State<ExerciseAlarmPage> {
  final ImagePicker _picker = ImagePicker();
  File? _photo;

  @override
  void initState() {
    super.initState();
    // Start alarm music
    Future.microtask(() {
      final ms = Provider.of<MusicService>(context, listen: false);
      if (widget.songAsset != null && widget.songAsset!.isNotEmpty) {
        ms.playAssetPath(widget.songAsset!, loop: true);
      } else if (ms.hasTracks) {
        ms.playIndex(ms.currentIndex);
      }
    });
  }

  Future<void> _uploadPhotoAndStop() async {
    if (_photo == null) return;
    // In a real app: upload to storage and mark challenge/day complete.
    // Stop music
    final ms = Provider.of<MusicService>(context, listen: false);
    await ms.stop();
    // Navigate back
    Navigator.pop(context, true);
  }

  Future<void> _takePhoto() async {
    final x = await _picker.pickImage(source: ImageSource.camera, imageQuality: 70);
    if (x == null) return;
    setState(() { _photo = File(x.path); });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(title: const Text('Exercise Alarm')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Exercise Alarm Ringing', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              Expanded(
                child: Center(
                  child: _photo == null
                      ? Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.fitness_center, color: Colors.red, size: 60),
                            const SizedBox(height: 16),
                            const Text('Complete the challenge to stop the alarm!', style: TextStyle(color: Colors.white70, fontSize: 18)),
                            const SizedBox(height: 12),
                            const Text('Take a photo of your workout or yourself exercising.', style: TextStyle(color: Colors.white54)),
                          ],
                        )
                      : ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Image.file(_photo!),
                        ),
                ),
              ),
              const SizedBox(height: 12),
              Row(children: [
                Expanded(child: ElevatedButton.icon(onPressed: _takePhoto, icon: const Icon(Icons.camera_alt), label: const Text('Take Photo'))),
                const SizedBox(width: 8),
                Expanded(child: ElevatedButton.icon(onPressed: _uploadPhotoAndStop, icon: const Icon(Icons.upload), label: const Text('Upload & Stop'))),
              ]),
            ],
          ),
        ),
      ),
    );
  }
}
