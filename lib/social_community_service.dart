import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

class SocialCommunityService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String? uid = FirebaseAuth.instance.currentUser?.uid;

  // Add a post
  Future<void> addPost(String content, String? imageUrl) async {
    if (uid == null) return;

    await _firestore.collection('posts').add({
      'userId': uid,
      'content': content,
      'imageUrl': imageUrl,
      'timestamp': FieldValue.serverTimestamp(),
      'likes': [],
      'comments': [],
    });
  }

  // Get posts feed
  Stream<QuerySnapshot> getPostsFeed() {
    return _firestore
        .collection('posts')
        .orderBy('timestamp', descending: true)
        .snapshots();
  }

  // Like a post
  Future<void> likePost(String postId) async {
    if (uid == null) return;

    final postRef = _firestore.collection('posts').doc(postId);
    await postRef.update({
      'likes': FieldValue.arrayUnion([uid]),
    });
  }

  // Unlike a post
  Future<void> unlikePost(String postId) async {
    if (uid == null) return;

    final postRef = _firestore.collection('posts').doc(postId);
    await postRef.update({
      'likes': FieldValue.arrayRemove([uid]),
    });
  }

  // Add comment to post
  Future<void> addComment(String postId, String comment) async {
    if (uid == null) return;

    final commentData = {
      'userId': uid,
      'comment': comment,
      'timestamp': FieldValue.serverTimestamp(),
    };

    await _firestore.collection('posts').doc(postId).update({
      'comments': FieldValue.arrayUnion([commentData]),
    });
  }

  // Get user profile
  Future<DocumentSnapshot?> getUserProfile(String userId) async {
    return await _firestore.collection('users').doc(userId).get();
  }

  // Follow user
  Future<void> followUser(String userId) async {
    if (uid == null) return;

    await _firestore.collection('users').doc(uid).update({
      'following': FieldValue.arrayUnion([userId]),
    });

    await _firestore.collection('users').doc(userId).update({
      'followers': FieldValue.arrayUnion([uid]),
    });
  }

  // Unfollow user
  Future<void> unfollowUser(String userId) async {
    if (uid == null) return;

    await _firestore.collection('users').doc(uid).update({
      'following': FieldValue.arrayRemove([userId]),
    });

    await _firestore.collection('users').doc(userId).update({
      'followers': FieldValue.arrayRemove([uid]),
    });
  }

  // Share app link
  Future<void> shareAppLink() async {
    final url = 'https://fitnessapp.com/share?user=$uid';
    if (await canLaunch(url)) {
      await launch(url);
    }
  }

  // Share text content
  Future<void> shareText(String text) async {
    await Share.share(text);
  }

  // Get friends list
  Future<List<Map<String, dynamic>>> getFriendsList() async {
    if (uid == null) return [];
    final doc = await _firestore.collection('users').doc(uid).get();
    final data = doc.data() ?? {};
    final friendIds = List<String>.from(data['friends'] ?? []);

    // Get friend details for each friend ID
    List<Map<String, dynamic>> friends = [];
    for (String friendId in friendIds) {
      final friendDoc = await _firestore.collection('users').doc(friendId).get();
      if (friendDoc.exists) {
        final friendData = friendDoc.data() as Map<String, dynamic>;
        friends.add({
          'id': friendId,
          'name': friendData['name'] ?? 'Unknown',
          'level': friendData['level'] ?? 1,
          'avatar': friendData['avatar'],
        });
      }
    }
    return friends;
  }

  // Get community posts
  Future<List<Map<String, dynamic>>> getCommunityPosts() async {
    final snapshot = await _firestore.collection('posts')
        .orderBy('timestamp', descending: true)
        .limit(50)
        .get();

    return snapshot.docs.map((doc) {
      final data = doc.data();
      return {
        'id': doc.id,
        ...data,
      };
    }).toList();
  }

  // Send friend request
  Future<void> sendFriendRequest(String recipientId) async {
    if (uid == null) return;
    await _firestore.collection('users').doc(recipientId).update({
      'friendRequests': FieldValue.arrayUnion([uid])
    });
  }

  // Share app
  Future<void> shareApp() async {
    const text = 'Check out this amazing fitness app! Download now: https://fitnessapp.com/download';
    await Share.share(text);
  }

  // Share referral link
  Future<void> shareReferralLink(String code) async {
    final link = 'https://fitnessapp.com/referral?code=$code';
    await Share.share('Join me on this fitness app! Use my referral code: $code\n$link');
  }

  // Open social media platforms
  Future<void> openFacebook() async {
    const url = 'https://www.facebook.com/fitnessapp';
    if (await canLaunch(url)) {
      await launch(url);
    }
  }

  Future<void> openInstagram() async {
    const url = 'https://www.instagram.com/fitnessapp';
    if (await canLaunch(url)) {
      await launch(url);
    }
  }

  Future<void> openTwitter() async {
    const url = 'https://www.twitter.com/fitnessapp';
    if (await canLaunch(url)) {
      await launch(url);
    }
  }

  // Comment on post
  Future<void> commentOnPost(String postId, String comment) async {
    if (uid == null || comment.trim().isEmpty) return;

    final commentData = {
      'userId': uid,
      'comment': comment.trim(),
      'timestamp': FieldValue.serverTimestamp(),
    };

    await _firestore.collection('posts').doc(postId).update({
      'comments': FieldValue.arrayUnion([commentData]),
    });
  }
}
