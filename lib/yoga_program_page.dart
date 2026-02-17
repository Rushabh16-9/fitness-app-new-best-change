import 'package:flutter/material.dart';
import '../services/yoga_program_service.dart';
import '../models/yoga_program.dart';
import 'yoga_session_page.dart';

class YogaProgramPage extends StatefulWidget {
  const YogaProgramPage({super.key});

  @override
  State<YogaProgramPage> createState() => _YogaProgramPageState();
}

class _YogaProgramPageState extends State<YogaProgramPage> {
  final YogaProgramService _service = YogaProgramService();
  final TextEditingController _searchController = TextEditingController();
  List<YogaProgram> _filteredPrograms = [];
  String _selectedLevel = 'all';
  String _selectedFocus = 'all';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadYogaPrograms();
  }

  Future<void> _loadYogaPrograms() async {
    await _service.load();
    setState(() {
      _filteredPrograms = _service.allPrograms;
      _loading = false;
    });
  }

  void _filterPrograms() {
    setState(() {
      List<YogaProgram> programs = _service.allPrograms;
      
      if (_selectedLevel != 'all') {
        programs = programs.where((program) => program.level == _selectedLevel).toList();
      }
      
      if (_selectedFocus != 'all') {
        programs = programs.where((program) => program.focus == _selectedFocus).toList();
      }
      
      if (_searchController.text.isNotEmpty) {
        final query = _searchController.text.toLowerCase();
        programs = programs.where((program) =>
          program.name.toLowerCase().contains(query) ||
          program.description.toLowerCase().contains(query)
        ).toList();
      }
      
      _filteredPrograms = programs;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text('Yoga Programs', style: TextStyle(color: Colors.white)),
        elevation: 0,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Colors.red))
          : Column(
              children: [
                // Search Bar
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (_) => _filterPrograms(),
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Search yoga programs...',
                      hintStyle: const TextStyle(color: Colors.white54),
                      prefixIcon: const Icon(Icons.search, color: Colors.red),
                      filled: true,
                      fillColor: Colors.grey.shade900,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                
                // Filter Chips
                SizedBox(
                  height: 50,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    scrollDirection: Axis.horizontal,
                    children: [
                      _buildFilterChip('Level', _selectedLevel, ['all', 'beginner', 'intermediate', 'advanced'], (value) {
                        setState(() => _selectedLevel = value);
                        _filterPrograms();
                      }),
                      const SizedBox(width: 8),
                      _buildFilterChip('Focus', _selectedFocus, ['all', 'flexibility', 'strength', 'balance', 'relaxation'], (value) {
                        setState(() => _selectedFocus = value);
                        _filterPrograms();
                      }),
                    ],
                  ),
                ),
                
                const SizedBox(height: 16),
                
                // Programs List
                Expanded(
                  child: _filteredPrograms.isEmpty
                      ? const Center(
                          child: Text(
                            'No yoga programs found',
                            style: TextStyle(color: Colors.white54, fontSize: 16),
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _filteredPrograms.length,
                          itemBuilder: (context, index) {
                            final program = _filteredPrograms[index];
                            return _buildProgramCard(program);
                          },
                        ),
                ),
              ],
            ),
    );
  }

  Widget _buildFilterChip(String label, String selected, List<String> options, Function(String) onChanged) {
    return PopupMenuButton<String>(
      color: Colors.grey.shade900,
      itemBuilder: (context) => options.map((option) => PopupMenuItem<String>(
        value: option,
        child: Text(
          option == 'all' ? 'All' : option[0].toUpperCase() + option.substring(1),
          style: const TextStyle(color: Colors.white),
        ),
      )).toList(),
      onSelected: onChanged,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.grey.shade800,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.red.withOpacity(0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '$label: ${selected == 'all' ? 'All' : selected[0].toUpperCase() + selected.substring(1)}',
              style: const TextStyle(color: Colors.white, fontSize: 12),
            ),
            const SizedBox(width: 4),
            const Icon(Icons.arrow_drop_down, color: Colors.white, size: 18),
          ],
        ),
      ),
    );
  }

  Widget _buildProgramCard(YogaProgram program) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: _getFocusGradient(program.focus),
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => YogaSessionPage(program: program),
            ),
          );
        },
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          program.name,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          program.description,
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${program.durationDays} days',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  _buildInfoChip(program.level.toUpperCase(), Icons.fitness_center),
                  const SizedBox(width: 8),
                  _buildInfoChip(program.focus.toUpperCase(), Icons.self_improvement),
                  const SizedBox(width: 8),
                  _buildInfoChip('${_getEstimatedTime(program)} min/day', Icons.access_time),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip(String text, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
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

  int _getEstimatedTime(YogaProgram program) {
    if (program.days.isEmpty) return 30;
    return program.days.map((day) => day.estimatedMinutes).reduce((a, b) => a + b) ~/ program.days.length;
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

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}