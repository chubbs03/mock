# 🚀 Quick Start Guide - Healthcare ML System

## ✅ **BOTH SERVERS ARE NOW RUNNING!**

---

## 🎯 **Current Status:**

✅ **ML API Server**: Running on http://localhost:5002  
✅ **Frontend Server**: Running on http://localhost:5173  
✅ **Model Loaded**: Random Forest (91.80% accuracy)  
✅ **Ready to Use**: Open browser and click "ML Predict"!  

---

## 🚀 **How to Start the System:**

### **Option 1: Use the Batch File (EASIEST)**
```bash
# Double-click this file or run in terminal:
START_SERVER.bat
```

This will:
1. Start ML API server on port 5002 (in separate window)
2. Start Frontend server on port 5173 (in main window)

### **Option 2: Manual Start (Two Terminals)**
```bash
# Terminal 1: Start ML API
python heart_disease_api.py

# Terminal 2: Start Frontend
npm run dev
```

---

## 🧪 **How to Test ML Predictions:**

1. **Open browser**: http://localhost:5173

2. **Select a patient** from the list (e.g., Richard Martin)

3. **Click "ML Predict"** button in the Risk Assessment section

4. **See the results:**
   - ✅ Prediction status (Heart Disease / No Disease)
   - ✅ Confidence percentage
   - ✅ Risk level (High/Moderate/Low)
   - ✅ **NEW: Model Performance Panel** showing:
     - Model Type: Random Forest
     - Accuracy: 91.80%
     - Trees: 200 estimators
     - Training/Test samples
     - Features used

5. **Check the terminal** running the ML API to see detailed logs:
   ```
   ============================================================
   🔍 NEW PREDICTION REQUEST
   ============================================================
   📊 Patient Data: ...
   🤖 Model: Random Forest
   🎯 Accuracy: 91.80%
   📈 PREDICTION RESULT: ...
   ============================================================
   ```

---

## 🔧 **Troubleshooting:**

### **Problem: "ML prediction service is not available"**

**Solution 1: Check if ML API is running**
```powershell
Invoke-WebRequest -Uri http://localhost:5002/api/health
```
- If you get Status 200: Server is running ✅
- If you get error: Server is not running ❌

**Solution 2: Start ML API manually**
```bash
python heart_disease_api.py
```

**Solution 3: Check Python dependencies**
```bash
pip install flask flask-cors joblib numpy scikit-learn
```

### **Problem: Frontend not loading**

**Solution 1: Check if frontend is running**
```powershell
Invoke-WebRequest -Uri http://localhost:5173
```

**Solution 2: Start frontend manually**
```bash
npm run dev
```

**Solution 3: Install dependencies**
```bash
npm install
```

### **Problem: Port already in use**

**Solution: Kill the process using the port**
```powershell
# For port 5002 (ML API)
netstat -ano | findstr :5002
taskkill /PID <PID> /F

# For port 5173 (Frontend)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

---

## 📊 **What You'll See:**

### **In the Browser:**
- Beautiful purple **Model Performance Panel** with:
  - Model Type, Accuracy, Estimators
  - Training/Test samples
  - Features used
- Color-coded prediction results
- Risk level badges
- Confidence percentages

### **In the Terminal:**
- Detailed prediction logs
- Patient data used
- Model information
- Probability breakdown
- Timestamps

---

## 🎨 **Features Implemented:**

✅ **Task Queue Priority Sorting**
- Tasks sorted High → Medium → Normal → Low
- Color-coded by priority
- Automatic sorting on add/remove

✅ **ML Model Performance Display**
- Shows accuracy, model type, estimators
- Displays with every prediction
- Both UI and terminal logging

✅ **Enhanced Predictions**
- ML-powered predictions (91.80% accuracy)
- Risk level classification
- Confidence scores
- Probability breakdown

---

## 📁 **Important Files:**

- `START_SERVER.bat` - One-click server startup
- `heart_disease_api.py` - ML API server (port 5002)
- `src/App.tsx` - Frontend application (port 5173)
- `heart_disease_model.pkl` - Trained Random Forest model
- `heart_disease_scaler.pkl` - Feature scaler
- `heart_disease_metadata.json` - Model metadata

---

## 🎯 **Next Steps:**

1. ✅ **Open browser**: http://localhost:5173
2. ✅ **Select a patient**
3. ✅ **Click "ML Predict"**
4. ✅ **See the Model Performance Panel**
5. ✅ **Check terminal for detailed logs**

---

## 💡 **Tips:**

- **Both servers must be running** for ML predictions to work
- **Use START_SERVER.bat** for easiest startup
- **Check terminal logs** for debugging
- **Model Performance Panel** appears after first ML prediction
- **Tasks are auto-sorted** by priority (High first)

---

**Everything is ready! Open http://localhost:5173 and try ML predictions now!** 🎉

