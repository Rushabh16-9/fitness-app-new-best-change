import 'package:firebase_auth/firebase_auth.dart';
import 'database_service.dart';
import 'asset_resolver.dart';

class YogaService {
  final DatabaseService _databaseService;

  YogaService(String? uid)
      : _databaseService = DatabaseService(uid: uid ?? FirebaseAuth.instance.currentUser?.uid) {
    _ensurePoseImages();
  }

  // Yoga poses data based on the dataset
  final Map<String, Map<String, dynamic>> yogaPoses = {
    'downward_dog': {
      'name': 'Downward Facing Dog',
      'sanskrit': 'Adho Mukha Svanasana',
      'difficulty': 'Beginner',
      'benefits': ['Stretches hamstrings', 'Strengthens arms', 'Calms mind'],
      'instructions': [
        'Start on hands and knees',
        'Lift hips up and back',
        'Straighten arms and legs',
        'Form an inverted V shape',
        'Hold for 30-60 seconds'
      ],
      'muscleGroups': ['Hamstrings', 'Calves', 'Shoulders', 'Arms'],
      'duration': 45,
      'imagePath': 'assets/yoga/downward_dog/downward_dog1.jpg'
    },
    'tree_pose': {
      'name': 'Tree Pose',
      'sanskrit': 'Vrksasana',
      'difficulty': 'Beginner',
      'benefits': ['Improves balance', 'Strengthens legs', 'Opens hips'],
      'instructions': [
        'Stand tall with feet together',
        'Place right foot on left inner thigh',
        'Bring hands to heart center',
        'Find a focal point to help balance',
        'Hold for 30 seconds, then switch sides'
      ],
      'muscleGroups': ['Legs', 'Core', 'Balance'],
      'duration': 30,
      'imagePath': 'assets/yoga/tree_pose/1.png'
    },
    'warrior_pose': {
      'name': 'Warrior Pose',
      'sanskrit': 'Virabhadrasana',
      'difficulty': 'Intermediate',
      'benefits': ['Strengthens legs', 'Opens hips', 'Builds stamina'],
      'instructions': [
        'Step right foot back',
        'Turn right foot out 90 degrees',
        'Bend left knee over ankle',
        'Square hips to front',
        'Raise arms overhead',
        'Hold for 30-60 seconds'
      ],
      'muscleGroups': ['Legs', 'Core', 'Shoulders'],
      'duration': 45,
  'imagePath': 'assets/yoga/warrior_pose/Veerabhadrasana_10.jpg'
    },
    'triangle_pose': {
      'name': 'Triangle Pose',
      'sanskrit': 'Trikonasana',
      'difficulty': 'Intermediate',
      'benefits': ['Stretches hamstrings', 'Opens chest', 'Strengthens legs'],
      'instructions': [
        'Stand with feet wide apart',
        'Turn right foot out 90 degrees',
        'Extend arms to sides',
        'Reach right hand to floor or shin',
        'Extend left arm up',
        'Look up at left hand',
        'Hold for 30 seconds'
      ],
      'muscleGroups': ['Hamstrings', 'Hips', 'Core'],
      'duration': 40,
  'imagePath': 'assets/yoga/triangle_pose/triangle1.jpg'
    },
    'cobra_pose': {
      'name': 'Cobra Pose',
      'sanskrit': 'Bhujangasana',
      'difficulty': 'Beginner',
      'benefits': ['Strengthens back', 'Opens chest', 'Improves posture'],
      'instructions': [
        'Lie face down on mat',
        'Place hands under shoulders',
        'Keep elbows close to body',
        'Press into hands to lift chest',
        'Keep hips on floor',
        'Look forward or slightly up',
        'Hold for 20-30 seconds'
      ],
      'muscleGroups': ['Back', 'Chest', 'Shoulders'],
      'duration': 25,
      'imagePath': 'assets/plank.png'
    },
    'bridge_pose': {
      'name': 'Bridge Pose',
      'sanskrit': 'Setu Bandhasana',
      'difficulty': 'Beginner',
      'benefits': ['Strengthens back', 'Opens chest', 'Stretches hips'],
      'instructions': [
        'Lie on back with knees bent',
        'Place feet hip-width apart',
        'Press feet into floor',
        'Lift hips toward ceiling',
        'Clasp hands under back',
        'Roll shoulders under',
        'Hold for 30 seconds'
      ],
      'muscleGroups': ['Back', 'Glutes', 'Hamstrings'],
      'duration': 35,
      'imagePath': 'assets/pushups.png'
    },
    'child_pose': {
      'name': 'Child\'s Pose',
      'sanskrit': 'Balasana',
      'difficulty': 'Beginner',
      'benefits': ['Relieves stress', 'Stretches back', 'Calms mind'],
      'instructions': [
        'Kneel on floor',
        'Sit back on heels',
        'Fold forward',
        'Extend arms forward',
        'Rest forehead on floor',
        'Breathe deeply',
        'Hold for 1-3 minutes'
      ],
      'muscleGroups': ['Back', 'Hips', 'Shoulders'],
      'duration': 90,
      'imagePath': 'assets/squats.png'
    },
    'cat_cow_pose': {
      'name': 'Cat-Cow Pose',
      'sanskrit': 'Marjaryasana-Bitilasana',
      'difficulty': 'Beginner',
      'benefits': ['Improves spinal flexibility', 'Relieves back pain', 'Calms mind'],
      'instructions': [
        'Start on hands and knees',
        'For cow: Lift head and tailbone, arch back',
        'For cat: Tuck chin and tailbone, round back',
        'Alternate between poses',
        'Move with breath',
        'Repeat 5-10 times'
      ],
      'muscleGroups': ['Back', 'Core', 'Neck'],
      'duration': 60,
      'imagePath': 'assets/plank.png'
    },
    'seated_forward_bend': {
      'name': 'Seated Forward Bend',
      'sanskrit': 'Paschimottanasana',
      'difficulty': 'Beginner',
      'benefits': ['Stretches hamstrings', 'Calms nervous system', 'Relieves stress'],
      'instructions': [
        'Sit with legs extended',
        'Inhale and lengthen spine',
        'Exhale and fold forward from hips',
        'Reach toward feet or shins',
        'Keep back straight as possible',
        'Hold for 30-60 seconds'
      ],
      'muscleGroups': ['Hamstrings', 'Back', 'Calves'],
      'duration': 45,
      'imagePath': 'assets/squats.png'
    },
    'corpse_pose': {
      'name': 'Corpse Pose',
      'sanskrit': 'Savasana',
      'difficulty': 'Beginner',
      'benefits': ['Reduces stress', 'Improves sleep', 'Promotes relaxation'],
      'instructions': [
        'Lie flat on back',
        'Let arms rest at sides',
        'Close eyes and breathe deeply',
        'Release all tension from body',
        'Stay completely still',
        'Hold for 5-10 minutes'
      ],
      'muscleGroups': ['Full Body', 'Mind'],
      'duration': 300,
      'imagePath': 'assets/squats.png'
    },
    'standing_forward_bend': {
      'name': 'Standing Forward Bend',
      'sanskrit': 'Uttanasana',
      'difficulty': 'Beginner',
      'benefits': ['Stretches hamstrings', 'Calms mind', 'Relieves stress'],
      'instructions': [
        'Stand with feet hip-width apart',
        'Hinge at hips and fold forward',
        'Let hands reach toward floor',
        'Keep knees slightly bent if needed',
        'Let head hang heavy',
        'Hold for 30-60 seconds'
      ],
      'muscleGroups': ['Hamstrings', 'Back', 'Calves'],
      'duration': 45,
      'imagePath': 'assets/squats.png'
    },
    'easy_pose': {
      'name': 'Easy Pose',
      'sanskrit': 'Sukhasana',
      'difficulty': 'Beginner',
      'benefits': ['Improves posture', 'Opens hips', 'Promotes meditation'],
      'instructions': [
        'Sit cross-legged on floor',
        'Rest hands on knees',
        'Lengthen spine upward',
        'Relax shoulders down',
        'Close eyes and breathe deeply',
        'Hold for 2-5 minutes'
      ],
      'muscleGroups': ['Hips', 'Back', 'Core'],
      'duration': 180,
      'imagePath': 'assets/squats.png'
    },
    'butterfly_pose': {
      'name': 'Butterfly Pose',
      'sanskrit': 'Baddha Konasana',
      'difficulty': 'Beginner',
      'benefits': ['Opens hips', 'Stretches inner thighs', 'Relieves menstrual discomfort'],
      'instructions': [
        'Sit with soles of feet together',
        'Let knees fall open to sides',
        'Hold feet with hands',
        'Lengthen spine',
        'Gently press knees toward floor',
        'Hold for 1-2 minutes'
      ],
      'muscleGroups': ['Hips', 'Inner Thighs', 'Groins'],
      'duration': 90,
      'imagePath': 'assets/data/yoga/Yoga_Poses-Dataset-main/TRAIN/BaddhaKonasana/Images/BK_2.jpg'
    },
    'dancer_pose': {
      'name': 'Dancer Pose',
      'sanskrit': 'Natarajasana',
      'difficulty': 'Intermediate',
      'benefits': ['Improves balance', 'Strengthens legs', 'Opens shoulders and chest'],
      'instructions': [
        'Stand tall on left leg',
        'Bend right knee and reach back for right foot',
        'Extend right arm forward',
        'Keep hips level',
        'Find a focal point to help balance',
        'Hold for 20-30 seconds, then switch sides'
      ],
      'muscleGroups': ['Legs', 'Core', 'Shoulders', 'Balance'],
      'duration': 25,
  'imagePath': 'assets/yoga/dancer_pose/download.jpeg'
    },
    'half_moon_pose': {
      'name': 'Half Moon Pose',
      'sanskrit': 'Ardha Chandrasana',
      'difficulty': 'Intermediate',
      'benefits': ['Improves balance', 'Strengthens legs', 'Stretches hips and hamstrings'],
      'instructions': [
        'Start in triangle pose',
        'Place right hand on floor or block',
        'Lift left leg parallel to floor',
        'Open hips to side',
        'Extend left arm toward ceiling',
        'Look up at left hand',
        'Hold for 20-30 seconds, then switch sides'
      ],
      'muscleGroups': ['Legs', 'Core', 'Hips', 'Balance'],
      'duration': 25,
      'imagePath': 'assets/data/yoga/Yoga_Poses-Dataset-main/TRAIN/ArdhaChandrasana/Images/1.jpg'
    },
    'leg_raise_pose': {
      'name': 'Leg Raise Pose',
      'sanskrit': 'Uttanpadasana',
      'difficulty': 'Beginner',
      'benefits': ['Strengthens core', 'Improves digestion', 'Tones abdominal muscles'],
      'instructions': [
        'Lie flat on back',
        'Place hands at sides',
        'Inhale and lift both legs together',
        'Keep legs straight',
        'Support lower back if needed',
        'Hold for 20-30 seconds'
      ],
      'muscleGroups': ['Core', 'Lower Abs', 'Hip Flexors'],
      'duration': 25,
      'imagePath': 'assets/plank.png'
    },
    'plow_pose': {
      'name': 'Plow Pose',
      'sanskrit': 'Halasana',
      'difficulty': 'Intermediate',
      'benefits': ['Stretches spine', 'Calms nervous system', 'Stimulates thyroid'],
      'instructions': [
        'Lie on back',
        'Lift legs over head',
        'Support lower back with hands',
        'Keep shoulders on floor',
        'Breathe deeply',
        'Hold for 30-60 seconds'
      ],
      'muscleGroups': ['Back', 'Shoulders', 'Neck'],
      'duration': 45,
      'imagePath': 'assets/plank.png'
    },
    'fish_pose': {
      'name': 'Fish Pose',
      'sanskrit': 'Matsyasana',
      'difficulty': 'Intermediate',
      'benefits': ['Opens chest', 'Stretches neck', 'Stimulates thyroid'],
      'instructions': [
        'Lie on back with legs extended',
        'Place hands under hips',
        'Press forearms into floor',
        'Lift chest and head',
        'Rest crown of head on floor',
        'Hold for 30 seconds'
      ],
      'muscleGroups': ['Chest', 'Neck', 'Shoulders'],
      'duration': 30,
      'imagePath': 'assets/pushups.png'
    },
    'camel_pose': {
      'name': 'Camel Pose',
      'sanskrit': 'Ustrasana',
      'difficulty': 'Intermediate',
      'benefits': ['Opens chest', 'Stretches hip flexors', 'Improves posture'],
      'instructions': [
        'Kneel with knees hip-width apart',
        'Place hands on lower back',
        'Arch back and reach for heels',
        'Keep hips forward',
        'Drop head back gently',
        'Hold for 20-30 seconds'
      ],
      'muscleGroups': ['Chest', 'Hip Flexors', 'Back'],
      'duration': 25,
      'imagePath': 'assets/pushups.png'
    },
    'bow_pose': {
      'name': 'Bow Pose',
      'sanskrit': 'Dhanurasana',
      'difficulty': 'Intermediate',
      'benefits': ['Strengthens back', 'Opens chest', 'Improves digestion'],
      'instructions': [
        'Lie face down',
        'Bend knees and reach back for ankles',
        'Lift chest and thighs off floor',
        'Keep knees hip-width apart',
        'Look forward',
        'Hold for 20-30 seconds'
      ],
      'muscleGroups': ['Back', 'Chest', 'Thighs'],
      'duration': 25,
      'imagePath': 'assets/pushups.png'
    },
    'pigeon_pose': {
      'name': 'Pigeon Pose',
      'sanskrit': 'Eka Pada Rajakapotasana',
      'difficulty': 'Intermediate',
      'benefits': ['Opens hips', 'Stretches hip flexors', 'Relieves sciatica'],
      'instructions': [
        'Start in downward dog',
        'Bring right knee forward',
        'Place right foot near left hand',
        'Extend left leg back',
        'Lower to forearms or stay up',
        'Hold for 30-60 seconds'
      ],
      'muscleGroups': ['Hips', 'Hip Flexors', 'Glutes'],
      'duration': 45,
      'imagePath': 'assets/squats.png'
    },
    'chair_pose': {
      'name': 'Chair Pose',
      'sanskrit': 'Utkatasana',
      'difficulty': 'Beginner',
      'benefits': ['Strengthens legs', 'Builds stamina', 'Tones core'],
      'instructions': [
        'Stand with feet together',
        'Bend knees and lower as if sitting',
        'Raise arms overhead',
        'Keep chest lifted',
        'Hold for 30-60 seconds'
      ],
      'muscleGroups': ['Legs', 'Core', 'Shoulders'],
      'duration': 45,
      'imagePath': 'assets/yoga/chair_pose/UK_2.jpeg'
    },
    'eagle_pose': {
      'name': 'Eagle Pose',
      'sanskrit': 'Garudasana',
      'difficulty': 'Intermediate',
      'benefits': ['Improves balance', 'Opens shoulders', 'Strengthens legs'],
      'instructions': [
        'Stand tall',
        'Wrap right leg over left',
        'Wrap right arm under left',
        'Bring palms together',
        'Lift elbows to shoulder height',
        'Hold for 20-30 seconds'
      ],
      'muscleGroups': ['Legs', 'Shoulders', 'Balance'],
      'duration': 25,
      'imagePath': 'assets/plank.png'
    },
    'half_lord_twist': {
      'name': 'Half Lord of the Fishes Pose',
      'sanskrit': 'Ardha Matsyendrasana',
      'difficulty': 'Intermediate',
      'benefits': ['Improves digestion', 'Stretches spine', 'Relieves back pain'],
      'instructions': [
        'Sit with legs extended',
        'Bend right knee and place foot outside left thigh',
        'Bend left knee and place foot near right hip',
        'Twist torso to right',
        'Place right hand behind you',
        'Hold for 30 seconds'
      ],
      'muscleGroups': ['Back', 'Spine', 'Hips'],
      'duration': 30,
      'imagePath': 'assets/squats.png'
    },
    'sphinx_pose': {
      'name': 'Sphinx Pose',
      'sanskrit': 'Salamba Bhujangasana',
      'difficulty': 'Beginner',
      'benefits': ['Strengthens back', 'Opens chest', 'Relieves stress'],
      'instructions': [
        'Lie face down with forearms on floor',
        'Elbows under shoulders',
        'Press forearms into floor',
        'Lift chest and head',
        'Keep hips on floor',
        'Hold for 30-60 seconds'
      ],
      'muscleGroups': ['Back', 'Chest', 'Shoulders'],
      'duration': 45,
      'imagePath': 'assets/plank.png'
    },
    'thread_needle_pose': {
      'name': 'Thread the Needle Pose',
      'sanskrit': 'Parsva Balasana',
      'difficulty': 'Beginner',
      'benefits': ['Stretches shoulders', 'Relieves neck tension', 'Opens chest'],
      'instructions': [
        'Start on hands and knees',
        'Thread right arm under left',
        'Lower right shoulder and ear to floor',
        'Extend left arm forward',
        'Breathe deeply',
        'Hold for 30-60 seconds'
      ],
      'muscleGroups': ['Shoulders', 'Neck', 'Back'],
      'duration': 45,
      'imagePath': 'assets/plank.png'
    },
    'happy_baby_pose': {
      'name': 'Happy Baby Pose',
      'sanskrit': 'Ananda Balasana',
      'difficulty': 'Beginner',
      'benefits': ['Opens hips', 'Stretches inner thighs', 'Calms mind'],
      'instructions': [
        'Lie on back',
        'Bend knees toward chest',
        'Hold outsides of feet',
        'Keep knees wider than torso',
        'Gently pull feet down',
        'Hold for 30-60 seconds'
      ],
      'muscleGroups': ['Hips', 'Inner Thighs', 'Groins'],
      'duration': 45,
      'imagePath': 'assets/squats.png'
    },
    'windshield_wiper_pose': {
      'name': 'Windshield Wiper Pose',
      'sanskrit': 'Supta Matsyendrasana Variation',
      'difficulty': 'Beginner',
      'benefits': ['Stretches hips', 'Relieves lower back tension', 'Improves spinal mobility'],
      'instructions': [
        'Lie on back with knees bent',
        'Place arms out to sides',
        'Drop knees to right side',
        'Keep shoulders on floor',
        'Look left if comfortable',
        'Hold for 20-30 seconds per side'
      ],
      'muscleGroups': ['Hips', 'Lower Back', 'Spine'],
      'duration': 25,
      'imagePath': 'assets/squats.png'
    },
    'reclined_hand_to_big_toe': {
      'name': 'Reclined Hand to Big Toe Pose',
      'sanskrit': 'Supta Padangusthasana',
      'difficulty': 'Beginner',
      'benefits': ['Stretches hamstrings', 'Relieves sciatica', 'Improves flexibility'],
      'instructions': [
        'Lie on back with legs extended',
        'Loop strap around right foot',
        'Hold strap with both hands',
        'Gently straighten right leg',
        'Keep left leg on floor',
        'Hold for 30-60 seconds per side'
      ],
      'muscleGroups': ['Hamstrings', 'Calves', 'Hips'],
      'duration': 45,
      'imagePath': 'assets/squats.png'
    },
    'knee_to_chest_pose': {
      'name': 'Knee to Chest Pose',
      'sanskrit': 'Apanasana',
      'difficulty': 'Beginner',
      'benefits': ['Relieves lower back pain', 'Improves digestion', 'Calms nervous system'],
      'instructions': [
        'Lie on back with knees bent',
        'Draw right knee toward chest',
        'Hold with both hands',
        'Keep left foot on floor',
        'Breathe deeply',
        'Hold for 30-60 seconds per side'
      ],
      'muscleGroups': ['Lower Back', 'Hips', 'Core'],
      'duration': 45,
      'imagePath': 'assets/squats.png'
    },
    'seated_twist': {
      'name': 'Seated Twist',
      'sanskrit': 'Ardha Matsyendrasana Variation',
      'difficulty': 'Beginner',
      'benefits': ['Improves digestion', 'Stretches spine', 'Relieves back tension'],
      'instructions': [
        'Sit with legs extended',
        'Bend right knee and place foot outside left knee',
        'Place left elbow outside right knee',
        'Twist torso to right',
        'Keep spine long',
        'Hold for 30 seconds per side'
      ],
      'muscleGroups': ['Back', 'Spine', 'Hips'],
      'duration': 30,
      'imagePath': 'assets/squats.png'
    },
    'mountain_pose': {
      'name': 'Mountain Pose',
      'sanskrit': 'Tadasana',
      'difficulty': 'Beginner',
      'benefits': ['Improves posture', 'Strengthens legs', 'Promotes balance'],
      'instructions': [
        'Stand tall with feet together',
        'Distribute weight evenly',
        'Engage thigh muscles',
        'Lengthen spine upward',
        'Relax shoulders down',
        'Hold for 30-60 seconds'
      ],
      'muscleGroups': ['Legs', 'Core', 'Posture'],
      'duration': 45,
      'imagePath': 'assets/squats.png'
    },
    'cow_face_pose': {
      'name': 'Cow Face Pose',
      'sanskrit': 'Gomukhasana',
      'difficulty': 'Intermediate',
      'benefits': ['Opens shoulders', 'Stretches hips', 'Relieves shoulder tension'],
      'instructions': [
        'Sit with legs extended',
        'Bend right knee and place foot outside left hip',
        'Bend left knee and stack left foot on right thigh',
        'Reach right arm up and bend elbow',
        'Reach left arm behind back',
        'Clasp hands if possible',
        'Hold for 30-60 seconds'
      ],
      'muscleGroups': ['Shoulders', 'Hips', 'Back'],
      'duration': 45,
      'imagePath': 'assets/plank.png'
    },
    'legs_up_wall': {
      'name': 'Legs Up the Wall Pose',
      'sanskrit': 'Viparita Karani',
      'difficulty': 'Beginner',
      'benefits': ['Reduces stress', 'Improves circulation', 'Relieves tired legs'],
      'instructions': [
        'Sit sideways against a wall',
        'Swing legs up the wall',
        'Lie back with shoulders on floor',
        'Place arms at sides or overhead',
        'Breathe deeply',
        'Hold for 5-10 minutes'
      ],
      'muscleGroups': ['Legs', 'Back', 'Neck'],
      'duration': 300,
      'imagePath': 'assets/squats.png'
    },
    'supported_backbend': {
      'name': 'Supported Backbend',
      'sanskrit': 'Salamba Purvottanasana Variation',
      'difficulty': 'Beginner',
      'benefits': ['Opens chest', 'Improves breathing', 'Relieves back tension'],
      'instructions': [
        'Sit with back supported by wall or bolster',
        'Place hands behind you',
        'Lean back gently',
        'Lift chest toward ceiling',
        'Keep neck relaxed',
        'Hold for 1-2 minutes'
      ],
      'muscleGroups': ['Chest', 'Back', 'Shoulders'],
      'duration': 90,
      'imagePath': 'assets/pushups.png'
    },
    'pranayama_prep': {
      'name': 'Pranayama Preparation',
      'sanskrit': 'Pranayama',
      'difficulty': 'Beginner',
      'benefits': ['Improves breathing', 'Reduces stress', 'Enhances lung capacity'],
      'instructions': [
        'Sit comfortably in easy pose',
        'Place hands on knees',
        'Close eyes and focus on breath',
        'Inhale deeply through nose',
        'Exhale slowly through nose',
        'Practice for 5-10 minutes'
      ],
      'muscleGroups': ['Diaphragm', 'Intercostal', 'Mind'],
      'duration': 300,
      'imagePath': 'assets/squats.png'
    },
    'yoga_nidra': {
      'name': 'Yoga Nidra',
      'sanskrit': 'Yoga Nidra',
      'difficulty': 'Beginner',
      'benefits': ['Deep relaxation', 'Reduces insomnia', 'Promotes healing'],
      'instructions': [
        'Lie flat on back',
        'Let arms rest at sides',
        'Close eyes',
        'Follow guided relaxation',
        'Release all tension',
        'Stay for 20-30 minutes'
      ],
      'muscleGroups': ['Full Body', 'Mind', 'Nervous System'],
      'duration': 1200,
      'imagePath': 'assets/squats.png'
    },
    'supported_child_pose': {
      'name': 'Supported Child\'s Pose',
      'sanskrit': 'Salamba Balasana',
      'difficulty': 'Beginner',
      'benefits': ['Deep relaxation', 'Stretches back', 'Calms nervous system'],
      'instructions': [
        'Kneel on floor with bolster or blanket',
        'Fold forward over support',
        'Extend arms forward',
        'Rest forehead on support',
        'Breathe deeply',
        'Hold for 2-5 minutes'
      ],
      'muscleGroups': ['Back', 'Hips', 'Shoulders'],
      'duration': 180,
      'imagePath': 'assets/squats.png'
    },
    'pelvic_floor_work': {
      'name': 'Pelvic Floor Exercises',
      'sanskrit': 'Mula Bandha',
      'difficulty': 'Beginner',
      'benefits': ['Strengthens pelvic floor', 'Improves bladder control', 'Supports postpartum recovery'],
      'instructions': [
        'Lie on back with knees bent',
        'Place hands on lower abdomen',
        'Inhale deeply',
        'Exhale and gently contract pelvic floor muscles',
        'Hold for 5-10 seconds',
        'Release and repeat 10 times'
      ],
      'muscleGroups': ['Pelvic Floor', 'Core', 'Lower Abdomen'],
      'duration': 60,
      'imagePath': 'assets/squats.png'
    },
    'cooling_poses': {
      'name': 'Cooling Poses Sequence',
      'sanskrit': 'Sheetali Pranayama',
      'difficulty': 'Beginner',
      'benefits': ['Reduces body heat', 'Calms nervous system', 'Balances hormones'],
      'instructions': [
        'Sit comfortably',
        'Roll tongue into tube shape',
        'Inhale through rolled tongue',
        'Exhale through nose',
        'Practice for 5-10 minutes',
        'Follow with gentle forward bends'
      ],
      'muscleGroups': ['Tongue', 'Diaphragm', 'Nervous System'],
      'duration': 300,
      'imagePath': 'assets/squats.png'
    },
    'gentle_flow': {
      'name': 'Gentle Flow Sequence',
      'sanskrit': 'Vinyasa Krama',
      'difficulty': 'Beginner',
      'benefits': ['Improves circulation', 'Reduces stiffness', 'Promotes relaxation'],
      'instructions': [
        'Start in mountain pose',
        'Inhale and raise arms overhead',
        'Exhale and fold forward',
        'Inhale and halfway lift',
        'Exhale and fold forward',
        'Repeat sequence slowly',
        'Continue for 10-15 minutes'
      ],
      'muscleGroups': ['Full Body', 'Spine', 'Joints'],
      'duration': 600,
      'imagePath': 'assets/plank.png'
    },
    'supported_poses': {
      'name': 'Supported Restorative Poses',
      'sanskrit': 'Supported Asana',
      'difficulty': 'Beginner',
      'benefits': ['Deep relaxation', 'Reduces muscle tension', 'Promotes healing'],
      'instructions': [
        'Use bolsters, blankets, and blocks',
        'Create comfortable supported positions',
        'Allow body to fully relax',
        'Focus on deep breathing',
        'Stay in each pose for 5-10 minutes',
        'Practice 3-4 supported poses'
      ],
      'muscleGroups': ['Full Body', 'Mind', 'Nervous System'],
      'duration': 1200,
      'imagePath': 'assets/squats.png'
    },
    'warm_therapy_prep': {
      'name': 'Warm Therapy Preparation',
      'sanskrit': 'Ushma Chikitsa',
      'difficulty': 'Beginner',
      'benefits': ['Increases circulation', 'Relieves muscle tension', 'Prepares for deeper poses'],
      'instructions': [
        'Apply warm compress to area',
        'Practice gentle movements',
        'Combine with deep breathing',
        'Focus on warming the body',
        'Prepare for therapeutic poses',
        'Practice for 10-15 minutes'
      ],
      'muscleGroups': ['Targeted Muscles', 'Circulatory System', 'Joints'],
      'duration': 600,
      'imagePath': 'assets/plank.png'
    },
    'recovery_flow': {
      'name': 'Recovery Flow Sequence',
      'sanskrit': 'Recovery Vinyasa',
      'difficulty': 'Beginner',
      'benefits': ['Promotes healing', 'Reduces inflammation', 'Restores energy'],
      'instructions': [
        'Start with gentle warm-up',
        'Include restorative poses',
        'Focus on injured or tired areas',
        'Use props for support',
        'Move slowly and mindfully',
        'End with relaxation pose'
      ],
      'muscleGroups': ['Targeted Areas', 'Full Body', 'Mind'],
      'duration': 900,
      'imagePath': 'assets/plank.png'
    },
    'restorative_poses': {
      'name': 'Restorative Yoga Poses',
      'sanskrit': 'Restorative Asana',
      'difficulty': 'Beginner',
      'benefits': ['Deep relaxation', 'Stress reduction', 'Healing support'],
      'instructions': [
        'Use plenty of props for support',
        'Find completely comfortable positions',
        'Stay in each pose for 5-20 minutes',
        'Focus on deep, slow breathing',
        'Allow body to release tension',
        'Practice 2-3 restorative poses'
      ],
      'muscleGroups': ['Full Body', 'Nervous System', 'Mind'],
      'duration': 1500,
      'imagePath': 'assets/squats.png'
    }
  };

