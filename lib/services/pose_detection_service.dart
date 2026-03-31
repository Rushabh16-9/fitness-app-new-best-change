import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import 'package:flutter/foundation.dart';

class PoseDetectionService {
  late PoseDetector _poseDetector;
  bool _isInitialized = false;

  Future<void> initialize() async {
    if (_isInitialized) return;
    
    final options = PoseDetectorOptions(
      mode: PoseDetectionMode.stream,
    );
    
    _poseDetector = PoseDetector(options: options);
    _isInitialized = true;
  }

  Future<PoseAnalysisResult> analyzePose({
    required InputImage inputImage,
    required String targetExercise,
  }) async {
    if (!_isInitialized) {
      await initialize();
    }

    try {
      final poses = await _poseDetector.processImage(inputImage);
      
      if (poses.isEmpty) {
        return PoseAnalysisResult(
          isDetected: false,
          accuracy: 0.0,
          feedback: 'No pose detected. Make sure you\'re fully visible in the camera.',
          points: 0,
        );
      }

      final pose = poses.first;
      return _analyzePoseForExercise(pose, targetExercise);
    } catch (e) {
      if (kDebugMode) {
        print('Pose detection error: $e');
      }
      return PoseAnalysisResult(
        isDetected: false,
        accuracy: 0.0,
        feedback: 'Error analyzing pose. Please try again.',
        points: 0,
      );
    }
  }

  PoseAnalysisResult _analyzePoseForExercise(Pose pose, String exercise) {
    final exerciseName = exercise.toLowerCase();
    
    if (exerciseName.contains('pushup') || exerciseName.contains('push-up')) {
      return _analyzePushUp(pose);
    } else if (exerciseName.contains('squat')) {
      return _analyzeSquat(pose);
    } else if (exerciseName.contains('plank')) {
      return _analyzePlank(pose);
    } else if (exerciseName.contains('jumping jack')) {
      return _analyzeJumpingJack(pose);
    } else {
      return _analyzeGenericPose(pose);
    }
  }

  PoseAnalysisResult _analyzePushUp(Pose pose) {
    final landmarks = pose.landmarks;
    
    // Get key points for push-up analysis
    final leftShoulder = landmarks[PoseLandmarkType.leftShoulder];
    final rightShoulder = landmarks[PoseLandmarkType.rightShoulder];
    final leftElbow = landmarks[PoseLandmarkType.leftElbow];
    final rightElbow = landmarks[PoseLandmarkType.rightElbow];
    final leftWrist = landmarks[PoseLandmarkType.leftWrist];
    final rightWrist = landmarks[PoseLandmarkType.rightWrist];
    final leftHip = landmarks[PoseLandmarkType.leftHip];
    final rightHip = landmarks[PoseLandmarkType.rightHip];
    
    if (leftShoulder == null || rightShoulder == null || leftElbow == null || 
        rightElbow == null || leftWrist == null || rightWrist == null ||
        leftHip == null || rightHip == null) {
      return PoseAnalysisResult(
        isDetected: false,
        accuracy: 0.0,
        feedback: 'Cannot detect all body parts needed for push-up analysis.',
        points: 0,
      );
    }

    double accuracy = 0.0;
    List<String> feedback = [];

    // Check arm position
    final leftArmAngle = _calculateAngle(leftShoulder, leftElbow, leftWrist);
    final rightArmAngle = _calculateAngle(rightShoulder, rightElbow, rightWrist);
    
    if (leftArmAngle > 70 && leftArmAngle < 110 && rightArmAngle > 70 && rightArmAngle < 110) {
      accuracy += 30;
    } else {
      feedback.add('Keep your arms at 90-degree angle');
    }

    // Check body alignment (shoulder to hip should be relatively straight)
    final bodyAlignment = _checkBodyAlignment([leftShoulder, leftHip], [rightShoulder, rightHip]);
    if (bodyAlignment > 0.8) {
      accuracy += 40;
    } else {
      feedback.add('Keep your body in a straight line');
    }

    // Check if hands are positioned correctly
    final handPosition = _checkHandPosition(leftWrist, rightWrist, leftShoulder, rightShoulder);
    if (handPosition > 0.7) {
      accuracy += 30;
    } else {
      feedback.add('Position hands slightly wider than shoulders');
    }

    final points = (accuracy / 10).round();
    
    return PoseAnalysisResult(
      isDetected: true,
      accuracy: accuracy,
      feedback: feedback.isEmpty ? 'Great form! Keep it up!' : feedback.join('. '),
      points: points,
    );
  }

