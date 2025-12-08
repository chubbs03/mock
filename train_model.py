#!/usr/bin/env python3
"""
Train ML model on Hugging Face patient dataset for risk prediction
"""
import json
import numpy as np
import pandas as pd
from datasets import load_dataset
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
import re

print("="*60)
print("🤖 TRAINING ML MODEL ON PATIENT DATASET")
print("="*60)

# Load dataset
print("\n📥 Loading dataset from Hugging Face...")
ds = load_dataset("madushan99/patient-clinical-letters")
data = ds['train']
print(f"✅ Loaded {len(data)} patient records")

# Extract features from dataset
print("\n🔍 Extracting features from patient data...")

def parse_patient_features(conversation_text):
    """Extract features for ML training"""
    features = {}
    
    # Extract basic info
    age_match = re.search(r'Age: (\d+)', conversation_text)
    sex_match = re.search(r'Sex: (Male|Female)', conversation_text)
    grade_match = re.search(r'grade=(\w+)', conversation_text)
    status_match = re.search(r'status=(\w+)', conversation_text)
    
    # Extract tumor characteristics
    size_match = re.search(r'size=(\d+)', conversation_text)
    depth_match = re.search(r'depth=(\w+)', conversation_text)
    site_match = re.search(r'site of primary STS=(.+?),', conversation_text)
    histological_match = re.search(r'histological type=(.+?),', conversation_text)
    mskcc_match = re.search(r'MSKCC type=(.+?),', conversation_text)
    
    # Extract treatment info
    treatment_match = re.search(r'Treatment: (.+?)\n', conversation_text)
    
    if age_match and sex_match and status_match:
        features['age'] = int(age_match.group(1))
        features['sex'] = sex_match.group(1)
        features['grade'] = grade_match.group(1) if grade_match else 'Unknown'
        features['status'] = status_match.group(1)
        features['tumor_size'] = int(size_match.group(1)) if size_match else 0
        features['depth'] = depth_match.group(1) if depth_match else 'Unknown'
        features['site'] = site_match.group(1).strip() if site_match else 'Unknown'
        features['histological_type'] = histological_match.group(1).strip() if histological_match else 'Unknown'
        features['mskcc_type'] = mskcc_match.group(1).strip() if mskcc_match else 'Unknown'
        features['treatment'] = treatment_match.group(1).strip() if treatment_match else 'Unknown'
        
        return features
    return None

# Parse all patients
patients_data = []
for i in range(len(data)):
    conversation = data[i]['conversations']
    human_msg = conversation[0]['value']
    features = parse_patient_features(human_msg)
    if features:
        patients_data.append(features)

print(f"✅ Extracted features from {len(patients_data)} patients")

# Create DataFrame
df = pd.DataFrame(patients_data)
print(f"\n📊 Dataset shape: {df.shape}")
print(f"📋 Features: {list(df.columns)}")

# Display distribution
print("\n📈 Target Distribution (Status):")
print(df['status'].value_counts())
print(f"\n📈 Tumor Grade Distribution:")
print(df['grade'].value_counts())

# Encode categorical variables
print("\n🔧 Encoding categorical variables...")
label_encoders = {}

categorical_features = ['sex', 'grade', 'depth', 'site', 'histological_type', 'mskcc_type', 'treatment']
for feature in categorical_features:
    le = LabelEncoder()
    df[feature + '_encoded'] = le.fit_transform(df[feature].astype(str))
    label_encoders[feature] = le

# Prepare features and target
feature_columns = ['age', 'tumor_size'] + [f + '_encoded' for f in categorical_features]
X = df[feature_columns].values
y = df['status'].values

# Encode target variable
target_encoder = LabelEncoder()
y_encoded = target_encoder.fit_transform(y)

print(f"\n✅ Feature matrix shape: {X.shape}")
print(f"✅ Target classes: {target_encoder.classes_}")

# Split data
print("\n📊 Splitting data into train/test sets...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
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
    n_estimators=100,
    max_depth=10,
    min_samples_split=5,
    random_state=42,
    class_weight='balanced'
)
rf_model.fit(X_train_scaled, y_train)
print("✅ Random Forest training complete!")

# Train Gradient Boosting model
print("\n🚀 Training Gradient Boosting Classifier...")
gb_model = GradientBoostingClassifier(
    n_estimators=100,
    max_depth=5,
    learning_rate=0.1,
    random_state=42
)
gb_model.fit(X_train_scaled, y_train)
print("✅ Gradient Boosting training complete!")

# Evaluate models
print("\n" + "="*60)
print("📊 MODEL EVALUATION")
print("="*60)

print("\n🌲 RANDOM FOREST RESULTS:")
rf_pred = rf_model.predict(X_test_scaled)
rf_accuracy = accuracy_score(y_test, rf_pred)
print(f"Accuracy: {rf_accuracy:.2%}")
print("\nClassification Report:")
print(classification_report(y_test, rf_pred, target_names=target_encoder.classes_))

print("\n🚀 GRADIENT BOOSTING RESULTS:")
gb_pred = gb_model.predict(X_test_scaled)
gb_accuracy = accuracy_score(y_test, gb_pred)
print(f"Accuracy: {gb_accuracy:.2%}")
print("\nClassification Report:")
print(classification_report(y_test, gb_pred, target_names=target_encoder.classes_))

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
best_model = rf_model if rf_accuracy >= gb_accuracy else gb_model
best_model_name = "Random Forest" if rf_accuracy >= gb_accuracy else "Gradient Boosting"
best_accuracy = max(rf_accuracy, gb_accuracy)

print(f"\n🏆 Best Model: {best_model_name} (Accuracy: {best_accuracy:.2%})")

# Save everything
joblib.dump(best_model, 'patient_risk_model.pkl')
joblib.dump(scaler, 'feature_scaler.pkl')
joblib.dump(target_encoder, 'target_encoder.pkl')
joblib.dump(label_encoders, 'label_encoders.pkl')

# Save feature names
with open('feature_names.json', 'w') as f:
    json.dump(feature_columns, f)

# Save model metadata
metadata = {
    'model_type': best_model_name,
    'accuracy': float(best_accuracy),
    'features': feature_columns,
    'target_classes': target_encoder.classes_.tolist(),
    'training_samples': len(X_train),
    'test_samples': len(X_test),
    'feature_importance': {
        feature_columns[i]: float(rf_model.feature_importances_[i])
        for i in range(len(feature_columns))
    }
}

with open('model_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print("✅ Saved: patient_risk_model.pkl")
print("✅ Saved: feature_scaler.pkl")
print("✅ Saved: target_encoder.pkl")
print("✅ Saved: label_encoders.pkl")
print("✅ Saved: feature_names.json")
print("✅ Saved: model_metadata.json")

print("\n" + "="*60)
print("🎉 MODEL TRAINING COMPLETE!")
print("="*60)
print(f"\n📊 Summary:")
print(f"   • Model: {best_model_name}")
print(f"   • Accuracy: {best_accuracy:.2%}")
print(f"   • Training samples: {len(X_train)}")
print(f"   • Test samples: {len(X_test)}")
print(f"   • Features: {len(feature_columns)}")
print(f"   • Target classes: {len(target_encoder.classes_)}")
print(f"\n🎯 Top 3 Most Important Features:")
for i in range(min(3, len(feature_importance))):
    row = feature_importance.iloc[i]
    print(f"   {i+1}. {row['feature']}: {row['importance']:.4f}")

print("\n" + "="*60)
print("✨ Ready to use for predictions!")
print("="*60)

