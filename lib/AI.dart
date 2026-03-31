import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class RecommendationPage extends StatefulWidget {
  final double bmi;

  const RecommendationPage({super.key, required this.bmi});

  @override
  _RecommendationPageState createState() => _RecommendationPageState();
}

class _RecommendationPageState extends State<RecommendationPage> {
  int age = 25;
  String gender = 'male';
  List<String> issues = [];
  List<String> equipment = [];
  List<String> recommendation = [];

  Future<void> fetchRecommendation() async {
    final url = Uri.parse('http://192.168.0.188:8000/recommendation');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'age': age,
          'bmi': widget.bmi,
          'gender': gender,
          'issues': issues,
          'equipment': equipment,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          recommendation = List<String>.from(data['recommendation']);
        });
      } else {
        setState(() {
          recommendation = ['Error: ${response.statusCode}'];
        });
      }
    } catch (e) {
      setState(() {
        recommendation = ['Exception: $e'];
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.red,
        title: Text('AI Recommendations'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              style: TextStyle(color: Colors.white),
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Age',
                labelStyle: TextStyle(color: Colors.white),
              ),
              onChanged: (value) {
                age = int.tryParse(value) ?? 0;
              },
            ),
            DropdownButton<String>(
              dropdownColor: Colors.black,
              value: gender,
              items: ['male', 'female'].map((val) {
                return DropdownMenuItem(value: val, child: Text(val, style: TextStyle(color: Colors.white)));
              }).toList(),
              onChanged: (val) {
                setState(() {
                  gender = val!;
                });
              },
            ),
            Wrap(
              spacing: 10,
              children: [
                FilterChip(
                  label: Text('Back Pain'),
                  selected: issues.contains('back pain'),
                  onSelected: (val) {
                    setState(() {
                      val ? issues.add('back pain') : issues.remove('back pain');
                    });
                  },
                ),
                FilterChip(
                  label: Text('Knee Pain'),
                  selected: issues.contains('knee pain'),
                  onSelected: (val) {
                    setState(() {
                      val ? issues.add('knee pain') : issues.remove('knee pain');
                    });
                  },
                ),
              ],
            ),
            Wrap(
              spacing: 10,
              children: [
                FilterChip(
                  label: Text('Dumbbells'),
                  selected: equipment.contains('dumbbells'),
                  onSelected: (val) {
                    setState(() {
                      val ? equipment.add('dumbbells') : equipment.remove('dumbbells');
                    });
                  },
                ),
                FilterChip(
                  label: Text('Resistance Bands'),
                  selected: equipment.contains('resistance bands'),
                  onSelected: (val) {
                    setState(() {
                      val ? equipment.add('resistance bands') : equipment.remove('resistance bands');
                    });
                  },
                ),
              ],
            ),
            SizedBox(height: 20),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              onPressed: fetchRecommendation,
              child: Text('Get Recommendation'),
            ),
            SizedBox(height: 20),
            Expanded(
              child: ListView(
                children: recommendation
                    .map((rec) => ListTile(
                          title: Text(rec, style: TextStyle(color: Colors.white)),
                        ))
                    .toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
