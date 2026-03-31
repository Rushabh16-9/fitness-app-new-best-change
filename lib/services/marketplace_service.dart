import 'dart:convert';
import 'package:collection/collection.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/marketplace.dart';
import '../database_service.dart';
import 'package:cloud_firestore/cloud_firestore.dart' as fb;

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
    // Only include marketplace items that have matching local asset images.
    MarketplaceItem(
      id: '1',
      name: 'Adjustable Dumbbells',
      description: 'High-quality adjustable dumbbells perfect for home workouts. Weight range: 5-50 lbs per dumbbell.',
      price: 299.99,
      category: 'Equipment',
      images: ['assets/data/fitness app pictures/urethane dumbbells.png', 'assets/data/fitness app pictures/Neoprene Dumbbell Pair 5.jpg'],
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
      id: '3',
      name: 'Yoga Mat Premium',
      description: 'Extra thick non-slip yoga mat with alignment lines. Perfect for yoga, pilates, and stretching.',
      price: 79.99,
      category: 'Equipment',
      images: ['assets/data/fitness app pictures/non slip yoga mat.jpg'],
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
      images: ['assets/data/fitness app pictures/resistent band set.jpg'],
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
    // Existing equipment with images
    MarketplaceItem(
      id: '8',
      name: 'Kettlebell Set',
      description: 'Cast iron kettlebell set with multiple weights for strength training.',
      price: 179.99,
      category: 'Equipment',
      images: ['assets/data/fitness app pictures/Kettlebells.png'],
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
    MarketplaceItem(
      id: '9',
      name: 'Hex Dumbbells',
      description: 'Durable hex dumbbells for a variety of strength training exercises.',
      price: 89.99,
      category: 'Equipment',
      images: ['assets/data/fitness app pictures/hex dumbbell.png'],
      rating: 4.5,
      reviewCount: 124,
      inStock: true,
      brand: 'ProHex',
      features: ['Comfort grip', 'Durable rubber coating'],
      specifications: {'Weight options': '5-50 lbs'},
    ),
    MarketplaceItem(
      id: '10',
      name: 'Flat Weight Bench',
      description: 'Stable flat bench for presses and dumbbell work.',
      price: 129.99,
      category: 'Equipment',
      images: ['assets/data/fitness app pictures/flat weight bench.jpg', 'assets/data/fitness app pictures/incline decline bench.jpg'],
      rating: 4.4,
      reviewCount: 88,
      inStock: true,
      brand: 'BenchMaster',
      features: ['Non-slip surface', 'Sturdy frame'],
      specifications: {'Max load': '600 lbs'},
    ),
    MarketplaceItem(
      id: '11',
      name: '7ft Olympic Barbell',
      description: 'Standard 7ft Olympic barbell for powerlifting and Olympic lifts.',
      price: 249.99,
      category: 'Equipment',
      images: ['assets/data/fitness app pictures/7ft olympic barbell.jpg', 'assets/data/fitness app pictures/cast iron plates set.jpg'],
      rating: 4.7,
      reviewCount: 64,
      inStock: true,
      brand: 'Olympus',
      features: ['Knurled grip', 'High tensile strength'],
      specifications: {'Length': '7ft', 'Weight': '20kg'},
    ),

    // Additional equipment items from assets
    MarketplaceItem(
      id: '12',
      name: 'Power Rack with Pull Up Bar',
      description: 'Full power rack with built-in pull-up bar for heavy lifts and safety.',
      price: 699.99,
      category: 'Equipment',
      images: ['assets/data/fitness app pictures/power rack with pull up bar.jpg'],
      rating: 4.6,
      reviewCount: 48,
      inStock: true,
      brand: 'RackPro',
      features: ['Adjustable safety pins', 'Powder coated finish'],
      specifications: {'Max load': '1000 lbs'},
    ),
    MarketplaceItem(
      id: '13',
      name: 'Half Squat Rack',
      description: 'Compact half-squat rack ideal for small home gyms.',
      price: 249.99,
      category: 'Equipment',
      images: ['assets/data/fitness app pictures/half-squat-rack.png'],
      rating: 4.3,
      reviewCount: 22,
      inStock: true,
      brand: 'HomeLift',
      features: ['Compact footprint', 'Sturdy construction'],
      specifications: {'Max load': '600 lbs'},
    ),
    MarketplaceItem(
      id: '14',
      name: 'Lat Pulldown & Low Row Station',
      description: 'Multi-function lat pulldown and low row station for back development.',
      price: 399.99,
      category: 'Equipment',
      images: ['assets/data/fitness app pictures/lat pull down and low row station.png'],
      rating: 4.4,
      reviewCount: 31,
      inStock: true,
      brand: 'BackStrong',
      features: ['Smooth cable system', 'Adjustable seat'],
      specifications: {'Max load': '500 lbs'},
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
    // Default no options for simple add; product-specific pages may call a different overload
    await addToCartWithOptions(item, quantity: quantity, options: null);
    
    
  }

  Future<void> addToCartWithOptions(MarketplaceItem item, {int quantity = 1, Map<String, dynamic>? options}) async {
    // Consider items with same id but different options as distinct cart lines
    final existingItemIndex = _cart.items.indexWhere((cartItem) {
      if (cartItem.id != item.id) return false;
      final a = cartItem.options ?? {};
      final b = options ?? {};
      return MapEquality().equals(a, b);
    });

    if (existingItemIndex >= 0) {
      _cart.items[existingItemIndex].quantity += quantity;
    } else {
      _cart.items.add(CartItem(
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        quantity: quantity,
        options: options,
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
    
    // Try to persist order to Firestore as well for cross-device visibility
    try {
      // Lightweight record saved under `orders` collection and user's purchases
      final db = DatabaseService(uid: order.userId);
      final eta = DateTime.now().add(const Duration(hours: 48)); // default ETA 48 hours
      final purchaseRecord = {
        'orderId': order.id,
        'items': items.map((i) => i.toJson()).toList(),
        'subtotal': order.subtotal,
        'tax': order.tax,
        'shipping': order.shipping,
        'total': order.total,
        'status': order.status.name,
        'orderDate': order.orderDate.toIso8601String(),
        'eta': eta.toIso8601String(),
        'shippingAddress': shippingAddress.toJson(),
        'payment': {
          'type': paymentMethod.type,
          'masked': paymentMethod.cardNumber,
        }
      };
      await db.recordPurchase(purchaseRecord);
      // Also write to a top-level orders collection for admin tracking
      try {
        await fb.FirebaseFirestore.instance.collection('orders').doc(order.id).set({
          ...purchaseRecord,
          'userId': order.userId,
        });
      } catch (_) {
        // ignore if Firebase not configured
      }
    } catch (_) {}

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