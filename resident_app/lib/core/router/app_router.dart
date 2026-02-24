/**
 * App Router Configuration
 * Route Management
 */

import 'package:flutter/material.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/otp_verification_page.dart';
import '../../features/auth/presentation/pages/society_selection_page.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../../features/dashboard/presentation/pages/dashboard_page.dart';
import '../../features/bills/presentation/pages/bills_page.dart';
import '../../features/bills/presentation/pages/bill_detail_page.dart';
import '../../features/complaints/presentation/pages/complaints_page.dart';
import '../../features/complaints/presentation/pages/complaint_detail_page.dart';
import '../../features/complaints/presentation/pages/create_complaint_page.dart';
import '../../features/notices/presentation/pages/notices_page.dart';
import '../../features/notices/presentation/pages/notice_detail_page.dart';
import '../../features/visitors/presentation/pages/visitors_page.dart';
import '../../features/visitors/presentation/pages/visitor_approval_page.dart';
import '../../features/amenities/presentation/pages/amenities_page.dart';
import '../../features/amenities/presentation/pages/booking_page.dart';
import '../../features/chat/presentation/pages/chat_page.dart';
import '../../features/profile/presentation/pages/profile_page.dart';
import '../../features/payments/presentation/pages/payment_page.dart';

class AppRoutes {
  static const String splash = '/';
  static const String login = '/login';
  static const String otpVerification = '/otp-verification';
  static const String societySelection = '/society-selection';
  static const String home = '/home';
  static const String dashboard = '/dashboard';
  
  // Bills
  static const String bills = '/bills';
  static const String billDetail = '/bills/detail';
  
  // Complaints
  static const String complaints = '/complaints';
  static const String complaintDetail = '/complaints/detail';
  static const String createComplaint = '/complaints/create';
  
  // Notices
  static const String notices = '/notices';
  static const String noticeDetail = '/notices/detail';
  
  // Visitors
  static const String visitors = '/visitors';
  static const String visitorApproval = '/visitors/approval';
  
  // Amenities
  static const String amenities = '/amenities';
  static const String booking = '/amenities/booking';
  
  // Chat
  static const String chat = '/chat';
  
  // Profile
  static const String profile = '/profile';
  
  // Payments
  static const String payment = '/payment';
}

class AppRouter {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case AppRoutes.login:
        return MaterialPageRoute(builder: (_) => const LoginPage());
        
      case AppRoutes.otpVerification:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => OtpVerificationPage(
            phone: args['phone'] ?? '',
            isRegistration: args['isRegistration'] ?? false,
          ),
        );
        
      case AppRoutes.societySelection:
        return MaterialPageRoute(builder: (_) => const SocietySelectionPage());
        
      case AppRoutes.home:
        return MaterialPageRoute(builder: (_) => const HomePage());
        
      case AppRoutes.dashboard:
        return MaterialPageRoute(builder: (_) => const DashboardPage());
        
      case AppRoutes.bills:
        return MaterialPageRoute(builder: (_) => const BillsPage());
        
      case AppRoutes.billDetail:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => BillDetailPage(billId: args['billId']),
        );
        
      case AppRoutes.complaints:
        return MaterialPageRoute(builder: (_) => const ComplaintsPage());
        
      case AppRoutes.complaintDetail:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => ComplaintDetailPage(complaintId: args['complaintId']),
        );
        
      case AppRoutes.createComplaint:
        return MaterialPageRoute(builder: (_) => const CreateComplaintPage());
        
      case AppRoutes.notices:
        return MaterialPageRoute(builder: (_) => const NoticesPage());
        
      case AppRoutes.noticeDetail:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => NoticeDetailPage(noticeId: args['noticeId']),
        );
        
      case AppRoutes.visitors:
        return MaterialPageRoute(builder: (_) => const VisitorsPage());
        
      case AppRoutes.visitorApproval:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => VisitorApprovalPage(visitorId: args['visitorId']),
        );
        
      case AppRoutes.amenities:
        return MaterialPageRoute(builder: (_) => const AmenitiesPage());
        
      case AppRoutes.booking:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => BookingPage(amenityId: args['amenityId']),
        );
        
      case AppRoutes.chat:
        return MaterialPageRoute(builder: (_) => const ChatPage());
        
      case AppRoutes.profile:
        return MaterialPageRoute(builder: (_) => const ProfilePage());
        
      case AppRoutes.payment:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => PaymentPage(
            billId: args['billId'],
            amount: args['amount'],
          ),
        );
        
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(
              child: Text('Route not found: ${settings.name}'),
            ),
          ),
        );
    }
  }
}