  PoseAnalysisResult _analyzeSquat(Pose pose) {
    final landmarks = pose.landmarks;
    
    final leftHip = landmarks[PoseLandmarkType.leftHip];
    final rightHip = landmarks[PoseLandmarkType.rightHip];
    final leftKnee = landmarks[PoseLandmarkType.leftKnee];
    final rightKnee = landmarks[PoseLandmarkType.rightKnee];
    final leftAnkle = landmarks[PoseLandmarkType.leftAnkle];
    final rightAnkle = landmarks[PoseLandmarkType.rightAnkle];
    
    if (leftHip == null || rightHip == null || leftKnee == null || 
        rightKnee == null || leftAnkle == null || rightAnkle == null) {
      return PoseAnalysisResult(
        isDetected: false,
        accuracy: 0.0,
        feedback: 'Cannot detect all body parts needed for squat analysis.',
        points: 0,
      );
    }

    double accuracy = 0.0;
    List<String> feedback = [];

    // Check knee angle (should be around 90 degrees for proper squat)
    final leftKneeAngle = _calculateAngle(leftHip, leftKnee, leftAnkle);
    final rightKneeAngle = _calculateAngle(rightHip, rightKnee, rightAnkle);
    
    if (leftKneeAngle > 70 && leftKneeAngle < 110 && rightKneeAngle > 70 && rightKneeAngle < 110) {
      accuracy += 40;
    } else {
      feedback.add('Squat deeper - aim for 90-degree knee angle');
    }

    // Check if knees are tracking over toes
    final kneeAlignment = _checkKneeAlignment(leftKnee, rightKnee, leftAnkle, rightAnkle);
    if (kneeAlignment > 0.7) {
      accuracy += 30;
    } else {
      feedback.add('Keep knees aligned over your toes');
    }

    // Check hip position (hips should go back)
    final hipPosition = _checkHipPosition(leftHip, rightHip, leftKnee, rightKnee);
    if (hipPosition > 0.6) {
      accuracy += 30;
    } else {
      feedback.add('Push your hips back more');
    }

    final points = (accuracy / 10).round();
    
    return PoseAnalysisResult(
      isDetected: true,
      accuracy: accuracy,
      feedback: feedback.isEmpty ? 'Perfect squat form!' : feedback.join('. '),
      points: points,
    );
  }

  PoseAnalysisResult _analyzePlank(Pose pose) {
    final landmarks = pose.landmarks;
    
    final leftShoulder = landmarks[PoseLandmarkType.leftShoulder];
    final rightShoulder = landmarks[PoseLandmarkType.rightShoulder];
    final leftHip = landmarks[PoseLandmarkType.leftHip];
    final rightHip = landmarks[PoseLandmarkType.rightHip];
    final leftAnkle = landmarks[PoseLandmarkType.leftAnkle];
    final rightAnkle = landmarks[PoseLandmarkType.rightAnkle];
    
    if (leftShoulder == null || rightShoulder == null || leftHip == null || 
        rightHip == null || leftAnkle == null || rightAnkle == null) {
      return PoseAnalysisResult(
        isDetected: false,
        accuracy: 0.0,
        feedback: 'Cannot detect all body parts needed for plank analysis.',
        points: 0,
      );
    }

    double accuracy = 0.0;
    List<String> feedback = [];

    // Check body alignment (straight line from shoulders to ankles)
    final bodyAlignment = _checkPlankAlignment(leftShoulder, leftHip, leftAnkle, rightShoulder, rightHip, rightAnkle);
    if (bodyAlignment > 0.8) {
      accuracy += 60;
    } else {
      feedback.add('Keep your body in a straight line');
    }

    // Check if not sagging or piking
    final sagCheck = _checkPlankSag(leftShoulder, leftHip, leftAnkle);
    if (sagCheck > 0.7) {
      accuracy += 40;
    } else {
      feedback.add('Engage your core - avoid sagging or piking');
    }

    final points = (accuracy / 10).round();
    
    return PoseAnalysisResult(
      isDetected: true,
      accuracy: accuracy,
      feedback: feedback.isEmpty ? 'Excellent plank! Hold steady!' : feedback.join('. '),
      points: points,
    );
  }

