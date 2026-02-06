# Predictive AI Clinic Assistant — Heart Disease Prediction System

A full-stack healthcare application that combines multiple machine learning techniques for heart disease prediction, including Random Forest, Gradient Boosting, Artificial Neural Networks, Genetic Algorithm feature selection, and Fuzzy Logic risk classification.

## Features

- **303 Patient Records** — Real data from the UCI Heart Disease dataset (Hugging Face)
- **6 ML Models** — Random Forest, Gradient Boosting, ANN, RF+GA, ANN+GA, and a best-model selector
- **Fuzzy Logic** — Intelligent risk classification using scikit-fuzzy with 24 rules
- **Genetic Algorithm** — Feature selection using DEAP for optimized model inputs
- **AUC-ROC Visualization** — Multi-model comparison plot
- **Interactive Dashboard** — Vitals charts (BP, HR, Glucose, SpO2), risk assessment, task queue
- **AI Helper Bot** — DeepSeek-powered conversational assistant
- **Department Routing** — Rule-based + AI fallback for task classification

## Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm
- Python packages: `flask`, `flask-cors`, `joblib`, `numpy`, `scikit-learn`, `scikit-fuzzy`, `deap`, `networkx`, `matplotlib`, `pandas`, `datasets`, `openai`

## Quick Start

You need **3 terminals** to run the full system:

### Terminal 1 — ML API Server (port 5002)

```bash
pip install flask flask-cors joblib numpy scikit-learn scikit-fuzzy deap networkx
python heart_disease_api.py
```

This serves all ML models and the fuzzy logic risk assessment.

### Terminal 2 — Backend Server (port 5001)

```bash
pip install flask flask-cors openai
python backend/app.py
```

This handles department routing with DeepSeek AI.

### Terminal 3 — Frontend Dev Server (port 5173)

```bash
npm install
npm run dev
```

### Open in Browser

Navigate to **http://localhost:5173**

## API Endpoints

### ML API (port 5002)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/predict` | Predict using the best model |
| `POST` | `/api/predict-all` | Predict using all 7 models (6 ML + fuzzy) |
| `POST` | `/api/fuzzy-risk` | Fuzzy logic risk assessment only |
| `GET` | `/api/model-info` | Model metadata, GA features, fuzzy config |
| `GET` | `/api/health` | Health check with loaded models list |

### Backend (port 5001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/route` | Department routing for tasks |
| `GET` | `/api/health` | Health check |

## Model Performance

| Model | AUC | Accuracy |
|-------|-----|----------|
| Random Forest | 0.9540 | 91.80% |
| Gradient Boosting | 0.9470 | 88.52% |
| RF + GA Features | 0.9416 | 83.61% |
| ANN (Neural Network) | 0.9361 | 86.89% |
| ANN + GA Features | 0.9361 | 77.05% |

## Retraining Models

To retrain all models from scratch:

```bash
# 1. Train base models (Random Forest, Gradient Boosting, ANN)
pip install datasets scikit-learn pandas numpy joblib
python train_heart_disease_model.py

# 2. Run Genetic Algorithm feature selection and train GA-optimized models
pip install deap networkx
python genetic_feature_selection.py

# 3. Generate fuzzy logic config
pip install scikit-fuzzy
python fuzzy_risk_classifier.py

# 4. Regenerate AUC-ROC comparison plot
pip install matplotlib
python plot_auc_roc.py
```

## Project Structure

```
├── src/                          # Frontend (React + TypeScript)
│   ├── App.tsx                   # Main app with 303 patients, charts, ML integration
│   ├── main.tsx                  # Entry point
│   ├── index.css                 # Tailwind CSS
│   └── components/ui/            # UI components (card, tabs, button, etc.)
├── backend/
│   ├── app.py                    # Department routing server (port 5001)
│   └── requirements.txt          # Python dependencies
├── heart_disease_api.py          # ML API server (port 5002)
├── train_heart_disease_model.py  # Training script for RF, GB, ANN
├── genetic_feature_selection.py  # GA feature selection with DEAP
├── fuzzy_risk_classifier.py      # Fuzzy logic risk classifier
├── plot_auc_roc.py               # AUC-ROC curve generator
├── heart_disease_model.pkl       # Best trained model
├── heart_disease_rf_model.pkl    # Random Forest model
├── heart_disease_gb_model.pkl    # Gradient Boosting model
├── heart_disease_ann_model.pkl   # ANN model
├── heart_disease_rf_ga_model.pkl # RF with GA-selected features
├── heart_disease_ann_ga_model.pkl# ANN with GA-selected features
├── heart_disease_scaler.pkl      # Feature scaler
├── heart_disease_metadata.json   # Model metadata
├── heart_disease_features.json   # Feature names
├── ga_selected_features.json     # GA-selected feature indices
├── fuzzy_config.json             # Fuzzy logic configuration
├── heart_disease_auc_roc_curve.png  # AUC-ROC plot (PNG)
├── heart_disease_auc_roc_curve.pdf  # AUC-ROC plot (PDF)
├── index.html                    # HTML entry point
├── package.json                  # npm dependencies
├── vite.config.ts                # Vite configuration
└── tsconfig.json                 # TypeScript configuration
```

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide React, OpenAI SDK (DeepSeek)

**ML API:** Flask, scikit-learn, scikit-fuzzy, DEAP, joblib, NumPy

**Backend:** Flask, OpenAI SDK (DeepSeek)

**Dataset:** UCI Heart Disease (303 records, 13 features) via Hugging Face

## Troubleshooting

### ML API won't start
- Ensure all Python packages are installed: `pip install flask flask-cors joblib numpy scikit-learn scikit-fuzzy networkx`
- Ensure all `.pkl` and `.json` model files exist in the root directory
- If missing, retrain models (see "Retraining Models" above)

### Frontend shows blank page
- Check browser console (F12) for errors
- Ensure `npm install` was run
- Try `npm run build` to check for TypeScript errors

### ML Predict button not working
- Ensure the ML API is running on port 5002
- Check `http://localhost:5002/api/health` returns `"status": "healthy"`

