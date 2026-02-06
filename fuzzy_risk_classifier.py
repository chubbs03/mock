#!/usr/bin/env python3
"""
Fuzzy Logic Risk Classification for Heart Disease Prediction
Uses scikit-fuzzy for intelligent risk assessment based on clinical parameters
"""
import json
import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

print("="*60)
print("🔮 FUZZY LOGIC RISK CLASSIFICATION SYSTEM")
print("="*60)

# ============================================================
# Define Fuzzy Variables (Antecedents & Consequent)
# ============================================================
print("\n📐 Defining fuzzy variables and membership functions...")

# --- Input Variables (Antecedents) ---

# Age (29-77 range from UCI dataset)
age = ctrl.Antecedent(np.arange(20, 90, 1), 'age')
age['young'] = fuzz.trimf(age.universe, [20, 20, 40])
age['middle'] = fuzz.trimf(age.universe, [35, 50, 65])
age['old'] = fuzz.trimf(age.universe, [55, 89, 89])

# Resting Blood Pressure (94-200 mmHg)
blood_pressure = ctrl.Antecedent(np.arange(80, 220, 1), 'blood_pressure')
blood_pressure['low'] = fuzz.trimf(blood_pressure.universe, [80, 80, 120])
blood_pressure['normal'] = fuzz.trimf(blood_pressure.universe, [110, 130, 150])
blood_pressure['high'] = fuzz.trimf(blood_pressure.universe, [140, 170, 200])
blood_pressure['very_high'] = fuzz.trimf(blood_pressure.universe, [180, 219, 219])

# Cholesterol (126-564 mg/dl)
cholesterol = ctrl.Antecedent(np.arange(100, 600, 1), 'cholesterol')
cholesterol['low'] = fuzz.trimf(cholesterol.universe, [100, 100, 200])
cholesterol['normal'] = fuzz.trimf(cholesterol.universe, [180, 220, 260])
cholesterol['high'] = fuzz.trimf(cholesterol.universe, [240, 300, 360])
cholesterol['very_high'] = fuzz.trimf(cholesterol.universe, [340, 599, 599])

# Maximum Heart Rate (71-202 bpm)
max_heart_rate = ctrl.Antecedent(np.arange(60, 220, 1), 'max_heart_rate')
max_heart_rate['low'] = fuzz.trimf(max_heart_rate.universe, [60, 60, 120])
max_heart_rate['medium'] = fuzz.trimf(max_heart_rate.universe, [100, 140, 170])
max_heart_rate['high'] = fuzz.trimf(max_heart_rate.universe, [150, 219, 219])

# ST Depression (oldpeak: 0-6.2)
st_depression = ctrl.Antecedent(np.arange(0, 7, 0.1), 'st_depression')
st_depression['low'] = fuzz.trimf(st_depression.universe, [0, 0, 1.5])
st_depression['medium'] = fuzz.trimf(st_depression.universe, [1, 2.5, 4])
st_depression['high'] = fuzz.trimf(st_depression.universe, [3, 6.9, 6.9])

# Chest Pain Type (1-4: typical angina, atypical, non-anginal, asymptomatic)
chest_pain = ctrl.Antecedent(np.arange(0, 5, 1), 'chest_pain')
chest_pain['typical_angina'] = fuzz.trimf(chest_pain.universe, [0, 1, 2])
chest_pain['atypical'] = fuzz.trimf(chest_pain.universe, [1, 2, 3])
chest_pain['non_anginal'] = fuzz.trimf(chest_pain.universe, [2, 3, 4])
chest_pain['asymptomatic'] = fuzz.trimf(chest_pain.universe, [3, 4, 4])

# --- Output Variable (Consequent) ---

# Heart Disease Risk (0-100%)
risk = ctrl.Consequent(np.arange(0, 101, 1), 'risk')
risk['very_low'] = fuzz.trimf(risk.universe, [0, 0, 20])
risk['low'] = fuzz.trimf(risk.universe, [10, 25, 40])
risk['moderate'] = fuzz.trimf(risk.universe, [30, 50, 70])
risk['high'] = fuzz.trimf(risk.universe, [60, 75, 90])
risk['very_high'] = fuzz.trimf(risk.universe, [80, 100, 100])

print("✅ Fuzzy variables defined")

# ============================================================
# Define Fuzzy Rules
# ============================================================
print("📏 Defining fuzzy rules...")

rules = []

