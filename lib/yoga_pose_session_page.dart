import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'asset_resolver.dart';
import 'yoga_service.dart';

class YogaPoseSessionPage extends StatefulWidget {
  final Map<String, dynamic> pose;

  const YogaPoseSessionPage({super.key, required this.pose});

  @override
  State<YogaPoseSessionPage> createState() => _YogaPoseSessionPageState();
}

class _YogaPoseSessionPageState extends State<YogaPoseSessionPage> {
  final YogaService _yogaService = YogaService(FirebaseAuth.instance.currentUser?.uid);
  // Removed unused DatabaseService instance (not referenced in this session page)

  late int duration;
  late int remaining;
  bool isRunning = false;
  bool isCompleted = false;

  // Music player state
  final AudioPlayer _player = AudioPlayer();
  List<String> _tracks = [];
  int _currentTrackIndex = 0;
  PlayerState _playerState = PlayerState.stopped;
  Duration _trackPosition = Duration.zero;
  Duration _trackDuration = Duration.zero;
  double _volume = 0.4;
  bool _shuffle = false;
  RepeatMode _repeat = RepeatMode.off;

  String get _prefsPrefix {
    final uid = FirebaseAuth.instance.currentUser?.uid ?? 'anon';
    return 'music_$uid';
  }

  @override
  void initState() {
    super.initState();
    duration = widget.pose['duration'] ?? 30;
    remaining = duration;
    _initMusic();
  }

  Future<void> _initMusic() async {
    await AssetResolver.init();
    await _loadPrefs();
    // Discover bundled music assets
    final assets = AssetResolver.list(prefix: 'assets/data/music/', extensions: ['.mp3', '.m4a', '.aac', '.wav']);
    setState(() {
      _tracks = assets;
      if (_tracks.isNotEmpty) {
        if (_currentTrackIndex < 0 || _currentTrackIndex >= _tracks.length) {
          _currentTrackIndex = 0;
        }
      }
    });

    // Wire listeners
    _player.onPlayerStateChanged.listen((s) {
      if (!mounted) return;
      setState(() => _playerState = s);
    });
    _player.onDurationChanged.listen((d) {
      if (!mounted) return;
      setState(() => _trackDuration = d);
    });
    _player.onPositionChanged.listen((p) {
      if (!mounted) return;
      setState(() => _trackPosition = p);
    });
    _player.onPlayerComplete.listen((_) => _handleTrackComplete());

    // Prepare selected track and start playing based on prefs
    if (_tracks.isNotEmpty) {
      await _applyReleaseMode();
      await _player.setSource(AssetSource(_assetSourceForIndex(_currentTrackIndex)));
      await _player.setVolume(_volume);
      await _player.resume();
    }
  }

