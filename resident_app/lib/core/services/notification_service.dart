import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

class NotificationService {
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  
  static Future<void> init() async {
    // Request permission
    final settings = await _firebaseMessaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );
    
    if (kDebugMode) {
      print('Notification permission status: ${settings.authorizationStatus}');
    }
    
    // Get token
    final token = await _firebaseMessaging.getToken();
    if (kDebugMode) {
      print('FCM Token: $token');
    }
    
    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleMessage);
    
    // Handle background messages when app is opened
    FirebaseMessaging.onMessageOpenedApp.listen(_handleMessage);
    
    // Handle notification tap when app is in background
    final initialMessage = await _firebaseMessaging.getInitialMessage();
    if (initialMessage != null) {
      _handleMessage(initialMessage);
    }
  }
  
  static void _handleMessage(RemoteMessage message) {
    if (kDebugMode) {
      print('Received notification: ${message.notification?.title}');
    }
    
    // Handle notification based on data
    final data = message.data;
    final type = data['type'];
    
    switch (type) {
      case 'bill':
        // Navigate to bills
        break;
      case 'complaint':
        // Navigate to complaints
        break;
      case 'visitor':
        // Navigate to visitors
        break;
      case 'notice':
        // Navigate to notices
        break;
      default:
        break;
    }
  }
  
  static Future<String?> getToken() async {
    return await _firebaseMessaging.getToken();
  }
  
  static Future<void> subscribeToTopic(String topic) async {
    await _firebaseMessaging.subscribeToTopic(topic);
  }
  
  static Future<void> unsubscribeFromTopic(String topic) async {
    await _firebaseMessaging.unsubscribeFromTopic(topic);
  }
}
