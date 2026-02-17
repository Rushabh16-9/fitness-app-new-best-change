# 🏗️ System Architecture Diagram

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE LAYER                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────┐         ┌────────────────────────────┐  │
│  │ MoodDetectionPage    │         │ ExerciseRunnerPage        │  │
│  ├──────────────────────┤         ├────────────────────────────┤  │
│  │ - Questionnaire      │────────▶│ - Exercise GIF Display    │  │
│  │ - Selfie Capture     │         │ - Timer (Play/Pause)      │  │
│  │ - Mood Display       │         │ - Instructions Panel      │  │
│  │ - Recommendations    │         │ - Metadata Chips          │  │
│  └──────────────────────┘         │ - Previous/Next Nav       │  │
│           │                        └────────────────────────────┘  │
│           ▼                                                         │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │         MoodRecommendationCard Widget                    │     │
│  ├──────────────────────────────────────────────────────────┤     │
│  │ - Title & Description                                    │     │
│  │ - Duration, Exercise Count, Difficulty (Chips)          │     │
│  │ - Benefits with Checkmarks                              │     │
│  │ - Start Button                                          │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ Provider (State Management)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        BUSINESS LOGIC LAYER                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    MoodService                               │  │
│  │                  (ChangeNotifier)                            │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │                                                              │  │
│  │  State:                         Methods:                    │  │
│  │  ├─ _detectedMood               ├─ initialize()            │  │
│  │  ├─ _recommendations             ├─ detectFromAnswers()    │  │
│  │  └─ _isInitialized               ├─ detectFromFaceFeatures()│ │
│  │                                   ├─ generateRecommendations()│ │
│  │                                   └─ detectAndGenerate()     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│                              │ Uses                                  │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              ExerciseDatabase (Singleton)                    │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │                                                              │  │
│  │  Data:                          Methods:                    │  │
│  │  ├─ _allExercises (1500+)       ├─ loadExercises()         │  │
│  │  └─ _isLoaded                   ├─ byEquipment()           │  │
│  │                                  ├─ byBodyPart()            │  │
│  │  Curated Sets:                   ├─ byMuscle()              │  │
│  │  ├─ warmupExercises             ├─ byDifficulty()          │  │
│  │  ├─ stressReliefExercises       ├─ byIntensity()           │  │
│  │  ├─ calmingExercises            ├─ search()                │  │
│  │  ├─ energyBoostExercises        └─ getRandomExercises()    │  │
│  │  ├─ coreExercises                                           │  │
│  │  ├─ upperBodyExercises                                      │  │
│  │  ├─ lowerBodyExercises                                      │  │
│  │  ├─ beginnerExercises                                       │  │
│  │  └─ intermediateExercises                                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│                              │ Loads from                            │
│                              ▼                                       │
└─────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Exercise Model                            │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  Properties:                    Computed:                    │  │
│  │  ├─ id                          ├─ localGifPath             │  │
│  │  ├─ name                        ├─ displayName              │  │
│  │  ├─ gifUrl                      ├─ difficulty               │  │
│  │  ├─ targetMuscles               └─ intensity                │  │
│  │  ├─ bodyParts                                                │  │
│  │  ├─ equipments                                               │  │
│  │  ├─ secondaryMuscles                                         │  │
│  │  └─ instructions                                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  WorkoutPlan Model                           │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  ├─ title                                                    │  │
│  │  ├─ description                                              │  │
│  │  ├─ exercises (List<Exercise>)                              │  │
│  │  ├─ estimatedDuration                                        │  │
│  │  ├─ level                                                    │  │
│  │  └─ benefits                                                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ Reads from
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          ASSET LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  assets/data/exercise vidio/exercisedb-api-main/             │  │
│  │  ├─ src/data/exercises.json (1500 exercise metadata)        │  │
│  │  └─ media/                                                   │  │
│  │      ├─ RJgzwny.gif (Mountain Climber)                      │  │
│  │      ├─ dK9394r.gif (Burpee)                                │  │
│  │      ├─ x6KpKpq.gif (Close-Grip Push-Up)                    │  │
│  │      └─ ... (1500+ GIF files)                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
USER INTERACTION
      │
      ▼
┌─────────────────┐
│ Answer Questions│
│   (1-5 rating)  │
└─────────────────┘
      │
      ▼
