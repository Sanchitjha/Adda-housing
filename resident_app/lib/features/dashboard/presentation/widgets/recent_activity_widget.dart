/**
 * Recent Activity Widget
 */

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';

class RecentActivityWidget extends StatelessWidget {
  const RecentActivityWidget({super.key});

  @override
  Widget build(BuildContext context) {
    // Sample data - will be replaced with actual data from API
    final activities = [
      _ActivityItem(
        icon: Icons.receipt_long,
        title: 'Bill Generated',
        subtitle: 'Maintenance bill for January 2024',
        time: '2 hours ago',
        color: AppTheme.primaryColor,
      ),
      _ActivityItem(
        icon: Icons.check_circle,
        title: 'Complaint Resolved',
        subtitle: 'Water leakage issue - Resolved',
        time: '1 day ago',
        color: AppTheme.successColor,
      ),
      _ActivityItem(
        icon: Icons.person,
        title: 'Visitor Approved',
        subtitle: 'John Doe approved for Flat 101',
        time: '2 days ago',
        color: AppTheme.accentColor,
      ),
    ];

    return Container(
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
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: activities.length,
        separatorBuilder: (context, index) => Divider(
          height: 1,
          color: Colors.grey.shade200,
        ),
        itemBuilder: (context, index) {
          final activity = activities[index];
          return ListTile(
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 8,
            ),
            leading: Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: activity.color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                activity.icon,
                color: activity.color,
                size: 22,
              ),
            ),
            title: Text(
              activity.title,
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppTheme.secondaryColor,
              ),
            ),
            subtitle: Text(
              activity.subtitle,
              style: GoogleFonts.inter(
                fontSize: 12,
                color: Colors.grey,
              ),
            ),
            trailing: Text(
              activity.time,
              style: GoogleFonts.inter(
                fontSize: 11,
                color: Colors.grey,
              ),
            ),
          );
        },
      ),
    );
  }
}

class _ActivityItem {
  final IconData icon;
  final String title;
  final String subtitle;
  final String time;
  final Color color;

  _ActivityItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.time,
    required this.color,
  });
}
