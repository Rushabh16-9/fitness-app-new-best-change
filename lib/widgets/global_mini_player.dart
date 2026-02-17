import 'package:flutter/material.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:provider/provider.dart';
import '../services/music_service.dart';
import '../music_playlist_page.dart';

class GlobalMiniPlayer extends StatelessWidget {
  const GlobalMiniPlayer({super.key});

  @override
  Widget build(BuildContext context) {
    final music = context.watch<MusicService>();
    if (!music.hasTracks || music.currentIndex == -1) return const SizedBox.shrink();

    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(14),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const MusicPlaylistPage()),
            ),
            child: Container(
              height: 56,
              decoration: BoxDecoration(
                color: Colors.white12,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white10),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Row(
                children: [
                  const Icon(Icons.music_note, color: Colors.white70),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      music.currentTitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: Colors.white),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.skip_previous, color: Colors.white),
                    onPressed: music.prev,
                  ),
                  IconButton(
                    icon: Icon(
                      music.playerState == PlayerState.playing ? Icons.pause : Icons.play_arrow,
                      color: Colors.white,
                    ),
                    onPressed: music.playPause,
                  ),
                  IconButton(
                    icon: const Icon(Icons.skip_next, color: Colors.white),
                    onPressed: music.next,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}