  // Extra poses discovered dynamically from data assets (e.g., renamed images)
  // Key is generated from filename; values mirror yogaPoses entries
  final Map<String, Map<String, dynamic>> discoveredYogaPoses = {};

  /// Scans the asset manifest for additional yoga images placed under
  /// assets/data/yoga/new images founded and creates simple pose entries.
  /// This lets newly added images appear in the Yoga UI without code edits.
  Future<void> discoverAdditionalYogaPoses() async {
    await AssetResolver.init();
    // Defer import to avoid a hard dependency at file load
    final assets = AssetResolver.list(
      prefix: 'assets/data/yoga/new images founded/',
      extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    );
    for (final path in assets) {
      final namePart = path
          .split('/')
          .last
          .replaceAll(RegExp(r'\.(jpg|jpeg|png|webp)$', caseSensitive: false), '');
      final id = _slugify(namePart);
      if (discoveredYogaPoses.containsKey(id) || yogaPoses.containsKey(id)) continue;
      discoveredYogaPoses[id] = {
        'name': namePart,
        'sanskrit': null,
        'difficulty': 'Beginner',
        'benefits': ['Relaxation', 'Mindfulness'],
        'instructions': [
          'Focus on breath and maintain posture comfortably.',
          'Avoid pain; adjust pose as needed.',
        ],
        'muscleGroups': ['Full Body'],
        'duration': 30,
        'imagePath': path,
      };
    }
  }

