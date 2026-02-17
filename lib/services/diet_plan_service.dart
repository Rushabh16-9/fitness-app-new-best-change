import 'dart:convert';
import 'package:flutter/services.dart';
import '../models/diet_plan.dart';

class DietPlanService {
  static const String _assetsPath = 'assets/data/diet_plans.json';
  List<DietPlan> _plans = [];
  bool _loaded = false;

  Future<void> load() async {
    if (_loaded) return;
    
    try {
      final jsonString = await rootBundle.loadString(_assetsPath);
      final Map<String, dynamic> jsonData = json.decode(jsonString);
      final List<dynamic> plansJson = jsonData['plans'] ?? [];
      
      _plans = plansJson.map((json) => DietPlan.fromJson(json)).toList();
      _loaded = true;
    } catch (e) {
      // If asset doesn't exist, create default plans
      _createDefaultPlans();
      _loaded = true;
    }
  }

  void _createDefaultPlans() {
    _plans = [
      // JAIN DIET PLANS
      DietPlan(
        id: 'jain_weight_loss',
        name: 'Jain Weight Loss Plan',
        description: 'Strict Jain diet for healthy weight loss',
        category: 'weight_loss',
        dietaryType: 'jain',
        region: 'indian',
        calories: 1400,
  duration: 21,
        difficulty: 'intermediate',
        cookingTime: 'moderate',
        tags: ['jain', 'no-root-vegetables', 'weight-loss', 'ayurvedic'],
        imageUrl: '',
        days: List.generate(7, (day) => DayMeal(
          day: day + 1,
          meals: [
            Meal(
              type: 'breakfast',
              name: 'Sabudana Khichdi',
              description: 'Light and nutritious tapioca preparation',
              calories: 280,
              macros: {'protein': 8, 'carbs': 45, 'fat': 10},
              ingredients: ['sabudana', 'peanuts', 'green chili', 'curry leaves', 'rock salt'],
              recipe: 'Soak sabudana overnight, sauté with peanuts and spices',
            ),
            Meal(
              type: 'lunch',
              name: 'Moong Dal Curry with Roti',
              description: 'Protein-rich lentil curry',
              calories: 380,
              macros: {'protein': 18, 'carbs': 52, 'fat': 8},
              ingredients: ['moong dal', 'wheat flour', 'turmeric', 'cumin', 'ghee'],
              recipe: 'Cook moong dal with minimal spices, serve with fresh roti',
            ),
            Meal(
              type: 'dinner',
              name: 'Lauki Sabzi with Quinoa',
              description: 'Bottle gourd curry with superfood quinoa',
              calories: 320,
              macros: {'protein': 12, 'carbs': 48, 'fat': 6},
              ingredients: ['lauki', 'quinoa', 'ginger', 'green chili', 'sendha namak'],
              recipe: 'Steam cook lauki with minimal oil, serve with boiled quinoa',
            ),
            Meal(
              type: 'snack',
              name: 'Makhana Roasted',
              description: 'Healthy fox nuts snack',
              calories: 120,
              macros: {'protein': 4, 'carbs': 18, 'fat': 2},
              ingredients: ['makhana', 'rock salt', 'black pepper'],
            ),
          ],
        )),
      ),

      // VEGETARIAN PLANS
      DietPlan(
        id: 'indian_veg_muscle_gain',
        name: 'Indian Vegetarian Muscle Gain',
        description: 'High-protein Indian vegetarian diet for muscle building',
        category: 'muscle_gain',
        dietaryType: 'veg',
        region: 'indian',
        calories: 2400,
  duration: 28,
        difficulty: 'advanced',
        cookingTime: 'moderate',
        tags: ['vegetarian', 'high-protein', 'muscle-gain', 'indian', 'paneer'],
        imageUrl: '',
        days: List.generate(7, (day) => DayMeal(
          day: day + 1,
          meals: [
            Meal(
              type: 'breakfast',
              name: 'Paneer Paratha with Curd',
              description: 'High-protein stuffed bread with yogurt',
              calories: 480,
              macros: {'protein': 22, 'carbs': 58, 'fat': 16},
              ingredients: ['whole wheat flour', 'paneer', 'curd', 'ghee', 'spices'],
              recipe: 'Stuff spiced paneer in dough, cook on tawa, serve with curd',
            ),
            Meal(
              type: 'lunch',
              name: 'Rajma Chawal with Salad',
              description: 'Complete protein kidney bean curry with rice',
              calories: 620,
              macros: {'protein': 28, 'carbs': 88, 'fat': 12},
              ingredients: ['rajma', 'basmati rice', 'onion', 'tomato', 'cucumber', 'carrot'],
              recipe: 'Pressure cook rajma with aromatic spices, serve with rice and fresh salad',
            ),
            Meal(
              type: 'dinner',
              name: 'Dal Makhani with Roti',
              description: 'Creamy black lentil curry',
              calories: 580,
              macros: {'protein': 24, 'carbs': 72, 'fat': 18},
              ingredients: ['urad dal', 'rajma', 'butter', 'cream', 'whole wheat flour'],
              recipe: 'Slow cook lentils with rich spices and cream',
            ),
            Meal(
              type: 'snack',
              name: 'Protein Lassi',
              description: 'High-protein yogurt drink',
              calories: 280,
              macros: {'protein': 18, 'carbs': 28, 'fat': 8},
              ingredients: ['greek yogurt', 'milk', 'honey', 'almonds', 'cardamom'],
            ),
          ],
        )),
      ),

      // VEGAN PLANS
      DietPlan(
        id: 'vegan_mediterranean',
        name: 'Mediterranean Vegan Plan',
        description: 'Plant-based Mediterranean diet for optimal health',
        category: 'maintenance',
        dietaryType: 'vegan',
        region: 'mediterranean',
        calories: 1800,
  duration: 21,
        difficulty: 'beginner',
        cookingTime: 'quick',
        tags: ['vegan', 'mediterranean', 'plant-based', 'olive-oil', 'legumes'],
        imageUrl: '',
        days: List.generate(7, (day) => DayMeal(
          day: day + 1,
          meals: [
            Meal(
              type: 'breakfast',
              name: 'Quinoa Bowl with Berries',
              description: 'Superfood breakfast bowl',
              calories: 320,
              macros: {'protein': 12, 'carbs': 58, 'fat': 6},
              ingredients: ['quinoa', 'mixed berries', 'almond milk', 'chia seeds', 'maple syrup'],
              recipe: 'Cook quinoa in almond milk, top with fresh berries and chia seeds',
            ),
            Meal(
              type: 'lunch',
              name: 'Chickpea Mediterranean Salad',
              description: 'Protein-rich chickpea salad with olive oil',
              calories: 450,
              macros: {'protein': 18, 'carbs': 52, 'fat': 20},
              ingredients: ['chickpeas', 'cucumber', 'tomatoes', 'olives', 'olive oil', 'lemon'],
              recipe: 'Toss cooked chickpeas with fresh vegetables and olive oil dressing',
            ),
            Meal(
              type: 'dinner',
              name: 'Lentil Moussaka',
              description: 'Plant-based version of Greek moussaka',
              calories: 420,
              macros: {'protein': 20, 'carbs': 48, 'fat': 16},
              ingredients: ['red lentils', 'eggplant', 'zucchini', 'tomato sauce', 'nutritional yeast'],
              recipe: 'Layer vegetables with lentil mixture and bake until golden',
            ),
            Meal(
              type: 'snack',
              name: 'Hummus with Veggies',
              description: 'Creamy chickpea dip with fresh vegetables',
              calories: 180,
              macros: {'protein': 8, 'carbs': 20, 'fat': 8},
              ingredients: ['chickpeas', 'tahini', 'carrots', 'bell peppers', 'olive oil'],
            ),
          ],
        )),
      ),

      // NON-VEG PLANS
      DietPlan(
        id: 'keto_non_veg',
        name: 'Ketogenic Non-Veg Plan',
        description: 'High-fat, low-carb diet with meat and fish',
        category: 'keto',
        dietaryType: 'non_veg',
        region: 'international',
        calories: 1900,
  duration: 21,
        difficulty: 'intermediate',
        cookingTime: 'moderate',
        tags: ['keto', 'non-veg', 'high-fat', 'low-carb', 'meat', 'fish'],
        imageUrl: '',
        days: List.generate(7, (day) => DayMeal(
          day: day + 1,
          meals: [
            Meal(
              type: 'breakfast',
              name: 'Scrambled Eggs with Bacon',
              description: 'High-fat keto breakfast',
              calories: 420,
              macros: {'protein': 28, 'carbs': 4, 'fat': 32},
              ingredients: ['eggs', 'bacon', 'butter', 'cheese', 'spinach'],
              recipe: 'Scramble eggs in butter, serve with crispy bacon and cheese',
            ),
            Meal(
              type: 'lunch',
              name: 'Grilled Salmon Salad',
              description: 'Omega-3 rich salmon with greens',
              calories: 520,
              macros: {'protein': 38, 'carbs': 8, 'fat': 36},
              ingredients: ['salmon fillet', 'mixed greens', 'avocado', 'olive oil', 'walnuts'],
              recipe: 'Grill salmon and serve over mixed greens with avocado',
            ),
            Meal(
              type: 'dinner',
              name: 'Chicken Thigh Curry',
              description: 'Rich and creamy chicken curry',
              calories: 480,
              macros: {'protein': 42, 'carbs': 6, 'fat': 28},
              ingredients: ['chicken thighs', 'coconut milk', 'onion', 'garlic', 'spices'],
              recipe: 'Cook chicken in coconut milk with aromatic spices',
            ),
            Meal(
              type: 'snack',
              name: 'Cheese and Meat Roll',
              description: 'High-fat protein snack',
              calories: 250,
              macros: {'protein': 18, 'carbs': 2, 'fat': 18},
              ingredients: ['deli turkey', 'cream cheese', 'cucumber', 'herbs'],
            ),
          ],
        )),
      ),

      // PESCATARIAN PLANS
      DietPlan(
        id: 'pescatarian_weight_loss',
        name: 'Pescatarian Weight Loss',
        description: 'Fish and plant-based diet for healthy weight loss',
        category: 'weight_loss',
        dietaryType: 'pescatarian',
        region: 'mediterranean',
        calories: 1600,
  duration: 28,
        difficulty: 'beginner',
        cookingTime: 'quick',
        tags: ['pescatarian', 'fish', 'seafood', 'weight-loss', 'omega-3'],
        imageUrl: '',
        days: List.generate(7, (day) => DayMeal(
          day: day + 1,
          meals: [
            Meal(
              type: 'breakfast',
              name: 'Smoked Salmon Avocado Toast',
              description: 'Nutrient-dense breakfast with healthy fats',
              calories: 340,
              macros: {'protein': 18, 'carbs': 28, 'fat': 18},
              ingredients: ['whole grain bread', 'smoked salmon', 'avocado', 'lemon', 'dill'],
              recipe: 'Toast bread, top with mashed avocado and smoked salmon',
            ),
            Meal(
              type: 'lunch',
              name: 'Tuna Quinoa Bowl',
              description: 'Complete protein bowl with superfoods',
              calories: 420,
              macros: {'protein': 32, 'carbs': 45, 'fat': 12},
              ingredients: ['canned tuna', 'quinoa', 'cherry tomatoes', 'cucumber', 'olive oil'],
              recipe: 'Mix tuna with cooked quinoa and fresh vegetables',
            ),
            Meal(
              type: 'dinner',
              name: 'Baked Cod with Vegetables',
              description: 'Light white fish with roasted vegetables',
              calories: 380,
              macros: {'protein': 35, 'carbs': 28, 'fat': 14},
              ingredients: ['cod fillet', 'broccoli', 'zucchini', 'bell peppers', 'herbs'],
              recipe: 'Bake cod with seasoned vegetables until tender',
            ),
            Meal(
              type: 'snack',
              name: 'Sardine Crackers',
              description: 'High omega-3 snack',
              calories: 180,
              macros: {'protein': 14, 'carbs': 12, 'fat': 8},
              ingredients: ['sardines', 'whole grain crackers', 'lemon', 'black pepper'],
            ),
          ],
        )),
      ),

      // ASIAN CUISINE PLANS
      DietPlan(
        id: 'asian_fusion_maintenance',
        name: 'Asian Fusion Balanced Diet',
        description: 'Balanced Asian-inspired meals for maintenance',
        category: 'maintenance',
        dietaryType: 'all',
        region: 'asian',
        calories: 2000,
        duration: 10,
        difficulty: 'intermediate',
        cookingTime: 'moderate',
        tags: ['asian', 'balanced', 'tofu', 'rice', 'vegetables', 'soy'],
        imageUrl: '',
        days: List.generate(7, (day) => DayMeal(
          day: day + 1,
          meals: [
            Meal(
              type: 'breakfast',
              name: 'Miso Soup with Tofu',
              description: 'Traditional Japanese breakfast soup',
              calories: 180,
              macros: {'protein': 12, 'carbs': 18, 'fat': 6},
              ingredients: ['miso paste', 'silken tofu', 'seaweed', 'green onions', 'dashi'],
              recipe: 'Dissolve miso in hot dashi, add cubed tofu and seaweed',
            ),
            Meal(
              type: 'lunch',
              name: 'Thai Basil Tofu Stir Fry',
              description: 'Aromatic stir fry with jasmine rice',
              calories: 520,
              macros: {'protein': 22, 'carbs': 68, 'fat': 16},
              ingredients: ['firm tofu', 'jasmine rice', 'thai basil', 'soy sauce', 'coconut oil'],
              recipe: 'Stir fry tofu with basil and serve over steamed rice',
            ),
            Meal(
              type: 'dinner',
              name: 'Korean Bibimbap Bowl',
              description: 'Mixed rice bowl with vegetables and protein',
              calories: 480,
              macros: {'protein': 20, 'carbs': 72, 'fat': 12},
              ingredients: ['brown rice', 'spinach', 'carrots', 'mushrooms', 'egg', 'gochujang'],
              recipe: 'Arrange seasoned vegetables over rice, top with fried egg',
            ),
            Meal(
              type: 'snack',
              name: 'Edamame with Sea Salt',
              description: 'Simple and protein-rich snack',
              calories: 120,
              macros: {'protein': 10, 'carbs': 8, 'fat': 4},
              ingredients: ['edamame', 'sea salt', 'lime'],
            ),
          ],
        )),
      ),

      // AMERICAN STYLE PLANS
      DietPlan(
        id: 'american_muscle_gain',
        name: 'American Style Muscle Building',
        description: 'High-protein American-style diet for muscle gain',
        category: 'muscle_gain',
        dietaryType: 'non_veg',
        region: 'american',
        calories: 2600,
        duration: 28,
        difficulty: 'advanced',
        cookingTime: 'extended',
        tags: ['american', 'high-protein', 'muscle-gain', 'beef', 'dairy'],
        imageUrl: '',
        days: List.generate(7, (day) => DayMeal(
          day: day + 1,
          meals: [
            Meal(
              type: 'breakfast',
              name: 'Protein Pancakes with Turkey Sausage',
              description: 'High-protein breakfast stack',
              calories: 650,
              macros: {'protein': 45, 'carbs': 52, 'fat': 22},
              ingredients: ['protein powder', 'oats', 'eggs', 'turkey sausage', 'maple syrup'],
              recipe: 'Blend protein powder with oats and eggs, cook as pancakes',
            ),
            Meal(
              type: 'lunch',
              name: 'Grilled Chicken Burrito Bowl',
              description: 'Complete meal with beans and rice',
              calories: 720,
              macros: {'protein': 48, 'carbs': 78, 'fat': 18},
              ingredients: ['chicken breast', 'brown rice', 'black beans', 'cheese', 'salsa'],
              recipe: 'Layer ingredients in bowl, top with cheese and salsa',
            ),
            Meal(
              type: 'dinner',
              name: 'Lean Beef Steak with Sweet Potato',
              description: 'Premium protein with complex carbs',
              calories: 680,
              macros: {'protein': 52, 'carbs': 48, 'fat': 24},
              ingredients: ['sirloin steak', 'sweet potato', 'asparagus', 'butter', 'herbs'],
              recipe: 'Grill steak to preference, serve with roasted sweet potato',
            ),
            Meal(
              type: 'snack',
              name: 'Protein Shake with Peanut Butter',
              description: 'Post-workout recovery drink',
              calories: 380,
              macros: {'protein': 32, 'carbs': 24, 'fat': 16},
              ingredients: ['whey protein', 'milk', 'peanut butter', 'banana', 'honey'],
            ),
          ],
        )),
      ),
    ];
  }

  List<DietPlan> get allPlans => _plans;

  List<DietPlan> getPlansByCategory(String category) {
    return _plans.where((plan) => plan.category == category).toList();
  }

  List<DietPlan> searchPlans(String query) {
    if (query.isEmpty) return _plans;
    
    final lowerQuery = query.toLowerCase();
    return _plans.where((plan) =>
      plan.name.toLowerCase().contains(lowerQuery) ||
      plan.description.toLowerCase().contains(lowerQuery) ||
      plan.tags.any((tag) => tag.toLowerCase().contains(lowerQuery))
    ).toList();
  }

  DietPlan? getPlanById(String id) {
    try {
      return _plans.firstWhere((plan) => plan.id == id);
    } catch (e) {
      return null;
    }
  }

  List<String> getCategories() {
    return _plans.map((plan) => plan.category).toSet().toList();
  }
}