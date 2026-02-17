import 'package:flutter/material.dart';
import 'main.dart'; // for LoginPage

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  late List<Map<String, String>> slides;

  @override
  void initState() {
    super.initState();
    slides = [
      {
        'image': 'assets/slide1.jpg',
        'title': 'Welcome!',
        'description': 'Your journey to a healthier, stronger version of yourself starts here.',
      },
      {
        'image': 'assets/slide2.jpg',
        'title': 'Why Fitness Matters',
        'description': 'Improves mood, boosts energy, strengthens the body, and increases confidence.',
      },
      {
        'image': 'assets/slide3.jpg',
        'title': 'Why SmartFit?',
        'description': 'Track progress, get personalized workouts, and stay motivated.',
      },
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Column(
        children: [
          Expanded(
            child: PageView.builder(
              controller: _pageController,
              itemCount: slides.length,
              onPageChanged: (index) {
                setState(() {
                  _currentPage = index;
                });
              },
              itemBuilder: (context, index) {
                return Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.asset(slides[index]['image']!, height: 300),
                    const SizedBox(height: 20),
                    Text(
                      slides[index]['title']!,
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    const SizedBox(height: 10),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 40),
                      child: Text(
                        slides[index]['description']!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 16, color: Colors.white70),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(
              slides.length,
              (index) => Container(
                margin: const EdgeInsets.symmetric(horizontal: 5),
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _currentPage == index ? Colors.red : Colors.grey,
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TextButton(
                  onPressed: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (context) => const LoginPage()),
                    );
                  },
                  child: const Text('Skip', style: TextStyle(color: Colors.white)),
                ),
                ElevatedButton(
                  onPressed: () {
                    if (_currentPage < slides.length - 1) {
                      _pageController.nextPage(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.ease,
                      );
                    } else {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (context) => const LoginPage()),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                  ),
                  child: Text(_currentPage < slides.length - 1 ? 'Next' : 'Get Started'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}
