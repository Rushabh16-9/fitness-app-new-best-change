# AI & Mood-Based Fitness System

## Overview
A comprehensive AI-powered fitness recommendation system that uses mood detection to generate personalized workout plans from a database of **1500+ exercises** with animated GIF demonstrations.

---

## 🎯 Features

### 1. **Comprehensive Exercise Database**
- **1500+ exercises** from ExerciseDB API with metadata
- Animated GIF demonstrations for every exercise
- Detailed metadata including:
  - Target muscles & secondary muscles
  - Equipment requirements
  - Body part focus
  - Step-by-step instructions
  - Difficulty level (beginner/intermediate/advanced)
  - Intensity level (low/moderate/high)

### 2. **Mood Detection**
- **Questionnaire-based detection**: 5 simple questions
- **Selfie-based detection**: Camera analysis of facial features
- **Mood categories**:
  - Stressed 😰
  - Anxious 😟
  - Neutral 😐
  - Energetic ⚡
  - Calm 😌

### 3. **Dynamic Workout Generation**
Each mood generates **3 personalized workout plans** with:
- Curated exercise selection based on mood alignment
- Progressive difficulty levels
- Varied workout types (HIIT, strength, yoga, cardio, circuit)
- Benefits and estimated duration
- Exercise count and metadata

---

## 📊 Exercise Categorization

### By Equipment (Top 10)
| Equipment | Count | Percentage |
|-----------|-------|------------|
| Body Weight | 372 | 24.8% |
| Dumbbell | 319 | 21.3% |
| Cable | 181 | 12.1% |
| Barbell | 170 | 11.3% |
| Leverage Machine | 91 | 6.1% |
| Band | 67 | 4.5% |
| Smith Machine | 56 | 3.7% |
| Kettlebell | 46 | 3.1% |
| Weighted | 41 | 2.7% |
| Stability Ball | 34 | 2.3% |

### By Body Part (Top 10)
| Body Part | Count | Percentage |
|-----------|-------|------------|
| Upper Arms | 323 | 21.5% |
| Upper Legs | 257 | 17.1% |
| Back | 239 | 15.9% |
| Waist | 195 | 13.0% |
| Chest | 191 | 12.7% |
| Shoulders | 156 | 10.4% |
| Lower Legs | 63 | 4.2% |
| Lower Arms | 40 | 2.7% |
| Cardio | 33 | 2.2% |
| Neck | 3 | 0.2% |

### By Difficulty
- **Beginner**: Body weight exercises, simple movements
- **Intermediate**: Dumbbells, kettlebells, moderate complexity
- **Advanced**: Barbells, cables, leverage machines, complex movements

### By Intensity (for Mood Matching)
- **Low**: Stretches, yoga, gentle movements → Stressed/Anxious moods
- **Moderate**: Balanced strength training → Neutral/Calm moods
- **High**: HIIT, burpees, jumps, sprints → Energetic mood

---

## 🧠 Mood-Based Workout Plans

### Stressed/Anxious Mood 😰😟
**Focus**: Calming, stress relief, gentle movements

**Plans**:
1. **Stress Relief Flow (20 min)**
   - 8 stress-relief exercises (stretches, gentle poses)
   - 90 seconds per exercise
   - Benefits: Reduces stress, calms nervous system, improves flexibility

2. **Calming Body Scan (15 min)**
   - 4 warmup + 4 calming exercises
   - 60 seconds per exercise
   - Benefits: Reduces anxiety, improves mind-body connection

3. **Beginner Decompression (25 min)**
   - 6 stress-relief + 4 low-intensity bodyweight
   - 90 seconds per exercise
   - Benefits: Deep stress relief, improves sleep, releases tension

### Energetic Mood ⚡
**Focus**: High-intensity cardio, HIIT, challenging exercises

**Plans**:
1. **HIIT Energy Blast (20 min)**
   - 10 high-intensity cardio exercises
   - 45 seconds per exercise
   - Benefits: Burns calories fast, boosts metabolism, releases endorphins

2. **Full Body Power (30 min)**
   - 3 warmup + 4 upper body + 4 lower body + 3 core + 2 cardio
   - 60 seconds per exercise
   - Benefits: Total body conditioning, builds strength, maximizes calorie burn

3. **Cardio Core Crusher (25 min)**
   - 8 cardio + 6 core exercises
   - 60 seconds per exercise
   - Benefits: Sculpts abs, burns fat, improves athletic performance

