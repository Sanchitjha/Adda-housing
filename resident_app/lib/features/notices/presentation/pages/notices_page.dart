/**
 * Notices Page
 * View society notices and announcements
 */

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/router/app_router.dart';

class NoticesPage extends StatelessWidget {
  const NoticesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notices'),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 5,
        itemBuilder: (context, index) {
          return _buildNoticeCard(context, index);
        },
      ),
    );
  }

  Widget _buildNoticeCard(BuildContext context, int index) {
    final notices = [
      {'id': '1', 'title': 'Society Meeting', 'date': 'Today', 'type': 'IMPORTANT'},
      {'id': '2', 'title': 'Maintenance Work', 'date': 'Yesterday', 'type': 'MAINTENANCE'},
      {'id': '3', 'title': 'Holiday Notice', 'date': '2 days ago', 'type': 'GENERAL'},
      {'id': '4', 'title': 'Emergency Contact Update', 'date': '1 week ago', 'type': 'EMERGENCY'},
      {'id': '5', 'title': 'New Facility Opening', 'date': '2 weeks ago', 'type': 'ANNOUNCEMENT'},
    ];
    
    final notice = notices[index];
    final typeColor = notice['type'] == 'EMERGENCY' 
        ? AppTheme.errorColor 
        : notice['type'] == 'IMPORTANT' 
            ? AppTheme.warningColor 
            : AppTheme.primaryColor;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: typeColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(
            notice['type'] == 'EMERGENCY' 
                ? Icons.warning 
                : Icons.campaign,
            color: typeColor,
          ),
        ),
        title: Text(
          notice['title'] ?? '',
          style: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Text(
          notice['date'] ?? '',
          style: GoogleFonts.inter(fontSize: 12, color: Colors.grey),
        ),
        trailing: Icon(Icons.chevron_right, color: Colors.grey.shade400),
        onTap: () {
          Navigator.pushNamed(
            context,
            AppRoutes.noticeDetail,
            arguments: {'noticeId': notice['id']},
          );
        },
      ),
    );
  }
}
