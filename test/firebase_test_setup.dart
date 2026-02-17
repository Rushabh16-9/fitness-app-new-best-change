import 'package:firebase_core_platform_interface/firebase_core_platform_interface.dart';
import 'package:flutter_test/flutter_test.dart';

class FakeFirebasePlatform extends FirebasePlatform {
  final Map<String, FakeFirebaseAppPlatform> _apps = {};

  @override
  Future<FirebaseAppPlatform> initializeApp({
    String? name,
    FirebaseOptions? options,
  }) async {
    final appName = name ?? '[DEFAULT]';
    final app = FakeFirebaseAppPlatform(appName, options ?? FirebaseOptions(
      apiKey: '',
      appId: '',
      messagingSenderId: '',
      projectId: '',
    ));
    _apps[appName] = app;
    return app;
  }

  @override
  FirebaseAppPlatform app([String name = '[DEFAULT]']) {
    return _apps[name] ?? FakeFirebaseAppPlatform(name, FirebaseOptions(
      apiKey: '',
      appId: '',
      messagingSenderId: '',
      projectId: '',
    ));
  }
}

class FakeFirebaseAppPlatform extends FirebaseAppPlatform {
  FakeFirebaseAppPlatform(super.name, super.options);

  @override
  Future<void> delete() async {}
}

void setupFirebaseMocks() {
  TestWidgetsFlutterBinding.ensureInitialized();
  FirebasePlatform.instance = FakeFirebasePlatform();
}