  Future<void> _loadPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    _currentTrackIndex = prefs.getInt('$_prefsPrefix.trackIndex') ?? 0;
    _volume = prefs.getDouble('$_prefsPrefix.volume') ?? 0.4;
    _shuffle = prefs.getBool('$_prefsPrefix.shuffle') ?? false;
    final rep = prefs.getString('$_prefsPrefix.repeat') ?? 'off';
    _repeat = RepeatModeX.fromString(rep);
  }

  Future<void> _savePrefs() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('$_prefsPrefix.trackIndex', _currentTrackIndex);
    await prefs.setDouble('$_prefsPrefix.volume', _volume);
    await prefs.setBool('$_prefsPrefix.shuffle', _shuffle);
    await prefs.setString('$_prefsPrefix.repeat', _repeat.name);
  }

  void _startTimer() {
    if (isRunning || remaining == 0) return;
    setState(() => isRunning = true);

    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return false;

      setState(() {
        if (remaining > 0) {
          remaining--;
        }
      });

      if (remaining == 0) {
        setState(() {
          isRunning = false;
          isCompleted = true;
        });
        _completeSession();
        return false;
      }
      return isRunning;
    });
  }

  void _pauseTimer() {
    setState(() => isRunning = false);
    // Fade music slightly when paused
    _player.setVolume((_volume * 0.5).clamp(0.0, 1.0));
  }

  void _resetTimer() {
    setState(() {
      remaining = duration;
      isRunning = false;
      isCompleted = false;
    });
    _player.seek(Duration.zero);
    _player.setVolume(_volume);
  }

  Future<void> _completeSession() async {
    try {
      final poseId = _yogaService.yogaPoses.entries
          .firstWhere((entry) => entry.value == widget.pose)
          .key;

      await _yogaService.saveCompletedYogaSession(poseId, duration);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${widget.pose['name']} session completed!'),
            backgroundColor: Colors.green,
          ),
        );
      }
      // Fade out music on completion
      await _player.setVolume(0.0);
      await _player.stop();
    } catch (e) {
      print('Error completing session: $e');
    }
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  String _currentTitle() {
    if (_tracks.isEmpty) return 'No Music';
    final file = _tracks[_currentTrackIndex].split('/').last;
    return file.replaceAll(RegExp(r'\.(mp3|m4a|aac|wav)$', caseSensitive: false), '');
  }

  Future<void> _playIndex(int i) async {
    if (_tracks.isEmpty) return;
    _currentTrackIndex = (i % _tracks.length + _tracks.length) % _tracks.length;
    final assetPath = _tracks[_currentTrackIndex].replaceFirst('assets/', '');
    await _player.setSource(AssetSource(assetPath));
    await _player.resume();
  }

  Future<void> _togglePlayPause() async {
    if (_playerState == PlayerState.playing) {
      await _player.pause();
    } else {
      if (_tracks.isEmpty) return;
      if (_playerState == PlayerState.stopped) {
        await _playIndex(_currentTrackIndex);
      } else {
        await _player.resume();
      }
    }
  }

  Future<void> _next() => _playIndex(_nextIndex());
  Future<void> _prev() => _playIndex(_prevIndex());

  int _nextIndex() {
    if (_tracks.isEmpty) return 0;
    if (_shuffle) {
      if (_tracks.length == 1) return _currentTrackIndex;
      int r;
      do {
        r = (DateTime.now().microsecondsSinceEpoch % _tracks.length);
      } while (r == _currentTrackIndex);
      return r;
    }
    final next = _currentTrackIndex + 1;
    if (next >= _tracks.length) {
      return _repeat == RepeatMode.all ? 0 : _currentTrackIndex;
    }
    return next;
  }

  int _prevIndex() {
    if (_tracks.isEmpty) return 0;
    if (_shuffle) {
      if (_tracks.length == 1) return _currentTrackIndex;
      int r;
      do {
        r = (DateTime.now().millisecondsSinceEpoch % _tracks.length);
      } while (r == _currentTrackIndex);
      return r;
    }
    final prev = _currentTrackIndex - 1;
    if (prev < 0) {
      return _repeat == RepeatMode.all ? _tracks.length - 1 : _currentTrackIndex;
    }
    return prev;
  }

  Future<void> _handleTrackComplete() async {
    if (_repeat == RepeatMode.one) {
      await _player.seek(Duration.zero);
      await _player.resume();
      return;
    }
    final ni = _nextIndex();
    if (ni == _currentTrackIndex && _repeat == RepeatMode.off && !_shuffle) {
      // End of list, no repeat: stop playback.
      await _player.stop();
      return;
    }
    await _playIndex(ni);
  }

  String _assetSourceForIndex(int index) => _tracks[index].replaceFirst('assets/', '');

  Future<void> _applyReleaseMode() async {
    if (_repeat == RepeatMode.one) {
      await _player.setReleaseMode(ReleaseMode.loop);
    } else {
      await _player.setReleaseMode(ReleaseMode.stop);
    }
  }

  Future<void> _toggleShuffle() async {
    setState(() => _shuffle = !_shuffle);
    await _savePrefs();
  }

  Future<void> _cycleRepeat() async {
    setState(() => _repeat = _repeat.next());
    await _applyReleaseMode();
    await _savePrefs();
  }

  Future<void> _pickTrack() async {
    if (_tracks.isEmpty) return;
    final selected = await showModalBottomSheet<int>(
      context: context,
      backgroundColor: Colors.black,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                child: const Text('Choose a track', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              ),
              Flexible(
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: _tracks.length,
                  itemBuilder: (context, index) {
                    final title = _tracks[index].split('/').last.replaceAll(RegExp(r'\.(mp3|m4a|aac|wav)$', caseSensitive: false), '');
                    final isSel = index == _currentTrackIndex;
                    return ListTile(
                      leading: Icon(isSel ? Icons.radio_button_checked : Icons.radio_button_off, color: isSel ? Colors.red : Colors.white54),
                      title: Text(title, style: const TextStyle(color: Colors.white)),
                      onTap: () => Navigator.of(context).pop(index),
                    );
                  },
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        );
      },
    );
    if (selected != null) {
      await _playIndex(selected);
    }
  }

  @override
  Widget build(BuildContext context) {
    final benefits = List<String>.from(widget.pose['benefits'] ?? []);
    final instructions = List<String>.from(widget.pose['instructions'] ?? []);
    final imagePath = widget.pose['imagePath'];

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text(widget.pose['name'] ?? 'Yoga Pose'),
        backgroundColor: Colors.black,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          // Music Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(color: Colors.grey.shade900, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 6)]),
            child: Row(
              children: [
                const Icon(Icons.music_note, color: Colors.red),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _currentTitle(),
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (_trackDuration.inMilliseconds > 0)
                        Slider(
                          value: _trackPosition.inMilliseconds.clamp(0, _trackDuration.inMilliseconds).toDouble(),
                          max: _trackDuration.inMilliseconds.toDouble(),
                          onChanged: (v) async {
                            await _player.seek(Duration(milliseconds: v.toInt()));
                          },
                          activeColor: Colors.red,
                          inactiveColor: Colors.white24,
                        ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.skip_previous, color: Colors.white),
                  onPressed: _tracks.length > 1 ? _prev : null,
                ),
                IconButton(
                  icon: Icon(_playerState == PlayerState.playing ? Icons.pause : Icons.play_arrow, color: Colors.white),
                  onPressed: _togglePlayPause,
                ),
                IconButton(
                  icon: const Icon(Icons.skip_next, color: Colors.white),
                  onPressed: _tracks.length > 1 ? _next : null,
                ),
                IconButton(
                  tooltip: 'Shuffle',
                  icon: Icon(Icons.shuffle, color: _shuffle ? Colors.red : Colors.white70),
                  onPressed: _toggleShuffle,
                ),
                IconButton(
                  tooltip: 'Repeat',
                  icon: Icon(_repeat.icon, color: _repeat == RepeatMode.off ? Colors.white70 : Colors.red),
                  onPressed: _cycleRepeat,
                ),
                IconButton(
                  tooltip: 'Pick Track',
                  icon: const Icon(Icons.queue_music, color: Colors.white),
                  onPressed: _pickTrack,
                ),
              ],
            ),
          ),
          // Pose Image
          if (imagePath != null)
            Container(
              height: 250,
              width: double.infinity,
              decoration: const BoxDecoration(
                color: Colors.grey,
              ),
              child: Image.asset(
                imagePath,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: Colors.grey.shade800,
                    child: const Icon(
                      Icons.image_not_supported,
                      color: Colors.red,
                      size: 64,
                    ),
                  );
                },
              ),
            ),

          // Timer Section
          Container(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Text(
                  '${remaining.toString().padLeft(2, '0')}:00',
                  style: const TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                      icon: Icon(
                        isRunning ? Icons.pause : Icons.play_arrow,
                        color: Colors.red,
                        size: 40,
                      ),
                      onPressed: isCompleted ? null : (isRunning ? _pauseTimer : _startTimer),
                    ),
                    const SizedBox(width: 16),
                    IconButton(
                      icon: const Icon(
                        Icons.refresh,
                        color: Colors.white,
                        size: 40,
                      ),
                      onPressed: _resetTimer,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                if (isCompleted)
                  const Text(
                    'Session Completed!',
                    style: TextStyle(
                      color: Colors.green,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
              ],
            ),
          ),

          // Instructions Section
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(16),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Instructions:',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ...instructions.asMap().entries.map((entry) {
                      final stepNumber = entry.key + 1;
                      final instruction = entry.value;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '$stepNumber.',
                              style: const TextStyle(
                                color: Colors.red,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                instruction,
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    }),

                    if (benefits.isNotEmpty) ...[
                      const SizedBox(height: 24),
                      const Text(
                        'Benefits:',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: benefits.map((benefit) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.green.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.green.withOpacity(0.3)),
                            ),
                            child: Text(
                              benefit,
                              style: const TextStyle(
                                color: Colors.green,
                                fontSize: 14,
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),

          // Bottom Action Button
          Container(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: isCompleted
                    ? () => Navigator.pop(context)
                    : null,
                icon: const Icon(Icons.check, color: Colors.white),
                label: const Text('Complete Session'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: isCompleted ? Colors.green : Colors.grey,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

enum RepeatMode { off, one, all }

extension RepeatModeX on RepeatMode {
  RepeatMode next() {
    switch (this) {
      case RepeatMode.off:
        return RepeatMode.one;
      case RepeatMode.one:
        return RepeatMode.all;
      case RepeatMode.all:
        return RepeatMode.off;
    }
  }

  String get name => toString().split('.').last;

  static RepeatMode fromString(String v) {
    switch (v) {
      case 'one':
        return RepeatMode.one;
      case 'all':
        return RepeatMode.all;
      default:
        return RepeatMode.off;
    }
  }

  IconData get icon {
    switch (this) {
      case RepeatMode.off:
        return Icons.repeat;
      case RepeatMode.one:
        return Icons.repeat_one;
      case RepeatMode.all:
        return Icons.repeat;
    }
  }
}
