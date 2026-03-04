import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  static const String baseUrl = 'http://10.0.2.2:3000/api/v1';
  static const storage = FlutterSecureStorage();
  
  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  static void init() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await storage.read(key: 'access_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            // Try to refresh token
            final refreshToken = await storage.read(key: 'refresh_token');
            if (refreshToken != null) {
              try {
                final response = await Dio().post(
                  '$baseUrl/auth/refresh',
                  data: {'refresh_token': refreshToken},
                );
                await storage.write(
                  key: 'access_token',
                  value: response.data['access_token'],
                );
                
                // Retry the original request
                error.requestOptions.headers['Authorization'] = 
                  'Bearer ${response.data['access_token']}';
                final retryResponse = await _dio.fetch(error.requestOptions);
                return handler.resolve(retryResponse);
              } catch (e) {
                await storage.delete(key: 'access_token');
                await storage.delete(key: 'refresh_token');
              }
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  // Auth APIs
  static Future<Response> login(String phone, String password) async {
    return _dio.post('/auth/login', data: {'phone': phone, 'password': password});
  }

  static Future<Response> register(Map<String, dynamic> data) async {
    return _dio.post('/auth/register', data: data);
  }

  static Future<Response> verifyOtp(String phone, String otp) async {
    return _dio.post('/auth/otp/verify', data: {'phone': phone, 'otp': otp});
  }

  // Bills APIs
  static Future<Response> getBills() async {
    return _dio.get('/bills');
  }

  static Future<Response> getBillById(String id) async {
    return _dio.get('/bills/$id');
  }

  // Payments APIs
  static Future<Response> createRazorpayOrder(String billId) async {
    return _dio.post('/payments/razorpay/order', data: {'bill_id': billId});
  }

  static Future<Response> verifyPayment(Map<String, dynamic> data) async {
    return _dio.post('/payments/verify', data: data);
  }

  static Future<Response> getPaymentHistory() async {
    return _dio.get('/payments');
  }

  // Complaints APIs
  static Future<Response> getComplaints() async {
    return _dio.get('/complaints');
  }

  static Future<Response> createComplaint(Map<String, dynamic> data) async {
    return _dio.post('/complaints', data: data);
  }

  // Notices APIs
  static Future<Response> getNotices() async {
    return _dio.get('/notices');
  }

  // Visitors APIs
  static Future<Response> getVisitors() async {
    return _dio.get('/visitors');
  }

  static Future<Response> approveVisitor(String id) async {
    return _dio.put('/visitors/$id/approve');
  }

  static Future<Response> rejectVisitor(String id) async {
    return _dio.put('/visitors/$id/reject');
  }

  // Amenities APIs
  static Future<Response> getAmenities() async {
    return _dio.get('/amenities');
  }

  static Future<Response> getAmenityBookings() async {
    return _dio.get('/amenities/bookings');
  }

  static Future<Response> createBooking(Map<String, dynamic> data) async {
    return _dio.post('/amenities/bookings', data: data);
  }

  // Chat APIs
  static Future<Response> getChatMessages() async {
    return _dio.get('/chat/messages');
  }

  static Future<Response> sendMessage(Map<String, dynamic> data) async {
    return _dio.post('/chat/messages', data: data);
  }

  // User APIs
  static Future<Response> getProfile() async {
    return _dio.get('/users/me');
  }

  static Future<Response> updateProfile(Map<String, dynamic> data) async {
    return _dio.put('/users/me', data: data);
  }

  // Society APIs
  static Future<Response> getSociety() async {
    return _dio.get('/societies/current');
  }
}