┌──────────────────────────────────────────┐
│        detectFromAnswers()               │
│  Score: sum of 5 answers (5-25)         │
│  ├─ 5-10:  stressed                     │
│  ├─ 11-14: anxious                      │
│  ├─ 15-18: neutral                      │
│  ├─ 19-22: energetic                    │
│  └─ 23-25: calm                         │
└──────────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────────┐
│    generateRecommendations(mood)         │
│                                          │
│  IF mood = "stressed" OR "anxious":     │
│  ├─ Get stressReliefExercises           │
│  ├─ Get warmupExercises                 │
│  ├─ Get calmingExercises                │
│  └─ Generate 3 plans:                   │
│      • Stress Relief Flow (20 min)      │
│      • Calming Body Scan (15 min)       │
│      • Beginner Decompression (25 min)  │
│                                          │
│  ELSE IF mood = "energetic":            │
│  ├─ Get energyBoostExercises            │
│  ├─ Get upperBodyExercises              │
│  ├─ Get lowerBodyExercises              │
│  ├─ Get coreExercises                   │
│  └─ Generate 3 plans:                   │
│      • HIIT Energy Blast (20 min)       │
│      • Full Body Power (30 min)         │
│      • Cardio Core Crusher (25 min)     │
│                                          │
│  ELSE IF mood = "calm":                 │
│  ├─ Get beginnerExercises               │
│  ├─ Get warmupExercises                 │
│  ├─ Get coreExercises                   │
│  └─ Generate 3 plans:                   │
│      • Gentle Strength Flow (25 min)    │
│      • Mobility & Core (20 min)         │
│      • Restore & Recharge (15 min)      │
│                                          │
│  ELSE (neutral):                        │
│  ├─ Get beginnerExercises               │
│  ├─ Get intermediateExercises           │
│  ├─ Get upperBodyExercises              │
│  ├─ Get lowerBodyExercises              │
│  └─ Generate 3 plans:                   │
│      • Beginner Full Body (20 min)      │
│      • Balanced Circuit (25 min)        │
│      • Intermediate Total Body (30 min) │
└──────────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────────┐
│    For each plan, call:                  │
│    getRandomExercises(pool, count)       │
│                                          │
│    Randomly selects exercises from       │
│    categorized pools to ensure variety   │
└──────────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────────┐
│    Convert exercises to UI format:       │
│    _exerciseToMap(exercise, duration)    │
│                                          │
│    Returns:                              │
│    {                                     │
│      'name': displayName,                │
│      'duration': seconds,                │
│      'image': localGifPath,              │
│      'instructions': [...],              │
│      'targetMuscles': [...],             │
│      'equipment': string,                │
│      'difficulty': string                │
│    }                                     │
└──────────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────────┐
│    notifyListeners()                     │
│    UI updates with new recommendations   │
└──────────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────────┐
│  MoodRecommendationCard displays:        │
│  ├─ Title & Description                  │
│  ├─ Duration, Exercise Count, Level      │
│  ├─ Benefits (top 3)                     │
│  └─ "Start" button                       │
└──────────────────────────────────────────┘
      │
      ▼ User clicks "Start"
      │
┌──────────────────────────────────────────┐
│    ExerciseRunnerPage opens              │
│    ├─ Loads first exercise               │
│    ├─ Displays GIF animation             │
│    ├─ Shows metadata (chips)             │
│    ├─ Starts timer countdown             │
│    ├─ User can expand instructions       │
│    └─ Auto-advances to next exercise     │
└──────────────────────────────────────────┘
      │
      ▼ Timer reaches 0:00
      │
┌──────────────────────────────────────────┐
│    _nextExercise()                       │
│    ├─ IF more exercises: load next       │
│    └─ ELSE: show "Workout complete!"     │
└──────────────────────────────────────────┘
```

---

## Exercise Categorization Logic

```
ExerciseDatabase.loadExercises()
      │
      ▼
┌───────────────────────────────────────────────────────────┐
│  Load exercises.json (1500 exercises)                     │
│  Parse each exercise:                                     │
│  {                                                        │
│    "exerciseId": "RJgzwny",                              │
│    "name": "mountain climber",                           │
│    "gifUrl": "https://...",                              │
│    "targetMuscles": ["abs"],                             │
│    "bodyParts": ["waist"],                               │
│    "equipments": ["body weight"],                        │
│    "secondaryMuscles": ["shoulders", "quadriceps"],      │
│    "instructions": ["Step 1...", "Step 2...", ...]      │
│  }                                                        │
└───────────────────────────────────────────────────────────┘
      │
      ▼
