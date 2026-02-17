import 'dart:convert';
import 'package:audioplayers/audioplayers.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:shared_preferences/shared_preferences.dart';

enum RepeatMode { off, one, all }

class MusicStatus {
  final List<String> tracks;
  final int index;
  final PlayerState state;
  final Duration position;
  final Duration duration;

  const MusicStatus({
    required this.tracks,
    required this.index,
    required this.state,
    required this.position,
    required this.duration,
  });

  bool get hasTracks => tracks.isNotEmpty;
  bool get isPlaying => state == PlayerState.playing;

  String get title {
    if (index < 0 || index >= tracks.length) return 'Nothing playing';
    return tracks[index].split('/').last;
  }
}

class MusicService extends ChangeNotifier {
  MusicService._();
  static final MusicService I = MusicService._();

  // Player
  final AudioPlayer _player = AudioPlayer();

  // Public status for UI (no Provider needed)
  final ValueNotifier<MusicStatus> _statusNotifier = ValueNotifier<MusicStatus>(
    const MusicStatus(
      tracks: <String>[],
      index: -1,
      state: PlayerState.stopped,
      position: Duration.zero,
      duration: Duration.zero,
    ),
  );
  ValueListenable<MusicStatus> get status => _statusNotifier;

  // Internal state
  final List<String> _tracks = [];
  int _currentTrackIndex = 0;
  PlayerState _playerState = PlayerState.stopped;
  Duration _trackPosition = Duration.zero;
  Duration _trackDuration = Duration.zero;
  double _volume = 0.5;
  bool _shuffle = false;
  RepeatMode _repeat = RepeatMode.off;

  // Ducking
  bool _isDucked = false;
  double? _preDuckVolume;

  // Lifecycle
  bool _bound = false;
  bool _initialized = false;

  Future<void> ensureLoaded() async {
    if (!_initialized) {
      await _init();
      _initialized = true;
    }
  }

  // Getters for non-ValueListenable UIs (optional)
  List<String> get tracks => _tracks;
  int get currentIndex => _currentTrackIndex;
  PlayerState get playerState => _playerState;
  Duration get position => _trackPosition;
  Duration get duration => _trackDuration;
  double get volume => _volume;
  bool get shuffle => _shuffle;
  RepeatMode get repeat => _repeat;
  bool get hasTracks => _tracks.isNotEmpty;
  String get currentTitle =>
      _tracks.isEmpty ? 'No Music' : _tracks[_currentTrackIndex].split('/').last;

  // Init
  Future<void> _init() async {
    await _loadPrefs();
    await _loadTracksFromManifest();
    _bindPlayer();
    await _player.setVolume(_volume);
    await _applyReleaseMode();
  }

  String get _prefsPrefix {
    final uid = FirebaseAuth.instance.currentUser?.uid ?? 'anon';
    return 'music_$uid';
  }

  Future<void> _loadPrefs() async {
    final p = await SharedPreferences.getInstance();
    _currentTrackIndex = p.getInt('$_prefsPrefix.trackIndex') ?? 0;
    _volume = p.getDouble('$_prefsPrefix.volume') ?? 0.5;
    _shuffle = p.getBool('$_prefsPrefix.shuffle') ?? false;
    final rep = p.getString('$_prefsPrefix.repeat') ?? 'off';
    _repeat = _repeatFromString(rep);
  }

  Future<void> _savePrefs() async {
    final p = await SharedPreferences.getInstance();
    await p.setInt('$_prefsPrefix.trackIndex', _currentTrackIndex);
    await p.setDouble('$_prefsPrefix.volume', _volume);
    await p.setBool('$_prefsPrefix.shuffle', _shuffle);
    await p.setString('$_prefsPrefix.repeat', _repeat.name);
  }

  void _bindPlayer() {
    if (_bound) return;
    _bound = true;
    _player.onPlayerStateChanged.listen((s) {
      _playerState = s;
      _statusNotifier.value = MusicStatus(
        tracks: _tracks,
        index: _currentTrackIndex,
        state: s,
        position: _trackPosition,
        duration: _trackDuration,
      );
      notifyListeners();
    });
    _player.onDurationChanged.listen((d) {
      _trackDuration = d;
      _statusNotifier.value = MusicStatus(
        tracks: _tracks,
        index: _currentTrackIndex,
        state: _playerState,
        position: _trackPosition,
        duration: d,
      );
      notifyListeners();
    });
    _player.onPositionChanged.listen((p) {
      _trackPosition = p;
      _statusNotifier.value = MusicStatus(
        tracks: _tracks,
        index: _currentTrackIndex,
        state: _playerState,
        position: p,
        duration: _trackDuration,
      );
    });
    _player.onPlayerComplete.listen((_) => _handleTrackComplete());
  }