### Calm Mood 😌
**Focus**: Balanced strength and flexibility

**Plans**:
1. **Gentle Strength Flow (25 min)**
   - 3 warmup + 8 beginner + 3 stress-relief
   - 60 seconds per exercise
   - Benefits: Builds foundational strength, low impact, restores energy

2. **Mobility & Core (20 min)**
   - 4 warmup + 6 core + 3 calming
   - 60 seconds per exercise
   - Benefits: Improves posture, strengthens core, enhances mobility

3. **Restore & Recharge (15 min)**
   - 5 stress-relief + 5 calming
   - 90 seconds per exercise
   - Benefits: Promotes recovery, reduces tension, maintains calm

### Neutral Mood 😐
**Focus**: Balanced workouts for all fitness levels

**Plans**:
1. **Beginner Friendly Full Body (20 min)**
   - 3 warmup + 10 beginner exercises
   - 60 seconds per exercise
   - Benefits: Builds confidence, easy to follow, full body workout

2. **Balanced Strength Circuit (25 min)**
   - 2 warmup + 4 upper + 4 lower + 4 core
   - 60 seconds per exercise
   - Benefits: Balanced development, improves coordination

3. **Intermediate Total Body (30 min)**
   - 2 warmup + 12 intermediate + 4 core
   - 60 seconds per exercise
   - Benefits: Challenges muscles, increases intensity, progressive overload

---

## 🏗️ Technical Architecture

### File Structure
```
lib/
├── models/
│   └── exercise_model.dart          # Exercise & WorkoutPlan data models
├── services/
│   ├── exercise_database.dart       # 1500+ exercise database with filtering
│   └── mood_service.dart            # Mood detection & recommendation engine
├── pages/
│   ├── mood_detection_page.dart     # Questionnaire + selfie capture UI
│   └── exercise_runner_page.dart    # Exercise player with timer & GIFs
└── widgets/
    └── mood_recommendation_card.dart # Beautiful workout plan cards

assets/
└── data/
    └── exercise vidio/
        └── exercisedb-api-main/
            ├── media/                # 1500+ animated GIF files
            │   ├── RJgzwny.gif      # Mountain Climber
            │   ├── dK9394r.gif      # Burpee
            │   └── ... (1500+ files)
            └── src/
                └── data/
                    └── exercises.json # Exercise metadata database
```

### Key Classes

#### `Exercise` Model
```dart
class Exercise {
  String id;                    // Hashed ID (e.g., "RJgzwny")
  String name;                  // "mountain climber"
  String gifUrl;                // Online URL
  List<String> targetMuscles;   // ["abs"]
  List<String> bodyParts;       // ["waist"]
  List<String> equipments;      // ["body weight"]
  List<String> secondaryMuscles;// ["shoulders", "quadriceps"]
  List<String> instructions;    // Step-by-step guide
  
  // Computed properties
  String localGifPath;          // Local asset path
  String displayName;           // Title-cased name
  String difficulty;            // beginner/intermediate/advanced
  String intensity;             // low/moderate/high
}
```

#### `ExerciseDatabase` Service
```dart
class ExerciseDatabase {
  // Load 1500+ exercises from JSON
  Future<void> loadExercises()
  
  // Filter by category
  List<Exercise> byEquipment(String equipment)
  List<Exercise> byBodyPart(String bodyPart)
  List<Exercise> byMuscle(String muscle)
  List<Exercise> byDifficulty(String difficulty)
  List<Exercise> byIntensity(String intensity)
  
  // Curated sets for mood-based workouts
  List<Exercise> get warmupExercises
  List<Exercise> get stressReliefExercises
  List<Exercise> get calmingExercises
  List<Exercise> get energyBoostExercises
  List<Exercise> get coreExercises
  List<Exercise> get upperBodyExercises
  List<Exercise> get lowerBodyExercises
  List<Exercise> get beginnerExercises
  List<Exercise> get intermediateExercises
  
  // Utilities
  List<Exercise> search(String query)
  List<Exercise> getRandomExercises(List<Exercise> pool, int count)
}
```

#### `MoodService` (Recommendation Engine)
```dart
class MoodService extends ChangeNotifier {
  // Initialize database (call once on app start)
  Future<void> initialize()
  
  // Mood detection
  String detectFromAnswers(List<int> answers)
  String detectFromFaceFeatures({...})
  
  // Generate 3 personalized workout plans based on mood
  List<Map<String, dynamic>> generateRecommendations(String mood)
  
  // Convenience method
  Future<void> detectAndGenerate(List<int> answers)
}
```

