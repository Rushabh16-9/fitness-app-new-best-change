import 'package:flutter/material.dart';
import 'marketplace_page.dart';

class InAppMarketplacePage extends StatelessWidget {
  const InAppMarketplacePage({super.key});

  @override
  Widget build(BuildContext context) {
    // Immediately redirect to the canonical MarketplacePage to avoid
    // duplicated UI and to keep this file minimal and analyzer-clean.
    Future.microtask(() => Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const MarketplacePage())));
    return const SizedBox.shrink();
  }
}