  String _slugify(String input) {
    return input
        .toLowerCase()
        .replaceAll(RegExp(r"[^a-z0-9]+"), '_')
        .replaceAll(RegExp(r"_+"), '_')
        .replaceAll(RegExp(r"^_|_$"), '');
  }

  // Pool of newly added yoga images to use as fallbacks for poses lacking specific imagery
  static const List<String> _fallbackYogaImages = [
    // Curated assets with safe ASCII names
    'assets/yoga/downward_dog/downward_dog1.jpg',
    'assets/yoga/downward_dog/downward_dog7.jpg',
    'assets/yoga/downward_dog/downward_dog12.jpg',
    'assets/yoga/triangle_pose/triangle1.jpg',
    'assets/yoga/triangle_pose/triangle10.jpg',
    'assets/yoga/tree_pose/1.png',
    'assets/yoga/tree_pose/v13.jpeg',
    'assets/yoga/tree_pose/v21.jpeg',
    'assets/yoga/warrior_pose/Veerabhadrasana_10.jpg',
    'assets/yoga/warrior_pose/Veerabhadrasana_18.jpeg',
  // Ensure these exist; adjusted to verified paths
  'assets/yoga/triangle_pose/triangle22.jpg',
  'assets/yoga/warrior_pose/Veerabhadrasana_14.jpg',
  'assets/yoga/half_moon_pose/1.jpg',
    'assets/yoga/half_moon_pose/v22.jpeg',
    'assets/yoga/half_moon_pose/v35.jpeg',
    'assets/yoga/dancer_pose/download.jpeg',
  ];

