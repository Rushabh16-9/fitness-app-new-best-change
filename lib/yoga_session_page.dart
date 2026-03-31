import 'package:flutter/material.dart';
import 'dart:async';
import '../models/yoga_program.dart';
import '../widgets/ai_exercise_assistant.dart';

class YogaSessionPage extends StatefulWidget {
  final YogaProgram program;
  
  const YogaSessionPage({super.key, required this.program});

  @override
  State<YogaSessionPage> createState() => _YogaSessionPageState();
}

class _YogaSessionPageState extends State<YogaSessionPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _selectedDay = 1;
  int _currentPoseIndex = 0;
  bool _isSessionActive = false;
  Timer? _poseTimer;
  int _remainingSeconds = 0;
  bool _isPaused = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _poseTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        title: Text(
          widget.program.name,
          style: const TextStyle(color: Colors.white),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.red,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white54,
          tabs: const [
            Tab(text: 'Program Overview'),
            Tab(text: 'Practice Session'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOverviewTab(),
          _buildSessionTab(),
        ],
      ),
    );
  }

  Widget _buildOverviewTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Program Info Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: _getFocusGradient(widget.program.focus),
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.program.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  widget.program.description,
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _buildInfoChip('${widget.program.durationDays} days', Icons.calendar_today),
                    const SizedBox(width: 12),
                    _buildInfoChip(widget.program.level.toUpperCase(), Icons.fitness_center),
                    const SizedBox(width: 12),
                    _buildInfoChip(widget.program.focus.toUpperCase(), Icons.self_improvement),
                  ],
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 20),
          
          // Day Selector
          const Text(
            'Select Day to Practice',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 80,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: widget.program.days.length,
              itemBuilder: (context, index) {
                final day = widget.program.days[index];
                final isSelected = day.day == _selectedDay;
                return GestureDetector(
                  onTap: () => setState(() => _selectedDay = day.day),
                  child: Container(
                    width: 120,
                    margin: const EdgeInsets.only(right: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isSelected ? Colors.red : Colors.grey.shade900,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Day ${day.day}',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${day.estimatedMinutes} min',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          day.theme,
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 10,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          
          const SizedBox(height: 20),
          
          // Selected Day Details
          _buildSelectedDayDetails(),
          
          const SizedBox(height: 20),
          
          // Start Session Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                _tabController.animateTo(1);
                _startSession();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(
                'Start Day $_selectedDay Practice',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSessionTab() {
    final currentDay = widget.program.days.firstWhere(
      (day) => day.day == _selectedDay,
      orElse: () => widget.program.days.first,
    );

    if (!_isSessionActive) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.self_improvement, color: Colors.red, size: 80),
            const SizedBox(height: 20),
            Text(
              'Day $_selectedDay: ${currentDay.theme}',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              currentDay.instructions,
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 16,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 30),
            ElevatedButton(
              onPressed: _startSession,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              ),
              child: const Text(
                'Begin Practice',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      );
    }

    final currentPose = currentDay.poses[_currentPoseIndex];
    
    return Column(
      children: [
        // Progress Bar
        Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Pose ${_currentPoseIndex + 1} of ${currentDay.poses.length}',
                    style: const TextStyle(color: Colors.white70),
                  ),
                  Text(
                    '${_remainingSeconds}s',
                    style: const TextStyle(
                      color: Colors.red,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              LinearProgressIndicator(
                value: (_currentPoseIndex + 1) / currentDay.poses.length,
                backgroundColor: Colors.grey.shade800,
                color: Colors.red,
              ),
            ],
          ),
        ),
        
        // Current Pose
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Pose Image (placeholder)
                Container(
                  height: 200,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade900,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: currentPose.imageAsset.isNotEmpty
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Image.asset(
                            currentPose.imageAsset,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => _buildPosePlaceholder(),
                          ),
                        )
                      : _buildPosePlaceholder(),
                ),
                
                const SizedBox(height: 16),
                
                // Pose Name
                Text(
                  currentPose.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                
                if (currentPose.sanskritName.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    currentPose.sanskritName,
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 16,
                      fontStyle: FontStyle.italic,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
                
                const SizedBox(height: 16),
                
                // Instructions
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade900,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    currentPose.instructions.isNotEmpty 
                        ? currentPose.instructions
                        : currentPose.description,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    textAlign: TextAlign.center,
                  ),
                ),
                
                const SizedBox(height: 16),
                
                // Benefits
                if (currentPose.benefits.isNotEmpty) ...[
                  const Text(
                    'Benefits',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...currentPose.benefits.map((benefit) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 2),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle, color: Colors.green, size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            benefit,
                            style: const TextStyle(color: Colors.white70),
                          ),
                        ),
                      ],
                    ),
                  )),
                  const SizedBox(height: 16),
                ],
              ],
            ),
          ),
        ),
        
        // Controls
        Container(
          padding: const EdgeInsets.all(16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              ElevatedButton.icon(
                onPressed: _currentPoseIndex > 0 ? _previousPose : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.grey.shade800,
                ),
                icon: const Icon(Icons.skip_previous),
                label: const Text('Previous'),
              ),
              
              ElevatedButton.icon(
                onPressed: _toggleTimer,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                ),
                icon: Icon(_isPaused ? Icons.play_arrow : Icons.pause),
                label: Text(_isPaused ? 'Resume' : 'Pause'),
              ),
              
              ElevatedButton.icon(
                onPressed: _nextPose,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.grey.shade800,
                ),
                icon: const Icon(Icons.skip_next),
                label: const Text('Next'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSelectedDayDetails() {
    final selectedDay = widget.program.days.firstWhere(
      (day) => day.day == _selectedDay,
      orElse: () => widget.program.days.first,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Day $_selectedDay: ${selectedDay.theme}',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          selectedDay.instructions,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 14,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'Poses (${selectedDay.poses.length}):',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        ...selectedDay.poses.asMap().entries.map((entry) {
          final index = entry.key;
          final pose = entry.value;
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.grey.shade900,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: Colors.red,
                  radius: 12,
                  child: Text(
                    '${index + 1}',
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        pose.name,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '${pose.holdSeconds}s • ${pose.repetitions} rep${pose.repetitions > 1 ? 's' : ''}',
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildPosePlaceholder() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey.shade800,
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.self_improvement, color: Colors.white38, size: 60),
            SizedBox(height: 8),
            Text(
              'Pose Image',
              style: TextStyle(color: Colors.white38),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoChip(String text, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.3),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.white, size: 12),
          const SizedBox(width: 4),
          Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  void _startSession() {
    setState(() {
      _isSessionActive = true;
      _currentPoseIndex = 0;
    });
    _startPoseTimer();
  }

  void _startPoseTimer() {
    final currentDay = widget.program.days.firstWhere(
      (day) => day.day == _selectedDay,
      orElse: () => widget.program.days.first,
    );
    
    if (_currentPoseIndex >= currentDay.poses.length) return;
    
    final currentPose = currentDay.poses[_currentPoseIndex];
    _remainingSeconds = currentPose.holdSeconds;
    _isPaused = false;
    
    _poseTimer?.cancel();
    _poseTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!_isPaused && _remainingSeconds > 0) {
        setState(() {
          _remainingSeconds--;
        });
      } else if (_remainingSeconds == 0) {
        timer.cancel();
        _nextPose();
      }
    });
  }

  void _toggleTimer() {
    setState(() {
      _isPaused = !_isPaused;
    });
  }

  void _nextPose() {
    final currentDay = widget.program.days.firstWhere(
      (day) => day.day == _selectedDay,
      orElse: () => widget.program.days.first,
    );
    
    if (_currentPoseIndex < currentDay.poses.length - 1) {
      setState(() {
        _currentPoseIndex++;
      });
      _startPoseTimer();
    } else {
      _finishSession();
    }
  }

  void _previousPose() {
    if (_currentPoseIndex > 0) {
      setState(() {
        _currentPoseIndex--;
      });
      _startPoseTimer();
    }
  }

  void _finishSession() {
    _poseTimer?.cancel();
    setState(() {
      _isSessionActive = false;
    });
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.black,
        title: const Text('Session Complete!', style: TextStyle(color: Colors.white)),
        content: const Text(
          'Great job completing your yoga practice today! Remember to rest and hydrate.',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Continue', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  List<Color> _getFocusGradient(String focus) {
    switch (focus) {
      case 'flexibility':
        return [Colors.purple.shade600, Colors.pink.shade600];
      case 'strength':
        return [Colors.orange.shade600, Colors.red.shade600];
      case 'balance':
        return [Colors.blue.shade600, Colors.cyan.shade600];
      case 'relaxation':
        return [Colors.green.shade600, Colors.teal.shade600];
      default:
        return [Colors.indigo.shade600, Colors.purple.shade600];
    }
  }
}

// Add floating action button for AI assistant
class YogaSessionPageWithAI extends StatelessWidget {
  final YogaProgram program;
  
  const YogaSessionPageWithAI({super.key, required this.program});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: YogaSessionPage(program: program),
      floatingActionButton: FloatingActionButton(
        backgroundColor: Colors.red,
        onPressed: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.transparent,
            builder: (context) => AIExerciseAssistant(
              exerciseName: 'Yoga Practice',
              muscleGroups: const ['flexibility', 'mindfulness'],
              exerciseType: 'flexibility',
            ),
          );
        },
        child: const Icon(Icons.smart_toy, color: Colors.white),
      ),
    );
  }
}