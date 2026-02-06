#!/usr/bin/env python3
"""
Flask API for heart disease prediction using trained ML models
Supports: Random Forest, Gradient Boosting, ANN, GA-optimized models, and Fuzzy Logic
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import json
import os

app = Flask(__name__)
CORS(app)

# Load models and scaler
print("📥 Loading heart disease ML models...")
model = joblib.load('heart_disease_model.pkl')
scaler = joblib.load('heart_disease_scaler.pkl')

# Load all available models
models = {'best': model}
model_files = {
    'random_forest': 'heart_disease_rf_model.pkl',
    'gradient_boosting': 'heart_disease_gb_model.pkl',
    'ann': 'heart_disease_ann_model.pkl',
    'rf_ga': 'heart_disease_rf_ga_model.pkl',
    'ann_ga': 'heart_disease_ann_ga_model.pkl'
}
for name, path in model_files.items():
    if os.path.exists(path):
        models[name] = joblib.load(path)
        print(f"   ✅ Loaded {name} model")

# Load metadata
with open('heart_disease_metadata.json', 'r') as f:
    metadata = json.load(f)

with open('heart_disease_features.json', 'r') as f:
    feature_names = json.load(f)

# Load GA feature selection results if available
ga_features = None
if os.path.exists('ga_selected_features.json'):
    with open('ga_selected_features.json', 'r') as f:
        ga_features = json.load(f)
    print(f"   ✅ Loaded GA feature selection ({len(ga_features['selected_features'])} features)")

# Load fuzzy config if available
fuzzy_config = None
if os.path.exists('fuzzy_config.json'):
    with open('fuzzy_config.json', 'r') as f:
        fuzzy_config = json.load(f)
    print(f"   ✅ Loaded Fuzzy Logic config ({fuzzy_config['num_rules']} rules)")

# Initialize fuzzy logic system
fuzzy_system = None
try:
    import skfuzzy as fuzz
    from skfuzzy import control as ctrl
    from fuzzy_risk_classifier import classify_risk_fuzzy, risk_ctrl
    fuzzy_system = True
    print("   ✅ Fuzzy Logic system initialized")
except ImportError:
    print("   ⚠️  Fuzzy Logic not available (install scikit-fuzzy)")

print(f"\n✅ Loaded {len(models)} models")

print("\n" + "="*60)
print("🫀 HEART DISEASE PREDICTION API (Enhanced)")
print("="*60)
print(f"📊 Best Model: {metadata['model_type']}")
print(f"🎯 Accuracy: {metadata['accuracy']:.2%}")
print(f"🧠 Available Models: {', '.join(models.keys())}")
print(f"🔮 Fuzzy Logic: {'✅ Active' if fuzzy_system else '❌ Not available'}")
print(f"🧬 GA Features: {'✅ Active' if ga_features else '❌ Not available'}")
print(f"📍 Endpoints:")
print(f"   POST /api/predict       - Predict with best model")
print(f"   POST /api/predict-all   - Predict with all models")
print(f"   POST /api/fuzzy-risk    - Fuzzy logic risk assessment")
print(f"   GET  /api/model-info    - Get model information")
print(f"   GET  /api/health        - Health check")
print("="*60)
print("🚀 Starting server on http://localhost:5002")
print("="*60)

def predict_heart_disease(patient_data):
    """Predict heart disease risk for a patient"""
    
    # Extract features in the correct order
    # Features: ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 
    #            'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
    
    features = []
    
    # Age
    features.append(patient_data.get('age', 50))
    
    # Sex (0=Female, 1=Male)
    sex = patient_data.get('sex', patient_data.get('gender', 'M'))
    if sex in ['M', 'Male', 1, 1.0]:
        features.append(1.0)
    else:
        features.append(0.0)
    
    # Chest pain type (1-4)
    cp = patient_data.get('cp', 4)
    features.append(float(cp))
    
    # Resting blood pressure
    features.append(patient_data.get('trestbps', patient_data.get('resting_bp', 130)))
    
    # Cholesterol
    features.append(patient_data.get('chol', patient_data.get('cholesterol', 240)))
    
    # Fasting blood sugar > 120 mg/dl (0 or 1)
    fbs = patient_data.get('fbs', 0)
    features.append(float(fbs))
    
    # Resting ECG results (0-2)
    restecg = patient_data.get('restecg', 0)
    features.append(float(restecg))
    
    # Maximum heart rate achieved
    features.append(patient_data.get('thalach', patient_data.get('max_heart_rate', 150)))
    
    # Exercise induced angina (0 or 1)
    exang = patient_data.get('exang', 0)
    if patient_data.get('exercise_angina') == 'Yes':
        exang = 1
    features.append(float(exang))
    
    # ST depression induced by exercise
    features.append(patient_data.get('oldpeak', 0))
    
    # Slope of peak exercise ST segment (1-3)
    features.append(patient_data.get('slope', 2))
    
    # Number of major vessels colored by fluoroscopy (0-3)
    ca = patient_data.get('ca', 0)
    if isinstance(ca, str):
        ca = float(ca) if ca != '' else 0
    features.append(float(ca))
    
    # Thalassemia (3=normal, 6=fixed defect, 7=reversible defect)
    thal = patient_data.get('thal', 3)
    if isinstance(thal, str):
        thal = float(thal) if thal != '' else 3
    features.append(float(thal))
    
    # Create feature array
    X = np.array([features])
    
    # Scale features
    X_scaled = scaler.transform(X)
    
    # Predict
    prediction = model.predict(X_scaled)[0]
    probabilities = model.predict_proba(X_scaled)[0]
    
    # Get probabilities
    no_disease_prob = float(probabilities[0])
    heart_disease_prob = float(probabilities[1])
    
    # Determine risk level
    if heart_disease_prob > 0.7:
        risk_level = 'High'
    elif heart_disease_prob > 0.4:
        risk_level = 'Moderate'
    else:
        risk_level = 'Low'
    
    # Predicted status
    predicted_status = 'Heart Disease' if prediction == 1 else 'No Disease'
    
    # Debug logging
    print(f"\n{'='*60}")
    print(f"🔍 NEW PREDICTION REQUEST")
    print(f"{'='*60}")
    print(f"📊 Patient Data:")
    print(f"   Age: {patient_data.get('age')}, Sex: {'Male' if sex == 1 else 'Female'}")
    print(f"   BP: {patient_data.get('trestbps', patient_data.get('resting_bp'))}, Cholesterol: {patient_data.get('chol')}")
    print(f"   Chest Pain Type: {patient_data.get('cp')}, Max Heart Rate: {patient_data.get('thalach')}")
    print(f"\n🤖 Model: {metadata['model_type']}")
    print(f"🎯 Accuracy: {metadata['accuracy']:.2%}")
    print(f"🌲 Estimators: 200 trees")
    print(f"\n📈 PREDICTION RESULT:")
    print(f"   Status: {predicted_status}")
    print(f"   Confidence: {max(probabilities)*100:.1f}%")
    print(f"   Risk Level: {risk_level}")
    print(f"   Probabilities:")
    print(f"      - No Disease: {no_disease_prob*100:.1f}%")
    print(f"      - Heart Disease: {heart_disease_prob*100:.1f}%")
    print(f"{'='*60}\n")
    
    return {
        'predicted_status': predicted_status,
        'confidence': float(max(probabilities)) * 100,
        'probabilities': {
            'No Disease': no_disease_prob,
            'Heart Disease': heart_disease_prob
        },
        'risk_level': risk_level,
        'prediction_value': int(prediction)
    }

@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict heart disease risk"""
    try:
        data = request.json

        # Get prediction
        result = predict_heart_disease(data)

        return jsonify({
            'success': True,
            'prediction': result,
            'model_info': {
                'model_type': metadata['model_type'],
                'accuracy': metadata['accuracy'],
                'training_samples': metadata['training_samples'],
                'test_samples': metadata['test_samples'],
                'n_estimators': 200,  # Random Forest parameter
                'total_features': len(metadata['features'])
            }
        })

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/predict-all', methods=['POST'])
def predict_all():
    """Predict heart disease risk using ALL available models"""
    try:
        data = request.json
        results = {}

        # Extract features
        features = _extract_features(data)
        X = np.array([features])
        X_scaled = scaler.transform(X)

        # Predict with each model
        for model_name, model_obj in models.items():
            try:
                if model_name in ('rf_ga', 'ann_ga') and ga_features:
                    # Use GA-selected features
                    X_ga = X_scaled[:, ga_features['selected_indices']]
                    pred = model_obj.predict(X_ga)[0]
                    proba = model_obj.predict_proba(X_ga)[0]
                else:
                    pred = model_obj.predict(X_scaled)[0]
                    proba = model_obj.predict_proba(X_scaled)[0]

                results[model_name] = {
                    'predicted_status': 'Heart Disease' if pred == 1 else 'No Disease',
                    'confidence': float(max(proba)) * 100,
                    'probabilities': {
                        'No Disease': float(proba[0]),
                        'Heart Disease': float(proba[1])
                    }
                }
            except Exception as e:
                results[model_name] = {'error': str(e)}

        # Add fuzzy logic result
        if fuzzy_system:
            try:
                fuzzy_result = classify_risk_fuzzy(data)
                results['fuzzy_logic'] = fuzzy_result
            except Exception as e:
                results['fuzzy_logic'] = {'error': str(e)}

        return jsonify({
            'success': True,
            'predictions': results,
            'models_used': list(results.keys())
        })

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/fuzzy-risk', methods=['POST'])
def fuzzy_risk():
    """Assess heart disease risk using Fuzzy Logic"""
    try:
        data = request.json

        if not fuzzy_system:
            return jsonify({
                'success': False,
                'error': 'Fuzzy Logic system not available. Install scikit-fuzzy.'
            }), 503

        result = classify_risk_fuzzy(data)

        return jsonify({
            'success': True,
            'fuzzy_assessment': result,
            'system_info': fuzzy_config
        })

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/model-info', methods=['GET'])
def model_info():
    """Get model information including all models"""
    info = {
        'success': True,
        'model': metadata,
        'available_models': list(models.keys()),
        'fuzzy_logic_available': fuzzy_system is not None,
        'ga_features_available': ga_features is not None
    }
    if ga_features:
        info['ga_selected_features'] = ga_features['selected_features']
    if fuzzy_config:
        info['fuzzy_config'] = fuzzy_config
    return jsonify(info)

