/**
 * Complaints Page
 * View and manage complaints
 */

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/router/app_router.dart';

class ComplaintsPage extends StatelessWidget {
  const ComplaintsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Complaints'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              Navigator.pushNamed(context, AppRoutes.createComplaint);
            },
          ),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 3,
        itemBuilder: (context, index) {
          return _buildComplaintCard(context, index);
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.pushNamed(context, AppRoutes.createComplaint);
        },
        icon: const Icon(Icons.add),
        label: const Text('New Complaint'),
        backgroundColor: AppTheme.primaryColor,
      ),
    );
  }

  Widget _buildComplaintCard(BuildContext context, int index) {
    final complaints = [
      {'id': '1', 'title': 'Water Leakage', 'status': 'OPEN', 'date': '2 days ago'},
      {'id': '2', 'title': 'Parking Issue', 'status': 'IN_PROGRESS', 'date': '5 days ago'},
      {'id': '3', 'title': 'Lift Not Working', 'status': 'RESOLVED', 'date': '1 week ago'},
    ];
    
    final complaint = complaints[index];
    final statusColor = complaint['status'] == 'OPEN' 
        ? AppTheme.errorColor 
        : complaint['status'] == 'IN_PROGRESS' 
            ? AppTheme.warningColor 
            : AppTheme.successColor;

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
            color: statusColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(
            complaint['status'] == 'RESOLVED' 
                ? Icons.check_circle 
                : Icons.report_problem,
            color: statusColor,
          ),
        ),
        title: Text(
          complaint['title'] ?? '',
          style: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              'ID: CMP-00${complaint['id']}',
              style: GoogleFonts.inter(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 4),
            Text(
              complaint['date'] ?? '',
              style: GoogleFonts.inter(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: statusColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            complaint['status'] ?? '',
            style: GoogleFonts.inter(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: statusColor,
            ),
          ),
        ),
        onTap: () {
          Navigator.pushNamed(
            context,
            AppRoutes.complaintDetail,
            arguments: {'complaintId': complaint['id']},
          );
        },
      ),
    );
  }
}
