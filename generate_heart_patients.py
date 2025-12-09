#!/usr/bin/env python3
"""
Convert heart disease dataset to patient format for App.tsx
"""
import json
import random
from datasets import load_dataset
import pandas as pd
from datetime import datetime, timedelta

print("="*60)
print("🫀 CONVERTING HEART DISEASE DATASET TO PATIENT FORMAT")
print("="*60)

# Load dataset
print("\n📥 Loading heart disease dataset...")
ds = load_dataset("skrishna/heart_disease_uci")
data = ds['test']
df = pd.DataFrame(data)
print(f"✅ Loaded {len(df)} patients")

# Generate realistic names
first_names_male = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles",
                    "Christopher", "Daniel", "Matthew", "Anthony", "Donald", "Mark", "Paul", "Steven", "Andrew", "Kenneth",
                    "Joshua", "Kevin", "Brian", "George", "Edward", "Ronald", "Timothy", "Jason", "Jeffrey", "Ryan"]
first_names_female = ["Mary", "Patricia", "Jennifer", "Linda", "Barbara", "Elizabeth", "Susan", "Jessica", "Sarah", "Karen",
                      "Nancy", "Lisa", "Betty", "Margaret", "Sandra", "Ashley", "Dorothy", "Kimberly", "Emily", "Donna",
                      "Michelle", "Carol", "Amanda", "Melissa", "Deborah", "Stephanie", "Rebecca", "Laura", "Sharon", "Cynthia"]
last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
              "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
              "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
              "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
              "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"]

# Helper functions
def get_chest_pain_type(cp):
    """Convert chest pain code to description"""
    cp_map = {
        1.0: "Typical Angina",
        2.0: "Atypical Angina",
        3.0: "Non-Anginal Pain",
        4.0: "Asymptomatic"
    }
    return cp_map.get(cp, "Unknown")

def get_risk_category(target, age, chol, trestbps):
    """Determine risk category based on multiple factors"""
    if target == 1:
        # Has heart disease
        if age > 65 or chol > 280 or trestbps > 160:
            return "High Risk"
        else:
            return "Moderate Risk"
    else:
        # No heart disease
        if age > 60 and (chol > 240 or trestbps > 140):
            return "Moderate Risk"
        else:
            return "Low Risk"

def generate_vitals(row, num_readings=10):
    """Generate realistic vital sign history based on patient data"""
    vitals = []
    base_date = datetime.now() - timedelta(days=num_readings * 7)
    
    # Base values from patient data
    base_bp = row['trestbps']
    base_hr = row['thalach']
    base_chol = row['chol']
    
    # Generate trend based on disease status
    has_disease = row['target'] == 1
    
    for i in range(num_readings):
        date = base_date + timedelta(days=i * 7)
        
        # Add realistic variation
        if has_disease:
            # Patients with disease have more variable readings
            bp_variation = random.uniform(-15, 20)
            hr_variation = random.uniform(-10, 15)
            glucose_base = random.uniform(110, 160)
            spo2_base = random.uniform(94, 98)
        else:
            # Healthy patients have more stable readings
            bp_variation = random.uniform(-10, 10)
            hr_variation = random.uniform(-8, 8)
            glucose_base = random.uniform(80, 120)
            spo2_base = random.uniform(96, 100)
        
        vitals.append({
            "date": date.strftime("%Y-%m-%d"),
            "BP": max(90, min(200, base_bp + bp_variation)),
            "HR": max(60, min(180, base_hr + hr_variation)),
            "Glucose": glucose_base + random.uniform(-10, 10),
            "SpO2": spo2_base + random.uniform(-2, 2)
        })
    
    return vitals

# Convert patients
print("\n🔄 Converting patients to format...")
patients = []
used_names = set()

for idx, row in df.iterrows():
    # Generate unique name
    while True:
        if row['sex'] == 1.0:  # Male
            name = f"{random.choice(first_names_male)} {random.choice(last_names)}"
        else:  # Female
            name = f"{random.choice(first_names_female)} {random.choice(last_names)}"
        
        if name not in used_names:
            used_names.add(name)
            break
    
    # Convert data
    age = int(row['age'])
    gender = 'M' if row['sex'] == 1.0 else 'F'
    chest_pain = get_chest_pain_type(row['cp'])
    risk_category = get_risk_category(row['target'], age, row['chol'], row['trestbps'])
    
    # Create diagnosis object
    diagnosis = {
        "condition": "Heart Disease" if row['target'] == 1 else "No Heart Disease",
        "chest_pain_type": chest_pain,
        "resting_bp": int(row['trestbps']),
        "cholesterol": int(row['chol']),
        "fasting_blood_sugar": "High" if row['fbs'] == 1.0 else "Normal",
        "max_heart_rate": int(row['thalach']),
        "exercise_angina": "Yes" if row['exang'] == 1.0 else "No",
        "risk_category": risk_category,
        "target": int(row['target'])
    }

    # Create tags
    tags = ["Cardiology"]
    if row['target'] == 1:
        tags.append("Heart Disease")
    tags.append(risk_category)
    tags.append(chest_pain)

    # Generate last visit date (within last 3 months)
    days_ago = random.randint(1, 90)
    last_visit = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")

    # Create patient object
    patient = {
        "id": f"HD-{idx+1:03d}",
        "name": name,
        "age": age,
        "gender": gender,
        "tags": tags,
        "diagnosis": diagnosis,
        "vitals": generate_vitals(row),
        "lastVisit": last_visit
    }

    patients.append(patient)

print(f"✅ Converted {len(patients)} patients")

# Save to JSON file
print("\n💾 Saving to heart_disease_patients.json...")
with open('heart_disease_patients.json', 'w') as f:
    json.dump(patients, f, indent=2)

print(f"✅ Saved {len(patients)} patients to heart_disease_patients.json")

# Print statistics
print("\n📊 Dataset Statistics:")
print(f"   Total patients: {len(patients)}")
print(f"   With heart disease: {sum(1 for p in patients if p['diagnosis']['target'] == 1)}")
print(f"   Without heart disease: {sum(1 for p in patients if p['diagnosis']['target'] == 0)}")
print(f"   Male: {sum(1 for p in patients if p['gender'] == 'M')}")
print(f"   Female: {sum(1 for p in patients if p['gender'] == 'F')}")
print(f"   Age range: {min(p['age'] for p in patients)} - {max(p['age'] for p in patients)}")

# Print sample patients
print("\n📋 Sample patients:")
for i in range(3):
    p = patients[i]
    print(f"\n{i+1}. {p['name']} ({p['age']}{p['gender']})")
    print(f"   ID: {p['id']}")
    print(f"   Condition: {p['diagnosis']['condition']}")
    print(f"   Risk: {p['diagnosis']['risk_category']}")
    print(f"   Chest Pain: {p['diagnosis']['chest_pain_type']}")
    print(f"   BP: {p['diagnosis']['resting_bp']}, Cholesterol: {p['diagnosis']['cholesterol']}")

print("\n" + "="*60)
print("✅ CONVERSION COMPLETE!")
print("="*60)
print("\nNext steps:")
print("1. Update App.tsx with the new patient data")
print("2. Retrain ML model for heart disease prediction")
print("3. Update ML API to use new features")


