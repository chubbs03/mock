# 🧠 ML Prediction System - Complete Guide

## 📋 Overview

The **ML Prediction System** uses a trained **Random Forest machine learning model** to predict heart disease risk with **91.80% accuracy**. The system analyzes 13 clinical features to provide AI-powered predictions.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                         │
│              http://localhost:5173                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Click "ML Predict" Button
                     ▼
┌─────────────────────────────────────────────────────────┐
│              REACT FRONTEND (Port 5173)                 │
│  - Collects patient data (age, BP, cholesterol, etc.)  │
│  - Sends POST request to ML API                         │
│  - Displays prediction results                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ POST /api/predict
                     │ {age, sex, cp, trestbps, chol, ...}
                     ▼
┌─────────────────────────────────────────────────────────┐
│           FLASK ML API SERVER (Port 5002)               │
│  - Receives patient data                                │
│  - Extracts 13 clinical features                        │
│  - Scales features using StandardScaler                 │
│  - Runs Random Forest model prediction                  │
│  - Returns prediction + confidence + probabilities      │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Uses trained model files:
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  ML MODEL FILES                         │
│  - heart_disease_model.pkl (Random Forest)              │
│  - heart_disease_scaler.pkl (Feature Scaler)            │
│  - heart_disease_metadata.json (Model Info)             │
│  - heart_disease_features.json (Feature Names)          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 What the ML Prediction Does

### **Input Features (13 Clinical Measurements):**

1. **age** - Patient age in years
2. **sex** - Gender (0=Female, 1=Male)
3. **cp** - Chest pain type (1-4)
   - 1: Typical Angina
   - 2: Atypical Angina
   - 3: Non-Anginal Pain
   - 4: Asymptomatic
4. **trestbps** - Resting blood pressure (mm Hg)
5. **chol** - Serum cholesterol (mg/dl)
6. **fbs** - Fasting blood sugar > 120 mg/dl (0=No, 1=Yes)
7. **restecg** - Resting ECG results (0-2)
8. **thalach** - Maximum heart rate achieved
9. **exang** - Exercise induced angina (0=No, 1=Yes)
10. **oldpeak** - ST depression induced by exercise
11. **slope** - Slope of peak exercise ST segment (1-3)
12. **ca** - Number of major vessels colored by fluoroscopy (0-3)
13. **thal** - Thalassemia (3=normal, 6=fixed defect, 7=reversible defect)

### **Output:**

```json
{
  "predicted_status": "Heart Disease" or "No Disease",
  "confidence": 95.3,  // Percentage (0-100)
  "probabilities": {
    "No Disease": 0.047,
    "Heart Disease": 0.953
  },
  "risk_level": "High" or "Moderate" or "Low"
}
```

### **Risk Level Calculation:**
- **High Risk**: Heart disease probability > 70%
- **Moderate Risk**: Heart disease probability 40-70%
- **Low Risk**: Heart disease probability < 40%

---

## 🚀 How to Use

### **Step 1: Start Both Servers**

**Option A: Use the batch file (Easiest)**
```bash
Double-click START_SERVER.bat
```

**Option B: Manual start**
```bash
# Terminal 1: Start ML API
python heart_disease_api.py

# Terminal 2: Start Frontend
npm run dev
```

### **Step 2: Open the Application**
- Open browser: **http://localhost:5173**

### **Step 3: Get ML Prediction**
1. **Select a patient** from the list
2. **Click "ML Predict"** button in the Risk Assessment section
3. **Wait 1-2 seconds** for the prediction
4. **View results** showing:
   - Predicted status (Heart Disease / No Disease)
   - Confidence percentage
   - Risk level (High/Moderate/Low)
   - Probability breakdown

---

## 📊 Model Performance

### **Accuracy: 91.80%**

| Metric | No Disease | Heart Disease |
|--------|------------|---------------|
| **Precision** | 97% | 87% |
| **Recall** | 88% | 96% |
| **F1-Score** | 92% | 91% |

### **Top 5 Most Important Features:**
1. **thal** (Thalassemia): 14.09%
2. **thalach** (Max Heart Rate): 12.17%
3. **cp** (Chest Pain Type): 11.48%
4. **ca** (Number of Major Vessels): 10.67%
5. **age**: 9.63%

---

## 🔧 Technical Details

### **Model Type:** Random Forest Classifier
- **Estimators:** 200 decision trees
- **Max Depth:** Unlimited
- **Class Weight:** Balanced
- **Training Data:** 303 patients from UCI Heart Disease dataset

### **Feature Scaling:** StandardScaler
- Normalizes all features to have mean=0 and std=1
- Essential for consistent predictions

### **API Endpoint:**
```
POST http://localhost:5002/api/predict
Content-Type: application/json

{
  "age": 63,
  "sex": 1,
  "cp": 1,
  "trestbps": 145,
  "chol": 233,
  "fbs": 1,
  "restecg": 2,
  "thalach": 150,
  "exang": 0,
  "oldpeak": 2.3,
  "slope": 3,
  "ca": 0,
  "thal": 6
}
```

---

## 🐛 Troubleshooting

### **"ML prediction service is not available"**
**Cause:** ML API server (port 5002) is not running

**Solution:**
```bash
python heart_disease_api.py
```

### **"Connection refused" error**
**Cause:** Frontend trying to connect before API is ready

**Solution:** Wait 3-5 seconds after starting the API, then try again

### **Incorrect predictions**
**Cause:** Model version mismatch (sklearn version warning)

**Solution:** Retrain the model with current sklearn version:
```bash
python train_heart_disease_model.py
```

---

## 📁 Related Files

- `heart_disease_api.py` - Flask ML API server
- `heart_disease_model.pkl` - Trained Random Forest model
- `heart_disease_scaler.pkl` - Feature scaler
- `heart_disease_metadata.json` - Model metadata
- `heart_disease_features.json` - Feature names
- `train_heart_disease_model.py` - Model training script
- `src/App.tsx` - Frontend with ML integration

---

## ✨ Example Prediction Flow

1. **User clicks "ML Predict"** for patient Richard Martin (Age 63, Male)
2. **Frontend extracts features:**
   - age: 63, sex: 1 (Male), cp: 1 (Typical Angina)
   - trestbps: 145, chol: 233, fbs: 1 (High)
   - restecg: 2, thalach: 150, exang: 0 (No)
   - oldpeak: 2.3, slope: 3, ca: 0, thal: 6
3. **API processes request:**
   - Scales features using StandardScaler
   - Runs Random Forest prediction
4. **Model predicts:**
   - Status: "No Disease"
   - Confidence: 85.2%
   - Risk Level: "Low"
5. **Frontend displays:**
   - Green badge: "No Disease (85.2% confidence)"
   - Suggested action: "Continue healthy lifestyle; routine annual checkup"

---

**Built with ❤️ using Random Forest ML, Flask, and React**

