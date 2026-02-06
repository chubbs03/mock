#!/usr/bin/env python3
"""
Train ML model on heart disease dataset for risk prediction
"""
import json
import numpy as np
import pandas as pd
from datasets import load_dataset
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib

print("="*60)
print("🫀 TRAINING HEART DISEASE PREDICTION MODEL")
print("="*60)

# Load dataset
print("\n📥 Loading heart disease dataset from Hugging Face...")
ds = load_dataset("skrishna/heart_disease_uci")
data = ds['test']
print(f"✅ Loaded {len(data)} patient records")

# Convert to DataFrame
print("\n🔄 Converting to DataFrame...")
df = pd.DataFrame(data)

# Handle string columns (ca and thal)
df['ca'] = pd.to_numeric(df['ca'], errors='coerce').fillna(0)
df['thal'] = pd.to_numeric(df['thal'], errors='coerce').fillna(0)

print(f"📊 Dataset shape: {df.shape}")
print(f"📋 Features: {list(df.columns)}")

# Display distribution
print("\n📈 Target Distribution:")
print(df['target'].value_counts())
print("   0 = No Heart Disease")
print("   1 = Heart Disease Present")

print(f"\n📈 Age Statistics:")
print(f"   Min: {df['age'].min()}, Max: {df['age'].max()}, Mean: {df['age'].mean():.1f}")

print(f"\n📈 Sex Distribution:")
print(f"   Female (0): {(df['sex'] == 0).sum()}")
print(f"   Male (1): {(df['sex'] == 1).sum()}")

print(f"\n📈 Chest Pain Type Distribution:")
print(df['cp'].value_counts().sort_index())

# Prepare features and target
print("\n🔧 Preparing features...")
feature_columns = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 
                   'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']

X = df[feature_columns].values
y = df['target'].values

print(f"\n✅ Feature matrix shape: {X.shape}")
print(f"✅ Target shape: {y.shape}")
print(f"✅ Features: {feature_columns}")

