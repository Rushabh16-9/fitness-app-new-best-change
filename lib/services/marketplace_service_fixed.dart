import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/marketplace.dart';

class MarketplaceService {
  static final MarketplaceService _instance = MarketplaceService._internal();
  factory MarketplaceService() => _instance;
  MarketplaceService._internal();

  static const String _cartKey = 'shopping_cart';
  static const String _ordersKey = 'user_orders';
  static const String _wishlistKey = 'user_wishlist';
  
  Cart _cart = Cart(items: []);
  List<Order> _orders = [];
  List<String> _wishlist = [];

  // Sample items - in a real app, this would come from a backend API
  final List<MarketplaceItem> _sampleItems = [
    MarketplaceItem(
      id: '1',
      name: 'Adjustable Dumbbells',
      description: 'High-quality adjustable dumbbells perfect for home workouts. Weight range: 5-50 lbs per dumbbell.',
      price: 299.99,
      category: 'Equipment',
      images: [],
      rating: 4.5,
      reviewCount: 245,
      inStock: true,
      brand: 'FitPro',
      features: ['Adjustable weight', 'Space-saving design', 'Durable construction'],
      specifications: {
        'Weight Range': '5-50 lbs',
        'Material': 'Cast Iron',
        'Warranty': '2 years',
      },
    ),
    MarketplaceItem(
      id: '2',
      name: 'Whey Protein Powder',
      description: 'Premium whey protein powder with 25g protein per serving. Available in chocolate and vanilla flavors.',
      price: 49.99,
      category: 'Supplements',
      images: [],
      rating: 4.7,
      reviewCount: 189,
      inStock: true,
      brand: 'NutriMax',
      features: ['25g protein per serving', 'Fast absorption', 'Great taste'],
      specifications: {
        'Protein per serving': '25g',
        'Servings': '30',
        'Flavors': 'Chocolate, Vanilla',
      },
    ),
    MarketplaceItem(
      id: '3',
      name: 'Yoga Mat Premium',
      description: 'Extra thick non-slip yoga mat with alignment lines. Perfect for yoga, pilates, and stretching.',
      price: 79.99,
      category: 'Equipment',
      images: [],
      rating: 4.8,
      reviewCount: 312,
      inStock: true,
      brand: 'ZenFlex',
      features: ['6mm thickness', 'Non-slip surface', 'Alignment lines', 'Eco-friendly'],
      specifications: {
        'Thickness': '6mm',
        'Dimensions': '72" x 24"',
        'Material': 'TPE',
      },
    ),
    MarketplaceItem(
      id: '4',
      name: 'Resistance Bands Set',
      description: 'Complete set of resistance bands with multiple resistance levels and accessories.',
      price: 39.99,
      category: 'Equipment',
      images: [],
      rating: 4.3,
      reviewCount: 156,
      inStock: true,
      brand: 'FlexBand',
      features: ['5 resistance levels', 'Door anchor included', 'Portable'],
      specifications: {
        'Resistance levels': '5 (Light to Extra Heavy)',
        'Material': 'Natural latex',
        'Accessories': 'Door anchor, handles, ankle straps',
      },
    ),
    MarketplaceItem(
      id: '5',
      name: 'Fitness Tracker Watch',
      description: 'Smart fitness tracker with heart rate monitoring, sleep tracking, and GPS.',
      price: 199.99,
      category: 'Accessories',
      images: [],
      rating: 4.4,
      reviewCount: 278,
      inStock: true,
      brand: 'TechFit',
      features: ['Heart rate monitor', 'GPS tracking', 'Sleep analysis', '7-day battery'],
      specifications: {
        'Battery life': '7 days',
        'Water resistance': '50m',
        'Display': 'AMOLED',
      },
    ),
    MarketplaceItem(
      id: '6',
      name: 'Athletic T-Shirt',
      description: 'Moisture-wicking athletic t-shirt made from premium performance fabric.',
      price: 29.99,
      category: 'Apparel',
      images: [],
      rating: 4.2,
      reviewCount: 94,
      inStock: true,
      brand: 'SportWear',
      features: ['Moisture-wicking', 'Breathable', 'Anti-odor technology'],
      specifications: {
        'Material': '100% Polyester',
        'Sizes': 'XS-XXL',
        'Colors': 'Black, Navy, Red, Gray',
      },
    ),
    MarketplaceItem(
      id: '7',
      name: 'Pre-Workout Energy',
      description: 'High-energy pre-workout supplement to boost performance and focus.',
      price: 34.99,
      category: 'Supplements',
      images: [],
      rating: 4.1,
      reviewCount: 67,
      inStock: false,
      brand: 'EnergyBoost',
      features: ['Natural caffeine', 'Beta-alanine', 'No crash formula'],
      specifications: {
        'Caffeine': '200mg per serving',
        'Servings': '30',
        'Flavor': 'Fruit Punch',
      },
    ),
    MarketplaceItem(
      id: '8',
      name: 'Kettlebell Set',
      description: 'Cast iron kettlebell set with multiple weights for strength training.',
      price: 179.99,
      category: 'Equipment',
      images: [],
      rating: 4.6,
      reviewCount: 203,
      inStock: true,
      brand: 'IronCore',
      features: ['Cast iron construction', 'Wide handle', 'Flat bottom'],
      specifications: {
        'Weights': '15, 20, 25, 30 lbs',
        'Material': 'Cast iron',
        'Finish': 'Powder coated',
      },
    ),
  ];