┌───────────────────────────────────────────────────────────┐
│  Create Exercise objects with computed properties:        │
│                                                           │
│  difficulty (computed from equipment):                    │
│  ├─ "body weight" → "beginner"                           │
│  ├─ "dumbbell/kettlebell" → "intermediate"               │
│  └─ "barbell/cable/machine" → "advanced"                 │
│                                                           │
│  intensity (computed from name):                          │
│  ├─ contains "stretch/yoga/cobra/bridge" → "low"        │
│  ├─ contains "burpee/jump/sprint/jack" → "high"         │
│  └─ else → "moderate"                                    │
│                                                           │
│  localGifPath: "assets/.../media/{exerciseId}.gif"       │
│  displayName: "Mountain Climber" (title-cased)           │
└───────────────────────────────────────────────────────────┘
      │
      ▼
┌───────────────────────────────────────────────────────────┐
│  Categorize into curated sets:                            │
│                                                           │
│  warmupExercises:                                         │
│  └─ Filter: name contains "stretch/warm/circle/rotation" │
│              AND equipment = "body weight"                │
│                                                           │
│  stressReliefExercises:                                   │
│  └─ Filter: name contains "stretch/yoga/cobra/bridge"    │
│              AND equipment = "body weight"                │
│              AND intensity = "low"                        │
│                                                           │
│  energyBoostExercises:                                    │
│  └─ Filter: name contains "burpee/jump/jack/sprint"      │
│              OR intensity = "high"                        │
│                                                           │
│  coreExercises:                                           │
│  └─ Filter: bodyParts contains "waist"                   │
│              AND targetMuscles contains "abs"             │
│                                                           │
│  upperBodyExercises:                                      │
│  └─ Filter: bodyParts contains "chest/back/shoulders/    │
│              upper arms"                                  │
│                                                           │
│  lowerBodyExercises:                                      │
│  └─ Filter: bodyParts contains "upper legs" OR           │
│              "lower legs"                                 │
│                                                           │
│  beginnerExercises:                                       │
│  └─ Filter: difficulty = "beginner"                      │
│              AND equipment = "body weight"                │
│                                                           │
│  intermediateExercises:                                   │
│  └─ Filter: difficulty = "intermediate"                  │
│              AND (equipment = "dumbbell" OR "kettlebell") │
└───────────────────────────────────────────────────────────┘
```

---

## Workout Plan Generation Flow

```
generateRecommendations("energetic")
      │
      ▼
┌───────────────────────────────────────────────────────────┐
│  Plan 1: HIIT Energy Blast (20 min)                       │
│  ├─ Get energyBoostExercises pool (~50 exercises)         │
│  ├─ getRandomExercises(pool, 10)                          │
│  ├─ Shuffle and select 10 random exercises                │
│  └─ Duration: 45 seconds each (fast-paced HIIT)           │
│                                                           │
│  Result: 10 high-intensity exercises like:                │
│  • Burpee, Mountain Climber, Jump Squat, Jack Burpee,    │
│    High Knees, Jumping Jacks, etc.                        │
└───────────────────────────────────────────────────────────┘
      │
      ▼
┌───────────────────────────────────────────────────────────┐
│  Plan 2: Full Body Power (30 min)                         │
│  ├─ warmupExercises: random 3                             │
│  ├─ upperBodyExercises (intermediate): random 4           │
│  ├─ lowerBodyExercises (intermediate): random 4           │
│  ├─ coreExercises: random 3                               │
│  ├─ energyBoostExercises: random 2                        │
│  └─ Duration: 60 seconds each                             │
│                                                           │
│  Result: 16 exercises targeting all muscle groups         │
└───────────────────────────────────────────────────────────┘
      │
      ▼
┌───────────────────────────────────────────────────────────┐
│  Plan 3: Cardio Core Crusher (25 min)                     │
│  ├─ energyBoostExercises: random 8                        │
│  ├─ coreExercises: random 6                               │
│  └─ Duration: 60 seconds each                             │
│                                                           │
│  Result: 14 exercises focusing on cardio + abs            │
└───────────────────────────────────────────────────────────┘
      │
      ▼
