/**
 * Bills Page
 * View and pay maintenance bills
 */

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/router/app_router.dart';

class BillsPage extends StatefulWidget {
  const BillsPage({super.key});

  @override
  State<BillsPage> createState() => _BillsPageState();
}

class _BillsPageState extends State<BillsPage> with SingleTickerProviderStateMixin {
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
        title: const Text('Bills'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Pending'),
            Tab(text: 'Paid'),
          ],
          labelColor: AppTheme.primaryColor,
          indicatorColor: AppTheme.primaryColor,
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildPendingBills(),
          _buildPaidBills(),
        ],
      ),
    );
  }

  Widget _buildPendingBills() {
    // Sample pending bills
    final pendingBills = [
      _BillItem(
        billNumber: 'BILL-2024-001',
        month: 'January 2024',
        amount: 4500,
        dueDate: '15 Feb 2024',
        status: 'PENDING',
      ),
      _BillItem(
        billNumber: 'BILL-2023-012',
        month: 'December 2023',
        amount: 4200,
        dueDate: '15 Jan 2024',
        status: 'OVERDUE',
      ),
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: pendingBills.length,
      itemBuilder: (context, index) {
        final bill = pendingBills[index];
        return _buildBillCard(bill);
      },
    );
  }

  Widget _buildPaidBills() {
    // Sample paid bills
    final paidBills = [
      _BillItem(
        billNumber: 'BILL-2023-011',
        month: 'November 2023',
        amount: 4200,
        dueDate: '15 Dec 2023',
        status: 'PAID',
      ),
      _BillItem(
        billNumber: 'BILL-2023-010',
        month: 'October 2023',
        amount: 4000,
        dueDate: '15 Nov 2023',
        status: 'PAID',
      ),
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: paidBills.length,
      itemBuilder: (context, index) {
        final bill = paidBills[index];
        return _buildBillCard(bill);
      },
    );
  }

  Widget _buildBillCard(_BillItem bill) {
    final isPaid = bill.status == 'PAID';
    final isOverdue = bill.status == 'OVERDUE';

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
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      bill.billNumber,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: Colors.grey,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: isPaid
                            ? AppTheme.successColor.withOpacity(0.1)
                            : isOverdue
                                ? AppTheme.errorColor.withOpacity(0.1)
                                : AppTheme.warningColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        bill.status,
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: isPaid
                              ? AppTheme.successColor
                              : isOverdue
                                  ? AppTheme.errorColor
                                  : AppTheme.warningColor,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  bill.month,
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.secondaryColor,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Amount Due',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: Colors.grey,
                          ),
                        ),
                        Text(
                          '₹${bill.amount.toString()}',
                          style: GoogleFonts.inter(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.secondaryColor,
                          ),
                        ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          isPaid ? 'Paid On' : 'Due Date',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: Colors.grey,
                          ),
                        ),
                        Text(
                          bill.dueDate,
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: isOverdue ? AppTheme.errorColor : Colors.grey.shade700,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
          if (!isPaid)
            Container(
              decoration: BoxDecoration(
                border: Border(
                  top: BorderSide(color: Colors.grey.shade200),
                ),
              ),
              child: TextButton(
                onPressed: () {
                  Navigator.pushNamed(
                    context,
                    AppRoutes.payment,
                    arguments: {
                      'billId': bill.billNumber,
                      'amount': bill.amount,
                    },
                  );
                },
                child: const Text('Pay Now'),
              ),
            ),
        ],
      ),
    );
  }
}

class _BillItem {
  final String billNumber;
  final String month;
  final int amount;
  final String dueDate;
  final String status;

  _BillItem({
    required this.billNumber,
    required this.month,
    required this.amount,
    required this.dueDate,
    required this.status,
  });
}
