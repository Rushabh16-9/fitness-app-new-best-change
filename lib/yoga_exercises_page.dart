import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'yoga_service.dart';
import 'health_assessment_page.dart';
import 'yoga_pose_session_page.dart';
import 'music_playlist_page.dart';
import 'camera_page.dart';
import 'asset_resolver.dart';

class YogaExercisesPage extends StatefulWidget {
  const YogaExercisesPage({super.key});

  @override
  State<YogaExercisesPage> createState() => _YogaExercisesPageState();
}

class _YogaExercisesPageState extends State<YogaExercisesPage> {
  final YogaService _yogaService = YogaService(FirebaseAuth.instance.currentUser?.uid);
  // Removed unused DatabaseService instance (was not referenced in this widget)
  final GlobalKey<ScaffoldMessengerState> _scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

  String selectedCategory = 'All';
  String selectedDifficulty = 'All';
  String selectedMuscleGroup = 'All';
  String selectedDuration = 'All';
  String selectedHealthCondition = 'All';
  String sortBy = 'name';
  String searchQuery = '';
  List<Map<String, dynamic>> displayedPoses = [];
  List<Map<String, dynamic>> allPoses = [];
  List<Map<String, dynamic>> personalizedPoses = [];
  Map<String, dynamic>? userAssessment;
  bool isLoading = true;
  bool showFilters = false;
  bool showPersonalizedOnly = true; // Toggle between all and personalized
  bool hasAssessment = false;

  final List<String> categories = ['All', 'Restorative', 'Strength', 'Flexibility', 'Balance', 'Beginner', 'Intermediate', 'Advanced'];
  final List<String> difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  final List<String> muscleGroups = ['All', 'Back', 'Shoulders', 'Hips', 'Legs', 'Core', 'Chest', 'Arms', 'Neck', 'Full Body'];
  final List<String> durations = ['All', 'Short (<30s)', 'Medium (30-60s)', 'Long (>60s)'];
  final List<String> sortOptions = ['name', 'difficulty', 'duration', 'relevance'];

  @override
  void initState() {
    super.initState();
    AssetResolver.init().whenComplete(_loadData);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Refresh data when returning to this page
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => isLoading = true);

    try {
      // Load user assessment for personalization
      userAssessment = await _yogaService.getHealthAssessment();

      // Debug: Print assessment data
      print('User Assessment: $userAssessment');

  // Load all poses
  allPoses = _yogaService.yogaPoses.values.toList();
  // Discover any additional poses shipped as data assets and include them
  await _yogaService.discoverAdditionalYogaPoses();
  allPoses.addAll(_yogaService.discoveredYogaPoses.values);

      // If user has assessment, prepare personalized recommendations
      if (userAssessment != null && userAssessment!.isNotEmpty) {
        hasAssessment = true;
        final healthConditions = List<String>.from(userAssessment!['conditions'] ?? []);
        print('Health Conditions: $healthConditions');

        if (healthConditions.isNotEmpty) {
          personalizedPoses = _yogaService.getPersonalizedYogaPoses(healthConditions);
          print('Personalized Poses Count: ${personalizedPoses.length}');
        } else {
          // If no specific conditions, show beginner poses
          personalizedPoses = _yogaService.getPersonalizedYogaPoses(['beginner']);
          print('Showing beginner poses as fallback');
        }
      } else {
        // No assessment found: don't hide poses — show all poses and use them as personalized fallback
        hasAssessment = false;
        personalizedPoses = List<Map<String, dynamic>>.from(allPoses);
        print('No assessment found; showing all poses as fallback');
        // If there was a UX state that defaulted to showing only personalized content, disable it
        showPersonalizedOnly = false;
      }

      // Set initial display based on toggle
      displayedPoses = showPersonalizedOnly ? personalizedPoses : allPoses;
    } catch (e) {
      print('Error loading yoga data: $e');
      // Fallback to showing all poses
      allPoses = _yogaService.yogaPoses.values.toList();
      personalizedPoses = allPoses;
      displayedPoses = allPoses;
    }

