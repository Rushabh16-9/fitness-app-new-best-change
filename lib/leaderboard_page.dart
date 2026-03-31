import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import 'database_service.dart';

class LeaderboardPage extends StatefulWidget {
  const LeaderboardPage({super.key});

  @override
  State<LeaderboardPage> createState() => _LeaderboardPageState();
}

class _LeaderboardPageState extends State<LeaderboardPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late DatabaseService _db;
  List<Map<String, dynamic>> _globalLeaderboard = [];
  List<Map<String, dynamic>> _friendsLeaderboard = [];
  bool _isLoading = true;
  String? _currentUserId;
  int _currentUserPoints = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _currentUserId = FirebaseAuth.instance.currentUser?.uid;
    _db = DatabaseService(uid: _currentUserId);
    _loadLeaderboardData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadLeaderboardData() async {
    setState(() => _isLoading = true);
    try {
      // Load global leaderboard from DB
      final global = await _getGlobalLeaderboard();
      _globalLeaderboard = _prepareRanks(global);

      // Load friends leaderboard from DB
      final friends = await _getFriendsLeaderboard();
      _friendsLeaderboard = _prepareRanks(friends);

      // capture current user points if present
      final me = _globalLeaderboard.firstWhere(
        (u) => u['userId'] == _currentUserId,
        orElse: () => {},
      );
      _currentUserPoints = (me['points'] ?? 0) as int;

      setState(() => _isLoading = false);
    } catch (e) {
      print('Error loading leaderboard: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<List<Map<String, dynamic>>> _getGlobalLeaderboard() async {
    final dbList = await _db.getGlobalLeaderboard();
    // Normalize to our UI shape
    return dbList.map((u) => {
          'userId': u['uid'],
          'name': u['name'] ?? 'Anonymous',
          'points': (u['points'] ?? 0) as int,
          'level': (u['level'] ?? 1) as int,
        }).toList();
  }

  Future<List<Map<String, dynamic>>> _getFriendsLeaderboard() async {
    // Build friends leaderboard using DB helper
    try {
      final friendIds = await _db.getFriendsList();
      if (friendIds.isEmpty) return [];
      final dbList = await _db.getFriendsLeaderboard(friendIds);
      return dbList.map((u) => {
            'userId': u['uid'],
            'name': u['name'] ?? 'Anonymous',
            'points': (u['points'] ?? 0) as int,
            'level': (u['level'] ?? 1) as int,
          }).toList();
    } catch (_) {
      return [];
    }
  }

  List<Map<String, dynamic>> _prepareRanks(List<Map<String, dynamic>> users) {
    final sorted = [...users]..sort((a, b) => (b['points'] as int).compareTo(a['points'] as int));
    int rank = 0;
    int? lastPoints;
    int sameRankCount = 0;
    for (final u in sorted) {
      final pts = u['points'] as int;
      if (lastPoints == null || pts < lastPoints) {
        rank += 1 + sameRankCount;
        sameRankCount = 0;
      } else {
        sameRankCount += 1; // tie keeps same rank number
      }
      lastPoints = pts;
      u['rank'] = rank;
      u['isCurrentUser'] = (u['userId'] == _currentUserId);
    }
    return sorted;
  }

  Future<void> _shareApkViaWhatsApp() async {
    const apkUrl = 'https://your-server.com/SmartFit-latest.apk'; // TODO: replace with your hosted APK URL
    final message = 'Join me on SmartFit! Download the APK directly:\n$apkUrl';
    final waUri = Uri.parse('https://wa.me/?text=${Uri.encodeComponent(message)}');
    try {
      final canLaunch = await canLaunchUrl(waUri);
      if (canLaunch) {
        await launchUrl(waUri, mode: LaunchMode.externalApplication);
      } else {
        // Fallback to system share sheet
        await Share.share(message);
      }
    } catch (_) {
      await Share.share(message);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Leaderboard'),
        backgroundColor: Colors.black,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Global'),
            Tab(text: 'Friends'),
          ],
          indicatorColor: Colors.red,
          labelColor: Colors.red,
          unselectedLabelColor: Colors.white70,
        ),
        actions: [
          if (_currentUserPoints > 0)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: Center(
                child: Text(
                  '$_currentUserPoints pts',
                  style: const TextStyle(color: Colors.white70, fontWeight: FontWeight.w600),
                ),
              ),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.red))
          : TabBarView(
              controller: _tabController,
              children: [
                _buildLeaderboardTab(_globalLeaderboard, false),
                _buildLeaderboardTab(_friendsLeaderboard, true),
              ],
            ),
    );
  }

  Widget _buildLeaderboardTab(List<Map<String, dynamic>> leaderboard, bool isFriends) {
    return Column(
      children: [
        // Podium for top 3
        if (leaderboard.isNotEmpty)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: _buildPodium(leaderboard.take(3).toList()),
          ),

        // Share button for friends tab
        if (isFriends) ...[
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: ElevatedButton.icon(
              onPressed: _shareApkViaWhatsApp,
              icon: const Icon(Icons.share, color: Colors.white),
              label: const Text('Share APK via WhatsApp'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 48),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],

        // Leaderboard list
        Expanded(
          child: ListView.builder(
            itemCount: leaderboard.length,
            itemBuilder: (context, index) {
              final user = leaderboard[index];
              return _buildLeaderboardItem(user, index + 1);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildLeaderboardItem(Map<String, dynamic> user, int actualRank) {
    final bool isCurrentUser = user['isCurrentUser'] ?? false;
    final int rank = user['rank'] ?? actualRank;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: isCurrentUser ? Colors.red.withOpacity(0.1) : Colors.grey[900],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isCurrentUser ? Colors.red : Colors.transparent,
          width: 2,
        ),
      ),
      child: ListTile(
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: _getRankColor(rank),
          ),
          child: Center(
            child: Text(
              rank.toString(),
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ),
        ),
        title: Text(
          user['name'] ?? 'Unknown',
          style: TextStyle(
            color: isCurrentUser ? Colors.red : Colors.white,
            fontWeight: isCurrentUser ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        subtitle: Text(
          'Level ${user['level'] ?? 1} • ${user['points'] ?? 0} points',
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 12,
          ),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (rank <= 3) ...[
              Icon(
                Icons.star,
                color: _getRankColor(rank),
                size: 20,
              ),
              const SizedBox(width: 4),
            ],
            Text(
              '${user['points'] ?? 0}',
              style: TextStyle(
                color: isCurrentUser ? Colors.red : Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPodium(List<Map<String, dynamic>> top3) {
    // Ensure 3 slots with placeholders
    final items = List<Map<String, dynamic>>.from(top3);
    while (items.length < 3) {
      items.add({'name': '—', 'points': 0, 'rank': items.length + 1});
    }
    // Order as 2nd, 1st, 3rd for visual podium
    final ordered = <Map<String, dynamic>>[items.length > 1 ? items[1] : items[0], items[0], items.length > 2 ? items[2] : items[0]];

    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF1a1a1a), Color(0xFF2a1a1a)]),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _podiumColumn(ordered[0], 2, height: 90),
          _podiumColumn(ordered[1], 1, height: 120),
          _podiumColumn(ordered[2], 3, height: 75),
        ],
      ),
    );
  }

  Widget _podiumColumn(Map<String, dynamic> user, int place, {double height = 90}) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          user['name'] ?? '—',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 6),
        Container(
          width: 80,
          height: height,
          decoration: BoxDecoration(
            color: _getRankColor(place).withOpacity(0.2),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: _getRankColor(place).withOpacity(0.6)),
          ),
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.emoji_events, color: _getRankColor(place)),
                const SizedBox(height: 6),
                Text('${user['points'] ?? 0}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ),
        const SizedBox(height: 6),
        Text('#$place', style: const TextStyle(color: Colors.white70, fontSize: 12)),
      ],
    );
  }

  Color _getRankColor(int rank) {
    switch (rank) {
      case 1:
        return Colors.yellow;
      case 2:
        return Colors.grey;
      case 3:
        return Colors.orange;
      default:
        return Colors.red;
    }
  }
}
