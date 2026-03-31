


import 'package:google_ml_kit/google_ml_kit.dart';

class PoseComparisonService {
  static const Map<String, List<String>> poseKeyPoints = {
    'downward_dog': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'tree_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'warrior_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'triangle_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'cobra_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip'],
    'bridge_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'child_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'cat_cow_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'seated_forward_bend': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'corpse_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'standing_forward_bend': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'easy_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'butterfly_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'leg_raise_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'plow_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'fish_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'camel_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'bow_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'pigeon_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'chair_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'eagle_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'half_lord_twist': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'sphinx_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'thread_needle_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'happy_baby_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'windshield_wiper_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'reclined_hand_to_big_toe': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'knee_to_chest_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'seated_twist': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'mountain_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'cow_face_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'legs_up_wall': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'supported_backbend': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'pranayama_prep': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'yoga_nidra': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'supported_child_pose': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'pelvic_floor_work': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'cooling_poses': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'gentle_flow': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'supported_poses': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'warm_therapy_prep': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'recovery_flow': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
    'restorative_poses': ['nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle']
  };

  static Map<String, dynamic> analyzePose(Pose detectedPose, String targetPoseId) {
    final keyPoints = poseKeyPoints[targetPoseId] ?? [];
    final detectedLandmarks = detectedPose.landmarks;

    double totalScore = 0;
    int validPoints = 0;
    List<String> feedback = [];

    for (final keyPoint in keyPoints) {
      final landmark = _getLandmarkByType(detectedLandmarks, _getPoseLandmarkType(keyPoint));
      if (landmark != null) {
        final score = _calculateKeyPointScore(landmark, targetPoseId, keyPoint);
        totalScore += score;
        validPoints++;

        if (score < 0.7) {
          final message = _getFeedbackMessage(keyPoint, score);
          if (message.isNotEmpty) {
            feedback.add(message);
          }
        }
      }
    }

    final accuracy = validPoints > 0 ? (totalScore / validPoints) * 100 : 0;

    return {
      'accuracy': accuracy.clamp(0, 100),
      'feedback': feedback,
      'validPoints': validPoints,
      'totalPoints': keyPoints.length
    };
  }

  static PoseLandmark? _getLandmarkByType(Map<PoseLandmarkType, PoseLandmark> landmarks, PoseLandmarkType type) {
    return landmarks[type];
  }

  static PoseLandmarkType _getPoseLandmarkType(String keyPoint) {
    switch (keyPoint) {
      case 'nose': return PoseLandmarkType.nose;
      case 'left_shoulder': return PoseLandmarkType.leftShoulder;
      case 'right_shoulder': return PoseLandmarkType.rightShoulder;
      case 'left_elbow': return PoseLandmarkType.leftElbow;
      case 'right_elbow': return PoseLandmarkType.rightElbow;
      case 'left_wrist': return PoseLandmarkType.leftWrist;
      case 'right_wrist': return PoseLandmarkType.rightWrist;
      case 'left_hip': return PoseLandmarkType.leftHip;
      case 'right_hip': return PoseLandmarkType.rightHip;
      case 'left_knee': return PoseLandmarkType.leftKnee;
      case 'right_knee': return PoseLandmarkType.rightKnee;
      case 'left_ankle': return PoseLandmarkType.leftAnkle;
      case 'right_ankle': return PoseLandmarkType.rightAnkle;
      default: return PoseLandmarkType.nose;
    }
  }

  static double _calculateKeyPointScore(PoseLandmark landmark, String poseId, String keyPoint) {
    // Use the landmark's likelihood as the confidence score
    // This indicates how confident the model is that this landmark is correctly detected
    double confidenceScore = landmark.likelihood;

    // For a more realistic pose comparison, we need to compare angles and relative positions
    // For now, we'll use the confidence score with some variation based on pose-specific logic

    // Add pose-specific scoring logic
    double poseSpecificScore = _calculatePoseSpecificScore(landmark, poseId, keyPoint);

    // Combine confidence with pose-specific scoring
    return (confidenceScore * 0.6) + (poseSpecificScore * 0.4);
  }

  static double _calculatePoseSpecificScore(PoseLandmark landmark, String poseId, String keyPoint) {
    // This is a simplified implementation
    // In a real app, you'd have reference pose data and compare angles between joints

    // For demonstration, we'll use some basic heuristics based on common pose requirements
    switch (poseId) {
      case 'downward_dog':
        return _scoreDownwardDogPose(landmark, keyPoint);
      case 'tree_pose':
        return _scoreTreePose(landmark, keyPoint);
      case 'warrior_pose':
        return _scoreWarriorPose(landmark, keyPoint);
      default:
        // For unknown poses, return a moderate score with some randomness
        return 0.5 + (landmark.x % 0.3); // Add some variation based on position
    }
  }

  static double _scoreDownwardDogPose(PoseLandmark landmark, String keyPoint) {
    // Basic scoring for downward dog pose
    switch (keyPoint) {
      case 'left_hip':
      case 'right_hip':
        // Hips should be higher than knees in downward dog
        return landmark.y < 0.6 ? 0.8 : 0.4;
      case 'left_knee':
      case 'right_knee':
        // Knees should be straight
        return 0.7;
      case 'left_ankle':
      case 'right_ankle':
        // Ankles should be grounded
        return landmark.y > 0.8 ? 0.8 : 0.5;
      default:
        return 0.6;
    }
  }

  static double _scoreTreePose(PoseLandmark landmark, String keyPoint) {
    // Basic scoring for tree pose
    switch (keyPoint) {
      case 'left_ankle':
      case 'right_ankle':
        // Standing leg should be stable
        return 0.7;
      case 'left_knee':
      case 'right_knee':
        // Bent knee should be at appropriate height
        return landmark.y < 0.5 ? 0.8 : 0.4;
      default:
        return 0.6;
    }
  }

  static double _scoreWarriorPose(PoseLandmark landmark, String keyPoint) {
    // Basic scoring for warrior pose
    switch (keyPoint) {
      case 'left_knee':
      case 'right_knee':
        // Front knee should be bent
        return landmark.y < 0.7 ? 0.8 : 0.4;
      case 'left_hip':
      case 'right_hip':
        // Hips should be level
        return 0.7;
      default:
        return 0.6;
    }
  }

  static String _getFeedbackMessage(String keyPoint, double score) {
    if (score < 0.5) {
      return 'Adjust your $keyPoint position';
    } else if (score < 0.7) {
      return 'Slightly adjust your $keyPoint';
    }
    return '';
  }

  static String getPoseFeedback(double accuracy) {
    if (accuracy >= 90) {
      return 'Excellent! Perfect pose!';
    } else if (accuracy >= 80) {
      return 'Great job! Almost there!';
    } else if (accuracy >= 70) {
      return 'Good! Keep adjusting your position';
    } else if (accuracy >= 60) {
      return 'Keep trying! Focus on your form';
    } else {
      return 'Take your time and follow the instructions';
    }
  }
}