  // Initialize service
  Future<void> initialize() async {
    await _loadCart();
    await _loadOrders();
    await _loadWishlist();
  }

  // Get all items
  Future<List<MarketplaceItem>> getAllItems() async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 500));
    return List.from(_sampleItems);
  }

  // Get item by ID
  MarketplaceItem? getItemById(String id) {
    try {
      return _sampleItems.firstWhere((item) => item.id == id);
    } catch (e) {
      return null;
    }
  }

  // Cart operations
  Cart getCart() => _cart;

  int getCartItemCount() {
    return _cart.items.fold(0, (sum, item) => sum + item.quantity);
  }

  double getCartTotal() {
    return _cart.items.fold(0.0, (sum, item) => sum + (item.price * item.quantity));
  }

  Future<void> addToCart(MarketplaceItem item, {int quantity = 1}) async {
    final existingItemIndex = _cart.items.indexWhere((cartItem) => cartItem.id == item.id);
    
    if (existingItemIndex >= 0) {
      _cart.items[existingItemIndex].quantity += quantity;
    } else {
      _cart.items.add(CartItem(
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        quantity: quantity,
      ));
    }
    
    await _saveCart();
  }

  Future<void> removeFromCart(String itemId) async {
    _cart.items.removeWhere((item) => item.id == itemId);
    await _saveCart();
  }

  Future<void> updateCartItemQuantity(String itemId, int quantity) async {
    final itemIndex = _cart.items.indexWhere((item) => item.id == itemId);
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        _cart.items.removeAt(itemIndex);
      } else {
        _cart.items[itemIndex].quantity = quantity;
      }
      await _saveCart();
    }
  }

  Future<void> clearCart() async {
    _cart.items.clear();
    await _saveCart();
  }

  // Order operations
  List<Order> getOrders() => List.from(_orders);

  Future<Order> createOrder(
    List<CartItem> items,
    Address shippingAddress,
    PaymentMethod paymentMethod,
  ) async {
    final order = Order(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      userId: 'current_user',
      items: List.from(items),
      subtotal: getCartTotal(),
      tax: getCartTotal() * 0.08, // 8% tax
      shipping: getCartTotal() > 50 ? 0.0 : 9.99, // Free shipping over $50
      total: getCartTotal() + (getCartTotal() * 0.08) + (getCartTotal() > 50 ? 0.0 : 9.99),
      status: OrderStatus.pending,
      orderDate: DateTime.now(),
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
    );

    _orders.insert(0, order); // Add to beginning for newest first
    await _saveOrders();
    await clearCart(); // Clear cart after successful order
    
    return order;
  }

  Future<void> updateOrderStatus(String orderId, OrderStatus status) async {
    final orderIndex = _orders.indexWhere((order) => order.id == orderId);
    if (orderIndex >= 0) {
      _orders[orderIndex].status = status;
      if (status == OrderStatus.delivered) {
        _orders[orderIndex].deliveredDate = DateTime.now();
      }
      await _saveOrders();
    }
  }

  // Wishlist operations
  List<String> getWishlist() => List.from(_wishlist);

  bool isInWishlist(String itemId) => _wishlist.contains(itemId);

  Future<void> toggleWishlist(String itemId) async {
    if (_wishlist.contains(itemId)) {
      _wishlist.remove(itemId);
    } else {
      _wishlist.add(itemId);
    }
    await _saveWishlist();
  }

  List<MarketplaceItem> getWishlistItems() {
    return _sampleItems.where((item) => _wishlist.contains(item.id)).toList();
  }

  // Persistence methods
  Future<void> _loadCart() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cartJson = prefs.getString(_cartKey);
      if (cartJson != null) {
        final cartMap = jsonDecode(cartJson);
        _cart = Cart.fromJson(cartMap);
      }
    } catch (e) {
      // If loading fails, start with empty cart
      _cart = Cart(items: []);
    }
  }

  Future<void> _saveCart() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cartJson = jsonEncode(_cart.toJson());
      await prefs.setString(_cartKey, cartJson);
    } catch (e) {
      // Handle save error silently
    }
  }

  Future<void> _loadOrders() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final ordersJson = prefs.getString(_ordersKey);
      if (ordersJson != null) {
        final ordersList = jsonDecode(ordersJson) as List;
        _orders = ordersList.map((orderMap) => Order.fromJson(orderMap)).toList();
      }
    } catch (e) {
      _orders = [];
    }
  }

  Future<void> _saveOrders() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final ordersJson = jsonEncode(_orders.map((order) => order.toJson()).toList());
      await prefs.setString(_ordersKey, ordersJson);
    } catch (e) {
      // Handle save error silently
    }
  }

  Future<void> _loadWishlist() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _wishlist = prefs.getStringList(_wishlistKey) ?? [];
    } catch (e) {
      _wishlist = [];
    }
  }

  Future<void> _saveWishlist() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList(_wishlistKey, _wishlist);
    } catch (e) {
      // Handle save error silently
    }
  }
}