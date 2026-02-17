import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'constants.dart';
import 'challenge_service.dart';
import 'database_service.dart';
import 'package:firebase_auth/firebase_auth.dart';

class ChallengesPage extends StatefulWidget {
  const ChallengesPage({super.key});

  @override
  State<ChallengesPage> createState() => _ChallengesPageState();
}

class _ChallengesPageState extends State<ChallengesPage> {
  late ChallengeService _challengeService;
  List<Map<String, dynamic>> _personalizedChallenges = [];
  List<Map<String, dynamic>> _activeChallenges = [];
  List<Map<String, dynamic>> _completedChallenges = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeService();
    });
  }

  Future<void> _initializeService() async {
  final uid = FirebaseAuth.instance.currentUser?.uid;
  final databaseService = DatabaseService(uid: uid);
  _challengeService = ChallengeService(databaseService.uid);

    await _loadChallenges();
  }

  Future<void> _loadChallenges() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      // Get user profile for personalization
  final uid = FirebaseAuth.instance.currentUser?.uid;
  final userProfile = await DatabaseService(uid: uid).getUserProfile();
      final fitnessLevel = (userProfile['fitnessLevel'] ?? 'Beginner').toString();
      final primaryGoal = (userProfile['primaryGoal'] ?? 'General Fitness').toString();
      final completedChallengesRaw = userProfile['completedChallenges'] ?? [];

      // Extract challengeId strings from completedChallenges list of maps
      final completedChallenges = completedChallengesRaw.map<String>((e) {
        if (e is Map<String, dynamic> && e.containsKey('challengeId')) {
          return e['challengeId'].toString();
        }
        return e.toString();
      }).toList();

      // Load active before personalizing so we can filter them out
      _activeChallenges = await _challengeService.getActiveChallenges();

      // Run integrity cleanup (dedupe, fill missing titles) using asset reference
      await _challengeService.ensureIntegrity();
      // Re-fetch after integrity enforcement
      _activeChallenges = await _challengeService.getActiveChallenges();

      _personalizedChallenges = await _challengeService.getPersonalizedChallenges(
        fitnessLevel: fitnessLevel,
        primaryGoal: primaryGoal,
        completedChallenges: completedChallenges,
      );
      // Exclude already active challengeIds from available list
      final activeIds = _activeChallenges.map((c) => c['challengeId']).toSet();
      _personalizedChallenges = _personalizedChallenges.where((c) => !activeIds.contains(c['id'])).toList();
      _completedChallenges = await _challengeService.getCompletedChallenges();

      if (mounted) setState(() { _isLoading = false; _errorMessage = null; });
    } catch (e) {
      print('Error loading challenges: $e'); // Debug print
      if (mounted) setState(() { _isLoading = false; _errorMessage = 'Failed to load challenges'; });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading challenges: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConstants.darkBackground,
      appBar: AppBar(
        title: Text('Challenges', style: AppConstants.titleLarge),
        backgroundColor: AppConstants.primaryRed,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadChallenges,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppConstants.primaryRed),
              ),
            )
          : _errorMessage != null
              ? _buildErrorState()
              : RefreshIndicator(
              onRefresh: _loadChallenges,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppConstants.paddingMedium),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_personalizedChallenges.isEmpty && _activeChallenges.isEmpty && _completedChallenges.isEmpty)
                      _buildEmptyState(),
                    _buildSectionHeader('Available Challenges'),
                    const SizedBox(height: AppConstants.paddingMedium),
                    if (_personalizedChallenges.isEmpty)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 16.0),
                        child: Text(
                          'No new challenges available right now. Complete current ones to unlock more!',
                          style: AppConstants.bodySmall.copyWith(color: Colors.white54),
                        ),
                      )
                    else
                      ..._personalizedChallenges.map((challenge) => _buildChallengeCard(challenge, 'available')),
                    const SizedBox(height: AppConstants.paddingLarge),
                    if (_activeChallenges.isNotEmpty) ...[
                      _buildSectionHeader('Active Challenges'),
                      const SizedBox(height: AppConstants.paddingMedium),
                      ..._activeChallenges.map((challenge) => _buildChallengeCard(challenge, 'active')),
                      const SizedBox(height: AppConstants.paddingLarge),
                    ],
                    if (_completedChallenges.isNotEmpty) ...[
                      _buildSectionHeader('Completed Challenges'),
                      const SizedBox(height: AppConstants.paddingMedium),
                      ..._completedChallenges.map((challenge) => _buildChallengeCard(challenge, 'completed')),
                    ],
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.grey[900],
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey[800]!),
      ),
      child: Column(
        children: [
          const Icon(Icons.emoji_events, color: Colors.white30, size: 48),
          const SizedBox(height: 12),
          Text('No challenges yet', style: AppConstants.titleMedium.copyWith(color: Colors.white70)),
          const SizedBox(height: 8),
          Text('Pull to refresh or check back later for new challenges tailored to you.',
              textAlign: TextAlign.center,
              style: AppConstants.bodySmall.copyWith(color: Colors.white54)),
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, color: Colors.redAccent, size: 48),
            const SizedBox(height: 16),
            Text(_errorMessage ?? 'Error', style: AppConstants.titleMedium.copyWith(color: Colors.white)),
            const SizedBox(height: 8),
            Text('Tap retry to attempt loading challenges again.',
                textAlign: TextAlign.center,
                style: AppConstants.bodySmall.copyWith(color: Colors.white54)),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _loadChallenges,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(backgroundColor: AppConstants.primaryRed),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: AppConstants.headlineSmall,
    );
  }

  Widget _buildChallengeCard(Map<String, dynamic> challenge, String type) {
    final imagePath = challenge['image'] ?? 'assets/slide1.jpg';
    final challengeId = challenge['challengeId'] ?? challenge['id'];

    return Card(
      color: AppConstants.cardBackground,
      margin: const EdgeInsets.only(bottom: AppConstants.paddingMedium),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusLarge),
      ),
      elevation: 8,
      shadowColor: AppConstants.primaryRed.withOpacity(0.3),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppConstants.borderRadiusLarge),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppConstants.cardBackground,
              AppConstants.cardBackground.withOpacity(0.8),
            ],
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Header
            Container(
              height: 120,
              decoration: BoxDecoration(
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(AppConstants.borderRadiusLarge),
                  topRight: Radius.circular(AppConstants.borderRadiusLarge),
                ),
                image: DecorationImage(
                  image: AssetImage(imagePath),
                  fit: BoxFit.cover,
                  colorFilter: type == 'completed'
                      ? ColorFilter.mode(Colors.black.withOpacity(0.3), BlendMode.darken)
                      : null,
                ),
              ),
              child: Stack(
                children: [
                  // Difficulty Badge
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: _getDifficultyColor(challenge['difficulty'] ?? 'Medium'),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        challenge['difficulty'] ?? 'Medium',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  // Category Badge
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppConstants.primaryRed.withOpacity(0.9),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        challenge['category'] ?? 'General',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  // Completion Overlay
                  if (type == 'completed')
                    const Positioned(
                      top: 8,
                      right: 8,
                      child: Icon(
                        Icons.check_circle,
                        color: Colors.greenAccent,
                        size: 32,
                      ),
                    ),
                ],
              ),
            ),

            // Content
            Padding(
              padding: const EdgeInsets.all(AppConstants.paddingMedium),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title and Icon Row
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppConstants.primaryRed.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
                        ),
                        child: Icon(
                          _getChallengeIcon(challenge['type']),
                          color: AppConstants.primaryRed,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: AppConstants.paddingMedium),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              challenge['title'] ?? 'Challenge',
                              style: AppConstants.titleMedium.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              '${challenge['duration'] ?? 7} days',
                              style: AppConstants.bodyMedium.copyWith(
                                color: AppConstants.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: AppConstants.paddingMedium),

                  // Description
                  Text(
                    challenge['description'] ?? '',
                    style: AppConstants.bodyMedium,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),

                  const SizedBox(height: AppConstants.paddingMedium),

                  // Reward Info
                  if (challenge['reward'] != null) ...[
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.amber.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: Colors.amber.withOpacity(0.3),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.emoji_events,
                            color: Colors.amber,
                            size: 16,
                          ),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              '${challenge['reward']['points'] ?? 0} pts • ${challenge['reward']['badge'] ?? ''}',
                              style: AppConstants.bodySmall.copyWith(
                                color: Colors.amber[700],
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: AppConstants.paddingMedium),
                  ],

                  // Progress Bar for Active Challenges
                  if (type == 'active' && challenge['progress'] != null && challenge['duration'] != null) ...[
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Progress',
                              style: AppConstants.bodySmall.copyWith(
                                color: AppConstants.textSecondary,
                              ),
                            ),
                            Text(
                              '${challenge['progress']}/${challenge['duration']}',
                              style: AppConstants.bodySmall.copyWith(
                                color: AppConstants.primaryRed,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        LinearProgressIndicator(
                          value: (challenge['progress'] / challenge['duration']).clamp(0.0, 1.0),
                          backgroundColor: AppConstants.dividerColor,
                          valueColor: const AlwaysStoppedAnimation<Color>(AppConstants.primaryRed),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppConstants.paddingMedium),
                  ],

                  // Action Button
                  Row(
                    children: [
                      Expanded(
                        child: () {
                          if (type == 'available') {
                            return ElevatedButton.icon(
                              onPressed: () => _startChallengeWithOptionalPhoto(challenge),
                              icon: const Icon(Icons.play_arrow, size: 18),
                              label: const Text('Start'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppConstants.primaryRed,
                                foregroundColor: AppConstants.textPrimary,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(AppConstants.borderRadiusMedium),
                                ),
                              ),
                            );
                          } else if (type == 'active') {
                            return OutlinedButton.icon(
                              onPressed: () => _showChallengeProgress(challenge),
                              icon: const Icon(Icons.visibility, size: 18),
                              label: const Text('Progress'),
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: AppConstants.primaryRed),
                                foregroundColor: AppConstants.primaryRed,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(AppConstants.borderRadiusMedium),
                                ),
                              ),
                            );
                          } else { // completed
                            return ElevatedButton.icon(
                              onPressed: () => _showChallengeDetails(challenge),
                              icon: const Icon(Icons.info, size: 18),
                              label: const Text('Details'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.green,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(AppConstants.borderRadiusMedium),
                                ),
                              ),
                            );
                          }
                        }(),
                      ),
                      if (type == 'active' || type == 'completed') ...[
                        const SizedBox(width: 12),
                        SizedBox(
                          width: 120,
                          child: ElevatedButton.icon(
                            onPressed: () => _restartChallenge(challengeId),
                            icon: const Icon(Icons.refresh, size: 16),
                            label: const Text('Restart'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blueGrey.shade700,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(AppConstants.borderRadiusMedium),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getChallengeIcon(String? type) {
    switch (type) {
      case 'streak':
        return Icons.calendar_today;
      case 'progress':
        return Icons.trending_up;
      case 'achievement':
        return Icons.emoji_events;
      case 'calories':
        return Icons.local_fire_department;
      case 'sessions':
        return Icons.fitness_center;
      default:
        return Icons.star;
    }
  }

  Future<void> _startChallenge(String challengeId) async {
    try {
      await _challengeService.startChallenge(challengeId);
      await _loadChallenges(); // Refresh the list
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Challenge started successfully!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error starting challenge: $e')),
        );
      }
    }
  }

  Future<void> _restartChallenge(String challengeId) async {
    try {
      await _challengeService.restartChallenge(challengeId);
      await _loadChallenges();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Challenge restarted. Progress reset.')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error restarting challenge: $e')),
        );
      }
    }
  }

  Future<void> _startChallengeWithOptionalPhoto(Map<String, dynamic> challenge) async {
    final challengeId = challenge['id'];
    await _startChallenge(challengeId);
    // Ask user if they want to capture a verification photo immediately
    if (!mounted) return;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.black,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Verify Day 1?', style: AppConstants.titleLarge.copyWith(color: Colors.white)),
                const SizedBox(height: 12),
                Text('You can upload a quick photo now to mark Day 1 as completed.', style: AppConstants.bodyMedium.copyWith(color: Colors.white70)),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(ctx),
                        style: OutlinedButton.styleFrom(foregroundColor: Colors.white),
                        child: const Text('Later'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () async {
                          final picker = ImagePicker();
                          final image = await picker.pickImage(source: ImageSource.camera);
                          if (image != null) {
                            await _challengeService.markDayChallengeComplete(challengeId, 1, photoUrl: image.path);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Day 1 verified!')));
                            }
                          }
                          if (mounted) Navigator.pop(ctx);
                          await _loadChallenges();
                        },
                        icon: const Icon(Icons.camera_alt),
                        label: const Text('Capture Photo'),
                        style: ElevatedButton.styleFrom(backgroundColor: AppConstants.primaryRed, foregroundColor: Colors.white),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showChallengeProgress(Map<String, dynamic> activeChallenge) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.black,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return ChallengeProgressSheet(
          activeChallenge: activeChallenge,
          onProgressUpdate: () => _loadChallenges(),
        );
      },
    );
  }

  Color _getDifficultyColor(String difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return Colors.green;
      case 'medium':
        return Colors.orange;
      case 'hard':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  void _showChallengeDetails(Map<String, dynamic> challenge) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(challenge['title'] ?? 'Challenge Details'),
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (challenge['longDescription'] != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Text(
                      challenge['longDescription'],
                      style: AppConstants.bodyMedium,
                    ),
                  ),
                if (challenge['requirements'] != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Requirements:', style: AppConstants.titleMedium),
                        ...List<Widget>.from(
                          (challenge['requirements'] as List<dynamic>).map(
                            (req) => Text('- $req', style: AppConstants.bodyMedium),
                          ),
                        ),
                      ],
                    ),
                  ),
                if (challenge['tips'] != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Tips:', style: AppConstants.titleMedium),
                        ...List<Widget>.from(
                          (challenge['tips'] as List<dynamic>).map(
                            (tip) => Text('- $tip', style: AppConstants.bodyMedium),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Close'),
            ),
          ],
        );
      },
    );
  }
}

