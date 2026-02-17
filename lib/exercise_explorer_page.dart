import 'package:flutter/material.dart';
import 'services/exercise_catalog_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ExerciseExplorerPage extends StatefulWidget {
  const ExerciseExplorerPage({super.key});

  @override
  State<ExerciseExplorerPage> createState() => _ExerciseExplorerPageState();
}

class _ExerciseExplorerPageState extends State<ExerciseExplorerPage> {
  final ExerciseCatalogService _service = ExerciseCatalogService();
  final TextEditingController _search = TextEditingController();
  final Set<String> _selectedTags = {};
  bool _loading = true;
  Set<String> _favorites = {};
  int _mode = 0; // 0=All, 1=Assets only, 2=Online only, 3=Favorites

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    await _service.load();
    final p = await SharedPreferences.getInstance();
    _favorites = p.getStringList('exercise_faves')?.toSet() ?? {};
    if (mounted) setState(() => _loading = false);
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    var results = _loading
        ? []
        : _service.search(_search.text, tagFilter: _selectedTags);
    if (_mode == 1) {
      results = results.where((e) => (e.assetPath ?? '').isNotEmpty).toList();
    } else if (_mode == 2) {
      results = results.where((e) => e.gifUrl.isNotEmpty).toList();
    } else if (_mode == 3) {
      results = results.where((e) => _favorites.contains(e.id)).toList();
    }
    final tags = _loading ? <String>[] : _service.getTopTags();

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text('Exercise Explorer'),
        actions: [
          PopupMenuButton<int>(
            icon: const Icon(Icons.filter_alt),
            color: Colors.black,
            onSelected: (v) => setState(() => _mode = v),
            itemBuilder: (_) => const [
              PopupMenuItem(value: 0, child: Text('All (show everything)', style: TextStyle(color: Colors.white))),
              PopupMenuItem(value: 1, child: Text('Downloaded (on-device images)', style: TextStyle(color: Colors.white))),
              PopupMenuItem(value: 2, child: Text('Online (GIFs via internet)', style: TextStyle(color: Colors.white))),
              PopupMenuItem(value: 3, child: Text('Favorites only', style: TextStyle(color: Colors.white))),
            ],
          ),
          IconButton(
            tooltip: 'Favorites only',
            onPressed: () => setState(() => _mode = _mode == 3 ? 0 : 3),
            icon: Icon(_mode == 3 ? Icons.favorite : Icons.favorite_border),
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () async { setState(() => _loading = true); await _service.load(); if (mounted) setState(() => _loading = false); },
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Colors.red))
          : Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: TextField(
                    controller: _search,
                    onChanged: (_) => setState(() {}),
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Search exercises…',
                      hintStyle: const TextStyle(color: Colors.white54),
                      prefixIcon: const Icon(Icons.search, color: Colors.red),
                      filled: true,
                      fillColor: Colors.grey.shade900,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline, color: Colors.white38, size: 16),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          _mode == 1
                              ? 'Showing downloaded on-device exercise images (works offline).'
                              : _mode == 2
                                  ? 'Showing online GIFs (needs internet).'
                                  : 'Showing all sources: downloaded images and online GIFs.',
                          style: const TextStyle(color: Colors.white38, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(
                  height: 48,
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    scrollDirection: Axis.horizontal,
                    itemBuilder: (_, i) {
                      final t = tags[i];
                      final sel = _selectedTags.contains(t);
                      return FilterChip(
                        label: Text(t, style: TextStyle(color: sel ? Colors.black : Colors.white)),
                        selected: sel,
                        onSelected: (v) => setState(() { v ? _selectedTags.add(t) : _selectedTags.remove(t); }),
                        backgroundColor: Colors.grey.shade800,
                        selectedColor: Colors.red,
                        checkmarkColor: Colors.black,
                      );
                    },
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemCount: tags.length,
                  ),
                ),
                const SizedBox(height: 8),
                FutureBuilder<List<String>>(
                  future: () async {
                    final p = await SharedPreferences.getInstance();
                    return p.getStringList('exercise_recent') ?? <String>[];
                  }(),
                  builder: (context, snap) {
                    final ids = snap.data ?? const [];
                    if (ids.isEmpty) return const SizedBox.shrink();
                    final recent = _service.all.where((e) => ids.contains(e.id)).take(10).toList();
                    if (recent.isEmpty) return const SizedBox.shrink();
                    return SizedBox(
                      height: 120,
                      child: ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        scrollDirection: Axis.horizontal,
                        itemCount: recent.length,
                        itemBuilder: (_, i) {
                          final ex = recent[i];
                          return SizedBox(
                            width: 120,
                            child: _ExerciseTile(
                              name: ex.name,
                              tags: ex.tags,
                              assetPath: ex.assetPath,
                              gifUrl: ex.gifUrl,
                              isFavorite: _favorites.contains(ex.id),
                              onOpen: () => _openPreview(ex.id, ex.assetPath, ex.gifUrl),
                              onToggleFavorite: () async {
                                setState(() {
                                  if (_favorites.contains(ex.id)) {
                                    _favorites.remove(ex.id);
                                  } else {
                                    _favorites.add(ex.id);
                                  }
                                });
                                final p = await SharedPreferences.getInstance();
                                await p.setStringList('exercise_faves', _favorites.toList());
                              },
                            ),
                          );
                        },
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                      ),
                    );
                  },
                ),
                Expanded(
                  child: results.isEmpty
                      ? const Center(child: Text('No results', style: TextStyle(color: Colors.white54)))
                      : SafeArea(
                          top: false,
                          child: GridView.builder(
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              mainAxisSpacing: 12,
                              crossAxisSpacing: 12,
                              childAspectRatio: 0.82,
                            ),
                            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                            itemCount: results.length,
                            itemBuilder: (_, i) {
                              final ex = results[i];
                              final isFav = _favorites.contains(ex.id);
                              return _ExerciseTile(
                                name: ex.name,
                                tags: ex.tags,
                                assetPath: ex.assetPath,
                                gifUrl: ex.gifUrl,
                                isFavorite: isFav,
                                onOpen: () => _openPreview(ex.id, ex.assetPath, ex.gifUrl),
                                onToggleFavorite: () async {
                                  setState(() {
                                    if (isFav) {
                                      _favorites.remove(ex.id);
                                    } else {
                                      _favorites.add(ex.id);
                                    }
                                  });
                                  final p = await SharedPreferences.getInstance();
                                  await p.setStringList('exercise_faves', _favorites.toList());
                                },
                              );
                            },
                          ),
                        ),
                ),
              ],
            ),
    );
  }

  void _openPreview(String id, String? assetPath, String gifUrl) async {
    // Update recently viewed list (most recent first, unique, cap 20)
    final p = await SharedPreferences.getInstance();
    final recents = p.getStringList('exercise_recent') ?? [];
    recents.remove(id);
    recents.insert(0, id);
    if (recents.length > 20) recents.removeRange(20, recents.length);
    await p.setStringList('exercise_recent', recents);

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: Colors.black,
        contentPadding: const EdgeInsets.all(0),
        content: AspectRatio(
          aspectRatio: 1,
          child: assetPath != null && assetPath.isNotEmpty
              ? Image.asset(assetPath, fit: BoxFit.cover, errorBuilder: (_, __, ___) => _imgFallback())
              : Image.network(gifUrl, fit: BoxFit.cover, errorBuilder: (_, __, ___) => _imgFallback()),
        ),
      ),
    );
  }

  Widget _imgFallback() => Container(
        color: Colors.grey.shade900,
        child: const Center(child: Icon(Icons.image_not_supported, color: Colors.white54)),
      );
}