  Future<void> _loadTracksFromManifest() async {
    final manifest = await rootBundle.loadString('AssetManifest.json');
    final Map<String, dynamic> map = json.decode(manifest);
    final list = map.keys
        .where((k) {
          final l = k.toLowerCase();
          return k.startsWith('assets/data/music/') &&
              (l.endsWith('.mp3') ||
                  l.endsWith('.m4a') ||
                  l.endsWith('.aac') ||
                  l.endsWith('.wav') ||
                  l.endsWith('.ogg'));
        })
        .toList()
      ..sort();
    _tracks.clear();
    _tracks.addAll(list);
    _statusNotifier.value = MusicStatus(
      tracks: _tracks,
      index: _currentTrackIndex.clamp(0, _tracks.length - 1),
      state: _playerState,
      position: _trackPosition,
      duration: _trackDuration,
    );
    notifyListeners();
  }

  Future<void> playPause() async {
    if (_playerState == PlayerState.playing) {
      await _player.pause();
    } else {
      if (_tracks.isEmpty) return;
      if (_playerState == PlayerState.stopped) {
        await _setSource(_currentTrackIndex);
      }
      await _player.resume();
    }
  }

  Future<void> playIndex(int i) async {
    if (_tracks.isEmpty) return;
    _currentTrackIndex = (i % _tracks.length + _tracks.length) % _tracks.length;
    await _savePrefs();
    await _setSource(_currentTrackIndex);
    await _player.resume();
    _statusNotifier.value = MusicStatus(
      tracks: _tracks,
      index: _currentTrackIndex,
      state: PlayerState.playing,
      position: Duration.zero,
      duration: _trackDuration,
    );
    notifyListeners();
  }

  Future<void> next() => playIndex(_nextIndex());
  Future<void> previous() => playIndex(_prevIndex());

  Future<void> seekTo(Duration d) => _player.seek(d);

  Future<void> setVolume(double v) async {
    final newVol = v.clamp(0.0, 1.0);
    if (_isDucked) {
      _preDuckVolume = newVol;
    } else {
      _volume = newVol;
      await _player.setVolume(_volume);
      await _savePrefs();
    }
    notifyListeners();
  }

  Future<void> duck(bool enable) async {
    try {
      if (enable) {
        if (_isDucked) return;
        _preDuckVolume = _volume;
        _isDucked = true;
        final duckVol = (_volume * 0.25).clamp(0.0, 1.0);
        await _player.setVolume(duckVol);
        notifyListeners();
      } else {
        if (!_isDucked) return;
        final restore = (_preDuckVolume ?? _volume).clamp(0.0, 1.0);
        _isDucked = false;
        _preDuckVolume = null;
        await _player.setVolume(restore);
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> toggleShuffle() async {
    _shuffle = !_shuffle;
    await _savePrefs();
    notifyListeners();
  }

  Future<void> cycleRepeat() async {
    switch (_repeat) {
      case RepeatMode.off:
        _repeat = RepeatMode.one;
        break;
      case RepeatMode.one:
        _repeat = RepeatMode.all;
        break;
      case RepeatMode.all:
        _repeat = RepeatMode.off;
        break;
    }
    await _applyReleaseMode();
    await _savePrefs();
    notifyListeners();
  }

  Future<void> stop() async {
    await _player.stop();
  }

  Future<void> playAssetPath(String assetPath, {bool loop = false}) async {
    if (assetPath.isEmpty) return;
    final src = assetPath.replaceFirst('assets/', '');
    await _player.setSource(AssetSource(src));
    await _player.setVolume(_volume);
    if (loop) {
      await _player.setReleaseMode(ReleaseMode.loop);
    } else {
      await _player.setReleaseMode(ReleaseMode.stop);
    }
    await _player.resume();
  }

  // Internals
  Future<void> _setSource(int index) async {
    if (_tracks.isEmpty || index < 0 || index >= _tracks.length) return;
    final src = _tracks[index].replaceFirst('assets/', '');
    await _player.setSource(AssetSource(src));
  }

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
      await _player.stop();
      return;
    }
    await playIndex(ni);
  }

  Future<void> _applyReleaseMode() async {
    if (_repeat == RepeatMode.one) {
      await _player.setReleaseMode(ReleaseMode.loop);
    } else {
      await _player.setReleaseMode(ReleaseMode.stop);
    }
  }

  RepeatMode _repeatFromString(String v) {
    switch (v) {
      case 'one':
        return RepeatMode.one;
      case 'all':
        return RepeatMode.all;
      default:
        return RepeatMode.off;
    }
  }
}
