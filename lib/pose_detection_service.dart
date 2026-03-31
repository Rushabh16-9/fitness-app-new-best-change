import 'dart:async';
import 'package:camera/camera.dart';
import 'package:flutter/services.dart';
import 'package:google_ml_kit/google_ml_kit.dart';

class PoseDetectionService {
  final CameraController cameraController;
  final PoseDetector poseDetector;
  bool isDetecting = false;

  PoseDetectionService._(this.cameraController, this.poseDetector);

  static Future<PoseDetectionService> initialize() async {
    final cameras = await availableCameras();
    final camera = cameras.firstWhere(
      (camera) => camera.lensDirection == CameraLensDirection.front,
      orElse: () => cameras.first,
    );

    final cameraController = CameraController(
      camera,
      ResolutionPreset.high,
      enableAudio: false,
      imageFormatGroup: ImageFormatGroup.nv21,
    );

    await cameraController.initialize();

    final poseDetector = PoseDetector(options: PoseDetectorOptions());

    return PoseDetectionService._(cameraController, poseDetector);
  }

  void startPoseDetection(Function(Pose) onPoseDetected) {
    cameraController.startImageStream((CameraImage image) async {
      if (isDetecting) return;
      isDetecting = true;

      try {
        final inputImage = _convertCameraImage(image, cameraController.description.sensorOrientation);
        final poses = await poseDetector.processImage(inputImage);
        if (poses.isNotEmpty) {
          onPoseDetected(poses.first);
        } else {
          // Emit a neutral pose (no update) by calling back with a null-like indication if needed
          // Caller can decide how to handle no-pose frames; here we simply skip to keep stream active
        }
      } catch (e) {
        // Handle errors
      } finally {
        isDetecting = false;
      }
    });
  }

  void stopPoseDetection() {
    cameraController.stopImageStream();
  }

  void dispose() {
    poseDetector.close();
    cameraController.dispose();
  }

  InputImage _convertCameraImage(CameraImage image, int rotation) {
    final WriteBuffer allBytes = WriteBuffer();
    for (final plane in image.planes) {
      allBytes.putUint8List(plane.bytes);
    }
    final bytes = allBytes.done().buffer.asUint8List();

    final Size imageSize = Size(image.width.toDouble(), image.height.toDouble());

    // Map sensor orientation to ML Kit rotation
    InputImageRotation imageRotation;
    switch (rotation) {
      case 90:
        imageRotation = InputImageRotation.rotation90deg;
        break;
      case 180:
        imageRotation = InputImageRotation.rotation180deg;
        break;
      case 270:
        imageRotation = InputImageRotation.rotation270deg;
        break;
      case 0:
      default:
        imageRotation = InputImageRotation.rotation0deg;
    }

    // Build InputImage with correct metadata
    return InputImage.fromBytes(
      bytes: bytes,
      metadata: InputImageMetadata(
        size: imageSize,
        rotation: imageRotation,
        format: InputImageFormat.nv21,
        bytesPerRow: image.planes[0].bytesPerRow,
      ),
    );
  }
}