  PoseAnalysisResult _analyzeJumpingJack(Pose pose) {
    final landmarks = pose.landmarks;
    
    final leftShoulder = landmarks[PoseLandmarkType.leftShoulder];
    final rightShoulder = landmarks[PoseLandmarkType.rightShoulder];
    final leftWrist = landmarks[PoseLandmarkType.leftWrist];
    final rightWrist = landmarks[PoseLandmarkType.rightWrist];
    final leftAnkle = landmarks[PoseLandmarkType.leftAnkle];
    final rightAnkle = landmarks[PoseLandmarkType.rightAnkle];
    
    if (leftShoulder == null || rightShoulder == null || leftWrist == null || 
        rightWrist == null || leftAnkle == null || rightAnkle == null) {
      return PoseAnalysisResult(
        isDetected: false,
        accuracy: 0.0,
        feedback: 'Cannot detect all body parts needed for jumping jack analysis.',
        points: 0,
      );
    }

    double accuracy = 0.0;
    List<String> feedback = [];

    // Check arm position (arms should be up)
    final armHeight = _checkArmHeight(leftWrist, rightWrist, leftShoulder, rightShoulder);
    if (armHeight > 0.7) {
      accuracy += 50;
    } else {
      feedback.add('Raise your arms higher');
    }

    // Check leg position (legs should be apart)
    final legSpread = _checkLegSpread(leftAnkle, rightAnkle);
    if (legSpread > 0.6) {
      accuracy += 50;
    } else {
      feedback.add('Spread your legs wider');
    }

    final points = (accuracy / 10).round();
    
    return PoseAnalysisResult(
      isDetected: true,
      accuracy: accuracy,
      feedback: feedback.isEmpty ? 'Great jumping jack form!' : feedback.join('. '),
      points: points,
    );
  }

  PoseAnalysisResult _analyzeGenericPose(Pose pose) {
    // Generic analysis for any exercise
    final confidence = pose.landmarks.values.length / pose.landmarks.length;
    
    double accuracy = confidence * 100;
    String feedback = accuracy > 70 ? 'Good pose detected!' : 'Try to be more visible in the camera';
    int points = (accuracy / 15).round();
    
    return PoseAnalysisResult(
      isDetected: true,
      accuracy: accuracy,
      feedback: feedback,
      points: points,
    );
  }

  // Helper methods for pose analysis
  double _calculateAngle(PoseLandmark a, PoseLandmark b, PoseLandmark c) {
    final ba = a.x - b.x;
    final bc = c.x - b.x;
    final cosine = (ba * bc) / (ba.abs() * bc.abs());
    return (cosine.abs() * 180 / 3.14159);
  }

  double _checkBodyAlignment(List<PoseLandmark> leftSide, List<PoseLandmark> rightSide) {
    // Calculate how straight the body alignment is
    double totalAlignment = 0.0;
    for (int i = 0; i < leftSide.length - 1; i++) {
      final leftVector = leftSide[i + 1].y - leftSide[i].y;
      final rightVector = rightSide[i + 1].y - rightSide[i].y;
      final similarity = 1.0 - (leftVector - rightVector).abs() / 100.0;
      totalAlignment += similarity.clamp(0.0, 1.0);
    }
    return totalAlignment / (leftSide.length - 1);
  }

