import 'package:flutter/material.dart';
import 'services/marketplace_service.dart';
import 'models/marketplace.dart';

class MarketplaceOrdersPage extends StatefulWidget {
  const MarketplaceOrdersPage({super.key});

  @override
  State<MarketplaceOrdersPage> createState() => _MarketplaceOrdersPageState();
}

class _MarketplaceOrdersPageState extends State<MarketplaceOrdersPage> {
  final MarketplaceService _service = MarketplaceService();
  bool _loading = true;
  List<Order> _orders = [];

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    await _service.initialize();
    setState(() {
      _orders = _service.getOrders();
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text('My Orders', style: TextStyle(color: Colors.white)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Colors.red))
          : _orders.isEmpty
              ? Center(
                  child: Text('No orders yet', style: TextStyle(color: Colors.white54)),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _orders.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final o = _orders[index];
                    return Container(
                      decoration: BoxDecoration(
                        color: Colors.grey.shade900,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Order ${o.id}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                              Text(o.status.name.toUpperCase(), style: const TextStyle(color: Colors.white70)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text('Placed: ${o.orderDate.toLocal().toString().split('.').first}', style: const TextStyle(color: Colors.white54, fontSize: 12)),
                          const SizedBox(height: 8),
                          ...o.items.map((ci) => Padding(
                                padding: const EdgeInsets.symmetric(vertical: 4.0),
                                child: Row(
                                  children: [
                                    Expanded(child: Text('${ci.name} x${ci.quantity}', style: const TextStyle(color: Colors.white70))),
                                    Text('\$${(ci.price * ci.quantity).toStringAsFixed(2)}', style: const TextStyle(color: Colors.white)),
                                  ],
                                ),
                              )),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              Text('Total: \$${o.total.toStringAsFixed(2)}', style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}