class ChallengeProgressSheet extends StatefulWidget {
  final Map<String, dynamic> activeChallenge;
  final VoidCallback onProgressUpdate;

  const ChallengeProgressSheet({
    super.key,
    required this.activeChallenge,
    required this.onProgressUpdate,
  });

  @override
  State<ChallengeProgressSheet> createState() => _ChallengeProgressSheetState();
}

class _ChallengeProgressSheetState extends State<ChallengeProgressSheet> {
  late ChallengeService _challengeService;
  bool _isUpdating = false;
  Map<String, dynamic> _challengeData = {};

  @override
  void initState() {
    super.initState();
    _challengeService = ChallengeService(null); // Will be initialized properly
    _challengeData = Map<String, dynamic>.from(widget.activeChallenge);
  }


  Future<void> _completeChallenge() async {
    setState(() => _isUpdating = true);
    try {
      await _challengeService.completeChallenge(widget.activeChallenge['challengeId']);
      widget.onProgressUpdate();
      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Challenge completed! 🎉')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error completing challenge: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isUpdating = false);
    }
  }

  Future<void> _shareProgressPhoto({int? forcedDay}) async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.camera);

    if (image != null && mounted) {
      // Determine next day or forced day
      final dayProgress = Map<String, dynamic>.from(_challengeData['dayProgress'] ?? {});
      int nextDay;
      if (forcedDay != null) {
        nextDay = forcedDay;
      } else {
        final duration = _challengeData['duration'] ?? 0;
        nextDay = 1;
        for (int d = 1; d <= duration; d++) {
          if (!(dayProgress.containsKey(d.toString()) && dayProgress[d.toString()]['completed'] == true)) {
            nextDay = d; break; }
        }
      }

      await _challengeService.markDayChallengeComplete(_challengeData['challengeId'], nextDay, photoUrl: image.path);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Day progress verified via photo.')));
      widget.onProgressUpdate();
      if (mounted) setState(() { /* local optimistic update could be added */ });
    }
  }

  @override
  Widget build(BuildContext context) {
  final challenge = _challengeData;
  final progress = challenge['progress'] ?? 0;
  final target = challenge['duration'] ?? challenge['target'] ?? 7;
    final progressPercentage = (progress / target).clamp(0.0, 1.0);
  final dayProgress = Map<String, dynamic>.from(challenge['dayProgress'] ?? {});
  final duration = challenge['duration'] ?? target;

    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            challenge['title'] ?? 'Challenge Progress',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            challenge['description'] ?? '',
            style: const TextStyle(color: Colors.white70, fontSize: 16),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Text(
                'Progress: $progress / $target',
                style: const TextStyle(color: Colors.white, fontSize: 18),
              ),
              const Spacer(),
              Text(
                '${(progressPercentage * 100).round()}%',
                style: const TextStyle(
                  color: Colors.red,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          LinearProgressIndicator(
            value: progressPercentage,
            backgroundColor: Colors.grey[800],
            valueColor: const AlwaysStoppedAnimation<Color>(Colors.red),
          ),
          const SizedBox(height: 24),
          _buildDayChips(dayProgress, duration),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: _isUpdating ? null : () => _shareProgressPhoto(),
            icon: const Icon(Icons.camera_alt, color: Colors.white),
            label: const Text('Upload Progress Photo'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 48),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _isUpdating ? null : () => Navigator.of(context).pop(),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.white70),
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 48),
                  ),
                  child: const Text('Close'),
                ),
              ),
              const SizedBox(width: 12),
              if (progress >= target) ...[
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isUpdating ? null : _completeChallenge,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 48),
                    ),
                    child: _isUpdating
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Text('Complete Challenge'),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDayChips(Map<String, dynamic> dayProgress, int duration) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: List.generate(duration, (index) {
        final dayNumber = index + 1;
        final entry = dayProgress[dayNumber.toString()];
        final completed = entry != null && entry['completed'] == true;
        return GestureDetector(
          onTap: completed || _isUpdating ? null : () => _shareProgressPhoto(forcedDay: dayNumber),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 250),
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: completed ? Colors.green : Colors.grey[850],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: completed ? Colors.greenAccent : Colors.grey[700]!),
              boxShadow: completed ? [const BoxShadow(color: Colors.greenAccent, blurRadius: 6, spreadRadius: 1)] : [],
            ),
            child: Center(
              child: completed
                  ? const Icon(Icons.check, size: 22, color: Colors.white)
                  : Text(
                      dayNumber.toString(),
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
            ),
          ),
        );
      }),
    );
  }
}