  // Expose a copy of verified fallbacks for UI runtime checks
  List<String> getVerifiedFallbacks() => List<String>.from(_fallbackYogaImages);

  void _ensurePoseImages() {
    // Any placeholder images that should be replaced if possible
    const placeholders = {
      'assets/squats.png',
      'assets/plank.png',
      'assets/pushups.png',
      '',
    };

    if (_fallbackYogaImages.isEmpty) return;

    yogaPoses.forEach((poseId, data) {
      final current = (data['imagePath'] ?? '').toString();
      if (placeholders.contains(current)) {
        // Deterministically assign an image based on poseId to keep it stable across runs
        final index = (poseId.hashCode.abs()) % _fallbackYogaImages.length;
        data['imagePath'] = _fallbackYogaImages[index];
      }
    });
  }

  // Day-wise yoga plans
  final Map<int, List<String>> dayPlans = {
    1: ['child_pose', 'cat_cow_pose'],
    2: ['downward_dog', 'tree_pose'],
    3: ['cobra_pose', 'bridge_pose'],
    4: ['warrior_pose', 'triangle_pose'],
    5: ['downward_dog', 'tree_pose', 'child_pose'],
    6: ['cobra_pose', 'bridge_pose', 'cat_cow_pose'],
    7: ['warrior_pose', 'triangle_pose', 'downward_dog'],
    8: ['tree_pose', 'cobra_pose', 'bridge_pose'],
    9: ['child_pose', 'warrior_pose', 'cat_cow_pose'],
    10: ['triangle_pose', 'downward_dog', 'bridge_pose'],
    11: ['cobra_pose', 'tree_pose', 'child_pose'],
    12: ['warrior_pose', 'cat_cow_pose', 'bridge_pose'],
    13: ['downward_dog', 'triangle_pose', 'cobra_pose'],
    14: ['tree_pose', 'warrior_pose', 'child_pose'],
    15: ['bridge_pose', 'downward_dog', 'cat_cow_pose'],
    16: ['cobra_pose', 'triangle_pose', 'tree_pose'],
    17: ['warrior_pose', 'bridge_pose', 'child_pose'],
    18: ['downward_dog', 'cobra_pose', 'warrior_pose'],
    19: ['tree_pose', 'cat_cow_pose', 'triangle_pose'],
    20: ['bridge_pose', 'warrior_pose', 'downward_dog'],
    21: ['cobra_pose', 'child_pose', 'tree_pose'],
    22: ['triangle_pose', 'bridge_pose', 'cat_cow_pose'],
    23: ['warrior_pose', 'downward_dog', 'cobra_pose'],
    24: ['tree_pose', 'triangle_pose', 'bridge_pose'],
    25: ['child_pose', 'warrior_pose', 'downward_dog'],
    26: ['cat_cow_pose', 'cobra_pose', 'tree_pose'],
    27: ['bridge_pose', 'triangle_pose', 'child_pose'],
    28: ['downward_dog', 'warrior_pose', 'cat_cow_pose'],
    29: ['tree_pose', 'bridge_pose', 'cobra_pose'],
    30: ['triangle_pose', 'child_pose', 'warrior_pose', 'downward_dog']
  };

