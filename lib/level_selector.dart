import 'package:flutter/material.dart';

class LevelSelector extends StatefulWidget {
  const LevelSelector({super.key});

  @override
  _LevelSelectorState createState() => _LevelSelectorState();
}

class _LevelSelectorState extends State<LevelSelector> {
  int currentLevel = 1;

  void incrementLevel() {
    if (currentLevel < 3) {
      setState(() {
        currentLevel++;
      });
    }
  }

  void decrementLevel() {
    if (currentLevel > 1) {
      setState(() {
        currentLevel--;
      });
    }
  }

  void setLevel(int level) {
    setState(() {
      currentLevel = level;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 20, vertical: 25),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.vertical(top: Radius.circular(25)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Select the Level That Suits You Best',
            style: TextStyle(
              fontSize: 18,
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 20),

          // Increment / Decrement buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                icon: Icon(Icons.remove_circle_outline, color: Colors.white),
                onPressed: decrementLevel,
              ),
              SizedBox(width: 10),
              Text(
                'Level $currentLevel',
                style: TextStyle(
                  fontSize: 20,
                  color: Colors.redAccent,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(width: 10),
              IconButton(
                icon: Icon(Icons.add_circle_outline, color: Colors.white),
                onPressed: incrementLevel,
              ),
            ],
          ),

          SizedBox(height: 10),

          // Labels
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              Text('Strength', style: TextStyle(color: Colors.white)),
              Text('Cardio', style: TextStyle(color: Colors.white)),
            ],
          ),

          SizedBox(height: 20),

          // Level bars - bottom aligned
          SizedBox(
            height: 130,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              crossAxisAlignment: CrossAxisAlignment.end, // Bottom align
              children: List.generate(3, (index) {
                int level = index + 1;
                bool isSelected = level == currentLevel;
                return GestureDetector(
                  onTap: () => setLevel(level),
                  child: Container(
                    height: (level * 40).toDouble(),
                    width: 40,
                    decoration: BoxDecoration(
                      color: isSelected ? Colors.redAccent : Colors.grey[800],
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.bottomCenter,
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 5),
                      child: Text(
                        '$level',
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.grey[400],
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),

          SizedBox(height: 30),

          // Cancel & Save buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.grey[900],
                  padding: EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                ),
                onPressed: () => Navigator.pop(context),
                child: Text('CANCEL', style: TextStyle(color: Colors.white)),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.redAccent,
                  padding: EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                ),
                onPressed: () {
                  // TODO: Save logic
                  Navigator.pop(context);
                },
                child: Text('SAVE', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}