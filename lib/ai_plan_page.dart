import 'package:flutter/material.dart';
import 'ai_plan_service.dart';
import 'ai_plan_day_page.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'database_service.dart';

class AiPlanPage extends StatefulWidget {
  const AiPlanPage({super.key});

  @override
  State<AiPlanPage> createState() => _AiPlanPageState();
}

class _AiPlanPageState extends State<AiPlanPage> {
  final _formKey = GlobalKey<FormState>();
  final _ageCtl = TextEditingController();
  final _weightCtl = TextEditingController();
  final _heightCtl = TextEditingController();
  final _problemsCtl = TextEditingController();
  String? _focus;
  bool _generating = false;
  List<Map<String, dynamic>>? _plan;

  @override
  void dispose() {
    _ageCtl.dispose();
    _weightCtl.dispose();
    _heightCtl.dispose();
    _problemsCtl.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _loadSavedPlan();
  }

  Future<void> _loadSavedPlan() async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return;
    final db = DatabaseService(uid: uid);
    final latest = await db.getLatestGeneratedPlan();
    if (latest != null) {
      final meta = latest['meta'] as Map<String,dynamic>? ?? {};
      final days = (latest['days'] as List<dynamic>?)?.cast<Map<String,dynamic>>() ?? [];
      setState(() {
        _plan = days;
        _focus = meta['focus'] as String?;
        _problemsCtl.text = meta['problems'] ?? '';
        _ageCtl.text = meta['age']?.toString() ?? '';
      });
    }
  }

  void _generate() {
    // Validate required fields
    if (_ageCtl.text.trim().isEmpty || _weightCtl.text.trim().isEmpty || _heightCtl.text.trim().isEmpty) {
      showDialog(context: context, builder: (_) => AlertDialog(title: const Text('Missing info'), content: const Text('Please enter Age, Weight and Height to generate a personalized plan.'), actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK'))]));
      return;
    }
    if (!_formKey.currentState!.validate()) return;
    final age = int.tryParse(_ageCtl.text) ?? 30;
    final weight = double.tryParse(_weightCtl.text) ?? 70.0;
    final height = double.tryParse(_heightCtl.text) ?? 170.0;
    final problems = _problemsCtl.text.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).toList();

    setState(() { _generating = true; _plan = null; });
    final plan = generate30DayPlan(age: age, weightKg: weight, heightCm: height, problems: problems, focus: _focus);
    Future.delayed(const Duration(milliseconds: 300), () {
      setState(() { _plan = plan; _generating = false; });
    });
  }

  Future<void> _savePlan() async {
    if (_plan == null) return;
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Not signed in')));
      return;
    }
    final db = DatabaseService(uid: uid);
    final meta = {
      'focus': _focus,
      'problems': _problemsCtl.text,
      'age': _ageCtl.text,
      'weight': _weightCtl.text,
      'height': _heightCtl.text,
    };
    await db.saveGeneratedPlan(uid, meta, _plan!);
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Plan saved')));
  }

  void _startDayOne() {
    if (_plan == null || _plan!.isEmpty) return;
    final p = _plan![0];
    final groups = (p['muscleGroups'] as List).map((e) => e.toString()).toList();
    Navigator.push(context, MaterialPageRoute(builder: (_) => AiPlanDayPage(title: p['title'] ?? 'Day 1', muscleGroups: groups, problems: _problemsCtl.text.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).toList())));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Personalize 30-day Plan')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Form(
                key: _formKey,
                child: Column(children: [
                  TextFormField(controller: _ageCtl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Age')),
                  TextFormField(controller: _weightCtl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Weight (kg)')),
                  TextFormField(controller: _heightCtl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Height (cm)')),
                  TextFormField(controller: _problemsCtl, decoration: const InputDecoration(labelText: 'Problems (comma separated, e.g., knee, back)')),
                  const SizedBox(height: 12),
                  Row(children: [
                    Expanded(child: MediaQuery(
                      data: MediaQuery.of(context).copyWith(textScaler: const TextScaler.linear(1.0)),
                      child: DropdownButtonFormField<String?>(initialValue: _focus, items: const [
                      DropdownMenuItem(value: null, child: Text('No specific focus')),
                      DropdownMenuItem(value: 'Chest', child: Text('Chest')),
                      DropdownMenuItem(value: 'Back', child: Text('Back')),
                      DropdownMenuItem(value: 'Legs', child: Text('Legs')),
                      DropdownMenuItem(value: 'Shoulders', child: Text('Shoulders')),
                      DropdownMenuItem(value: 'Arms', child: Text('Arms')),
                      DropdownMenuItem(value: 'Abs', child: Text('Abs')),
                    ], onChanged: (v) => setState(() => _focus = v), decoration: const InputDecoration(labelText: 'Focus (optional)')),
                    )),
                    const SizedBox(width: 12),
                    ElevatedButton(onPressed: _generating ? null : _generate, child: _generating ? const CircularProgressIndicator() : const Text('Generate'))
                  ])
                ]),
              ),
              const SizedBox(height: 16),
              if (_plan != null) ...[
                const Text('Generated 30-day plan', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Row(children: [
                  ElevatedButton(onPressed: _savePlan, child: const Text('Save Plan')),
                  const SizedBox(width: 12),
                  ElevatedButton(onPressed: _startDayOne, child: const Text('Start Day 1')),
                ]),
                const SizedBox(height: 8),
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemBuilder: (_, i) {
                    final p = _plan![i];
                    return InkWell(
                      onTap: () {
                        final groups = (p['muscleGroups'] as List).map((e) => e.toString()).toList();
                        Navigator.push(context, MaterialPageRoute(builder: (_) => AiPlanDayPage(title: p['title'] ?? 'Day', muscleGroups: groups, problems: _problemsCtl.text.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).toList())));
                      },
                      child: ListTile(
                        tileColor: i == 0 ? Colors.red.shade200 : null,
                        title: Text(p['title'] ?? ''),
                        subtitle: Text(p['subtitle'] ?? ''),
                        trailing: Text((p['muscleGroups'] as List).join(', ')),
                      ),
                    );
                  },
                  separatorBuilder: (_, __) => const Divider(),
                  itemCount: _plan!.length,
                ),
              ]
            ],
          ),
        ),
      ),
    );
  }
}