  // Health condition based recommendations
  final Map<String, List<String>> healthRecommendations = {
    // Original conditions
    'back_pain': ['child_pose', 'cat_cow_pose', 'cobra_pose', 'sphinx_pose', 'thread_needle_pose'],
    'stress': ['child_pose', 'bridge_pose', 'tree_pose', 'corpse_pose', 'easy_pose'],
    'flexibility': ['downward_dog', 'triangle_pose', 'warrior_pose', 'seated_forward_bend', 'standing_forward_bend'],
    'balance': ['tree_pose', 'warrior_pose', 'eagle_pose', 'mountain_pose'],
    'strength': ['warrior_pose', 'bridge_pose', 'cobra_pose', 'chair_pose', 'plow_pose'],
    'beginner': ['child_pose', 'cat_cow_pose', 'tree_pose', 'mountain_pose'],
    'intermediate': ['downward_dog', 'triangle_pose', 'bridge_pose', 'pigeon_pose'],
    'advanced': ['warrior_pose', 'cobra_pose', 'downward_dog', 'camel_pose'],

    // New conditions from health assessment
    'Back Pain': ['child_pose', 'cat_cow_pose', 'cobra_pose', 'sphinx_pose', 'thread_needle_pose', 'knee_to_chest_pose'],
    'Neck Pain': ['thread_needle_pose', 'cat_cow_pose', 'easy_pose', 'corpse_pose', 'seated_twist'],
    'Shoulder Pain': ['thread_needle_pose', 'eagle_pose', 'downward_dog', 'cow_face_pose', 'sphinx_pose'],
    'Knee Pain': ['chair_pose', 'tree_pose', 'mountain_pose', 'easy_pose', 'bridge_pose'],
    'Hip Pain': ['pigeon_pose', 'butterfly_pose', 'easy_pose', 'happy_baby_pose', 'bridge_pose'],
    'Arthritis': ['easy_pose', 'cat_cow_pose', 'corpse_pose', 'gentle_flow', 'supported_poses'],
    'High Blood Pressure': ['corpse_pose', 'easy_pose', 'seated_twist', 'bridge_pose', 'legs_up_wall'],
    'Diabetes': ['downward_dog', 'triangle_pose', 'bridge_pose', 'seated_twist', 'corpse_pose'],
    'Asthma': ['easy_pose', 'corpse_pose', 'supported_backbend', 'gentle_twists', 'pranayama_prep'],
    'Anxiety': ['corpse_pose', 'child_pose', 'easy_pose', 'seated_forward_bend', 'butterfly_pose'],
    'Depression': ['corpse_pose', 'bridge_pose', 'tree_pose', 'easy_pose', 'standing_forward_bend'],
    'Insomnia': ['corpse_pose', 'legs_up_wall', 'easy_pose', 'supported_child_pose', 'yoga_nidra'],
    'Digestive Issues': ['seated_twist', 'knee_to_chest_pose', 'windshield_wiper_pose', 'bridge_pose', 'easy_pose'],
    'Thyroid Problems': ['bridge_pose', 'plow_pose', 'fish_pose', 'shoulder_stand_prep', 'neck_stretches'],
    'Pregnancy': ['easy_pose', 'butterfly_pose', 'cat_cow_pose', 'supported_squat', 'gentle_twists'],
    'Postpartum': ['easy_pose', 'bridge_pose', 'gentle_twists', 'pelvic_floor_work', 'supported_poses'],
    'Menopause': ['corpse_pose', 'bridge_pose', 'easy_pose', 'gentle_flow', 'cooling_poses'],
    'PCOS': ['butterfly_pose', 'bridge_pose', 'seated_twist', 'corpse_pose', 'gentle_inversions'],
    'Sports Injury': ['easy_pose', 'corpse_pose', 'gentle_stretches', 'supported_poses', 'recovery_flow'],
    'Chronic Fatigue': ['corpse_pose', 'easy_pose', 'supported_poses', 'gentle_flow', 'restorative_poses'],
    'Fibromyalgia': ['corpse_pose', 'easy_pose', 'gentle_flow', 'supported_poses', 'warm_therapy_prep'],
    'Migraine': ['corpse_pose', 'easy_pose', 'supported_child_pose', 'gentle_twists', 'cooling_poses'],
    'Weight Management': ['downward_dog', 'warrior_pose', 'chair_pose', 'bridge_pose', 'triangle_pose'],
    'Flexibility Issues': ['downward_dog', 'standing_forward_bend', 'seated_forward_bend', 'butterfly_pose', 'pigeon_pose'],
    'Balance Problems': ['tree_pose', 'warrior_pose', 'eagle_pose', 'mountain_pose', 'chair_pose'],
    'Joint Pain': ['easy_pose', 'cat_cow_pose', 'gentle_flow', 'supported_poses', 'warm_therapy_prep'],
    'Muscle Tension': ['child_pose', 'thread_needle_pose', 'cat_cow_pose', 'seated_twist', 'corpse_pose'],
    'Poor Posture': ['mountain_pose', 'eagle_pose', 'downward_dog', 'bridge_pose', 'sphinx_pose']
  };