    setState(() => isLoading = false);
  }

  void _filterAndSortPoses() {
    // Start with the base poses (personalized or all)
    List<Map<String, dynamic>> filtered = showPersonalizedOnly ? List.from(personalizedPoses) : List.from(allPoses);

    // Apply search filter
    if (searchQuery.isNotEmpty) {
      filtered = filtered.where((pose) {
        final name = pose['name']?.toString().toLowerCase() ?? '';
        final benefits = List<String>.from(pose['benefits'] ?? []).join(' ').toLowerCase();
        final instructions = List<String>.from(pose['instructions'] ?? []).join(' ').toLowerCase();
        final muscleGroups = List<String>.from(pose['muscleGroups'] ?? []).join(' ').toLowerCase();
        final query = searchQuery.toLowerCase();

        return name.contains(query) ||
               benefits.contains(query) ||
               instructions.contains(query) ||
               muscleGroups.contains(query);
      }).toList();
    }

    // Filter by difficulty
    if (selectedDifficulty != 'All') {
      filtered = filtered.where((pose) => pose['difficulty'] == selectedDifficulty).toList();
    }

    // Filter by muscle group
    if (selectedMuscleGroup != 'All') {
      filtered = filtered.where((pose) {
        final muscleGroups = List<String>.from(pose['muscleGroups'] ?? []);
        return muscleGroups.any((group) => group.toLowerCase().contains(selectedMuscleGroup.toLowerCase()));
      }).toList();
    }

    // Filter by duration
    if (selectedDuration != 'All') {
      filtered = filtered.where((pose) {
        final duration = pose['duration'] ?? 30;
        switch (selectedDuration) {
          case 'Short (<30s)':
            return duration < 30;
          case 'Medium (30-60s)':
            return duration >= 30 && duration <= 60;
          case 'Long (>60s)':
            return duration > 60;
          default:
            return true;
        }
      }).toList();
    }

    // Filter by health condition
    if (selectedHealthCondition != 'All') {
      final healthConditions = [selectedHealthCondition];
      filtered = _yogaService.getPersonalizedYogaPoses(healthConditions);
    }

    // Apply sorting
    filtered.sort((a, b) {
      switch (sortBy) {
        case 'name':
          return (a['name'] ?? '').toString().compareTo((b['name'] ?? '').toString());
        case 'difficulty':
          final difficultyOrder = {'Beginner': 1, 'Intermediate': 2, 'Advanced': 3};
          final aOrder = difficultyOrder[a['difficulty']] ?? 0;
          final bOrder = difficultyOrder[b['difficulty']] ?? 0;
          return aOrder.compareTo(bOrder);
        case 'duration':
          return (a['duration'] ?? 30).compareTo(b['duration'] ?? 30);
        case 'relevance':
          // Sort by relevance to user's assessment
          if (userAssessment != null) {
            final userConditions = List<String>.from(userAssessment!['conditions'] ?? []);
            final aRelevance = _calculateRelevance(a, userConditions);
            final bRelevance = _calculateRelevance(b, userConditions);
            return bRelevance.compareTo(aRelevance); // Higher relevance first
          }
          return 0;
        default:
          return 0;
      }
    });

    setState(() => displayedPoses = filtered);
  }

  void _togglePersonalization() {
    setState(() {
      showPersonalizedOnly = !showPersonalizedOnly;
      // Reset filters when switching modes
      selectedDifficulty = 'All';
      selectedMuscleGroup = 'All';
      selectedDuration = 'All';
      selectedHealthCondition = 'All';
      searchQuery = '';
      sortBy = 'name';
    });
    _filterAndSortPoses();
  }

  int _calculateRelevance(Map<String, dynamic> pose, List<String> userConditions) {
    int relevance = 0;
    final poseBenefits = List<String>.from(pose['benefits'] ?? []);

    for (var condition in userConditions) {
      // Check if pose benefits match user's health conditions
      if (poseBenefits.any((benefit) => benefit.toLowerCase().contains(condition.toLowerCase()))) {
        relevance += 10;
      }
      // Check if pose is recommended for this condition
      final recommendedPoses = _yogaService.healthRecommendations[condition] ?? [];
      if (recommendedPoses.contains(_getPoseId(pose))) {
        relevance += 5;
      }
    }

    return relevance;
  }

  String _getPoseId(Map<String, dynamic> pose) {
    return _yogaService.yogaPoses.entries
        .firstWhere((entry) => entry.value == pose, orElse: () => MapEntry('', {}))
        .key;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldMessengerKey,
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Yoga Exercises'),
        backgroundColor: Colors.black,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.edit, color: Colors.red),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const HealthAssessmentPage()),
            ),
            tooltip: 'Edit Health Assessment',
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.red),
            onPressed: _loadData,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.red))
          : !hasAssessment
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.self_improvement,
                          size: 100,
                          color: Colors.red,
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'Personalized Yoga Exercises',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Fill your health assessment to get yoga exercises tailored to your needs.',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 16,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 32),
                        ElevatedButton.icon(
                          onPressed: () async {
                            final result = await Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const HealthAssessmentPage()),
                            );
                            if (result == true) {
                              _loadData(); // Reload data after assessment is saved
                            }
                          },
                          icon: const Icon(Icons.edit, color: Colors.white),
                          label: const Text('Fill Health Assessment'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red,
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                            textStyle: const TextStyle(fontSize: 16),
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              : Column(
                  children: [
                    // Personalization Banner
                    if (userAssessment != null)
                      Container(
                        margin: const EdgeInsets.all(16),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.red.withOpacity(0.3)),
                        ),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.personal_video, color: Colors.red),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Personalized for You',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                        ),
                                      ),
                                      Text(
                                        'Based on your health assessment',
                                        style: TextStyle(
                                          color: Colors.white70,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            // Toggle Button
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: Colors.grey.shade900,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'Show: ',
                                    style: TextStyle(
                                      color: Colors.white70,
                                      fontSize: 14,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  TextButton(
                                    onPressed: () {
                                      if (!showPersonalizedOnly) {
                                        _togglePersonalization();
                                      }
                                    },
                                    style: TextButton.styleFrom(
                                      backgroundColor: showPersonalizedOnly ? Colors.red : Colors.transparent,
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                    ),
                                    child: Text(
                                      'Personalized',
                                      style: TextStyle(
                                        color: showPersonalizedOnly ? Colors.white : Colors.white70,
                                        fontSize: 12,
                                        fontWeight: showPersonalizedOnly ? FontWeight.bold : FontWeight.normal,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  TextButton(
                                    onPressed: () {
                                      if (showPersonalizedOnly) {
                                        _togglePersonalization();
                                      }
                                    },
                                    style: TextButton.styleFrom(
                                      backgroundColor: !showPersonalizedOnly ? Colors.red : Colors.transparent,
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                    ),
                                    child: Text(
                                      'All Poses',
                                      style: TextStyle(
                                        color: !showPersonalizedOnly ? Colors.white : Colors.white70,
                                        fontSize: 12,
                                        fontWeight: !showPersonalizedOnly ? FontWeight.bold : FontWeight.normal,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),

                    // Search Bar
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade900,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: TextField(
                        onChanged: (value) {
                          setState(() => searchQuery = value);
                          _filterAndSortPoses();
                        },
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          hintText: 'Search exercises...',
                          hintStyle: TextStyle(color: Colors.white70),
                          prefixIcon: const Icon(Icons.search, color: Colors.red),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                      ),
                    ),

                    // Filters Toggle
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        children: [
                          TextButton.icon(
                            onPressed: () => setState(() => showFilters = !showFilters),
                            icon: Icon(
                              showFilters ? Icons.filter_list_off : Icons.filter_list,
                              color: Colors.red,
                            ),
                            label: Text(
                              showFilters ? 'Hide Filters' : 'Show Filters',
                              style: const TextStyle(color: Colors.red),
                            ),
                          ),
                          const Spacer(),
                          // Sort Dropdown
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                            decoration: BoxDecoration(
                              color: Colors.grey.shade900,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: DropdownButton<String>(
                              value: sortBy,
                              dropdownColor: Colors.grey.shade900,
                              style: const TextStyle(color: Colors.white, fontSize: 12),
                              underline: const SizedBox(),
                              items: const [
                                DropdownMenuItem(value: 'name', child: Text('Name')),
                                DropdownMenuItem(value: 'difficulty', child: Text('Difficulty')),
                                DropdownMenuItem(value: 'duration', child: Text('Duration')),
                                DropdownMenuItem(value: 'relevance', child: Text('Relevance')),
                              ],
                              onChanged: (value) {
                                setState(() => sortBy = value!);
                                _filterAndSortPoses();
                              },
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Expanded Filters
                    if (showFilters) ...[
                      Container(
                        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade900,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Filters',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 16),
                            // Row 1: Difficulty and Muscle Group
                            Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Difficulty',
                                        style: TextStyle(color: Colors.white70, fontSize: 12),
                                      ),
                                      const SizedBox(height: 4),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8),
                                        decoration: BoxDecoration(
                                          color: Colors.grey.shade800,
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: DropdownButton<String>(
                                          value: selectedDifficulty,
                                          dropdownColor: Colors.grey.shade800,
                                          style: const TextStyle(color: Colors.white, fontSize: 12),
                                          isExpanded: true,
                                          underline: const SizedBox(),
                                          items: difficulties.map((difficulty) {
                                            return DropdownMenuItem(
                                              value: difficulty,
                                              child: Text(difficulty),
                                            );
                                          }).toList(),
                                          onChanged: (value) {
                                            setState(() => selectedDifficulty = value!);
                                            _filterAndSortPoses();
                                          },
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Muscle Group',
                                        style: TextStyle(color: Colors.white70, fontSize: 12),
                                      ),
                                      const SizedBox(height: 4),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8),
                                        decoration: BoxDecoration(
                                          color: Colors.grey.shade800,
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: DropdownButton<String>(
                                          value: selectedMuscleGroup,
                                          dropdownColor: Colors.grey.shade800,
                                          style: const TextStyle(color: Colors.white, fontSize: 12),
                                          isExpanded: true,
                                          underline: const SizedBox(),
                                          items: muscleGroups.map((group) {
                                            return DropdownMenuItem(
                                              value: group,
                                              child: Text(group),
                                            );
                                          }).toList(),
                                          onChanged: (value) {
                                            setState(() => selectedMuscleGroup = value!);
                                            _filterAndSortPoses();
                                          },
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            // Row 2: Duration and Health Condition
                            Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Duration',
                                        style: TextStyle(color: Colors.white70, fontSize: 12),
                                      ),
                                      const SizedBox(height: 4),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8),
                                        decoration: BoxDecoration(
                                          color: Colors.grey.shade800,
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: DropdownButton<String>(
                                          value: selectedDuration,
                                          dropdownColor: Colors.grey.shade800,
                                          style: const TextStyle(color: Colors.white, fontSize: 12),
                                          isExpanded: true,
                                          underline: const SizedBox(),
                                          items: durations.map((duration) {
                                            return DropdownMenuItem(
                                              value: duration,
                                              child: Text(duration),
                                            );
                                          }).toList(),
                                          onChanged: (value) {
                                            setState(() => selectedDuration = value!);
                                            _filterAndSortPoses();
                                          },
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Health Condition',
                                        style: TextStyle(color: Colors.white70, fontSize: 12),
                                      ),
                                      const SizedBox(height: 4),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8),
                                        decoration: BoxDecoration(
                                          color: Colors.grey.shade800,
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: DropdownButton<String>(
                                          value: selectedHealthCondition,
                                          dropdownColor: Colors.grey.shade800,
                                          style: const TextStyle(color: Colors.white, fontSize: 12),
                                          isExpanded: true,
                                          underline: const SizedBox(),
                                          items: [
                                            const DropdownMenuItem(value: 'All', child: Text('All')),
                                            if (userAssessment != null)
                                              ...List<String>.from(userAssessment!['conditions'] ?? []).map((condition) {
                                                return DropdownMenuItem(
                                                  value: condition,
                                                  child: Text(condition),
                                                );
                                              }),
                                          ],
                                          onChanged: (value) {
                                            setState(() => selectedHealthCondition = value!);
                                            _filterAndSortPoses();
                                          },
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            // Clear Filters Button
                            Center(
                              child: TextButton(
                                onPressed: () {
                                  setState(() {
                                    selectedDifficulty = 'All';
                                    selectedMuscleGroup = 'All';
                                    selectedDuration = 'All';
                                    selectedHealthCondition = 'All';
                                    searchQuery = '';
                                    sortBy = 'name';
                                  });
                                  _filterAndSortPoses();
                                },
                                child: const Text(
                                  'Clear All Filters',
                                  style: TextStyle(color: Colors.red),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    // Poses List
                    Expanded(
                      child: displayedPoses.isEmpty
                          ? const Center(
                              child: Text(
                                'No yoga poses found',
                                style: TextStyle(color: Colors.white70, fontSize: 18),
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: displayedPoses.length,
                              itemBuilder: (context, index) {
                                final pose = displayedPoses[index];
                                return _buildPoseCard(pose);
                              },
                            ),
                    ),
                  ],
                ),
    );
  }

  Widget _buildPoseCard(Map<String, dynamic> pose) {
    final benefits = List<String>.from(pose['benefits'] ?? []);
    final instructions = List<String>.from(pose['instructions'] ?? []);
  // muscleGroups local variable removed (unused)
    final duration = pose['duration'] ?? 30;
    String imagePath = pose['imagePath'] ?? '';
    // Validate the asset path and auto-fallback to a safe image if missing
    if (imagePath.isNotEmpty && !AssetResolver.exists(imagePath)) {
      // Pick a deterministic fallback from YogaService's verified pool and ensure it exists
      final id = _getPoseId(pose);
      final List<String> pool = _yogaService.getVerifiedFallbacks();
      if (pool.isNotEmpty) {
        // Try up to N candidates (circular) to find one present in the manifest
        final start = (id.hashCode.abs()) % pool.length;
        for (int attempt = 0; attempt < pool.length; attempt++) {
          final idx = (start + attempt) % pool.length;
          final candidate = pool[idx];
          if (AssetResolver.exists(candidate)) {
            imagePath = candidate;
            break;
          }
        }
      }

      // Last resort: known-good asset from the root bundle (registered in pubspec)
      if (imagePath.isEmpty || !AssetResolver.exists(imagePath)) {
        // Prefer a yoga image we know exists; fallback to a generic local asset
        const knownGoodYoga = 'assets/yoga/downward_dog/downward_dog1.jpg';
        imagePath = AssetResolver.exists(knownGoodYoga) ? knownGoodYoga : 'assets/coach.jpg';
      }
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.grey.shade900,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade800),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Pose Image
          if (imagePath.isNotEmpty)
            Container(
              height: 200,
              width: double.infinity,
              decoration: const BoxDecoration(
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
              ),
              child: ClipRRect(
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
              child: Image.asset(
                imagePath,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  // Print error to console for debugging
                  debugPrint('Image load error: $error');
                  // Graceful placeholder instead of verbose error text
                  return Container(
                    color: Colors.grey.shade800,
                    alignment: Alignment.center,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.image_not_supported, color: Colors.white54, size: 40),
                        SizedBox(height: 8),
                        Text(
                          'Preview not available',
                          style: TextStyle(color: Colors.white60),
                        ),
                      ],
                    ),
                  );
                },
              ),
              ),
            ),

          // Pose Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: imagePath.isNotEmpty ? Colors.black.withOpacity(0.7) : Colors.red,
              borderRadius: imagePath.isNotEmpty
                  ? const BorderRadius.only(
                      bottomLeft: Radius.circular(16),
                      bottomRight: Radius.circular(16),
                    )
                  : const BorderRadius.only(
                      topLeft: Radius.circular(16),
                      topRight: Radius.circular(16),
                    ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        pose['name'] ?? 'Unknown Pose',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (pose['sanskrit'] != null)
                        Text(
                          pose['sanskrit'],
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getDifficultyColor(pose['difficulty']),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    pose['difficulty'] ?? 'Beginner',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Pose Content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Duration
                Row(
                  children: [
                    const Icon(Icons.timer, color: Colors.red, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      '$duration seconds',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Benefits
                if (benefits.isNotEmpty) ...[
                  const Text(
                    'Benefits:',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    children: benefits.map((benefit) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.green.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.green.withOpacity(0.3)),
                        ),
                        child: Text(
                          benefit,
                          style: const TextStyle(
                            color: Colors.green,
                            fontSize: 12,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 12),
                ],

                // Instructions
                const Text(
                  'Instructions:',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                ...instructions.asMap().entries.map((entry) {
                  final stepNumber = entry.key + 1;
                  final instruction = entry.value;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '$stepNumber.',
                          style: const TextStyle(
                            color: Colors.red,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            instruction,
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }),

                const SizedBox(height: 16),

                // Action Buttons
                Row(
                  children: [
                    // Camera Button
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _openCameraPage(pose),
                        icon: const Icon(Icons.camera_alt, color: Colors.white),
                        label: const Text('Practice with Camera'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Start Button
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _startYogaSession(pose),
                        icon: const Icon(Icons.play_arrow, color: Colors.white),
                        label: const Text('Start Pose'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Music quick playlist button
                    SizedBox(
                      width: 48,
                      height: 44,
                      child: Tooltip(
                        message: 'Open playlist',
                        child: ElevatedButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const MusicPlaylistPage(),
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.grey.shade800,
                            padding: EdgeInsets.zero,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: const Icon(Icons.music_note, color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _getDifficultyColor(String? difficulty) {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return Colors.green;
      case 'intermediate':
        return Colors.orange;
      case 'advanced':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  void _startYogaSession(Map<String, dynamic> pose) {
    // Navigate to the yoga pose session page
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => YogaPoseSessionPage(pose: pose),
      ),
    );
  }

  void _openCameraPage(Map<String, dynamic> pose) {
    // Navigate to the camera page with the selected pose
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CameraPage(targetPose: pose),
      ),
    );
  }
}
