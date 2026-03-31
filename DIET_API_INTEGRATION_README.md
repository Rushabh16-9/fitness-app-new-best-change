# Python ML Diet API Integration

## Overview
Your Flutter fitness app now integrates with your Python ML model for advanced diet recommendations. The Python Flask API uses machine learning (TF-IDF vectorization and cosine similarity) to provide personalized diet recommendations based on user profiles.

## Features
- **AI-Powered Recommendations**: Uses ML algorithms to match user profiles with optimal diet plans
- **BMR Calculation**: Automatically calculates Basal Metabolic Rate for calorie targets
- **Smart Filtering**: Filters recommendations based on allergies, diet preferences, and meal types
- **Real-time API**: Flutter app communicates with Python API via HTTP requests

## Setup Instructions

### 1. Install Python Dependencies
```bash
pip install flask pandas numpy scikit-learn joblib
```

### 2. Prepare Dataset
Ensure your `diet_recommendations_dataset.csv` has the required columns:
- Patient_ID, Age, Gender, Weight_kg, Height_cm, BMI
- Disease_Type, Severity, Physical_Activity_Level
- Daily_Caloric_Intake, Cholesterol_mg/dL, Blood_Pressure_mmHg, Glucose_mg/dL
- Dietary_Restrictions, Allergies, Preferred_Cuisine
- Weekly_Exercise_Hours, Adherence_to_Diet_Plan, Dietary_Nutrient_Imbalance_Score
- Diet_Recommendation

### 3. Start the Python API Server
Run the batch file:
```bash
run_diet_api.bat
```

Or manually:
```bash
cd assets/data/diet/diet_api
python app_diet_api.py
```

The API will start on `http://localhost:5001`

### 4. Use in Flutter App
Navigate to the "AI Diet Recommendations" page in your app and fill out the form with user details. The app will send a POST request to `/recommend` endpoint with user data and display personalized recommendations.

## API Endpoint

### POST /recommend
**Request Body:**
```json
{
  "age": 25,
  "gender": "male",
  "height_cm": 175.0,
  "weight_kg": 70.0,
  "activity": "moderate",
  "goal": "maintain",
  "meals_per_day": 3,
  "diet_type": "vegetarian",
  "meal_type": "lunch",
  "allergies": ["peanuts"],
  "dislikes": ["spinach"],
  "include_keywords": ["healthy", "protein"],
  "exclude_keywords": ["sugar"],
  "protein_target_per_meal": 25.0,
  "top_k": 5
}
```

**Response:**
```json
{
  "count": 5,
  "items": [
    {
      "Patient_ID": "P001",
      "Age": 25,
      "Gender": "male",
      "Weight_kg": 70.0,
      "Height_cm": 175.0,
      "BMI": 22.9,
      "Disease_Type": "None",
      "Severity": "None",
      "Physical_Activity_Level": "moderate",
      "Daily_Caloric_Intake": 2200,
      "Cholesterol_mg/dL": 180.0,
      "Blood_Pressure_mmHg": 120,
      "Glucose_mg/dL": 90.0,
      "Dietary_Restrictions": "None",
      "Allergies": "None",
      "Preferred_Cuisine": "Mediterranean",
      "Weekly_Exercise_Hours": 5.0,
      "Adherence_to_Diet_Plan": 85.0,
      "Dietary_Nutrient_Imbalance_Score": 2.1,
      "Diet_Recommendation": "Focus on balanced Mediterranean diet with adequate protein intake..."
    }
  ]
}
```

## ML Model Details

### Text Processing
- **TF-IDF Vectorization**: Converts text features (name, description, ingredients, tags, cuisine, diet_type, meal_type) into numerical vectors
- **Cosine Similarity**: Measures similarity between user preferences and available diet options

### Numeric Processing
- **Standard Scaling**: Normalizes nutritional values (calories, protein, carbs, fat)
- **Similarity Scoring**: Combines text and numeric similarities (55% text, 45% numeric)

### BMR Calculation
- **Harris-Benedict Formula**: Calculates daily calorie needs based on age, gender, height, weight
- **Activity Multipliers**: Adjusts calories based on activity level
- **Goal Adjustments**: Modifies calories for weight loss (+300), maintenance, or gain (-450)

## Troubleshooting

### API Connection Issues
- Ensure Python API is running on port 5001
- Check firewall settings
- Verify all Python dependencies are installed

### Dataset Issues
- Ensure CSV file exists in `assets/data/diet/diet_recommendations_dataset.csv`
- Verify column names match the expected format
- Check for missing or invalid data

### Flutter App Issues
- Check internet connectivity
- Verify API base URL in `DietApiService`
- Check console logs for error messages

## Future Enhancements
- Add more ML models (neural networks, collaborative filtering)
- Implement real-time model retraining
- Add user feedback loop for model improvement
- Integrate with nutrition APIs for real-time data
- Add image recognition for food logging
