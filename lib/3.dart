import 'package:flutter/material.dart';
import 'dart:async';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '2.dart';

// Firebase Functions
Future<void> signUpUser(String name, String gender, String goal, double height, 
    double weight, double bmi, int fitnessLevel, String email, String password) async {
  try {
    // 1. Create user in Firebase Auth
    UserCredential userCredential = await FirebaseAuth.instance
        .createUserWithEmailAndPassword(email: email, password: password);

    String uid = userCredential.user!.uid;

    // 2. Save user details in Firestore
    await FirebaseFirestore.instance.collection("users").doc(uid).set({
      "name": name,
      "gender": gender,
      "goal": goal,
      "height": height,
      "weight": weight,
      "bmi": bmi,
      "fitnessLevel": fitnessLevel,
      "email": email,
      "createdAt": FieldValue.serverTimestamp(),
    });

    print("User registered and details saved successfully!");
  } catch (e) {
    print("Error during sign up: $e");
    rethrow; // Re-throw to handle in UI
  }
}

class FitnessApp extends StatelessWidget {
  const FitnessApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: Colors.black,
        textTheme: const TextTheme(
          bodyLarge: TextStyle(color: Colors.white),
          bodyMedium: TextStyle(color: Colors.white),
        ),
        primaryColor: Colors.red,
      ),
      home: const NamePage(),
    );
  }
}

class NamePage extends StatefulWidget {
  const NamePage({super.key});

  @override
  State<NamePage> createState() => _NamePageState();
}

