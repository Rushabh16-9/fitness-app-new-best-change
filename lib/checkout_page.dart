import 'package:flutter/material.dart';
import '../models/marketplace.dart';
import '../services/marketplace_service.dart';
import '../database_service.dart';
import 'package:firebase_auth/firebase_auth.dart';

class CheckoutPage extends StatefulWidget {
  final List<CartItem> cartItems;
  final double subtotal;
  final double tax;
  final double shipping;
  final double total;

  const CheckoutPage({
    super.key,
    required this.cartItems,
    required this.subtotal,
    required this.tax,
    required this.shipping,
    required this.total,
  });

  @override
  State<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends State<CheckoutPage> {
  final MarketplaceService _marketplaceService = MarketplaceService();
  final _formKey = GlobalKey<FormState>();
  final _databaseService = DatabaseService(uid: FirebaseAuth.instance.currentUser?.uid);
  bool _useSavedAddress = false;
  
  // Address fields
  final _fullNameController = TextEditingController();
  final _streetController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _zipController = TextEditingController();
  final _phoneController = TextEditingController();
  
  // Payment fields
  final _cardNumberController = TextEditingController();
  final _cardHolderController = TextEditingController();
  final _expiryController = TextEditingController();
  final _cvvController = TextEditingController();
  
  bool _isProcessing = false;
  String _selectedPaymentMethod = 'credit_card';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        title: const Text('Checkout', style: TextStyle(color: Colors.white)),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Order Summary
              _buildOrderSummary(),
              
              const SizedBox(height: 24),
              
              // Shipping Address
              _buildSectionTitle('Shipping Address'),
              SwitchListTile(
                value: _useSavedAddress,
                onChanged: (v) async {
                  setState(() => _useSavedAddress = v);
                  if (v) {
                    // Load saved profile and populate fields
                    try {
                      final profile = await _databaseService.getUserProfile();
                      setState(() {
                        _fullNameController.text = profile['name'] ?? '';
                        final addr = profile['address'] as Map<String, dynamic>?;
                        if (addr != null) {
                          _streetController.text = addr['streetAddress'] ?? '';
                          _cityController.text = addr['city'] ?? '';
                          _stateController.text = addr['state'] ?? '';
                          _zipController.text = addr['zipCode'] ?? '';
                          _phoneController.text = addr['phoneNumber'] ?? '';
                        }
                      });
                    } catch (_) {}
                  } else {
                    // clear fields so user can enter new
                    setState(() {
                      _fullNameController.clear();
                      _streetController.clear();
                      _cityController.clear();
                      _stateController.clear();
                      _zipController.clear();
                      _phoneController.clear();
                    });
                  }
                },
                title: const Text('Use saved address', style: TextStyle(color: Colors.white)),
                activeThumbColor: Colors.red,
                secondary: const Icon(Icons.home, color: Colors.white),
              ),
              _buildAddressForm(),
              
              const SizedBox(height: 24),
              
              // Payment Method
              _buildSectionTitle('Payment Method'),
              _buildPaymentForm(),
              
              const SizedBox(height: 24),
              
              // Order Total
              _buildOrderTotal(),
              
              const SizedBox(height: 24),
              
              // Place Order Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isProcessing ? null : _placeOrder,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isProcessing
                      ? const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            ),
                            SizedBox(width: 12),
                            Text('Processing...'),
                          ],
                        )
                      : Text(
                          'Place Order • \$${widget.total.toStringAsFixed(2)}',
                          style: const TextStyle(
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
    );
  }

  Widget _buildOrderSummary() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade900,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Order Summary',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          ...widget.cartItems.map((item) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    '${item.name}${item.options != null && (item.options as Map).isNotEmpty ? ' (${(item.options as Map).entries.map((e) => '${e.key}: ${e.value}').join(', ')})' : ''} x ${item.quantity}',
                    style: const TextStyle(color: Colors.white70),
                  ),
                ),
                Text(
                  '\$${(item.price * item.quantity).toStringAsFixed(2)}',
                  style: const TextStyle(color: Colors.white),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildAddressForm() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade900,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          _buildTextField(_fullNameController, 'Full Name', Icons.person),
          const SizedBox(height: 16),
          _buildTextField(_streetController, 'Street Address', Icons.home),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildTextField(_cityController, 'City', Icons.location_city),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildTextField(_stateController, 'State', Icons.map),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildTextField(_zipController, 'ZIP Code', Icons.local_post_office),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildTextField(_phoneController, 'Phone (Optional)', Icons.phone),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentForm() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade900,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          // Payment Method Selection
          Row(
            children: [
              Expanded(
                child: _buildPaymentMethodTile('credit_card', 'Credit Card', Icons.credit_card),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildPaymentMethodTile('paypal', 'PayPal', Icons.account_balance_wallet),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          if (_selectedPaymentMethod == 'credit_card') ...[
            _buildTextField(_cardNumberController, 'Card Number', Icons.credit_card),
            const SizedBox(height: 16),
            _buildTextField(_cardHolderController, 'Card Holder Name', Icons.person),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildTextField(_expiryController, 'MM/YY', Icons.calendar_today),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildTextField(_cvvController, 'CVV', Icons.security),
                ),
              ],
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue.shade900,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Row(
                children: [
                  Icon(Icons.account_balance_wallet, color: Colors.white),
                  SizedBox(width: 12),
                  Text(
                    'You will be redirected to PayPal to complete payment',
                    style: TextStyle(color: Colors.white),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPaymentMethodTile(String method, String label, IconData icon) {
    final isSelected = _selectedPaymentMethod == method;
    return GestureDetector(
      onTap: () => setState(() => _selectedPaymentMethod = method),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? Colors.red.withOpacity(0.2) : Colors.grey.shade800,
          border: Border.all(
            color: isSelected ? Colors.red : Colors.transparent,
            width: 2,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Icon(icon, color: isSelected ? Colors.red : Colors.white70),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.red : Colors.white70,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String label, IconData icon) {
    return TextFormField(
      controller: controller,
      style: const TextStyle(color: Colors.white),
      validator: (value) {
        if (label.contains('Optional')) return null;
        if (value == null || value.isEmpty) {
          return 'Please enter $label';
        }
        return null;
      },
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white70),
        prefixIcon: Icon(icon, color: Colors.white70),
        filled: true,
        fillColor: Colors.black,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Colors.red),
        ),
      ),
    );
  }

  Widget _buildOrderTotal() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade900,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          _buildTotalRow('Subtotal', widget.subtotal),
          _buildTotalRow('Tax', widget.tax),
          _buildTotalRow('Shipping', widget.shipping),
          const Divider(color: Colors.grey),
          _buildTotalRow('Total', widget.total, isTotal: true),
        ],
      ),
    );
  }

  Widget _buildTotalRow(String label, double amount, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
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
    );
  }

  void _placeOrder() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isProcessing = true;
    });

    try {
      final address = Address(
        fullName: _fullNameController.text,
        streetAddress: _streetController.text,
        city: _cityController.text,
        state: _stateController.text,
        zipCode: _zipController.text,
        country: 'United States',
        phoneNumber: _phoneController.text.isNotEmpty ? _phoneController.text : null,
      );

      final paymentMethod = PaymentMethod(
        type: _selectedPaymentMethod,
        cardNumber: _selectedPaymentMethod == 'credit_card' ? '**** **** **** ${_cardNumberController.text.substring(_cardNumberController.text.length - 4)}' : null,
        cardHolderName: _selectedPaymentMethod == 'credit_card' ? _cardHolderController.text : null,
        expiryDate: _selectedPaymentMethod == 'credit_card' ? _expiryController.text : null,
      );

      // Simulate processing delay
      await Future.delayed(const Duration(seconds: 2));

      final order = await _marketplaceService.createOrder(
        widget.cartItems,
        address,
        paymentMethod,
      );

      if (mounted) {
        // Show success dialog with ETA
        final eta = DateTime.now().add(const Duration(hours: 48));
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            backgroundColor: Colors.grey.shade900,
            title: const Row(
              children: [
                Icon(Icons.check_circle, color: Colors.green, size: 30),
                SizedBox(width: 12),
                Text('Order Placed!', style: TextStyle(color: Colors.white)),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Your order #${order.id} has been placed successfully.',
                  style: const TextStyle(color: Colors.white70),
                ),
                const SizedBox(height: 8),
                Text('Estimated delivery: ${eta.toLocal().toString().split(".")[0]}', style: const TextStyle(color: Colors.white70)),
                const SizedBox(height: 8),
                Text('Delivery address:', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                Text('${address.fullName}, ${address.streetAddress}, ${address.city} ${address.zipCode}', style: const TextStyle(color: Colors.white70)),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop(); // Close dialog
                  Navigator.of(context).pop(); // Go back to cart
                  Navigator.of(context).pop(); // Go back to marketplace
                },
                child: const Text('Continue Shopping', style: TextStyle(color: Colors.red)),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to place order. Please try again.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _streetController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _zipController.dispose();
    _phoneController.dispose();
    _cardNumberController.dispose();
    _cardHolderController.dispose();
    _expiryController.dispose();
    _cvvController.dispose();
    super.dispose();
  }
}