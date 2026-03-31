import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CustomizationPage extends StatefulWidget {
  const CustomizationPage({super.key});

  @override
  State<CustomizationPage> createState() => _CustomizationPageState();
}

class _CustomizationPageState extends State<CustomizationPage> {
  String _selectedTheme = 'Dark';
  String _selectedLanguage = 'English';
  bool _notificationsEnabled = true;
  bool _soundEnabled = true;
  double _textSize = 16.0;

  final List<String> _themes = ['Dark', 'Light', 'Red', 'Blue'];
  final List<String> _languages = ['English', 'Spanish', 'French', 'German'];

  @override
  void initState() {
    super.initState();
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _selectedTheme = prefs.getString('theme') ?? 'Dark';
      _selectedLanguage = prefs.getString('language') ?? 'English';
      _notificationsEnabled = prefs.getBool('notifications') ?? true;
      _soundEnabled = prefs.getBool('sound') ?? true;
      _textSize = prefs.getDouble('textSize') ?? 16.0;
    });
  }

  Future<void> _savePreference(String key, dynamic value) async {
    final prefs = await SharedPreferences.getInstance();
    if (value is String) {
      await prefs.setString(key, value);
    } else if (value is bool) {
      await prefs.setBool(key, value);
    } else if (value is double) {
      await prefs.setDouble(key, value);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Customization'),
        backgroundColor: Colors.black,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSectionTitle('Appearance'),
          _buildThemeSelector(),
          _buildTextSizeSlider(),
          const SizedBox(height: 32),
          _buildSectionTitle('Language & Region'),
          _buildLanguageSelector(),
          const SizedBox(height: 32),
          _buildSectionTitle('Notifications'),
          _buildNotificationSettings(),
          const SizedBox(height: 32),
          _buildSectionTitle('Sound'),
          _buildSoundSettings(),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: _resetToDefaults,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.grey,
              minimumSize: const Size(double.infinity, 50),
            ),
            child: const Text('Reset to Defaults'),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Text(
        title,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildThemeSelector() {
    return Card(
      color: Colors.grey[900],
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'App Theme',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              children: _themes.map((theme) => _buildThemeOption(theme)).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildThemeOption(String theme) {
    final isSelected = _selectedTheme == theme;
    return ChoiceChip(
      label: Text(theme),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          setState(() {
            _selectedTheme = theme;
          });
          _savePreference('theme', theme);
        }
      },
      selectedColor: Colors.red,
      backgroundColor: Colors.grey[700],
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : Colors.grey[300],
      ),
    );
  }

  Widget _buildTextSizeSlider() {
    return Card(
      color: Colors.grey[900],
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Text Size: ${_textSize.toInt()}',
              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            Slider(
              value: _textSize,
              min: 12,
              max: 24,
              divisions: 12,
              onChanged: (value) {
                setState(() {
                  _textSize = value;
                });
                _savePreference('textSize', value);
              },
              activeColor: Colors.red,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLanguageSelector() {
    return Card(
      color: Colors.grey[900],
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: DropdownButtonFormField<String>(
          initialValue: _selectedLanguage,
          decoration: const InputDecoration(
            labelText: 'Language',
            labelStyle: TextStyle(color: Colors.white),
            enabledBorder: UnderlineInputBorder(
              borderSide: BorderSide(color: Colors.grey),
            ),
          ),
          dropdownColor: Colors.grey[800],
          style: const TextStyle(color: Colors.white),
          items: _languages.map((language) {
            return DropdownMenuItem(
              value: language,
              child: Text(language),
            );
          }).toList(),
          onChanged: (value) {
            if (value != null) {
              setState(() {
                _selectedLanguage = value;
              });
              _savePreference('language', value);
            }
          },
        ),
      ),
    );
  }

  Widget _buildNotificationSettings() {
    return Card(
      color: Colors.grey[900],
      child: SwitchListTile(
        title: const Text(
          'Enable Notifications',
          style: TextStyle(color: Colors.white),
        ),
        subtitle: const Text(
          'Receive reminders and updates',
          style: TextStyle(color: Colors.grey),
        ),
        value: _notificationsEnabled,
        onChanged: (value) {
          setState(() {
            _notificationsEnabled = value;
          });
          _savePreference('notifications', value);
        },
        activeThumbColor: Colors.red,
      ),
    );
  }

  Widget _buildSoundSettings() {
    return Card(
      color: Colors.grey[900],
      child: SwitchListTile(
        title: const Text(
          'Enable Sound',
          style: TextStyle(color: Colors.white),
        ),
        subtitle: const Text(
          'Play sounds for interactions',
          style: TextStyle(color: Colors.grey),
        ),
        value: _soundEnabled,
        onChanged: (value) {
          setState(() {
            _soundEnabled = value;
          });
          _savePreference('sound', value);
        },
        activeThumbColor: Colors.red,
      ),
    );
  }

  void _resetToDefaults() {
    setState(() {
      _selectedTheme = 'Dark';
      _selectedLanguage = 'English';
      _notificationsEnabled = true;
      _soundEnabled = true;
      _textSize = 16.0;
    });
    _saveAllPreferences();
  }

  Future<void> _saveAllPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('theme', _selectedTheme);
    await prefs.setString('language', _selectedLanguage);
    await prefs.setBool('notifications', _notificationsEnabled);
    await prefs.setBool('sound', _soundEnabled);
    await prefs.setDouble('textSize', _textSize);
  }
}
