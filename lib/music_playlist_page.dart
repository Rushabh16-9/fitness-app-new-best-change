import 'package:flutter/material.dart';
import 'services/music_service.dart';

class MusicPlaylistPage extends StatefulWidget {
  const MusicPlaylistPage({super.key});

  @override
  State<MusicPlaylistPage> createState() => _MusicPlaylistPageState();
}

class _MusicPlaylistPageState extends State<MusicPlaylistPage> {
  @override
  void initState() {
    super.initState();
    MusicService.I.ensureLoaded();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Music', style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: ValueListenableBuilder<MusicStatus>(
        valueListenable: MusicService.I.status,
        builder: (context, s, _) {
          return Column(
            children: [
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white12,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.music_note, color: Colors.white70, size: 48),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          s.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                        ),
                      ),
                      IconButton(
                        onPressed: MusicService.I.previous,
                        icon: const Icon(Icons.skip_previous, color: Colors.white),
                      ),
                      IconButton(
                        onPressed: MusicService.I.playPause,
                        icon: Icon(
                          s.isPlaying ? Icons.pause_circle_filled : Icons.play_circle_fill,
                          color: Colors.white,
                          size: 32,
                        ),
                      ),
                      IconButton(
                        onPressed: MusicService.I.next,
                        icon: const Icon(Icons.skip_next, color: Colors.white),
                      ),
                    ],
                  ),
                ),
              ),
              const Padding(
                padding: EdgeInsets.fromLTRB(16, 0, 16, 6),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text('Playlist', style: TextStyle(color: Colors.white70)),
                ),
              ),
              Expanded(
                child: s.tracks.isEmpty
                    ? const Center(
                        child: Text(
                          'No tracks found in assets/data/music',
                          style: TextStyle(color: Colors.white60),
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        itemCount: s.tracks.length,
                        separatorBuilder: (_, __) => const Divider(color: Colors.white10, height: 1),
                        itemBuilder: (context, i) {
                          final path = s.tracks[i];
                          final name = path.split('/').last;
                          final selected = i == s.index;
                          return ListTile(
                            dense: true,
                            leading: Icon(
                              selected ? Icons.graphic_eq : Icons.music_note,
                              color: selected ? Colors.redAccent : Colors.white54,
                            ),
                            title: Text(name, style: const TextStyle(color: Colors.white)),
                            trailing: const Icon(Icons.play_arrow, color: Colors.white70),
                            onTap: () => MusicService.I.playIndex(i),
                          );
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}