# Split data
print("\n📊 Splitting data into train/test sets...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"✅ Training set: {X_train.shape[0]} samples")
print(f"✅ Test set: {X_test.shape[0]} samples")

# Scale features
print("\n⚖️ Scaling features...")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train Random Forest model
print("\n🌲 Training Random Forest Classifier...")
rf_model = RandomForestClassifier(
    n_estimators=200,
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
    max_features='sqrt',
    random_state=42,
    class_weight='balanced',
    bootstrap=True
)
rf_model.fit(X_train_scaled, y_train)
print("✅ Random Forest training complete!")

# Train Gradient Boosting model
print("\n🚀 Training Gradient Boosting Classifier...")
gb_model = GradientBoostingClassifier(
    n_estimators=200,
    max_depth=4,
    learning_rate=0.05,
    subsample=0.8,
    random_state=42
)
gb_model.fit(X_train_scaled, y_train)
print("✅ Gradient Boosting training complete!")

# Train ANN (Neural Network) model
print("\n🧠 Training Artificial Neural Network (ANN)...")
ann_model = MLPClassifier(
    hidden_layer_sizes=(100, 50, 25),
    activation='relu',
    solver='adam',
    max_iter=500,
    random_state=42,
    early_stopping=True,
    validation_fraction=0.1,
    n_iter_no_change=10,
    verbose=False
)
ann_model.fit(X_train_scaled, y_train)
print("✅ ANN training complete!")
print(f"   Iterations: {ann_model.n_iter_}")
print(f"   Layers: {ann_model.n_layers_}")
print(f"   Hidden layers: {ann_model.hidden_layer_sizes}")

# Evaluate models
print("\n" + "="*60)
print("📊 MODEL EVALUATION")
print("="*60)

print("\n🌲 RANDOM FOREST RESULTS:")
rf_pred = rf_model.predict(X_test_scaled)
rf_accuracy = accuracy_score(y_test, rf_pred)
print(f"Accuracy: {rf_accuracy:.2%}")
print("\nClassification Report:")
print(classification_report(y_test, rf_pred, target_names=['No Disease', 'Heart Disease']))

print("\n🚀 GRADIENT BOOSTING RESULTS:")
gb_pred = gb_model.predict(X_test_scaled)
gb_accuracy = accuracy_score(y_test, gb_pred)
print(f"Accuracy: {gb_accuracy:.2%}")
print("\nClassification Report:")
print(classification_report(y_test, gb_pred, target_names=['No Disease', 'Heart Disease']))

print("\n🧠 ARTIFICIAL NEURAL NETWORK RESULTS:")
ann_pred = ann_model.predict(X_test_scaled)
ann_accuracy = accuracy_score(y_test, ann_pred)
print(f"Accuracy: {ann_accuracy:.2%}")
print("\nClassification Report:")
print(classification_report(y_test, ann_pred, target_names=['No Disease', 'Heart Disease']))

# Cross-validation scores
print("\n" + "="*60)
print("🔄 CROSS-VALIDATION SCORES (5-Fold)")
print("="*60)
rf_cv_scores = cross_val_score(rf_model, X_train_scaled, y_train, cv=5)
print(f"Random Forest CV Scores: {rf_cv_scores}")
print(f"Random Forest CV Mean: {rf_cv_scores.mean():.2%} (+/- {rf_cv_scores.std() * 2:.2%})")

gb_cv_scores = cross_val_score(gb_model, X_train_scaled, y_train, cv=5)
print(f"Gradient Boosting CV Scores: {gb_cv_scores}")
print(f"Gradient Boosting CV Mean: {gb_cv_scores.mean():.2%} (+/- {gb_cv_scores.std() * 2:.2%})")

ann_cv_scores = cross_val_score(ann_model, X_train_scaled, y_train, cv=5)
print(f"ANN CV Scores: {ann_cv_scores}")
print(f"ANN CV Mean: {ann_cv_scores.mean():.2%} (+/- {ann_cv_scores.std() * 2:.2%})")

# Feature importance
print("\n" + "="*60)
print("🎯 FEATURE IMPORTANCE (Random Forest)")
print("="*60)
feature_importance = pd.DataFrame({
    'feature': feature_columns,
    'importance': rf_model.feature_importances_
}).sort_values('importance', ascending=False)
print(feature_importance.to_string(index=False))

# Save models and encoders
print("\n" + "="*60)
print("💾 SAVING MODELS AND ENCODERS")
print("="*60)

# Choose best model
model_scores = {
    'Random Forest': rf_accuracy,
    'Gradient Boosting': gb_accuracy,
    'ANN (Neural Network)': ann_accuracy
}
best_model_name = max(model_scores, key=model_scores.get)
best_accuracy = model_scores[best_model_name]
best_model = {'Random Forest': rf_model, 'Gradient Boosting': gb_model, 'ANN (Neural Network)': ann_model}[best_model_name]

print(f"\n📊 Model Comparison:")
for name, acc in model_scores.items():
    marker = "🏆" if name == best_model_name else "  "
    print(f"   {marker} {name}: {acc:.2%}")

print(f"\n🏆 Best Model: {best_model_name} (Accuracy: {best_accuracy:.2%})")

# Save all models
joblib.dump(best_model, 'heart_disease_model.pkl')
joblib.dump(rf_model, 'heart_disease_rf_model.pkl')
joblib.dump(gb_model, 'heart_disease_gb_model.pkl')
joblib.dump(ann_model, 'heart_disease_ann_model.pkl')
joblib.dump(scaler, 'heart_disease_scaler.pkl')

# Save feature names
with open('heart_disease_features.json', 'w') as f:
    json.dump(feature_columns, f)

# Save model metadata
metadata = {
    'model_type': best_model_name,
    'accuracy': float(best_accuracy),
    'all_models': {
        'Random Forest': float(rf_accuracy),
        'Gradient Boosting': float(gb_accuracy),
        'ANN (Neural Network)': float(ann_accuracy)
    },
    'ann_config': {
        'hidden_layers': list(ann_model.hidden_layer_sizes),
        'activation': 'relu',
        'solver': 'adam',
        'iterations': int(ann_model.n_iter_),
        'n_layers': int(ann_model.n_layers_)
    },
    'features': feature_columns,
    'target_classes': ['No Disease', 'Heart Disease'],
    'training_samples': len(X_train),
    'test_samples': len(X_test),
    'feature_importance': {
        feature_columns[i]: float(rf_model.feature_importances_[i])
        for i in range(len(feature_columns))
    }
}

with open('heart_disease_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print("✅ Saved: heart_disease_model.pkl (best model)")
print("✅ Saved: heart_disease_rf_model.pkl")
print("✅ Saved: heart_disease_gb_model.pkl")
print("✅ Saved: heart_disease_ann_model.pkl")
print("✅ Saved: heart_disease_scaler.pkl")
print("✅ Saved: heart_disease_features.json")
print("✅ Saved: heart_disease_metadata.json")

# Test with diverse patients
print("\n" + "="*60)
print("🧪 TESTING MODEL WITH DIVERSE PATIENTS")
print("="*60)

test_patients = [
    {
        'name': 'Young Healthy Patient',
        'age': 35, 'sex': 0, 'cp': 4, 'trestbps': 120, 'chol': 180,
        'fbs': 0, 'restecg': 0, 'thalach': 170, 'exang': 0,
        'oldpeak': 0, 'slope': 1, 'ca': 0, 'thal': 3
    },
    {
        'name': 'High-Risk Patient',
        'age': 65, 'sex': 1, 'cp': 1, 'trestbps': 160, 'chol': 300,
        'fbs': 1, 'restecg': 2, 'thalach': 110, 'exang': 1,
        'oldpeak': 3.5, 'slope': 3, 'ca': 3, 'thal': 7
    },
    {
        'name': 'Moderate-Risk Patient',
        'age': 50, 'sex': 0, 'cp': 2, 'trestbps': 140, 'chol': 240,
        'fbs': 0, 'restecg': 1, 'thalach': 140, 'exang': 0,
        'oldpeak': 1.5, 'slope': 2, 'ca': 1, 'thal': 3
    }
]

for test_patient in test_patients:
    # Extract features
    features = [test_patient[f] for f in feature_columns]
    X_test_patient = scaler.transform([features])

    # Predict
    prediction = best_model.predict(X_test_patient)[0]
    probabilities = best_model.predict_proba(X_test_patient)[0]

    print(f"\n{test_patient['name']}:")
    print(f"  Age: {test_patient['age']}, Sex: {'Male' if test_patient['sex']==1 else 'Female'}, BP: {test_patient['trestbps']}, Chol: {test_patient['chol']}")
    print(f"  Predicted: {'Heart Disease' if prediction==1 else 'No Disease'} ({max(probabilities)*100:.1f}% confidence)")
    print(f"  Probabilities: No Disease={probabilities[0]*100:.1f}%, Heart Disease={probabilities[1]*100:.1f}%")

print("\n" + "="*60)
print("🎉 MODEL TRAINING COMPLETE!")
print("="*60)
print(f"\n📊 Summary:")
print(f"   • Best Model: {best_model_name}")
print(f"   • Best Accuracy: {best_accuracy:.2%}")
print(f"   • Random Forest: {rf_accuracy:.2%}")
print(f"   • Gradient Boosting: {gb_accuracy:.2%}")
print(f"   • ANN (Neural Network): {ann_accuracy:.2%}")
print(f"   • Training samples: {len(X_train)}")
print(f"   • Test samples: {len(X_test)}")
print(f"   • Features: {len(feature_columns)}")
print(f"   • Target classes: 2 (No Disease, Heart Disease)")

print(f"\n🧠 ANN Architecture:")
print(f"   • Hidden layers: {ann_model.hidden_layer_sizes}")
print(f"   • Activation: relu")
print(f"   • Solver: adam")
print(f"   • Iterations: {ann_model.n_iter_}")

print(f"\n🎯 Top 5 Most Important Features:")
for i in range(min(5, len(feature_importance))):
    row = feature_importance.iloc[i]
    print(f"   {i+1}. {row['feature']}: {row['importance']:.4f}")

print("\n" + "="*60)
print("✨ Ready to use for heart disease predictions!")
print("="*60)


