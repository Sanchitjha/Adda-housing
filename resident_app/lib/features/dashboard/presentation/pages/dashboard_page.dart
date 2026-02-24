/**
 * Dashboard Page
 * Main home screen with summary and quick actions
 */

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/router/app_router.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../widgets/quick_action_card.dart';
import '../widgets/summary_card.dart';
import '../widgets/recent_activity_widget.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            // Refresh dashboard data
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                _buildHeader(context),
                const SizedBox(height: 24),
                
                // Quick Actions
                _buildQuickActions(context),
                const SizedBox(height: 24),
                
                // Summary Cards
                _buildSummarySection(),
                const SizedBox(height: 24),
                
                // Recent Activity
                _buildRecentActivity(),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        String userName = 'Resident';
        String flatNumber = '';
        
        if (state is AuthAuthenticated) {
          userName = state.user.firstName ?? 'Resident';
          flatNumber = state.user.flatNumber ?? '';
        }
        
        return Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hello, $userName 👋',
                  style: GoogleFonts.inter(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.secondaryColor,
                  ),
                ),
                if (flatNumber.isNotEmpty)
                  Text(
                    'Flat $flatNumber',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: Colors.grey,
                    ),
                  ),
              ],
            ),
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.notifications_outlined),
                  onPressed: () {
                    // Navigate to notifications
                  },
                ),
                GestureDetector(
                  onTap: () {
                    Navigator.pushNamed(context, AppRoutes.profile);
                  },
                  child: CircleAvatar(
                    radius: 20,
                    backgroundColor: AppTheme.primaryColor,
                    child: Text(
                      userName.isNotEmpty ? userName[0].toUpperCase() : 'R',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Actions',
          style: GoogleFonts.inter(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AppTheme.secondaryColor,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            QuickActionCard(
              icon: Icons.receipt_long,
              label: 'Pay Bill',
              color: AppTheme.primaryColor,
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.bills);
              },
            ),
            QuickActionCard(
              icon: Icons.add_circle_outline,
              label: 'Complaint',
              color: AppTheme.warningColor,
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.createComplaint);
              },
            ),
            QuickActionCard(
              icon: Icons.qr_code,
              label: 'Visitors',
              color: AppTheme.accentColor,
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.visitors);
              },
            ),
            QuickActionCard(
              icon: Icons.calendar_month,
              label: 'Amenities',
              color: Colors.purple,
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.amenities);
              },
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSummarySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Overview',
          style: GoogleFonts.inter(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AppTheme.secondaryColor,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: SummaryCard(
                title: 'Pending Bills',
                value: '₹4,500',
                subtitle: 'Due in 5 days',
                icon: Icons.receipt,
                color: AppTheme.warningColor,
                onTap: () {},
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: SummaryCard(
                title: 'Open Complaints',
                value: '2',
                subtitle: 'View status',
                icon: Icons.report_problem,
                color: AppTheme.errorColor,
                onTap: () {},
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: SummaryCard(
                title: 'Pending Visitors',
                value: '1',
                subtitle: 'Needs approval',
                icon: Icons.people,
                color: AppTheme.accentColor,
                onTap: () {},
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: SummaryCard(
                title: 'Notices',
                value: '3',
                subtitle: 'New updates',
                icon: Icons.campaign,
                color: AppTheme.primaryColor,
                onTap: () {},
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildRecentActivity() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Recent Activity',
              style: GoogleFonts.inter(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppTheme.secondaryColor,
              ),
            ),
            TextButton(
              onPressed: () {},
              child: const Text('See All'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        const RecentActivityWidget(),
      ],
    );
  }
}