# High risk rules
rules.append(ctrl.Rule(age['old'] & blood_pressure['very_high'] & cholesterol['very_high'], risk['very_high']))
rules.append(ctrl.Rule(age['old'] & blood_pressure['high'] & cholesterol['high'], risk['high']))
rules.append(ctrl.Rule(age['old'] & st_depression['high'], risk['very_high']))
rules.append(ctrl.Rule(age['old'] & max_heart_rate['low'] & st_depression['medium'], risk['high']))
rules.append(ctrl.Rule(chest_pain['typical_angina'] & st_depression['high'], risk['very_high']))
rules.append(ctrl.Rule(chest_pain['typical_angina'] & blood_pressure['very_high'], risk['high']))
rules.append(ctrl.Rule(blood_pressure['very_high'] & cholesterol['very_high'] & max_heart_rate['low'], risk['very_high']))
rules.append(ctrl.Rule(cholesterol['very_high'] & st_depression['high'], risk['very_high']))

# Moderate risk rules
rules.append(ctrl.Rule(age['middle'] & blood_pressure['high'] & cholesterol['high'], risk['moderate']))
rules.append(ctrl.Rule(age['middle'] & st_depression['medium'], risk['moderate']))
rules.append(ctrl.Rule(age['old'] & blood_pressure['normal'] & cholesterol['normal'], risk['moderate']))
rules.append(ctrl.Rule(chest_pain['atypical'] & blood_pressure['high'], risk['moderate']))
rules.append(ctrl.Rule(max_heart_rate['low'] & cholesterol['high'], risk['moderate']))
rules.append(ctrl.Rule(blood_pressure['high'] & st_depression['medium'], risk['moderate']))

# Low risk rules
rules.append(ctrl.Rule(age['young'] & blood_pressure['normal'] & cholesterol['normal'], risk['very_low']))
rules.append(ctrl.Rule(age['young'] & blood_pressure['low'] & cholesterol['low'], risk['very_low']))
rules.append(ctrl.Rule(age['young'] & max_heart_rate['high'] & st_depression['low'], risk['very_low']))
rules.append(ctrl.Rule(chest_pain['asymptomatic'] & blood_pressure['normal'] & cholesterol['normal'], risk['low']))
rules.append(ctrl.Rule(age['middle'] & blood_pressure['normal'] & cholesterol['normal'] & st_depression['low'], risk['low']))
rules.append(ctrl.Rule(max_heart_rate['high'] & st_depression['low'] & blood_pressure['normal'], risk['low']))

# Additional nuanced rules
rules.append(ctrl.Rule(age['middle'] & blood_pressure['normal'] & cholesterol['high'], risk['moderate']))
rules.append(ctrl.Rule(age['young'] & cholesterol['high'] & st_depression['medium'], risk['moderate']))
rules.append(ctrl.Rule(age['old'] & blood_pressure['normal'] & max_heart_rate['high'], risk['low']))
rules.append(ctrl.Rule(chest_pain['non_anginal'] & blood_pressure['normal'], risk['low']))

print(f"✅ {len(rules)} fuzzy rules defined")

# ============================================================
# Create Fuzzy Control System
# ============================================================
print("\n⚙️ Building fuzzy control system...")
risk_ctrl = ctrl.ControlSystem(rules)
risk_simulator = ctrl.ControlSystemSimulation(risk_ctrl)
print("✅ Fuzzy control system ready")

# ============================================================
# Fuzzy Risk Classification Function
# ============================================================

def classify_risk_fuzzy(patient_data):
    """
    Classify heart disease risk using fuzzy logic

    Parameters:
        patient_data: dict with keys: age, trestbps, chol, thalach, oldpeak, cp

    Returns:
        dict with risk_score, risk_level, and risk_category
    """
    sim = ctrl.ControlSystemSimulation(risk_ctrl)

    # Set input values (clamp to valid ranges)
    sim.input['age'] = np.clip(patient_data.get('age', 50), 20, 89)
    sim.input['blood_pressure'] = np.clip(patient_data.get('trestbps', 130), 80, 219)
    sim.input['cholesterol'] = np.clip(patient_data.get('chol', 240), 100, 599)
    sim.input['max_heart_rate'] = np.clip(patient_data.get('thalach', 150), 60, 219)
    sim.input['st_depression'] = np.clip(patient_data.get('oldpeak', 0), 0, 6.9)
    sim.input['chest_pain'] = np.clip(patient_data.get('cp', 4), 0, 4)

    try:
        sim.compute()
        risk_score = float(sim.output['risk'])
    except Exception as e:
        # Fallback: use a simple weighted calculation if fuzzy rules don't fire
        age_risk = (patient_data.get('age', 50) - 20) / 70 * 30
        bp_risk = max(0, (patient_data.get('trestbps', 130) - 120) / 100) * 25
        chol_risk = max(0, (patient_data.get('chol', 240) - 200) / 400) * 25
        st_risk = patient_data.get('oldpeak', 0) / 6.2 * 20
        risk_score = min(100, age_risk + bp_risk + chol_risk + st_risk)

    # Determine risk level
    if risk_score >= 75:
        risk_level = 'Very High'
        risk_category = 'CRITICAL'
    elif risk_score >= 55:
        risk_level = 'High'
        risk_category = 'WARNING'
    elif risk_score >= 35:
        risk_level = 'Moderate'
        risk_category = 'CAUTION'
    elif risk_score >= 20:
        risk_level = 'Low'
        risk_category = 'NORMAL'
    else:
        risk_level = 'Very Low'
        risk_category = 'HEALTHY'

    return {
        'risk_score': round(risk_score, 2),
        'risk_level': risk_level,
        'risk_category': risk_category
    }


