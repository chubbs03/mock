#!/usr/bin/env python3
"""
Flask API for ML model predictions
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import numpy as np
import joblib

app = Flask(__name__)
CORS(app)

# Load model and encoders
print("📥 Loading ML model...")
model = joblib.load('patient_risk_model.pkl')
scaler = joblib.load('feature_scaler.pkl')
target_encoder = joblib.load('target_encoder.pkl')
label_encoders = joblib.load('label_encoders.pkl')

with open('feature_names.json', 'r') as f:
    feature_names = json.load(f)

with open('model_metadata.json', 'r') as f:
    metadata = json.load(f)

print(f"✅ Loaded {metadata['model_type']} model (Accuracy: {metadata['accuracy']:.2%})")

def predict_patient_risk(patient_data):
    """Predict risk for a patient - FIXED to handle data properly"""

    # Normalize grade values (handle typos like "intermedaite")
    grade = patient_data.get('grade', 'Intermediate')
    if grade.lower() in ['intermedaite', 'intermediate']:
        grade = 'Intermediate'
    elif grade.lower() == 'high':
        grade = 'High'
    elif grade.lower() == 'low':
        grade = 'Low'

    # Map gender to sex
    sex = patient_data.get('sex', patient_data.get('gender', 'Female'))
    if sex in ['M', 'Male']:
        sex = 'Male'
    else:
        sex = 'Female'

    # Normalize treatment
    treatment = patient_data.get('treatment', 'Surgery')
    # Map common treatment patterns
    if 'radiotherapy' in treatment.lower() and 'surgery' in treatment.lower() and 'chemotherapy' in treatment.lower():
        treatment = 'Radiotherapy + Surgery + Chemotherapy'
    elif 'radiotherapy' in treatment.lower() and 'surgery' in treatment.lower():
        treatment = 'Radiotherapy + Surgery'
    elif 'surgery' in treatment.lower() and 'chemotherapy' in treatment.lower():
        treatment = 'Surgery + Chemotherapy'

    # Encode categorical features
    encoded_features = []

    # Add numerical features (age, tumor_size)
    encoded_features.append(patient_data.get('age', 50))
    encoded_features.append(patient_data.get('tumor_size', 5))

    # Encode categorical features in the correct order
    categorical_features = ['sex', 'grade', 'depth', 'site', 'histological_type', 'mskcc_type', 'treatment']
    feature_values = {
        'sex': sex,
        'grade': grade,
        'depth': patient_data.get('depth', 'Deep'),
        'site': patient_data.get('tumor_site', patient_data.get('site', 'Unknown')),
        'histological_type': patient_data.get('histological_type', 'Unknown'),
        'mskcc_type': patient_data.get('mskcc_type', 'Unknown'),
        'treatment': treatment
    }

    for feature in categorical_features:
        value = feature_values[feature]
        encoder = label_encoders[feature]

        # Handle unknown values
        try:
            encoded_value = encoder.transform([str(value)])[0]
        except ValueError:
            # Use most common class if value not seen during training
            print(f"⚠️ Unknown value '{value}' for feature '{feature}', using fallback")
            # Get the most common class (first class in encoder)
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

    # Calculate risk level based on probabilities
    risk_level = 'Low'
    if class_probabilities.get('D', 0) > 0.3:
        risk_level = 'High'
    elif class_probabilities.get('AWD', 0) > 0.4:
        risk_level = 'Medium'
    elif class_probabilities.get('NED', 0) < 0.6:
        risk_level = 'Medium'

    # Debug logging
    print(f"🔍 Prediction for patient: Age={patient_data.get('age')}, Grade={grade}, Treatment={treatment}")
    print(f"   Result: {predicted_status} ({max(probabilities)*100:.1f}% confidence)")

    return {
        'predicted_status': predicted_status,
        'confidence': float(max(probabilities)) * 100,
        'probabilities': class_probabilities,
        'risk_level': risk_level
    }

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': metadata['model_type'],
        'accuracy': metadata['accuracy']
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict patient risk"""
    try:
        data = request.json
        
        # Extract patient data
        patient_data = {
            'age': data.get('age', 50),
            'sex': data.get('gender', 'Male'),  # Map 'gender' to 'sex'
            'grade': data.get('grade', 'Intermediate'),
            'tumor_size': data.get('tumor_size', 5),
            'depth': data.get('depth', 'Deep'),
            'site': data.get('tumor_site', 'Unknown'),
            'histological_type': data.get('histological_type', 'Unknown'),
            'mskcc_type': data.get('mskcc_type', 'Unknown'),
            'treatment': data.get('treatment', 'Surgery')
        }
        
        # Get prediction
        result = predict_patient_risk(patient_data)
        
        return jsonify({
            'success': True,
            'prediction': result
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/model-info', methods=['GET'])
def model_info():
    """Get model information"""
    return jsonify({
        'model_type': metadata['model_type'],
        'accuracy': metadata['accuracy'],
        'features': metadata['features'],
        'target_classes': metadata['target_classes'],
        'training_samples': metadata['training_samples'],
        'test_samples': metadata['test_samples'],
        'feature_importance': metadata['feature_importance']
    })

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🤖 ML PREDICTION API")
    print("="*60)
    print(f"📊 Model: {metadata['model_type']}")
    print(f"🎯 Accuracy: {metadata['accuracy']:.2%}")
    print(f"📍 Endpoints:")
    print(f"   POST /api/predict - Predict patient risk")
    print(f"   GET  /api/model-info - Get model information")
    print(f"   GET  /api/health - Health check")
    print("="*60)
    print("🚀 Starting server on http://localhost:5002")
    print("="*60)
    
    app.run(debug=True, host='0.0.0.0', port=5002)

