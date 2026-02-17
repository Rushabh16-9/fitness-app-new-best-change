import 'package:flutter/material.dart';
import '../models/marketplace.dart';
import '../services/marketplace_service.dart';
import 'checkout_page.dart';

class CartPage extends StatefulWidget {
  const CartPage({super.key});

  @override
  State<CartPage> createState() => _CartPageState();
}

class _CartPageState extends State<CartPage> {
  final MarketplaceService _marketplaceService = MarketplaceService();

  @override
  Widget build(BuildContext context) {
    final cart = _marketplaceService.getCart();
    final subtotal = _marketplaceService.getCartTotal();
    final tax = subtotal * 0.08; // 8% tax
    final shipping = subtotal > 50 ? 0.0 : 9.99; // Free shipping over $50
    final total = subtotal + tax + shipping;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        title: Text(
          'Shopping Cart (${cart.items.length})',
          style: const TextStyle(color: Colors.white),
        ),
      ),
      body: cart.items.isEmpty
          ? _buildEmptyCart()
          : Column(
              children: [
                // Cart Items
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: cart.items.length,
                    itemBuilder: (context, index) {
                      return _buildCartItem(cart.items[index]);
                    },
                  ),
                ),
                
                // Order Summary
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade900,
                    border: Border(
                      top: BorderSide(color: Colors.grey.shade800),
                    ),
                  ),
                  child: SafeArea(
                    child: Column(
                      children: [
                        _buildSummaryRow('Subtotal', subtotal),
                        _buildSummaryRow('Tax', tax),
                        _buildSummaryRow('Shipping', shipping, 
                          subtitle: subtotal > 50 ? 'Free shipping on orders over \$50' : null),
                        const Divider(color: Colors.grey),
                        _buildSummaryRow('Total', total, isTotal: true),
                        
                        const SizedBox(height: 16),
                        
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: cart.items.isNotEmpty ? () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => CheckoutPage(
                                    cartItems: cart.items,
                                    subtotal: subtotal,
                                    tax: tax,
                                    shipping: shipping,
                                    total: total,
                                  ),
                                ),
                              ).then((_) => setState(() {})); // Refresh after checkout
                            } : null,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text(
                              'Proceed to Checkout',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildEmptyCart() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.shopping_cart_outlined,
            size: 80,
            color: Colors.grey.shade600,
          ),
          const SizedBox(height: 16),
          Text(
            'Your cart is empty',
            style: TextStyle(
              color: Colors.grey.shade600,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Add some items to get started',
            style: TextStyle(
              color: Colors.grey.shade600,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
            child: const Text('Continue Shopping'),
          ),
        ],
      ),
    );
  }

  Widget _buildCartItem(CartItem item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade900,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          // Product Image
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: Colors.grey.shade800,
              borderRadius: BorderRadius.circular(8),
            ),
            child: item.imageUrl.isNotEmpty
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      item.imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _buildImagePlaceholder(),
                    ),
                  )
                : _buildImagePlaceholder(),
          ),
          
          const SizedBox(width: 12),
          
          // Product Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  '\$${item.price.toStringAsFixed(2)} each',
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    // Quantity Controls
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.grey.shade800,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            onPressed: item.quantity > 1 ? () {
                              _updateQuantity(item.id, item.quantity - 1);
                            } : null,
                            icon: const Icon(Icons.remove, color: Colors.white, size: 16),
                            padding: const EdgeInsets.all(4),
                            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                          ),
                          Container(
                            width: 40,
                            alignment: Alignment.center,
                            child: Text(
                              '${item.quantity}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          IconButton(
                            onPressed: item.quantity < 99 ? () {
                              _updateQuantity(item.id, item.quantity + 1);
                            } : null,
                            icon: const Icon(Icons.add, color: Colors.white, size: 16),
                            padding: const EdgeInsets.all(4),
                            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                          ),
                        ],
                      ),
                    ),
                    
                    const Spacer(),
                    
                    // Remove Button
                    IconButton(
                      onPressed: () => _removeItem(item.id),
                      icon: const Icon(Icons.delete_outline, color: Colors.red),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Total Price
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '\$${(item.price * item.quantity).toStringAsFixed(2)}',
                style: const TextStyle(
                  color: Colors.red,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildImagePlaceholder() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey.shade700,
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Center(
        child: Icon(Icons.image, color: Colors.white38, size: 30),
      ),
    );
  }

  Widget _buildSummaryRow(String label, double amount, {bool isTotal = false, String? subtitle}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: isTotal ? 18 : 16,
                  fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
                ),
              ),
              Text(
                amount == 0.0 ? 'FREE' : '\$${amount.toStringAsFixed(2)}',
                style: TextStyle(
                  color: isTotal ? Colors.red : Colors.white,
                  fontSize: isTotal ? 18 : 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 2),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  subtitle,
                  style: const TextStyle(
                    color: Colors.green,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(),
              ],
            ),
          ],
        ],
      ),
    );
  }

  void _updateQuantity(String itemId, int newQuantity) async {
    await _marketplaceService.updateCartItemQuantity(itemId, newQuantity);
    setState(() {});
  }

  void _removeItem(String itemId) async {
    await _marketplaceService.removeFromCart(itemId);
    setState(() {});
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Item removed from cart'),
        backgroundColor: Colors.grey,
      ),
    );
  }
}