# ============================================================
# Test with Sample Patients
# ============================================================
print("\n" + "="*60)
print("🧪 TESTING FUZZY RISK CLASSIFICATION")
print("="*60)

test_patients = [
    {
        'name': 'Young Healthy Patient',
        'age': 35, 'sex': 0, 'cp': 4, 'trestbps': 120, 'chol': 180,
        'fbs': 0, 'restecg': 0, 'thalach': 170, 'exang': 0,
        'oldpeak': 0, 'slope': 1, 'ca': 0, 'thal': 3
    },
    {
        'name': 'High-Risk Elderly Patient',
        'age': 65, 'sex': 1, 'cp': 1, 'trestbps': 160, 'chol': 300,
        'fbs': 1, 'restecg': 2, 'thalach': 110, 'exang': 1,
        'oldpeak': 3.5, 'slope': 3, 'ca': 3, 'thal': 7
    },
    {
        'name': 'Moderate-Risk Patient',
        'age': 50, 'sex': 0, 'cp': 2, 'trestbps': 140, 'chol': 240,
        'fbs': 0, 'restecg': 1, 'thalach': 140, 'exang': 0,
        'oldpeak': 1.5, 'slope': 2, 'ca': 1, 'thal': 3
    },
    {
        'name': 'Very High-Risk Patient',
        'age': 70, 'sex': 1, 'cp': 1, 'trestbps': 190, 'chol': 400,
        'fbs': 1, 'restecg': 2, 'thalach': 90, 'exang': 1,
        'oldpeak': 5.0, 'slope': 3, 'ca': 3, 'thal': 7
    },
    {
        'name': 'Borderline Patient',
        'age': 55, 'sex': 1, 'cp': 3, 'trestbps': 135, 'chol': 250,
        'fbs': 0, 'restecg': 0, 'thalach': 145, 'exang': 0,
        'oldpeak': 1.0, 'slope': 2, 'ca': 0, 'thal': 3
    }
]

print(f"\n{'Patient':<30} {'Risk Score':>12} {'Level':>12} {'Category':>12}")
print("-" * 70)

for patient in test_patients:
    result = classify_risk_fuzzy(patient)
    print(f"{patient['name']:<30} {result['risk_score']:>10.1f}% {result['risk_level']:>12} {result['risk_category']:>12}")

# Save fuzzy system configuration
fuzzy_config = {
    'system': 'Fuzzy Logic Risk Classifier',
    'input_variables': {
        'age': {'range': [20, 89], 'sets': ['young', 'middle', 'old']},
        'blood_pressure': {'range': [80, 219], 'sets': ['low', 'normal', 'high', 'very_high']},
        'cholesterol': {'range': [100, 599], 'sets': ['low', 'normal', 'high', 'very_high']},
        'max_heart_rate': {'range': [60, 219], 'sets': ['low', 'medium', 'high']},
        'st_depression': {'range': [0, 6.9], 'sets': ['low', 'medium', 'high']},
        'chest_pain': {'range': [0, 4], 'sets': ['typical_angina', 'atypical', 'non_anginal', 'asymptomatic']}
    },
    'output_variable': {
        'risk': {'range': [0, 100], 'sets': ['very_low', 'low', 'moderate', 'high', 'very_high']}
    },
    'num_rules': len(rules),
    'risk_thresholds': {
        'very_low': [0, 20],
        'low': [20, 35],
        'moderate': [35, 55],
        'high': [55, 75],
        'very_high': [75, 100]
    }
}

with open('fuzzy_config.json', 'w') as f:
    json.dump(fuzzy_config, f, indent=2)

print(f"\n✅ Saved: fuzzy_config.json")

print("\n" + "="*60)
print("✨ Fuzzy Logic risk classification system ready!")
print("="*60)

