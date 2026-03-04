import 'package:flutter/material.dart';

class PaymentPage extends StatelessWidget {
  final String billId;
  const PaymentPage({super.key, required this.billId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Payment')),
      body: const Center(child: Text('Payment Page')),
    );
  }
}
