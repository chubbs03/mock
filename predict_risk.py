#!/usr/bin/env python3
"""
Use trained ML model to predict patient risk
"""
import json
import numpy as np
import joblib
import sys

def load_model():
    """Load trained model and encoders"""
    print("📥 Loading trained model...")
    model = joblib.load('patient_risk_model.pkl')
    scaler = joblib.load('feature_scaler.pkl')
    target_encoder = joblib.load('target_encoder.pkl')
    label_encoders = joblib.load('label_encoders.pkl')
    
    with open('feature_names.json', 'r') as f:
        feature_names = json.load(f)
    
    with open('model_metadata.json', 'r') as f:
        metadata = json.load(f)
    
    print(f"✅ Loaded {metadata['model_type']} model (Accuracy: {metadata['accuracy']:.2%})")
    return model, scaler, target_encoder, label_encoders, feature_names, metadata

def predict_patient_risk(patient_data, model, scaler, target_encoder, label_encoders, feature_names):
    """
    Predict risk for a patient
    
    patient_data should contain:
    - age: int
    - sex: 'Male' or 'Female'
    - grade: 'High', 'Intermediate', 'Low', etc.
    - tumor_size: int (in cm)
    - depth: 'Deep', 'Superficial', etc.
    - site: tumor site
    - histological_type: histological type
    - mskcc_type: MSKCC classification
    - treatment: treatment plan
    """
    
    # Encode categorical features
    encoded_features = []
    
    # Add numerical features
    encoded_features.append(patient_data.get('age', 50))
    encoded_features.append(patient_data.get('tumor_size', 5))
    
    # Encode categorical features
    categorical_features = ['sex', 'grade', 'depth', 'site', 'histological_type', 'mskcc_type', 'treatment']
    
    for feature in categorical_features:
        value = patient_data.get(feature, 'Unknown')
        encoder = label_encoders[feature]
        
        # Handle unknown values
        try:
            encoded_value = encoder.transform([str(value)])[0]
        except ValueError:
            # Use most common class if value not seen during training
            encoded_value = 0
        
        encoded_features.append(encoded_value)
    
    # Create feature array
    X = np.array([encoded_features])
    
    # Scale features
    X_scaled = scaler.transform(X)
    
    # Predict
    prediction = model.predict(X_scaled)[0]
    probabilities = model.predict_proba(X_scaled)[0]
    
    # Decode prediction
    predicted_status = target_encoder.inverse_transform([prediction])[0]
    
    # Get probability for each class
    class_probabilities = {
        target_encoder.classes_[i]: float(probabilities[i])
        for i in range(len(target_encoder.classes_))
    }
    
    return {
        'predicted_status': predicted_status,
        'confidence': float(max(probabilities)),
        'probabilities': class_probabilities
    }

def main():
    # Load model
    model, scaler, target_encoder, label_encoders, feature_names, metadata = load_model()
    
    print("\n" + "="*60)
    print("🔮 PATIENT RISK PREDICTION")
    print("="*60)
    
    # Example predictions
    print("\n📋 Example Predictions:\n")
    
    # Example 1: High-risk patient
    patient1 = {
        'age': 65,
        'sex': 'Male',
        'grade': 'High',
        'tumor_size': 12,
        'depth': 'Deep',
        'site': 'lower extremity',
        'histological_type': 'leiomyosarcoma',
        'mskcc_type': 'Leiomyosarcoma',
        'treatment': 'Surgery'
    }
    
    result1 = predict_patient_risk(patient1, model, scaler, target_encoder, label_encoders, feature_names)
    print("👤 Patient 1: 65M, High-grade, 12cm tumor")
    print(f"   Predicted Status: {result1['predicted_status']}")
    print(f"   Confidence: {result1['confidence']:.2%}")
    print(f"   Probabilities: {', '.join([f'{k}: {v:.1%}' for k, v in result1['probabilities'].items()])}")
    
    # Example 2: Low-risk patient
    patient2 = {
        'age': 35,
        'sex': 'Female',
        'grade': 'Intermediate',
        'tumor_size': 4,
        'depth': 'Superficial',
        'site': 'upper extremity',
        'histological_type': 'synovial sarcoma',
        'mskcc_type': 'Synovial',
        'treatment': 'Surgery + Radiotherapy'
    }
    
    result2 = predict_patient_risk(patient2, model, scaler, target_encoder, label_encoders, feature_names)
    print("\n👤 Patient 2: 35F, Intermediate-grade, 4cm tumor")
    print(f"   Predicted Status: {result2['predicted_status']}")
    print(f"   Confidence: {result2['confidence']:.2%}")
    print(f"   Probabilities: {', '.join([f'{k}: {v:.1%}' for k, v in result2['probabilities'].items()])}")
    
    # Example 3: Medium-risk patient
    patient3 = {
        'age': 55,
        'sex': 'Female',
        'grade': 'High',
        'tumor_size': 8,
        'depth': 'Deep',
        'site': 'thigh',
        'histological_type': 'undifferentiated pleomorphic sarcoma',
        'mskcc_type': 'MFH',
        'treatment': 'Surgery + Radiotherapy + Chemotherapy'
    }
    
    result3 = predict_patient_risk(patient3, model, scaler, target_encoder, label_encoders, feature_names)
    print("\n👤 Patient 3: 55F, High-grade, 8cm tumor, comprehensive treatment")
    print(f"   Predicted Status: {result3['predicted_status']}")
    print(f"   Confidence: {result3['confidence']:.2%}")
    print(f"   Probabilities: {', '.join([f'{k}: {v:.1%}' for k, v in result3['probabilities'].items()])}")
    
    print("\n" + "="*60)
    print("✨ Prediction complete!")
    print("="*60)

if __name__ == '__main__':
    main()