class _NamePageState extends State<NamePage> {
  final TextEditingController nameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  bool showCredentials = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
          reverse: true,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Coach Image
              Center(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(60),
                  child: Image.asset(
                    'assets/coach.jpg',
                    width: 120,
                    height: 120,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(height: 30),

              const Text(
                "What's your name?",
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),

              const Text(
                "Hello! I'm your personal coach Max.\nWhat would you like to be called?",
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey, fontSize: 14),
              ),
              const SizedBox(height: 32),

              // Name Input
              TextField(
                controller: nameController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Enter your name',
                  hintStyle: const TextStyle(color: Colors.grey),
                  enabledBorder: OutlineInputBorder(
                    borderSide: const BorderSide(color: Colors.white),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderSide: const BorderSide(color: Colors.redAccent),
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              
              // Toggle for showing credential fields
              TextButton(
                onPressed: () {
                  setState(() {
                    showCredentials = !showCredentials;
                  });
                },
                child: Text(
                  showCredentials ? "Hide credentials" : "Add email/password",
                  style: const TextStyle(color: Colors.blue),
                ),
              ),
              
              if (showCredentials) ...[
                const SizedBox(height: 20),
                TextField(
                  controller: emailController,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: 'Enter your email',
                    hintStyle: const TextStyle(color: Colors.grey),
                    enabledBorder: OutlineInputBorder(
                      borderSide: const BorderSide(color: Colors.white),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderSide: const BorderSide(color: Colors.redAccent),
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: passwordController,
                  style: const TextStyle(color: Colors.white),
                  obscureText: true,
                  decoration: InputDecoration(
                    hintText: 'Enter your password',
                    hintStyle: const TextStyle(color: Colors.grey),
                    enabledBorder: OutlineInputBorder(
                      borderSide: const BorderSide(color: Colors.white),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderSide: const BorderSide(color: Colors.redAccent),
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ],

              const SizedBox(height: 40),

              // Next Button
              ElevatedButton(
                onPressed: () {
                  if (nameController.text.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("Please enter your name")));
                    return;
                  }
                  
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => GenderPage(
                        name: nameController.text,
                        email: emailController.text,
                        password: passwordController.text,
                      ),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  "Next",
                  style: TextStyle(fontSize: 16, color: Colors.white),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class GenderPage extends StatefulWidget {
  final String name;
  final String email;
  final String password;
  
  const GenderPage({
    super.key,
    required this.name,
    this.email = '',
    this.password = '',
  });

  @override
  State<GenderPage> createState() => _GenderPageState();
}

class _GenderPageState extends State<GenderPage> {
  String selectedGender = "";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                "What's your gender?",
                style: TextStyle(
                  fontSize: 30,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 50),

              // Gender selection
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  genderOption(Icons.male, "Male"),
                  genderOption(Icons.female, "Female"),
                ],
              ),

              const SizedBox(height: 60),

              // Next button
              ElevatedButton(
  onPressed: selectedGender.isNotEmpty
      ? () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => GoalPage(
                name: widget.name,         // Make sure these are passed from previous screen
                gender: selectedGender,     // This should be your selected gender
                email: widget.email,        // From previous screen
                password: widget.password,  // From previous screen
              ),
            ),
          );
        }
      : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      selectedGender.isNotEmpty ? Colors.red : Colors.grey,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 40, vertical: 18),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: const Text("Next",
                    style: TextStyle(fontSize: 18, color: Colors.white)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget genderOption(IconData icon, String label) {
    bool isSelected = selectedGender == label;

    return GestureDetector(
      onTap: () {
        setState(() {
          selectedGender = label;
        });
      },
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isSelected ? Colors.red.withOpacity(0.2) : Colors.grey[900],
              border: Border.all(
                  color: isSelected ? Colors.red : Colors.white, width: 2),
            ),
            child: Icon(
              icon,
              size: 100,
              color: isSelected ? Colors.red : Colors.white,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            label,
            style: TextStyle(
              fontSize: 20,
              color: isSelected ? Colors.red : Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class GoalPage extends StatefulWidget {
  final String name;
  final String gender;
  final String email;
  final String password;
  
  const GoalPage({
    super.key,
    required this.name,
    required this.gender,
    required this.email,
    required this.password,
  });

  @override
  State<GoalPage> createState() => _GoalPageState();
}

class _GoalPageState extends State<GoalPage> {
  String selectedGoal = "";
  final List<String> goals = ["Lose Weight", "Build Muscle", "Keep Fit"];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 80),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              const Text(
                "What's your goal?",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              for (var goal in goals) goalOption(goal),
              const SizedBox(height: 40),
              ElevatedButton(
  onPressed: selectedGoal.isNotEmpty 
      ? () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => BMIFullFlowPage(
                name: widget.name,
                gender: widget.gender,
                goal: selectedGoal,
                email: widget.email,
                password: widget.password,
              ),
            ),
          );
        }
      : null,
  // ... rest of button styling

                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      selectedGoal.isNotEmpty ? Colors.red : Colors.grey,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text("Next", style: TextStyle(fontSize: 16)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget goalOption(String goal) {
    bool isSelected = selectedGoal == goal;
    return GestureDetector(
      onTap: () {
        setState(() {
          selectedGoal = goal;
        });
      },
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 8),
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: isSelected ? Colors.red : Colors.grey.shade800,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Center(
          child: Text(
            goal,
            style: const TextStyle(
              fontSize: 18,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }
}

class BMIFullFlowPage extends StatefulWidget {
  final String name;
  final String gender;
  final String goal;
  final String email;
  final String password;
  
  const BMIFullFlowPage({
    super.key,
    required this.name,
    required this.gender,
    required this.goal,
    required this.email,
    required this.password,
  });

  @override
  State<BMIFullFlowPage> createState() => _BMIFullFlowPageState();
}

class _BMIFullFlowPageState extends State<BMIFullFlowPage> {
  int currentStep = 0;
  int selectedFeet = 5;
  int selectedInches = 6;
  int selectedWeight = 60;
  double bmi = 0.0;

  double calculateHeightInMeters() {
    return ((selectedFeet * 12 + selectedInches) * 0.0254);
  }

  double calculateBMI() {
    double height = calculateHeightInMeters();
    bmi = selectedWeight / (height * height);
    return bmi;
  }

  String getBMIResult() {
    if (bmi < 18.5) {
      return "Underweight";
    } else if (bmi < 25) {
      return "Normal";
    } else if (bmi < 30) {
      return "Overweight";
    } else {
      return "Obese";
    }
  }

  Color getBMIColor() {
    if (bmi < 18.5) {
      return Colors.blueAccent;
    } else if (bmi < 25) {
      return Colors.green;
    } else if (bmi < 30) {
      return Colors.orange;
    } else {
      return Colors.redAccent;
    }
  }

  Future<void> _saveUserData() async {
  try {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      // If user isn't logged in, create account first
      UserCredential userCredential = await FirebaseAuth.instance
          .createUserWithEmailAndPassword(
              email: widget.email, 
              password: widget.password);

      // Then save all data
      await FirebaseFirestore.instance.collection("users").doc(userCredential.user!.uid).set({
        "name": widget.name,
        "gender": widget.gender,
        "goal": widget.goal,
        "height": calculateHeightInMeters(),
        "weight": selectedWeight,
        "bmi": bmi,
        "email": widget.email,
        "createdAt": FieldValue.serverTimestamp(),
      });
    } else {
      // User is logged in, just update the data
      await FirebaseFirestore.instance.collection("users").doc(user.uid).set({
        "height": calculateHeightInMeters(),
        "weight": selectedWeight,
        "bmi": bmi,
        "lastUpdated": FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
    }

    print("User data saved successfully!");
  } catch (e) {
    print("Error saving user data: $e");
    rethrow;
  }
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Center(
            child: currentStep == 0
                ? Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text("Select Your Height", 
                          style: TextStyle(color: Colors.red, fontSize: 24, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 40),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Column(
                            children: [
                              const Text("Feet", style: TextStyle(color: Colors.white, fontSize: 20)),
                              DropdownButton<int>(
                                value: selectedFeet,
                                dropdownColor: Colors.black,
                                style: const TextStyle(color: Colors.white, fontSize: 20),
                                items: List.generate(8, (index) => index + 1).map((feet) {
                                  return DropdownMenuItem(
                                    value: feet,
                                    child: Text(feet.toString()),
                                  );
                                }).toList(),
                                onChanged: (val) => setState(() => selectedFeet = val!),
                              ),
                            ],
                          ),
                          const SizedBox(width: 30),
                          Column(
                            children: [
                              const Text("Inches", style: TextStyle(color: Colors.white, fontSize: 20)),
                              DropdownButton<int>(
                                value: selectedInches,
                                dropdownColor: Colors.black,
                                style: const TextStyle(color: Colors.white, fontSize: 20),
                                items: List.generate(12, (index) => index).map((inch) {
                                  return DropdownMenuItem(
                                    value: inch,
                                    child: Text(inch.toString()),
                                  );
                                }).toList(),
                                onChanged: (val) => setState(() => selectedInches = val!),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 40),
                      ElevatedButton(
                        onPressed: () => setState(() => currentStep++),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                        child: const Text("Next", style: TextStyle(fontSize: 18)),
                      )
                    ],
                  )
                : currentStep == 1
                    ? Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text("Select Your Weight (kg)", 
                              style: TextStyle(color: Colors.red, fontSize: 24, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 40),
                          DropdownButton<int>(
                            value: selectedWeight,
                            dropdownColor: Colors.black,
                            style: const TextStyle(color: Colors.white, fontSize: 20),
                            items: List.generate(121, (index) => index + 30).map((kg) {
                              return DropdownMenuItem(
                                value: kg,
                                child: Text(kg.toString()),
                              );
                            }).toList(),
                            onChanged: (val) => setState(() => selectedWeight = val!),
                          ),
                          const SizedBox(height: 40),
                          ElevatedButton(
                            onPressed: () {
                              setState(() {
                                calculateBMI();
                                currentStep++;
                              });
                            },
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                            child: const Text("Next", style: TextStyle(fontSize: 18)),
                          )
                        ],
                      )
                    : Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text("Your BMI: ${bmi.toStringAsFixed(1)}",
                              style: TextStyle(color: getBMIColor(), fontSize: 28, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 20),
                          Text(getBMIResult(),
                              style: TextStyle(color: getBMIColor(), fontSize: 22)),
                          const SizedBox(height: 50),
                          ElevatedButton(
                            onPressed: () async {
                              try {
                                await _saveUserData();
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => FitnessLevelPage(bmi: bmi),
                                  ),
                                );
                              } catch (e) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text("Error saving data: $e")),
                                );
                              }
                            },
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                            child: const Text("Continue", style: TextStyle(fontSize: 18)),
                          )
                        ],
                      ),
          ),
        ),
      ),
    );
  }
}

class FitnessLevelPage extends StatefulWidget {
  final double bmi;
  const FitnessLevelPage({super.key, required this.bmi});

  @override
  State<FitnessLevelPage> createState() => _FitnessLevelPageState();
}

class _FitnessLevelPageState extends State<FitnessLevelPage> {
  int selectedLevel = -1;
  final List<String> levelDescriptions = [
    "Beginner: Just getting started",
    "Light: Some activity, but not regular",
    "Moderate: Exercises 2-3 times/week",
    "Active: Consistent weekly workouts",
    "Athlete: Trains intensively",
  ];

  final List<String> emojis = ["😴", "🙂", "😅", "💪", "🔥"];

  Future<void> _saveFitnessLevel() async {
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) {
        throw Exception('User not logged in');
      }

      await FirebaseFirestore.instance.collection("users").doc(user.uid).set({
        "fitnessLevel": selectedLevel,
        "lastUpdated": FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));

      print("Fitness level saved successfully!");
    } catch (e) {
      print("Error saving fitness level: $e");
      rethrow;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 60),
            const Text(
              "Select your fitness level",
              style: TextStyle(fontSize: 24, color: Colors.white, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 40),
            Expanded(
              child: SingleChildScrollView(
                child: SizedBox(
                  height: MediaQuery.of(context).size.height * 0.5,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: List.generate(5, (index) {
                      bool isSelected = selectedLevel == index;
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            selectedLevel = index;
                          });
                        },
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              width: 40,
                              height: 60.0 + (index * 25),
                              decoration: BoxDecoration(
                                color: isSelected ? Colors.red : Colors.grey[700],
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            const SizedBox(height: 10),
                            if (isSelected)
                              Column(
                                children: [
                                  Text(
                                    emojis[index],
                                    style: const TextStyle(fontSize: 28),
                                  ),
                                  const SizedBox(height: 5),
                                  SizedBox(
                                    width: 80,
                                    child: Text(
                                      levelDescriptions[index],
                                      style: const TextStyle(color: Colors.white70, fontSize: 13),
                                      textAlign: TextAlign.center,
                                    ),
                                  ),
                                ],
                              ),
                          ],
                        ),
                      );
                    }),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: selectedLevel != -1
                  ? () async {
                      try {
                        await _saveFitnessLevel();
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const PlanScreen(),
                          ),
                        );
                      } catch (e) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text("Error: ${e.toString()}")),
                        );
                      }
                    }
                  : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
              ),
              child: const Text(
                'FINISH',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