---

## 🎨 UI Components

### MoodRecommendationCard
Enhanced workout plan card with:
- ✅ Title & description
- ✅ Duration, exercise count, difficulty level chips
- ✅ Top 3 benefits displayed
- ✅ Red-themed color scheme
- ✅ "Start" button to begin workout

### ExerciseRunnerPage
Enhanced exercise player with:
- ✅ Large animated GIF display
- ✅ Exercise name & progress (e.g., "Exercise 3 of 10")
- ✅ Metadata chips (difficulty, equipment, target muscles)
- ✅ 64pt countdown timer
- ✅ Play/Pause, Reset, Complete buttons (circular FABs)
- ✅ Previous/Next/Music navigation
- ✅ **Expandable instructions panel** with step-by-step guide
- ✅ Auto-advance to next exercise when timer completes
- ✅ "Workout complete!" notification

---

## 🚀 Usage

### 1. Initialize MoodService (on app start)
```dart
// In MoodDetectionPage initState()
_moodService = MoodService();
await _moodService.initialize(); // Loads 1500+ exercises
```

### 2. Detect Mood & Generate Plans
```dart
// Questionnaire method
final mood = moodService.detectFromAnswers([3, 4, 2, 5, 3]);
final plans = moodService.generateRecommendations(mood);

// Selfie method
final mood = moodService.detectFromFaceFeatures(
  smilingProbability: 0.8,
  leftEyeOpenProbability: 0.9,
  rightEyeOpenProbability: 0.9,
);
// Recommendations auto-generated
```

### 3. Display Recommendations
```dart
// MoodRecommendationCard automatically displays:
// - Title, description, duration
// - Exercise count, difficulty level
// - Benefits
// - Start button
```

### 4. Start Workout
```dart
Navigator.push(context, MaterialPageRoute(
  builder: (_) => ExerciseRunnerPage(
    exercises: selectedPlan['exercises'],
    totalMinutes: (selectedPlan['durationSeconds'] / 60).ceil(),
  ),
));
```

---

## 📈 Future Enhancements

### Planned Features
- [ ] **User Preferences**: Save available equipment, fitness level
- [ ] **Workout History**: Track completed exercises and progress
- [ ] **Exercise Variations**: Suggest easier/harder alternatives
- [ ] **Custom Plans**: Let users build their own workouts
- [ ] **Social Sharing**: Share workout achievements
- [ ] **Music Integration**: Spotify/Apple Music sync
- [ ] **Voice Coaching**: Audio cues during exercises
- [ ] **Progress Tracking**: Charts showing improvement over time
- [ ] **Favorites**: Bookmark favorite exercises/plans
- [ ] **Rest Timer**: Configurable rest between exercises
- [ ] **Workout Calendar**: Schedule workouts in advance
- [ ] **Nutrition Integration**: Meal suggestions based on mood & workout
- [ ] **AI Evolution**: Machine learning to refine mood detection

### Database Expansions
- [ ] Add more exercise variations (Olympic lifts, gymnastics)
- [ ] Include yoga sequences with proper Sanskrit names
- [ ] Add Pilates exercises
- [ ] Include sports-specific drills
- [ ] Add mobility/flexibility routines

---

## 🛠️ Troubleshooting

### Exercise GIFs Not Loading
- Ensure `pubspec.yaml` includes asset declaration:
  ```yaml
  assets:
    - assets/data/exercise vidio/exercisedb-api-main/media/
    - assets/data/exercise vidio/exercisedb-api-main/src/data/exercises.json
  ```
- Run `flutter pub get` after modifying pubspec.yaml
- Verify GIF files exist in the media folder

### MoodService Not Initialized
```dart
// Always initialize before using
await moodService.initialize();

// Check initialization status
if (!_isInitialized) {
  print('Warning: MoodService not initialized');
}
```

### Empty Recommendations
- Verify exercises.json is loaded correctly
- Check console for loading errors
- Ensure mood string matches: 'stressed', 'anxious', 'neutral', 'energetic', 'calm'

---

## 📝 Credits

- **ExerciseDB API**: Exercise metadata and GIF animations
- **Flutter**: Cross-platform UI framework
- **Provider**: State management
- **Google ML Kit**: Face detection for selfie-based mood detection

---

## 📄 License

This fitness system is part of the application_main Flutter project.

---

**Last Updated**: 2024
**Version**: 2.0 (Comprehensive Exercise Database Edition)
