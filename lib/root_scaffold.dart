import 'package:flutter/material.dart';
import 'home_page.dart';
import 'me_page.dart';
// Marketplace now accessible via Me page button (premium tab removed)
// Premium tab removed; marketplace accessed from Me page.
import 'friend_workout_lobby.dart'; // Changed to old friends lobby
import 'challenges_page.dart';
import 'achievements_page.dart';

class RootScaffold extends StatefulWidget {
  const RootScaffold({super.key});

  @override
  State<RootScaffold> createState() => _RootScaffoldState();
}

class _NavItem {
  final IconData icon;
  final String label;
  final Widget page;
  const _NavItem({required this.icon, required this.label, required this.page});
}

class _RootScaffoldState extends State<RootScaffold> {
  int _current = 0;

  late final List<_NavItem> _items = [
    _NavItem(icon: Icons.calendar_today, label: 'DAILY', page: const HomePage()),
    _NavItem(icon: Icons.flag_outlined, label: 'CHALLENGES', page: const ChallengesPage()),
    _NavItem(icon: Icons.people_outline, label: 'FRIENDS', page: const FriendWorkoutLobby()), // Changed to old lobby
    _NavItem(icon: Icons.emoji_events, label: 'ACHIEVE', page: const AchievementsPage()),
    _NavItem(icon: Icons.person, label: 'ME', page: const MePage()),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 350),
        transitionBuilder: (child, anim) {
          final offsetAnimation = Tween<Offset>(
            begin: const Offset(0.05, 0),
            end: Offset.zero,
          ).animate(CurvedAnimation(parent: anim, curve: Curves.easeOutCubic));
          return FadeTransition(
            opacity: anim,
            child: SlideTransition(position: offsetAnimation, child: child),
          );
        },
        child: KeyedSubtree(
          key: ValueKey(_current),
          child: _items[_current].page,
        ),
      ),
      bottomNavigationBar: _buildNavBar(),
    );
  }

  Widget _buildNavBar() {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.black,
        border: Border(top: BorderSide(color: Colors.red, width: 0.5)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 2),
          child: Row(
            children: List.generate(_items.length, (index) {
              final selected = index == _current;
              final item = _items[index];
              return Expanded(
                child: InkWell(
                  borderRadius: BorderRadius.circular(20),
                  onTap: () => setState(() => _current = index),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
                    decoration: BoxDecoration(
                      color: selected ? Colors.redAccent.withOpacity(0.18) : Colors.transparent,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          item.icon,
                          color: selected ? Colors.redAccent : Colors.white70,
                          size: selected ? 24 : 22,
                        ),
                        const SizedBox(height: 2),
                        AnimatedDefaultTextStyle(
                          duration: const Duration(milliseconds: 200),
                          style: TextStyle(
                            fontSize: 10.5, // slightly smaller to fit long words
                            fontWeight: FontWeight.w600,
                            color: selected ? Colors.redAccent : Colors.white60,
                            letterSpacing: selected ? 0.4 : 0,
                          ),
                          child: FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Text(
                              item.label,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

// Helper to keep font size logic tidy
double eleven(int _) => 11; // reserved for future dynamic sizing
