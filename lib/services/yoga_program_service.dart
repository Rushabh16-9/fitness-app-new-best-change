import 'dart:convert';
import 'package:flutter/services.dart';
import '../models/yoga_program.dart';


class YogaProgramService {
  static const String _assetsPath = 'assets/data/yoga_programs.json';
  List<YogaProgram> _programs = [];
  bool _loaded = false;

  Future<void> load() async {
    if (_loaded) return;
    
    try {
      final jsonString = await rootBundle.loadString(_assetsPath);
      final Map<String, dynamic> jsonData = json.decode(jsonString);
      final List<dynamic> programsJson = jsonData['programs'] ?? [];
      
      _programs = programsJson.map((json) => YogaProgram.fromJson(json)).toList();
      _loaded = true;
    } catch (e) {
      // If asset doesn't exist, create default programs
      _createDefaultPrograms();
      _loaded = true;
    }
  }

  void _createDefaultPrograms() {
    _programs = [
      YogaProgram(
        id: 'beginner_7_day',
        name: '7-Day Beginner Yoga',
        description: 'Perfect introduction to yoga for beginners',
        level: 'beginner',
        durationDays: 7,
        focus: 'flexibility',
        imageUrl: '',
        days: [
          YogaDay(
            day: 1,
            theme: 'Foundation & Breath',
            estimatedMinutes: 20,
            instructions: 'Focus on basic poses and breathing techniques',
            poses: [
              YogaPose(
                name: 'Mountain Pose',
                sanskritName: 'Tadasana',
                description: 'Stand tall with feet hip-width apart',
                holdSeconds: 30,
                repetitions: 1,
                difficulty: 'beginner',
                benefits: ['Improves posture', 'Increases awareness'],
                modifications: ['Use wall support if needed'],
                imageAsset: 'assets/yoga/mountain_pose.jpg',
                instructions: 'Stand with feet parallel, arms at sides. Breathe deeply.',
              ),
              YogaPose(
                name: 'Child\'s Pose',
                sanskritName: 'Balasana',
                description: 'Kneel and sit back on heels, fold forward',
                holdSeconds: 60,
                repetitions: 1,
                difficulty: 'beginner',
                benefits: ['Calms mind', 'Stretches hips'],
                modifications: ['Place pillow under knees'],
                imageAsset: 'assets/yoga/childs_pose.jpg',
                instructions: 'Kneel, touch big toes, sit back, extend arms forward.',
              ),
              YogaPose(
                name: 'Cat-Cow Stretch',
                sanskritName: 'Marjaryasana-Bitilasana',
                description: 'Alternate between arching and rounding spine',
                holdSeconds: 5,
                repetitions: 8,
                difficulty: 'beginner',
                benefits: ['Spinal mobility', 'Core warming'],
                modifications: ['Move slowly with breath'],
                imageAsset: 'assets/yoga/cat_cow.jpg',
                instructions: 'Start on hands and knees, alternate spine positions.',
              ),
            ],
          ),
          YogaDay(
            day: 2,
            theme: 'Standing Poses',
            estimatedMinutes: 25,
            instructions: 'Build strength and stability in standing poses',
            poses: [
              YogaPose(
                name: 'Warrior I',
                sanskritName: 'Virabhadrasana I',
                description: 'Lunge with arms overhead',
                holdSeconds: 30,
                repetitions: 2,
                difficulty: 'beginner',
                benefits: ['Strengthens legs', 'Opens hips'],
                modifications: ['Use blocks under hands'],
                imageAsset: 'assets/yoga/warrior1.jpg',
                instructions: 'Step back, bend front knee, raise arms up.',
              ),
              YogaPose(
                name: 'Tree Pose',
                sanskritName: 'Vrikshasana',
                description: 'Balance on one foot with other foot on inner thigh',
                holdSeconds: 30,
                repetitions: 2,
                difficulty: 'beginner',
                benefits: ['Improves balance', 'Strengthens core'],
                modifications: ['Hold wall for support'],
                imageAsset: 'assets/yoga/tree_pose.jpg',
                instructions: 'Stand on one foot, place other foot on inner thigh.',
              ),
              YogaPose(
                name: 'Forward Fold',
                sanskritName: 'Uttanasana',
                description: 'Fold forward from hips',
                holdSeconds: 45,
                repetitions: 1,
                difficulty: 'beginner',
                benefits: ['Stretches hamstrings', 'Calms nervous system'],
                modifications: ['Bend knees as needed'],
                imageAsset: 'assets/yoga/forward_fold.jpg',
                instructions: 'Hinge at hips, let arms hang or hold elbows.',
              ),
            ],
          ),
          // Continue for days 3-7...
          YogaDay(
            day: 3,
            theme: 'Gentle Flow',
            estimatedMinutes: 30,
            instructions: 'Connect poses with breath in gentle flow',
            poses: [
              YogaPose(
                name: 'Downward Dog',
                sanskritName: 'Adho Mukha Svanasana',
                description: 'Inverted V-shape pose',
                holdSeconds: 45,
                repetitions: 1,
                difficulty: 'beginner',
                benefits: ['Full body stretch', 'Strengthens arms'],
                modifications: ['Bend knees, use blocks'],
                imageAsset: 'assets/yoga/downward_dog.jpg',
                instructions: 'From hands and knees, tuck toes, lift hips up.',
              ),
            ],
          ),
          YogaDay(
            day: 4,
            theme: 'Hip Openers',
            estimatedMinutes: 25,
            instructions: 'Focus on hip flexibility and mobility',
            poses: [
              YogaPose(
                name: 'Pigeon Pose',
                sanskritName: 'Eka Pada Rajakapotasana',
                description: 'Hip opener with front leg bent',
                holdSeconds: 60,
                repetitions: 2,
                difficulty: 'intermediate',
                benefits: ['Deep hip stretch', 'Releases tension'],
                modifications: ['Use bolster under hips'],
                imageAsset: 'assets/yoga/pigeon.jpg',
                instructions: 'From downward dog, bring knee to wrist, extend back leg.',
              ),
            ],
          ),
          YogaDay(
            day: 5,
            theme: 'Core Strength',
            estimatedMinutes: 20,
            instructions: 'Build core strength and stability',
            poses: [
              YogaPose(
                name: 'Plank Pose',
                sanskritName: 'Phalakasana',
                description: 'Hold straight line from head to heels',
                holdSeconds: 30,
                repetitions: 3,
                difficulty: 'beginner',
                benefits: ['Core strength', 'Full body engagement'],
                modifications: ['Drop to knees'],
                imageAsset: 'assets/yoga/plank.jpg',
                instructions: 'From downward dog, shift forward, hold straight line.',
              ),
            ],
          ),
          YogaDay(
            day: 6,
            theme: 'Backbends',
            estimatedMinutes: 25,
            instructions: 'Gentle heart opening and back strengthening',
            poses: [
              YogaPose(
                name: 'Cobra Pose',
                sanskritName: 'Bhujangasana',
                description: 'Gentle backbend lying on stomach',
                holdSeconds: 20,
                repetitions: 3,
                difficulty: 'beginner',
                benefits: ['Strengthens back', 'Opens chest'],
                modifications: ['Keep forearms down'],
                imageAsset: 'assets/yoga/cobra.jpg',
                instructions: 'Lie on stomach, press palms, lift chest.',
              ),
            ],
          ),
          YogaDay(
            day: 7,
            theme: 'Relaxation & Integration',
            estimatedMinutes: 35,
            instructions: 'Gentle practice focusing on relaxation and reflection',
            poses: [
              YogaPose(
                name: 'Legs Up Wall',
                sanskritName: 'Viparita Karani',
                description: 'Lie on back with legs up wall',
                holdSeconds: 300,
                repetitions: 1,
                difficulty: 'beginner',
                benefits: ['Relaxes nervous system', 'Improves circulation'],
                modifications: ['Use bolster under lower back'],
                imageAsset: 'assets/yoga/legs_up_wall.jpg',
                instructions: 'Lie near wall, extend legs up wall, relax arms.',
              ),
              YogaPose(
                name: 'Savasana',
                sanskritName: 'Savasana',
                description: 'Complete relaxation lying flat',
                holdSeconds: 600,
                repetitions: 1,
                difficulty: 'beginner',
                benefits: ['Deep relaxation', 'Stress relief'],
                modifications: ['Use eye pillow, blanket'],
                imageAsset: 'assets/yoga/savasana.jpg',
                instructions: 'Lie flat, let body completely relax, focus on breath.',
              ),
            ],
          ),
        ],
      ),
      // Add intermediate and advanced programs
      YogaProgram(
        id: 'strength_14_day',
        name: '14-Day Strength Building',
        description: 'Build strength and endurance through yoga',
        level: 'intermediate',
        durationDays: 14,
        focus: 'strength',
        imageUrl: '',
        days: List.generate(14, (index) => YogaDay(
          day: index + 1,
          theme: 'Strength Day ${index + 1}',
          estimatedMinutes: 35,
          instructions: 'Focus on building strength and endurance',
          poses: [
            YogaPose(
              name: 'Warrior III',
              sanskritName: 'Virabhadrasana III',
              description: 'Balance on one leg, body parallel to ground',
              holdSeconds: 20,
              repetitions: 3,
              difficulty: 'intermediate',
              benefits: ['Core strength', 'Balance', 'Leg strength'],
              modifications: ['Use wall or block for support'],
              imageAsset: 'assets/yoga/warrior3.jpg',
              instructions: 'From warrior I, hinge forward, lift back leg.',
            ),
          ],
        )),
      ),
    ];
  }

  List<YogaProgram> get allPrograms => _programs;

  List<YogaProgram> getProgramsByLevel(String level) {
    return _programs.where((program) => program.level == level).toList();
  }

  List<YogaProgram> getProgramsByFocus(String focus) {
    return _programs.where((program) => program.focus == focus).toList();
  }

  YogaProgram? getProgramById(String id) {
    try {
      return _programs.firstWhere((program) => program.id == id);
    } catch (e) {
      return null;
    }
  }

  List<String> getLevels() {
    return _programs.map((program) => program.level).toSet().toList();
  }

  List<String> getFocusAreas() {
    return _programs.map((program) => program.focus).toSet().toList();
  }
}