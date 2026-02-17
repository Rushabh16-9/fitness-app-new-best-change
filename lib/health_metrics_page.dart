import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:health/health.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
// Google Sign-In temporarily disabled due to environment symlink issue.
// import 'package:google_sign_in/google_sign_in.dart';

/// Upgraded Health Metrics Page (v7-final)
class HealthMetricsPage extends StatefulWidget {
  const HealthMetricsPage({super.key});
  @override
  State<HealthMetricsPage> createState() => _HealthMetricsPageState();
}

class _HealthMetricsPageState extends State<HealthMetricsPage> {
  static const String _buildTag = 'health-metrics-v7a';
  final Health _health = Health();
  bool _authorized = false;
  bool _fetching = false;
  String? _error;
  String _status = '';

  // granular permission flags
  bool _permSteps = false;
  bool _permDistance = false;
  bool _permEnergy = false;
  bool _overall = false;

  // metrics
  int _steps = 0;
  double _distanceKm = 0;
  double _activeEnergy = 0;

  // history
  final List<_DailyStep> _history = [];

  // debug
  bool _showDebug = false;
  final List<String> _logLines = [];
  int _authAttempts = 0;
  bool _showOAuthHelp = false; // surfaced after repeated failed attempts

  static const _types = <HealthDataType>[
    HealthDataType.STEPS,
    HealthDataType.DISTANCE_WALKING_RUNNING,
    HealthDataType.ACTIVE_ENERGY_BURNED,
  ];

  @override
  void initState() {
    super.initState();
    _log('INIT build=$_buildTag');
  }

  void _log(String m) {
    if (!mounted) return;
    setState(() {
      _logLines.insert(0, '${DateTime.now().toIso8601String().substring(11,19)} $m');
      if (_logLines.length > 120) _logLines.removeRange(120, _logLines.length);
    });
  }

  void _setStatus(String s) {
    if (!mounted) return;
    setState(() => _status = s);
    _log('STATUS: $s');
  }

  Future<bool> _ensureRuntimePermissions() async {
    if (!Platform.isAndroid) return true;
    final status = await Permission.activityRecognition.status;
    if (status.isGranted) return true;
    _setStatus('Requesting activity recognition...');
    final req = await Permission.activityRecognition.request();
    if (req.isGranted) return true;
    if (req.isPermanentlyDenied) {
      setState(() { _error = 'Activity Recognition permanently denied. Open system settings.'; });
    } else {
      setState(() { _error = 'Activity Recognition denied.'; });
    }
    return false;
  }

  Future<void> _refreshPerms() async {
    try {
      _overall = (await _health.hasPermissions(_types, permissions: _types.map((_) => HealthDataAccess.READ).toList())) ?? false;
      _permSteps = (await _health.hasPermissions([HealthDataType.STEPS], permissions: [HealthDataAccess.READ])) ?? false;
      _permDistance = (await _health.hasPermissions([HealthDataType.DISTANCE_WALKING_RUNNING], permissions: [HealthDataAccess.READ])) ?? false;
      _permEnergy = (await _health.hasPermissions([HealthDataType.ACTIVE_ENERGY_BURNED], permissions: [HealthDataAccess.READ])) ?? false;
    } catch (e) { _log('perm probe error: $e'); }
    if (mounted) setState(() {});
  }

  Future<void> _authFlow() async {
    if (_fetching) return;
    _error = null;
    _setStatus('Starting authorization flow...');
    _authAttempts++;
    setState(() => _fetching = true);
    try {
      if (!await _ensureRuntimePermissions()) { await _refreshPerms(); return; }
      await _refreshPerms();
      if (_overall) {
        _authorized = true; _setStatus('Already authorized.'); await _fetchAll(); return; }
      _setStatus('Requesting all permissions...');
      final allOk = await _health.requestAuthorization(_types, permissions: _types.map((_) => HealthDataAccess.READ).toList());
      _log('Full request => $allOk');
      if (!allOk) {
        _setStatus('All failed -> request steps only');
        final stepsOk = await _health.requestAuthorization([HealthDataType.STEPS], permissions: [HealthDataAccess.READ]);
        _log('Steps only => $stepsOk');
        if (!stepsOk) { _error = 'Steps permission denied.'; await _refreshPerms(); return; }
        for (final t in [HealthDataType.DISTANCE_WALKING_RUNNING, HealthDataType.ACTIVE_ENERGY_BURNED]) {
          final extra = await _health.requestAuthorization([t], permissions: [HealthDataAccess.READ]);
          _log('Extra $t => $extra');
        }
      }
      await _refreshPerms();
      _authorized = _permSteps || _overall;
      if (!_authorized) { _error = 'No usable permission granted.'; return; }
      await _fetchAll();
    } catch (e) { _error = 'Authorization error: $e'; _log('Auth exception: $e'); }
    finally {
      _maybeShowOAuthHelp();
      if (mounted) setState(() => _fetching = false);
    }
  }