class _ExerciseTile extends StatelessWidget {
  final String name;
  final List<String> tags;
  final String? assetPath;
  final String gifUrl;
  final bool isFavorite;
  final VoidCallback onOpen;
  final VoidCallback onToggleFavorite;

  const _ExerciseTile({
    required this.name,
    required this.tags,
    required this.assetPath,
    required this.gifUrl,
    required this.isFavorite,
    required this.onOpen,
    required this.onToggleFavorite,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onOpen,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.grey.shade900,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                child: assetPath != null && assetPath!.isNotEmpty
                    ? Image.asset(assetPath!, fit: BoxFit.cover, width: double.infinity,
                        errorBuilder: (_, __, ___) => _fallback())
                    : Image.network(gifUrl, fit: BoxFit.cover, width: double.infinity,
                        errorBuilder: (_, __, ___) => _fallback()),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name, maxLines: 1, overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                        const SizedBox(height: 2),
                        Text(tags.take(3).join(' • '), maxLines: 1, overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: Colors.white54, fontSize: 12)),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: Icon(isFavorite ? Icons.favorite : Icons.favorite_border, color: Colors.red),
                    onPressed: onToggleFavorite,
                  )
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _fallback() => Container(color: Colors.black26, child: const Center(child: Icon(Icons.fitness_center, color: Colors.white38)));
}
