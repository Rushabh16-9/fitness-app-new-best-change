import 'package:flutter/material.dart';
import 'equipment_recommendation_service.dart';

class EquipmentDetailPage extends StatelessWidget {
  final EquipmentItem item;
  final VoidCallback onBuy;
  const EquipmentDetailPage({super.key, required this.item, required this.onBuy});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            backgroundColor: Colors.black,
            expandedHeight: 260,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(item.name, maxLines: 1, overflow: TextOverflow.ellipsis),
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Hero(
                    tag: 'equip:${item.id}',
                    child: Image.asset(item.image, fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const ColoredBox(color: Colors.black38),
                    ),
                  ),
                  Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Colors.transparent, Colors.black],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Chip(label: Text(item.category.toUpperCase()), backgroundColor: Colors.redAccent.withOpacity(.15)),
                      const SizedBox(width: 8),
                      Chip(label: Text(item.difficulty.toUpperCase()), backgroundColor: Colors.white12),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(item.description, style: const TextStyle(color: Colors.white70, height: 1.4)),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    children: item.tags.map((t) => Chip(label: Text(t), backgroundColor: Colors.white10)).toList(),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('${item.currency} ${item.price}', style: const TextStyle(color: Colors.redAccent, fontSize: 22, fontWeight: FontWeight.bold)),
                      FilledButton.icon(
                        onPressed: onBuy,
                        icon: const Icon(Icons.shopping_bag_outlined),
                        label: const Text('Buy Now'),
                        style: FilledButton.styleFrom(backgroundColor: Colors.redAccent),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  const Divider(color: Colors.white12),
                  const SizedBox(height: 12),
                  const Text('Specifications', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  _spec('Category', item.category),
                  _spec('Difficulty', item.difficulty),
                  _spec('ID', item.id),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _spec(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          SizedBox(width: 120, child: Text(label, style: const TextStyle(color: Colors.white54))),
          Expanded(child: Text(value, style: const TextStyle(color: Colors.white))),
        ],
      ),
    );
  }
}