  /// Deep probe: request each type one by one and log the outcome.
  /// Helps distinguish between: (a) Google Fit not installed, (b) user denied, (c) plugin/platform issue.
  Future<void> _deepProbeAuth() async {
    if (_fetching) return;
    _authAttempts++;
    _log('--- Deep Probe Start ---');
    setState(() => _fetching = true);
    try {
      if (!await _ensureRuntimePermissions()) { _log('Runtime permission missing; abort deep probe.'); return; }
      for (final t in _types) {
        _log('Probe request for $t ...');
        final ok = await _health.requestAuthorization([t], permissions: [HealthDataAccess.READ]);
        _log('Probe result $t => $ok');
      }
      await _refreshPerms();
      if ((_permSteps || _overall) && !_authorized) {
        _authorized = true; await _fetchAll();
      }
    } catch (e) { _log('Deep probe error: $e'); }
    finally { _maybeShowOAuthHelp(); if (mounted) setState(() => _fetching = false); _log('--- Deep Probe End ---'); }
  }

  void _maybeShowOAuthHelp() {
    // Show guidance card if after at least 2 attempts we still have zero permissions.
    if (_authorized) return;
    final none = !_permSteps && !_permDistance && !_permEnergy;
    if (none && _authAttempts >= 2) {
      _showOAuthHelp = true;
    }
  }

  Future<void> _openAppSettingsWrapper() async {
    await openAppSettings();
  }

