import 'package:flutter/material.dart';

class ReportScreen extends StatefulWidget {
  const ReportScreen({super.key});
  @override
  State<ReportScreen> createState() => _ReportScreenState();
}
class _ReportScreenState extends State<ReportScreen> {
  String _reason = 'HARASSMENT';
  final _details = TextEditingController();
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Report')),
    body: Padding(padding: const EdgeInsets.all(24), child: Column(children: [
      DropdownButtonFormField(initialValue: _reason, items: const ['HARASSMENT','HATE','SEXUAL_CONTENT','SPAM','UNDERAGE','THREATS','OTHER'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(), onChanged: (v) => setState(() => _reason = v!)),
      TextField(controller: _details, maxLength: 2000, decoration: const InputDecoration(labelText: 'Details (optional)')),
      FilledButton(onPressed: () => Navigator.pop(context), child: const Text('Submit report')),
    ])),
  );
}