┌───────────────────────────────────────────────────────────┐
│  For each plan, construct WorkoutPlan object:             │
│  {                                                        │
│    'id': 'hiit_energy_blast',                            │
│    'title': 'HIIT Energy Blast (20 min)',               │
│    'description': 'High-intensity cardio circuit...',    │
│    'type': 'hiit',                                       │
│    'durationSeconds': 1200,                              │
│    'level': 'intermediate',                              │
│    'benefits': [                                         │
│      'Burns calories fast',                              │
│      'Boosts metabolism',                                │
│      'Improves cardiovascular fitness',                  │
│      'Releases endorphins'                               │
│    ],                                                    │
│    'exercises': [                                        │
│      {                                                   │
│        'name': 'Burpee',                                 │
│        'duration': 45,                                   │
│        'image': 'assets/.../dK9394r.gif',               │
│        'instructions': [...],                            │
│        'targetMuscles': ['full body'],                   │
│        'equipment': 'body weight',                       │
│        'difficulty': 'intermediate'                      │
│      },                                                  │
│      ... (9 more exercises)                              │
│    ]                                                     │
│  }                                                       │
└───────────────────────────────────────────────────────────┘
```

---

## Component Interaction Sequence

```
[User] → [MoodDetectionPage] → [MoodService] → [ExerciseDatabase]
  │              │                    │                  │
  │ Answers      │                    │                  │
  │ Questions    │                    │                  │
  │─────────────▶│                    │                  │
  │              │ detectFromAnswers()│                  │
  │              │───────────────────▶│                  │
  │              │                    │                  │
  │              │                    │ Calculates mood  │
  │              │                    │ (stressed/calm)  │
  │              │                    │                  │
  │              │                    │ generateRecommendations()
  │              │                    │─────────────────▶│
  │              │                    │                  │
  │              │                    │                  │ Get curated sets
  │              │                    │                  │ (stressRelief,
  │              │                    │                  │  energyBoost, etc.)
  │              │                    │                  │
  │              │                    │ Random selection │
  │              │                    │◀─────────────────│
  │              │                    │                  │
  │              │ 3 WorkoutPlans     │                  │
  │              │◀───────────────────│                  │
  │              │                    │                  │
  │              │ notifyListeners()  │                  │
  │              │                    │                  │
  │ UI Updates   │                    │                  │
  │◀─────────────│                    │                  │
  │              │                    │                  │
  │ Displays 3   │                    │                  │
  │ MoodRecommendationCards          │                  │
  │              │                    │                  │
  │ User clicks  │                    │                  │
  │ "Start"      │                    │                  │
  │─────────────▶│                    │                  │
  │              │                    │                  │
  │              │ Navigate to ExerciseRunnerPage       │
  │              │                    │                  │
  │              │                    │                  │
  │              │ [ExerciseRunnerPage]                 │
  │              │          │                            │
  │              │          │ Load exercise GIF          │
  │              │          │ Display metadata           │
  │              │          │ Start timer                │
  │              │          │                            │
  │              │          │ Timer reaches 0            │
  │              │          │ Auto-advance to next       │
  │              │          │                            │
  │              │          │ All exercises complete     │
  │              │          │ Show "Workout complete!"   │
  │              │          │                            │
```

---

## File Dependencies

```
exercise_model.dart (Data Models)
      │
      │ imported by
      │
      ▼
exercise_database.dart (Database Service)
      │
      │ imported by
      │
      ▼
mood_service.dart (Business Logic)
      │
      │ used by (Provider)
      │
      ▼
mood_detection_page.dart (UI)
      │
      │ displays
      │
      ▼
mood_recommendation_card.dart (Widget)
      │
      │ navigates to
      │
      ▼
exercise_runner_page.dart (Exercise Player)
```

---

## State Management Flow

```
MoodService (ChangeNotifier)
      │
      ├─ _detectedMood: String?
      │     └─ Updated by: detectFromAnswers(), detectFromFaceFeatures()
      │
      ├─ _recommendations: List<Map<String, dynamic>>
      │     └─ Updated by: generateRecommendations()
      │
      └─ _isInitialized: bool
            └─ Updated by: initialize()

When state changes:
  notifyListeners()
      │
      ▼
  Consumer<MoodService> in MoodDetectionPage rebuilds
      │
      ▼
  UI updates with new recommendations
```

---

This architecture provides:
✅ Separation of concerns (UI, Business Logic, Data)
✅ Scalability (easy to add more exercises, moods, or workout types)
✅ Testability (each component can be tested independently)
✅ Maintainability (clear dependencies and data flow)
✅ Performance (singleton pattern, lazy loading, efficient filtering)