@app.route('/api/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'models_loaded': list(models.keys()),
        'fuzzy_logic': fuzzy_system is not None,
        'ga_features': ga_features is not None
    })


def _extract_features(patient_data):
    """Extract feature vector from patient data dict"""
    features = []
    features.append(patient_data.get('age', 50))
    sex = patient_data.get('sex', patient_data.get('gender', 'M'))
    features.append(1.0 if sex in ['M', 'Male', 1, 1.0] else 0.0)
    features.append(float(patient_data.get('cp', 4)))
    features.append(patient_data.get('trestbps', patient_data.get('resting_bp', 130)))
    features.append(patient_data.get('chol', patient_data.get('cholesterol', 240)))
    features.append(float(patient_data.get('fbs', 0)))
    features.append(float(patient_data.get('restecg', 0)))
    features.append(patient_data.get('thalach', patient_data.get('max_heart_rate', 150)))
    exang = patient_data.get('exang', 0)
    if patient_data.get('exercise_angina') == 'Yes':
        exang = 1
    features.append(float(exang))
    features.append(patient_data.get('oldpeak', 0))
    features.append(patient_data.get('slope', 2))
    ca = patient_data.get('ca', 0)
    if isinstance(ca, str):
        ca = float(ca) if ca != '' else 0
    features.append(float(ca))
    thal = patient_data.get('thal', 3)
    if isinstance(thal, str):
        thal = float(thal) if thal != '' else 3
    features.append(float(thal))
    return features


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)


