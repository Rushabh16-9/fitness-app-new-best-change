import 'package:flutter/material.dart';
import '../models/marketplace.dart';
import '../services/marketplace_service.dart';
import 'cart_page.dart';

class ProductDetailPage extends StatefulWidget {
  final MarketplaceItem item;
  
  const ProductDetailPage({super.key, required this.item});

  @override
  State<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage> {
  final MarketplaceService _marketplaceService = MarketplaceService();
  int _selectedQuantity = 1;
  bool _isAddingToCart = false;
  String? _selectedWeight;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: CustomScrollView(
        slivers: [
          // App Bar with Image
          SliverAppBar(
            backgroundColor: Colors.black,
            expandedHeight: 300,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  color: Colors.grey.shade800,
                ),
                child: widget.item.imageUrl.isNotEmpty
                      ? Builder(builder: (_) {
                          final normalized = widget.item.imageUrl.trim();
                          try {
                            if (normalized.startsWith('http')) {
                              return Image.network(
                                normalized,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => _buildImagePlaceholder(),
                              );
                            } else {
                              return Image.asset(
                                normalized,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => _buildImagePlaceholder(),
                              );
                            }
                          } catch (e) {
                            return _buildImagePlaceholder();
                          }
                        })
                      : _buildImagePlaceholder(),
              ),
            ),
            actions: [
              IconButton(
                icon: Icon(
                  _marketplaceService.isInWishlist(widget.item.id)
                      ? Icons.favorite
                      : Icons.favorite_border,
                  color: Colors.red,
                ),
                onPressed: () {
                  _marketplaceService.toggleWishlist(widget.item.id);
                  setState(() {});
                },
              ),
              IconButton(
                icon: Stack(
                  children: [
                    const Icon(Icons.shopping_cart, color: Colors.white),
                    if (_marketplaceService.getCartItemCount() > 0)
                      Positioned(
                        right: 0,
                        top: 0,
                        child: Container(
                          padding: const EdgeInsets.all(2),
                          decoration: const BoxDecoration(
                            color: Colors.red,
                            shape: BoxShape.circle,
                          ),
                          constraints: const BoxConstraints(
                            minWidth: 16,
                            minHeight: 16,
                          ),
                          child: Text(
                            '${_marketplaceService.getCartItemCount()}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                  ],
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const CartPage()),
                  );
                },
              ),
            ],
          ),
          
          // Product Details
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Product Name and Brand
                  Text(
                    widget.item.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'by ${widget.item.brand}',
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 16,
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Price and Rating
                  Row(
                    children: [
                      Text(
                        '\$${widget.item.price.toStringAsFixed(2)}',
                        style: const TextStyle(
                          color: Colors.red,
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: widget.item.inStock ? Colors.green : Colors.grey,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          widget.item.inStock ? 'In Stock' : 'Out of Stock',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 8),
                  
                  Row(
                    children: [
                      const Icon(Icons.star, color: Colors.amber, size: 20),
                      const SizedBox(width: 4),
                      Text(
                        '${widget.item.rating}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '(${(widget.item.rating * 100).round()} reviews)',
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // Description
                  const Text(
                    'Description',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    widget.item.description,
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                      height: 1.5,
                    ),
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // Features
                  if (widget.item.features.isNotEmpty) ...[
                    const Text(
                      'Key Features',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    ...widget.item.features.map((feature) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 2),
                      child: Row(
                        children: [
                          const Icon(Icons.check_circle, color: Colors.green, size: 16),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              feature,
                              style: const TextStyle(color: Colors.white70),
                            ),
                          ),
                        ],
                      ),
                    )),
                    const SizedBox(height: 24),
                  ],
                  
                  // Specifications
                  if (widget.item.specifications.isNotEmpty) ...[
                    const Text(
                      'Specifications',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.grey.shade900,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        children: widget.item.specifications.entries.map((spec) {
                          return Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              border: Border(
                                bottom: BorderSide(
                                  color: Colors.grey.shade800,
                                  width: 0.5,
                                ),
                              ),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  flex: 2,
                                  child: Text(
                                    spec.key,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                Expanded(
                                  flex: 3,
                                  child: Text(
                                    spec.value,
                                    style: const TextStyle(color: Colors.white70),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                  
                  // Quantity Selector
                  // If this product looks like a dumbbell, offer a weight selector
                  if (widget.item.name.toLowerCase().contains('dumbbell') || widget.item.specifications.containsKey('Weight options') || widget.item.specifications.containsKey('Weight Range')) ...[
                    const SizedBox(height: 16),
                    const Text(
                      'Select Weight',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade900,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: DropdownButton<String>(
                        value: _selectedWeight,
                        hint: const Text('Choose weight', style: TextStyle(color: Colors.white70)),
                        isExpanded: true,
                        underline: const SizedBox.shrink(),
                        dropdownColor: Colors.grey.shade900,
                        items: _weightOptionsFromItem(widget.item).map((w) => DropdownMenuItem(value: w, child: Text(w))).toList(),
                        onChanged: (v) => setState(() => _selectedWeight = v),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                  Row(
                    children: [
                      const Text(
                        'Quantity:',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.grey.shade900,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              onPressed: _selectedQuantity > 1 ? () {
                                setState(() {
                                  _selectedQuantity--;
                                });
                              } : null,
                              icon: const Icon(Icons.remove, color: Colors.white),
                            ),
                            Container(
                              width: 50,
                              alignment: Alignment.center,
                              child: Text(
                                '$_selectedQuantity',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            IconButton(
                              onPressed: _selectedQuantity < 99 ? () {
                                setState(() {
                                  _selectedQuantity++;
                                });
                              } : null,
                              icon: const Icon(Icons.add, color: Colors.white),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 100), // Space for fixed bottom button
                ],
              ),
            ),
          ),
        ],
      ),
      
      // Fixed bottom button
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.black,
          border: Border(
            top: BorderSide(color: Colors.grey.shade800),
          ),
        ),
        child: SafeArea(
          child: SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: widget.item.inStock && !_isAddingToCart ? _addToCart : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: widget.item.inStock ? Colors.red : Colors.grey,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _isAddingToCart
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : Text(
                      widget.item.inStock 
                          ? 'Add $_selectedQuantity to Cart • \$${(widget.item.price * _selectedQuantity).toStringAsFixed(2)}'
                          : 'Out of Stock',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildImagePlaceholder() {
    return Container(
      color: Colors.grey.shade800,
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.image, color: Colors.white38, size: 80),
            SizedBox(height: 8),
            Text(
              'No Image Available',
              style: TextStyle(color: Colors.white38),
            ),
          ],
        ),
      ),
    );
  }

  void _addToCart() async {
    if (!widget.item.inStock) return;
    
    setState(() {
      _isAddingToCart = true;
    });

    try {
  // If this item has weight selection, pass options into cart so it persists with the item
  final options = _selectedWeight != null ? {'weight': _selectedWeight} : null;
  await _marketplaceService.addToCartWithOptions(widget.item, quantity: _selectedQuantity, options: options);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Added $_selectedQuantity ${widget.item.name} to cart'),
            backgroundColor: Colors.green,
            action: SnackBarAction(
              label: 'View Cart',
              textColor: Colors.white,
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const CartPage()),
                );
              },
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to add item to cart'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isAddingToCart = false;
        });
      }
    }
  }
}

  List<String> _weightOptionsFromItem(MarketplaceItem item) {
    // Try to extract weight options from specifications or a common range
    final opts = <String>[];
    if (item.specifications.containsKey('Weights')) {
      final raw = item.specifications['Weights'].toString();
      raw.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).forEach(opts.add);
    } else if (item.specifications.containsKey('Weight options')) {
      final raw = item.specifications['Weight options'].toString();
      raw.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).forEach(opts.add);
    } else if (item.specifications.containsKey('Weight Range')) {
      opts.add(item.specifications['Weight Range'].toString());
    }

    // Fallback common options for dumbbells
    if (opts.isEmpty && item.name.toLowerCase().contains('dumbbell')) {
      opts.addAll(['5 lbs', '10 lbs', '15 lbs', '20 lbs', '25 lbs', '30 lbs']);
    }

    return opts;
  }