  Future<void> _openGoogleFitStore() async {
    final uri = Uri.parse('https://play.google.com/store/apps/details?id=com.google.android.apps.fitness');
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  Widget _oauthHelpCard() {
    if (!_showOAuthHelp) return const SizedBox.shrink();
    return Container(
      margin: const EdgeInsets.only(bottom:24),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.redAccent.withOpacity(.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.redAccent.withOpacity(.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children:[
          const Text('Authorization Help', style: TextStyle(fontWeight: FontWeight.w600, color: Colors.white)),
          const SizedBox(height:8),
          const Text('- Open Google Fit, ensure you are signed in.\n- Verify Fitness API enabled (Cloud Console).\n- Confirm Android OAuth client package & SHA-1 match.\n- Remove previous connection inside Google Fit (Profile > Settings > Manage connected apps) then retry.', style: TextStyle(fontSize:12, color: Colors.white70, height:1.35)),
          const SizedBox(height:12),
          Wrap(spacing:8, runSpacing:8, children: [
            OutlinedButton(onPressed: _openAppSettingsWrapper, child: const Text('App Settings')),
            OutlinedButton(onPressed: _openGoogleFitStore, child: const Text('Google Fit')),
            OutlinedButton(onPressed: _authFlow, child: const Text('Retry Auth')),
          ])
        ],
      ),
    );
  }

  Future<void> _fetchAll() async {
    _setStatus('Fetching today data...');
    try {
      final now = DateTime.now();
      final start = DateTime(now.year, now.month, now.day);
      if (_permSteps) {
        try { _steps = (await _health.getTotalStepsInInterval(start, now)) ?? 0; _log('Steps=$_steps'); } catch (e) { _log('steps error: $e'); }
      }
      if (_permDistance) {
        try {
          final d = await _health.getHealthDataFromTypes(
            startTime: start,
            endTime: now,
            types: const [HealthDataType.DISTANCE_WALKING_RUNNING],
          );
          double sum = 0; for (final r in d) { if (r.value is double) sum += (r.value as double); }
          _distanceKm = sum / 1000.0; _log('DistanceKm=${_distanceKm.toStringAsFixed(2)}');
        } catch (e) { _log('distance err: $e'); }
      }
      if (_permEnergy) {
        try {
          final d = await _health.getHealthDataFromTypes(
            startTime: start,
            endTime: now,
            types: const [HealthDataType.ACTIVE_ENERGY_BURNED],
          );
          double sum = 0; for (final r in d) { if (r.value is double) sum += (r.value as double); }
          _activeEnergy = sum; _log('Energy=$_activeEnergy');
        } catch (e) { _log('energy err: $e'); }
      }
      await _fetchHistory();
      if (_permSteps) { _log('Daily steps challenge sync placeholder'); }
      setState(() {});
    } catch (e) { _error = 'Fetch error: $e'; _log('Fetch exception: $e'); }
  }

  Future<void> _fetchHistory() async {
    _history.clear();
    try {
      final now = DateTime.now();
      for (int i = 6; i >= 0; i--) {
        final dayStart = DateTime(now.year, now.month, now.day).subtract(Duration(days: i));
        final dayEnd = dayStart.add(const Duration(days: 1));
        int steps = 0; try { steps = (await _health.getTotalStepsInInterval(dayStart, dayEnd)) ?? 0; } catch (_) {}
        _history.add(_DailyStep(date: dayStart, steps: steps));
      }
    } catch (e) { _log('history err: $e'); }
  }

  void _manualAddSteps() { setState(() { _steps += 250; }); _log('Manual +250 => $_steps'); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.redAccent,
        title: const Text('Daily Health Metrics'),
        actions: [
          IconButton(onPressed: () => setState(() => _showDebug = !_showDebug), icon: Icon(_showDebug ? Icons.bug_report : Icons.bug_report_outlined)),
          IconButton(onPressed: _authorized ? _fetchAll : _authFlow, icon: const Icon(Icons.refresh))
        ],
      ),
      body: Column(
        children: [
          _diagBar(),
          if (_showDebug) _debugPanel(),
          Expanded(child: _fetching ? const Center(child: CircularProgressIndicator(color: Colors.redAccent)) : (_authorized ? _content() : _denied())),
        ],
      ),
      floatingActionButton: !_authorized ? FloatingActionButton.extended(onPressed: _authFlow, label: const Text('Grant'), icon: const Icon(Icons.lock_open), backgroundColor: Colors.redAccent) : null,
    );
  }

