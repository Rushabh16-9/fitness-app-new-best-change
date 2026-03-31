import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:permission_handler/permission_handler.dart';
import 'pose_detection_service.dart';
import 'pose_comparison_service.dart';
import 'package:google_ml_kit/google_ml_kit.dart';

class CameraPage extends StatefulWidget {
  final Map<String, dynamic>? targetPose;

  const CameraPage({super.key, this.targetPose});

  @override
  State<CameraPage> createState() => _CameraPageState();
}

class _CameraPageState extends State<CameraPage> {
  PoseDetectionService? _poseDetectionService;
  bool _isInitialized = false;
  bool _isDetecting = false;
  String _feedback = 'Position yourself in front of the camera';
  double _accuracy = 0.0;
  List<String> _detailedFeedback = [];
  DateTime? _lastDetectionAt;

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    try {
      // Request camera permission
      final status = await Permission.camera.request();
      if (status.isGranted) {
        _poseDetectionService = await PoseDetectionService.initialize();
        setState(() {
          _isInitialized = true;
        });

        if (widget.targetPose != null) {
          _startPoseDetection();
        }
      } else {
        setState(() {
          _feedback = 'Camera permission denied';
        });
      }
    } catch (e) {
      setState(() {
        _feedback = 'Failed to initialize camera: $e';
      });
    }
  }

  void _startPoseDetection() {
    if (_poseDetectionService == null || widget.targetPose == null) return;

    setState(() {
      _isDetecting = true;
      _feedback = 'Detecting pose...';
    });

    _poseDetectionService!.startPoseDetection((Pose detectedPose) {
      if (!mounted) return;

      // Get pose ID from target pose
      String poseId = widget.targetPose!['name']?.toString().toLowerCase().replaceAll(RegExp(r"[^a-z0-9]+"), '_') ?? '';
      // Common fallback synonyms
      final Map<String, String> alias = {
        'savasana': 'corpse_pose',
        'corpse_pose': 'corpse_pose',
        'tadasana': 'mountain_pose',
        'vrksasana': 'tree_pose',
        'adho_mukha_svanasana': 'downward_dog',
      };
      if (alias.containsKey(poseId)) poseId = alias[poseId]!;

      // Analyze the detected pose
  final analysis = PoseComparisonService.analyzePose(detectedPose, poseId);

      setState(() {
        _accuracy = analysis['accuracy'] ?? 0.0;
        _detailedFeedback = List<String>.from(analysis['feedback'] ?? []);
        _feedback = PoseComparisonService.getPoseFeedback(_accuracy);
        _lastDetectionAt = DateTime.now();
      });
    });
  }

  void _stopPoseDetection() {
    if (_poseDetectionService != null) {
      _poseDetectionService!.stopPoseDetection();
    }
    if (mounted) {
      setState(() {
        _isDetecting = false;
      });
    } else {
      _isDetecting = false;
    }
  }

  @override
  void dispose() {
    // Avoid setState calls during dispose
    _poseDetectionService?.stopPoseDetection();
    _poseDetectionService?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text(widget.targetPose?['name'] ?? 'Pose Detection'),
        backgroundColor: Colors.black,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          if (_isInitialized && !_isDetecting)
            IconButton(
              icon: const Icon(Icons.play_arrow, color: Colors.red),
              onPressed: _startPoseDetection,
              tooltip: 'Start Detection',
            ),
          if (_isDetecting)
            IconButton(
              icon: const Icon(Icons.stop, color: Colors.red),
              onPressed: _stopPoseDetection,
              tooltip: 'Stop Detection',
            ),
        ],
      ),
      body: _isInitialized
          ? Column(
              children: [
                // Camera Preview
                Expanded(
                  flex: 3,
                  child: SizedBox(
                    width: double.infinity,
                    child: CameraPreview(_poseDetectionService!.cameraController),
                  ),
                ),

                // Pose Information and Feedback
                Expanded(
                  flex: 2,
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: const BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(20),
                        topRight: Radius.circular(20),
                      ),
                    ),
                    child: SingleChildScrollView(
                      child: ConstrainedBox(
                        constraints: BoxConstraints(
                          minHeight: MediaQuery.of(context).size.height * 0.4,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            // Target Pose Info
                            if (widget.targetPose != null) ...[
                              Text(
                                widget.targetPose!['name'] ?? '',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                widget.targetPose!['sanskrit'] ?? '',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 16,
                                  fontStyle: FontStyle.italic,
                                ),
                              ),
                              const SizedBox(height: 16),
                            ],

                            // Accuracy Indicator
                            Row(
                              children: [
                                const Text(
                                  'Accuracy: ',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 16,
                                  ),
                                ),
                                Text(
                                  '${_accuracy.toStringAsFixed(1)}%',
                                  style: TextStyle(
                                    color: _getAccuracyColor(_accuracy),
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),

                            const SizedBox(height: 8),

                            // Accuracy Bar
                            LinearProgressIndicator(
                              value: _accuracy / 100,
                              backgroundColor: Colors.grey[800],
                              valueColor: AlwaysStoppedAnimation<Color>(_getAccuracyColor(_accuracy)),
                            ),

                            const SizedBox(height: 16),

                            // Feedback
                            Builder(
                              builder: (_) {
                                String text = _feedback;
                                // If we haven't detected anything for >2s while detecting, show hint
                                if (_isDetecting) {
                                  final now = DateTime.now();
                                  if (_lastDetectionAt == null || now.difference(_lastDetectionAt!).inSeconds > 2) {
                                    text = 'Detecting pose... Make sure your full body is visible and the camera faces you.';
                                  }
                                }
                                return Text(
                                  text,
                                  style: const TextStyle(color: Colors.white, fontSize: 16),
                                );
                              },
                            ),

                            const SizedBox(height: 12),

                            // Detailed Feedback (Limited to 3 items to prevent overflow)
                            if (_detailedFeedback.isNotEmpty) ...[
                              const Text(
                                'Tips:',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              ..._detailedFeedback.take(3).map((tip) => Padding(
                                padding: const EdgeInsets.only(bottom: 4),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Icon(
                                      Icons.lightbulb,
                                      color: Colors.yellow,
                                      size: 16,
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        tip,
                                        style: const TextStyle(
                                          color: Colors.white70,
                                          fontSize: 14,
                                        ),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                              )),
                              if (_detailedFeedback.length > 3)
                                Text(
                                  '+${_detailedFeedback.length - 3} more tips...',
                                  style: const TextStyle(
                                    color: Colors.white54,
                                    fontSize: 12,
                                    fontStyle: FontStyle.italic,
                                  ),
                                ),
                            ],

                            // Instructions
                            if (widget.targetPose != null && !_isDetecting) ...[
                              const SizedBox(height: 16),
                              const Text(
                                'Instructions:',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              ...List<String>.from(widget.targetPose!['instructions'] ?? [])
                                  .take(5) // Limit to 5 instructions
                                  .map((instruction) => Padding(
                                padding: const EdgeInsets.only(bottom: 4),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      '• ',
                                      style: TextStyle(
                                        color: Colors.white70,
                                        fontSize: 14,
                                      ),
                                    ),
                                    Expanded(
                                      child: Text(
                                        instruction,
                                        style: const TextStyle(
                                          color: Colors.white70,
                                          fontSize: 14,
                                        ),
                                        maxLines: 3,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                              )),
                              if (_getInstructionsLength() > 5)
                                Text(
                                  '+${_getInstructionsLength() - 5} more steps...',
                                  style: const TextStyle(
                                    color: Colors.white54,
                                    fontSize: 12,
                                    fontStyle: FontStyle.italic,
                                  ),
                                ),
                            ],

                            // Add bottom padding to ensure content doesn't get cut off
                            const SizedBox(height: 20),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            )
          : Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircularProgressIndicator(color: Colors.red),
                  const SizedBox(height: 16),
                  Text(
                    _feedback,
                    style: const TextStyle(color: Colors.white),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
    );
  }

  int _getInstructionsLength() {
    if (widget.targetPose == null) return 0;
    final instructions = widget.targetPose!['instructions'];
    if (instructions is List) {
      return instructions.length;
    }
    return 0;
  }

  Color _getAccuracyColor(double accuracy) {
    if (accuracy >= 90) return Colors.green;
    if (accuracy >= 70) return Colors.orange;
    if (accuracy >= 50) return Colors.yellow;
    return Colors.red;
  }
}
