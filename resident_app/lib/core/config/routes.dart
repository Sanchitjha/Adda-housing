import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/otp_verify_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/home/presentation/pages/main_page.dart';
import '../../features/home/presentation/pages/dashboard_page.dart';
import '../../features/bills/presentation/pages/bills_page.dart';
import '../../features/bills/presentation/pages/payment_page.dart';
import '../../features/complaints/presentation/pages/complaints_page.dart';
import '../../features/complaints/presentation/pages/add_complaint_page.dart';
import '../../features/notices/presentation/pages/notices_page.dart';
import '../../features/visitors/presentation/pages/visitors_page.dart';
import '../../features/amenities/presentation/pages/amenities_page.dart';
import '../../features/chat/presentation/pages/chat_page.dart';
import '../../features/profile/presentation/pages/profile_page.dart';

class AppRouter {
  static const storage = FlutterSecureStorage();
  
  static final router = GoRouter(
    initialLocation: '/login',
    redirect: (context, state) async {
      final token = await storage.read(key: 'access_token');
      final isLoggedIn = token != null;
      final isAuthRoute = state.matchedLocation == '/login' || 
                          state.matchedLocation == '/register' ||
                          state.matchedLocation == '/otp-verify';
      
      if (!isLoggedIn && !isAuthRoute) {
        return '/login';
      }
      
      if (isLoggedIn && isAuthRoute) {
        return '/home';
      }
      
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterPage(),
      ),
      GoRoute(
        path: '/otp-verify',
        builder: (context, state) {
          final phone = state.extra as String? ?? '';
          return OtpVerifyPage(phone: phone);
        },
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const MainPage(),
        routes: [
          GoRoute(
            path: 'dashboard',
            builder: (context, state) => const DashboardPage(),
          ),
          GoRoute(
            path: 'bills',
            builder: (context, state) => const BillsPage(),
          ),
          GoRoute(
            path: 'payment/:billId',
            builder: (context, state) {
              final billId = state.pathParameters['billId']!;
              return PaymentPage(billId: billId);
            },
          ),
          GoRoute(
            path: 'complaints',
            builder: (context, state) => const ComplaintsPage(),
          ),
          GoRoute(
            path: 'add-complaint',
            builder: (context, state) => const AddComplaintPage(),
          ),
          GoRoute(
            path: 'notices',
            builder: (context, state) => const NoticesPage(),
          ),
          GoRoute(
            path: 'visitors',
            builder: (context, state) => const VisitorsPage(),
          ),
          GoRoute(
            path: 'amenities',
            builder: (context, state) => const AmenitiesPage(),
          ),
          GoRoute(
            path: 'chat',
            builder: (context, state) => const ChatPage(),
          ),
          GoRoute(
            path: 'profile',
            builder: (context, state) => const ProfilePage(),
          ),
        ],
      ),
    ],
  );
}