  Widget _diagBar() {
    final t = 'Diag build=$_buildTag auth=$_authorized overall=${_overall? 'Y':'N'} steps=${_permSteps? 'Y':'N'} dist=${_permDistance? 'Y':'N'} energy=${_permEnergy? 'Y':'N'}';
    return Container(padding: const EdgeInsets.all(10), margin: const EdgeInsets.fromLTRB(16,16,16,8), decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.redAccent.withOpacity(.35))), child: Align(alignment: Alignment.centerLeft, child: Text(t, style: const TextStyle(fontSize: 11, fontFamily: 'monospace', color: Colors.white70))));
  }

  Widget _debugPanel() {
    final hint = (!_permSteps && !_permDistance && !_permEnergy)
        ? 'All health data permissions currently false. If Google Fit never prompted, open Fit app once, ensure you are signed in, then press Deep Probe.'
        : null;
    // Google Sign-In debug helper removed temporarily.
    return Container(
      margin: const EdgeInsets.fromLTRB(16,0,16,12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade900,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.redAccent.withOpacity(.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Debug Log', style: TextStyle(color: Colors.white70, fontWeight: FontWeight.w600)),
          if (hint != null) Padding(padding: const EdgeInsets.only(top:6,bottom:4), child: Text(hint, style: const TextStyle(color: Colors.orangeAccent, fontSize:11))),
          const SizedBox(height:8),
          SizedBox(
            height:120,
            child: ListView.builder(
              reverse:true,
              itemCount:_logLines.length,
              itemBuilder:(_,i)=>Text(_logLines[i], style: const TextStyle(fontSize:11,color: Colors.white54)),
            ),
          ),
            const SizedBox(height:8),
          Wrap(
            spacing:8,
            children:[
              OutlinedButton(onPressed:(){_logLines.clear(); setState((){});}, child: const Text('Clear')),
              OutlinedButton(onPressed:_refreshPerms, child: const Text('Probe Perms')),
              OutlinedButton(onPressed:_authFlow, child: const Text('Re-Auth')),
              OutlinedButton(onPressed:_deepProbeAuth, child: const Text('Deep Probe')),
              // Google Sign-In button removed.
            ],
          )
        ],
      ),
    );
  }

  Widget _metric(String label, String value, IconData icon) {
    return Container(padding: const EdgeInsets.all(16), margin: const EdgeInsets.only(bottom:16), decoration: BoxDecoration(color: Colors.grey.shade900, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.redAccent.withOpacity(.25))), child: Row(children:[CircleAvatar(backgroundColor: Colors.redAccent.withOpacity(.18), child: Icon(icon,color: Colors.redAccent)), const SizedBox(width:14), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[Text(label, style: const TextStyle(color: Colors.white70, fontSize:13, fontWeight: FontWeight.w500)), const SizedBox(height:4), Text(value, style: const TextStyle(color: Colors.white, fontSize:22, fontWeight: FontWeight.bold))]))]));
  }

  Widget _historyStrip() {
    if (_history.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children:[
        const Padding(
          padding: EdgeInsets.only(left:4,bottom:8, top:8),
          child: Text('Past 7 Days', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
        ),
        Row(
          children:_history.map((h)=>Expanded(
            child: Column(
              children:[
                Container(
                  height:50,
                  margin: const EdgeInsets.symmetric(horizontal:3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E1E1E), // replaced shade850
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.redAccent.withOpacity(.25)),
                  ),
                  child: Center(child: Text(h.steps.toString(), style: const TextStyle(fontSize:11,color: Colors.white,fontWeight: FontWeight.w600))),
                ),
                const SizedBox(height:4),
                Text(DateFormat('E').format(h.date), style: const TextStyle(fontSize:11,color: Colors.white54))
              ],
            ),
          )).toList(),
        )
      ],
    );
  }

  Widget _content() {
    return SingleChildScrollView(padding: const EdgeInsets.fromLTRB(20,0,20,40), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[_metric('Steps Today', _steps.toString(), Icons.directions_walk), _metric('Distance', _permDistance? '${_distanceKm.toStringAsFixed(2)} km':'— (no perm)', Icons.route), _metric('Active Energy', _permEnergy? '${_activeEnergy.toStringAsFixed(0)} kcal':'— (no perm)', Icons.local_fire_department), _historyStrip(), const SizedBox(height:20), if (_status.isNotEmpty) Text(_status, style: const TextStyle(fontSize:12.5,color: Colors.white54)), const SizedBox(height:12), Center(child: OutlinedButton.icon(onPressed:_fetchAll, icon: const Icon(Icons.refresh), label: const Text('Refresh Data'), style: OutlinedButton.styleFrom(foregroundColor: Colors.redAccent, side: const BorderSide(color: Colors.redAccent)))), const SizedBox(height:32)]));
  }

  Widget _denied() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children:[
            _oauthHelpCard(),
            const Icon(Icons.error_outline,color: Colors.redAccent,size:70),
            const SizedBox(height:16),
            Text(_error ?? 'Permissions denied', textAlign: TextAlign.center, style: const TextStyle(color: Colors.white70)),
            const SizedBox(height:24),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal:32, vertical:14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
              ),
              onPressed:_authFlow,
              icon: const Icon(Icons.lock_open),
              label: const Text('Grant Permissions'),
            ),
            const SizedBox(height:12),
            TextButton(onPressed:_authFlow, child: const Text('Try Again', style: TextStyle(color: Colors.redAccent))),
            const SizedBox(height:4),
            TextButton(onPressed:_openAppSettingsWrapper, child: const Text('Open App Settings', style: TextStyle(color: Colors.white54, fontSize:12))),
            const SizedBox(height:20),
            TextButton(onPressed:_manualAddSteps, child: const Text('Temp +250 Steps (Dev)', style: TextStyle(color: Colors.white38, fontSize:11))),
          ],
        ),
      ),
    );
  }
}

class _DailyStep { final DateTime date; final int steps; _DailyStep({required this.date, required this.steps}); }
