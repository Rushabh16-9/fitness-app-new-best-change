import 'package:flutter/material.dart';
import 'social_community_service.dart';

class SocialCommunityPage extends StatefulWidget {
  const SocialCommunityPage({super.key});

  @override
  State<SocialCommunityPage> createState() => _SocialCommunityPageState();
}

class _SocialCommunityPageState extends State<SocialCommunityPage> {
  final SocialCommunityService _socialService = SocialCommunityService();
  List<Map<String, dynamic>> _friends = [];
  List<Map<String, dynamic>> _posts = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final friends = await _socialService.getFriendsList();
    final posts = await _socialService.getCommunityPosts();
    setState(() {
      _friends = friends;
      _posts = posts;
    });
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Community'),
          backgroundColor: Colors.black,
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Feed'),
              Tab(text: 'Friends'),
              Tab(text: 'Share'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildFeedTab(),
            _buildFriendsTab(),
            _buildShareTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildFeedTab() {
    return ListView.builder(
      itemCount: _posts.length,
      itemBuilder: (context, index) {
        final post = _posts[index];
        return Card(
          color: Colors.grey[900],
          margin: const EdgeInsets.all(8),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: Colors.red,
                      child: Text(post['user'][0]),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      post['user'],
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  post['content'],
                  style: const TextStyle(color: Colors.white),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.thumb_up, color: Colors.red),
                      onPressed: () => _socialService.likePost(post['id']),
                    ),
                    Text('${post['likes']}', style: const TextStyle(color: Colors.white)),
                    const SizedBox(width: 16),
                    IconButton(
                      icon: const Icon(Icons.comment, color: Colors.grey),
                      onPressed: () => _showCommentDialog(post['id']),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildFriendsTab() {
    return ListView.builder(
      itemCount: _friends.length,
      itemBuilder: (context, index) {
        final friend = _friends[index];
        return ListTile(
          leading: CircleAvatar(
            backgroundColor: Colors.red,
            child: Text(friend['name'][0]),
          ),
          title: Text(friend['name'], style: const TextStyle(color: Colors.white)),
          subtitle: Text('Level ${friend['level']}', style: const TextStyle(color: Colors.grey)),
          trailing: ElevatedButton(
            onPressed: () => _socialService.sendFriendRequest(friend['id']),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Add Friend'),
          ),
        );
      },
    );
  }

  Widget _buildShareTab() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          ElevatedButton.icon(
            onPressed: () => _socialService.shareApp(),
            icon: const Icon(Icons.share),
            label: const Text('Share App'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              minimumSize: const Size(double.infinity, 50),
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () => _socialService.shareReferralLink('SF123ABC'),
            icon: const Icon(Icons.card_giftcard),
            label: const Text('Share Referral Code'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              minimumSize: const Size(double.infinity, 50),
            ),
          ),
          const SizedBox(height: 32),
          const Text(
            'Connect with us on social media:',
            style: TextStyle(color: Colors.white, fontSize: 18),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              IconButton(
                icon: const Icon(Icons.facebook, color: Colors.blue, size: 40),
                onPressed: () => _socialService.openFacebook(),
              ),
              IconButton(
                icon: const Icon(Icons.camera_alt, color: Colors.pink, size: 40),
                onPressed: () => _socialService.openInstagram(),
              ),
              IconButton(
                icon: const Icon(Icons.flutter_dash, color: Colors.lightBlue, size: 40),
                onPressed: () => _socialService.openTwitter(),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showCommentDialog(String postId) {
    final TextEditingController commentController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[900],
        title: const Text('Add Comment', style: TextStyle(color: Colors.white)),
        content: TextField(
          controller: commentController,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(
            hintText: 'Write a comment...',
            hintStyle: TextStyle(color: Colors.grey),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              _socialService.commentOnPost(postId, commentController.text);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Comment'),
          ),
        ],
      ),
    );
  }
}