  double _checkHandPosition(PoseLandmark leftWrist, PoseLandmark rightWrist, 
                          PoseLandmark leftShoulder, PoseLandmark rightShoulder) {
    final wristDistance = (leftWrist.x - rightWrist.x).abs();
    final shoulderDistance = (leftShoulder.x - rightShoulder.x).abs();
    final ratio = wristDistance / shoulderDistance;
    return (ratio > 1.0 && ratio < 1.5) ? 1.0 : (2.0 - ratio).clamp(0.0, 1.0);
  }

  double _checkKneeAlignment(PoseLandmark leftKnee, PoseLandmark rightKnee,
                           PoseLandmark leftAnkle, PoseLandmark rightAnkle) {
    final leftAlignment = (leftKnee.x - leftAnkle.x).abs();
    final rightAlignment = (rightKnee.x - rightAnkle.x).abs();
    final avgAlignment = (leftAlignment + rightAlignment) / 2;
    return (20.0 - avgAlignment).clamp(0.0, 20.0) / 20.0;
  }

  double _checkHipPosition(PoseLandmark leftHip, PoseLandmark rightHip,
                         PoseLandmark leftKnee, PoseLandmark rightKnee) {
    final hipCenter = (leftHip.x + rightHip.x) / 2;
    final kneeCenter = (leftKnee.x + rightKnee.x) / 2;
    final hipBack = (hipCenter - kneeCenter).abs();
    return (hipBack / 50.0).clamp(0.0, 1.0);
  }

  double _checkPlankAlignment(PoseLandmark leftShoulder, PoseLandmark leftHip, PoseLandmark leftAnkle,
                            PoseLandmark rightShoulder, PoseLandmark rightHip, PoseLandmark rightAnkle) {
    final leftLinearity = _calculateLinearity([leftShoulder, leftHip, leftAnkle]);
    final rightLinearity = _calculateLinearity([rightShoulder, rightHip, rightAnkle]);
    return (leftLinearity + rightLinearity) / 2;
  }

  double _checkPlankSag(PoseLandmark shoulder, PoseLandmark hip, PoseLandmark ankle) {
    final expectedHipY = (shoulder.y + ankle.y) / 2;
    final actualDeviation = (hip.y - expectedHipY).abs();
    return (30.0 - actualDeviation).clamp(0.0, 30.0) / 30.0;
  }

  double _checkArmHeight(PoseLandmark leftWrist, PoseLandmark rightWrist,
                       PoseLandmark leftShoulder, PoseLandmark rightShoulder) {
    final leftArmUp = leftWrist.y < leftShoulder.y;
    final rightArmUp = rightWrist.y < rightShoulder.y;
    return (leftArmUp && rightArmUp) ? 1.0 : 0.5;
  }

  double _checkLegSpread(PoseLandmark leftAnkle, PoseLandmark rightAnkle) {
    final legDistance = (leftAnkle.x - rightAnkle.x).abs();
    return (legDistance / 100.0).clamp(0.0, 1.0);
  }

  double _calculateLinearity(List<PoseLandmark> points) {
    if (points.length < 3) return 1.0;
    
    double totalDeviation = 0.0;
    for (int i = 1; i < points.length - 1; i++) {
      final expected = points[0].y + (points.last.y - points[0].y) * i / (points.length - 1);
      final actual = points[i].y;
      totalDeviation += (expected - actual).abs();
    }
    
    final avgDeviation = totalDeviation / (points.length - 2);
    return (50.0 - avgDeviation).clamp(0.0, 50.0) / 50.0;
  }

  void dispose() {
    if (_isInitialized) {
      _poseDetector.close();
      _isInitialized = false;
    }
  }
}

class PoseAnalysisResult {
  final bool isDetected;
  final double accuracy; // 0-100
  final String feedback;
  final int points;

  PoseAnalysisResult({
    required this.isDetected,
    required this.accuracy,
    required this.feedback,
    required this.points,
  });
}