import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static late SharedPreferences _prefs;
  
  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _userKey = 'user';
  static const String _societyKey = 'society';
  static const String _flatKey = 'flat';
  static const String _isLoggedInKey = 'is_logged_in';
  static const String _fcmTokenKey = 'fcm_token';
  
  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }
  
  // Token Management
  static Future<void> saveTokens(String accessToken, String refreshToken) async {
    await _prefs.setString(_accessTokenKey, accessToken);
    await _prefs.setString(_refreshTokenKey, refreshToken);
  }
  
  static String? getAccessToken() {
    return _prefs.getString(_accessTokenKey);
  }
  
  static String? getRefreshToken() {
    return _prefs.getString(_refreshTokenKey);
  }
  
  static Future<void> clearTokens() async {
    await _prefs.remove(_accessTokenKey);
    await _prefs.remove(_refreshTokenKey);
  }
  
  // User Data
  static Future<void> saveUser(Map<String, dynamic> user) async {
    await _prefs.setString(_userKey, user.toString());
  }
  
  static Map<String, dynamic>? getUser() {
    final userStr = _prefs.getString(_userKey);
    if (userStr != null) {
      // Parse user string to map if needed
      return {};
    }
    return null;
  }
  
  static Future<void> clearUser() async {
    await _prefs.remove(_userKey);
  }
  
  // Society Data
  static Future<void> saveSociety(Map<String, dynamic> society) async {
    await _prefs.setString(_societyKey, society.toString());
  }
  
  static Future<void> clearSociety() async {
    await _prefs.remove(_societyKey);
  }
  
  // Flat Data
  static Future<void> saveFlat(Map<String, dynamic> flat) async {
    await _prefs.setString(_flatKey, flat.toString());
  }
  
  static Future<void> clearFlat() async {
    await _prefs.remove(_flatKey);
  }
  
  // Login Status
  static Future<void> setLoggedIn(bool value) async {
    await _prefs.setBool(_isLoggedInKey, value);
  }
  
  static bool isLoggedIn() {
    return _prefs.getBool(_isLoggedInKey) ?? false;
  }
  
  // FCM Token
  static Future<void> saveFcmToken(String token) async {
    await _prefs.setString(_fcmTokenKey, token);
  }
  
  static String? getFcmToken() {
    return _prefs.getString(_fcmTokenKey);
  }
  
  // Clear All
  static Future<void> clearAll() async {
    await _prefs.clear();
  }
}
