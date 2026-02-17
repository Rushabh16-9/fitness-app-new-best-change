import 'package:url_launcher/url_launcher.dart';

class SpotifyMusicService {
  // Open Spotify app
  Future<void> openSpotify() async {
    const url = 'spotify:';
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url));
    } else {
      // Fallback to web
      const webUrl = 'https://open.spotify.com';
      if (await canLaunchUrl(Uri.parse(webUrl))) {
        await launchUrl(Uri.parse(webUrl));
      }
    }
  }

  // Open specific playlist in Spotify
  Future<void> openPlaylist(String playlistId) async {
    final url = 'https://open.spotify.com/playlist/$playlistId';
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    } else {
      print('Could not launch $url');
    }
  }

  // Open workout playlist (example)
  Future<void> openWorkoutPlaylist() async {
    // Example workout playlist - in real app, this would be dynamic
    const playlistId = '37i9dQZF1DX76Wlfdnj7AP'; // Popular workout playlist
    await openPlaylist(playlistId);
  }

  // Open Spotify search for workout music
  Future<void> searchWorkoutMusic() async {
    const url = 'https://open.spotify.com/search/workout';
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    }
  }
}
