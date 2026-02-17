import 'package:flutter/material.dart';
import 'marketplace_page.dart';
// redirect-only page

class EquipmentMarketplacePage extends StatefulWidget {
  const EquipmentMarketplacePage({super.key});
  @override
  State<EquipmentMarketplacePage> createState() => _EquipmentMarketplacePageState();
}

class _EquipmentMarketplacePageState extends State<EquipmentMarketplacePage> with SingleTickerProviderStateMixin {
  // redirect-only: no local services needed
  // redirect-only helper page: no local state required

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    // no-op: this page redirects to the canonical MarketplacePage immediately
    return;
  }

  // redirect-only helper page: helpers removed

  // helper widgets removed since page redirects

  // filtered catalog helper removed; page now redirects

  @override
  Widget build(BuildContext context) {
    // Redirect to canonical MarketplacePage to avoid duplicates
    Future.microtask(() => Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const MarketplacePage())));
    return const SizedBox.shrink();
  }
}