  // Get yoga poses for a specific day
  List<Map<String, dynamic>> getYogaPosesForDay(int day) {
    final poseIds = dayPlans[day] ?? [];
    return poseIds.map((id) => yogaPoses[id]!).toList();
  }

  // Get personalized yoga poses based on health conditions
  List<Map<String, dynamic>> getPersonalizedYogaPoses(List<String> healthConditions) {
    // Normalize recommendation keys for case-insensitive lookup
    final Map<String, List<String>> lowerRecommendations = {};
    healthRecommendations.forEach((k, v) => lowerRecommendations[k.toLowerCase()] = List<String>.from(v));

    Set<String> recommendedPoseIds = {};

    for (var rawCondition in healthConditions) {
      final condition = rawCondition.toString().toLowerCase().trim();

      // Direct lookup
      if (lowerRecommendations.containsKey(condition)) {
        recommendedPoseIds.addAll(lowerRecommendations[condition]!);
        continue;
      }

      // Try replacing underscores/spaces and lookup
      final alt = condition.replaceAll(RegExp(r'[\s_]+'), ' ');
      if (lowerRecommendations.containsKey(alt)) {
        recommendedPoseIds.addAll(lowerRecommendations[alt]!);
        continue;
      }

      // Substring match across recommendation keys (covers variations like 'back pain' vs 'Back Pain')
      for (final entry in lowerRecommendations.entries) {
        if (entry.key.contains(condition) || condition.contains(entry.key) || entry.key.split(' ').any((part) => condition.contains(part))) {
          recommendedPoseIds.addAll(entry.value);
        }
      }
    }

    // If no recommendations found, attempt a keyword match against pose benefits and names
    if (recommendedPoseIds.isEmpty) {
      for (var rawCondition in healthConditions) {
        final keyword = rawCondition.toString().toLowerCase();
        yogaPoses.forEach((id, data) {
          final name = (data['name'] ?? '').toString().toLowerCase();
          final benefits = List<String>.from(data['benefits'] ?? []).join(' ').toLowerCase();
          if (name.contains(keyword) || benefits.contains(keyword) || id.contains(keyword)) {
            recommendedPoseIds.add(id);
          }
        });
      }
    }

    final base = recommendedPoseIds
        .map((id) => yogaPoses.containsKey(id) ? yogaPoses[id]! : (discoveredYogaPoses[id] ?? {}))
        .where((m) => m.isNotEmpty)
        .toList();

    // Optionally enrich with discovered poses for general categories
    if (healthConditions.any((c) => c.toLowerCase().contains('beginner') || c.toLowerCase().contains('stress'))) {
      base.addAll(discoveredYogaPoses.values);
    }

    return base;
  }

  // Save user's health assessment
  Future<void> saveHealthAssessment(Map<String, dynamic> assessment) async {
    await _databaseService.saveHealthAssessment(assessment);
  }

  // Get user's health assessment
  Future<Map<String, dynamic>?> getHealthAssessment() async {
    return await _databaseService.getHealthAssessment();
  }

  // Check if user has premium subscription
  Future<bool> hasPremiumAccess() async {
    return await _databaseService.hasPremiumAccess();
  }

  // Save completed yoga session
  Future<void> saveCompletedYogaSession(String poseId, int duration) async {
    await _databaseService.saveCompletedYogaSession(poseId, duration);
  }

  // Get completed yoga sessions
  Future<List<Map<String, dynamic>>> getCompletedYogaSessions() async {
    return await _databaseService.getCompletedYogaSessions();
  }
}
