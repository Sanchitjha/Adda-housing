/**
 * Visitors Page
 * View and manage visitor approvals
 */

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';

class VisitorsPage extends StatefulWidget {
  const VisitorsPage({super.key});

  @override
  State<VisitorsPage> createState() => _VisitorsPageState();
}

class _VisitorsPageState extends State<VisitorsPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Visitors'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Pending'),
            Tab(text: 'History'),
          ],
          labelColor: AppTheme.primaryColor,
          indicatorColor: AppTheme.primaryColor,
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildPendingVisitors(),
          _buildVisitorHistory(),
        ],
      ),
    );
  }

  Widget _buildPendingVisitors() {
    final pendingVisitors = [
      {'id': '1', 'name': 'John Doe', 'purpose': 'Guest', 'flat': '101', 'time': '10:30 AM'},
      {'id': '2', 'name': 'Delivery', 'purpose': 'Delivery', 'flat': '102', 'time': '11:00 AM'},
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: pendingVisitors.length,
      itemBuilder: (context, index) {
        final visitor = pendingVisitors[index];
        return _buildVisitorCard(visitor, showActions: true);
      },
    );
  }

  Widget _buildVisitorHistory() {
    final historyVisitors = [
      {'id': '3', 'name': 'Alice Smith', 'purpose': 'Guest', 'flat': '101', 'time': 'Yesterday'},
      {'id': '4', 'name': 'Pizza Delivery', 'purpose': 'Delivery', 'flat': '103', 'time': 'Yesterday'},
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: historyVisitors.length,
      itemBuilder: (context, index) {
        final visitor = historyVisitors[index];
        return _buildVisitorCard(visitor, showActions: false);
      },
    );
  }

  Widget _buildVisitorCard(Map<String, String> visitor, {required bool showActions}) {
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
      child: Column(
        children: [
          ListTile(
            contentPadding: const EdgeInsets.all(16),
            leading: CircleAvatar(
              backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
              child: Icon(Icons.person, color: AppTheme.primaryColor),
            ),
            title: Text(
              visitor['name'] ?? '',
              style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Flat: ${visitor['flat']} • ${visitor['purpose']}'),
                Text(visitor['time'] ?? '', style: TextStyle(color: Colors.grey, fontSize: 12)),
              ],
            ),
          ),
          if (showActions)
            Container(
              decoration: BoxDecoration(
                border: Border(top: BorderSide(color: Colors.grey.shade200)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextButton(
                      onPressed: () {
                        // Reject visitor
                      },
                      child: const Text('Reject', style: TextStyle(color: Colors.red)),
                    ),
                  ),
                  Container(width: 1, height: 24, color: Colors.grey.shade200),
                  Expanded(
                    child: TextButton(
                      onPressed: () {
                        // Approve visitor
                      },
                      child: const Text('Approve', style: TextStyle(color: Colors.green)),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
