#!/usr/bin/env python3
"""
Generate patient data from the Hugging Face dataset with realistic vital signs
"""
from datasets import load_dataset
import json
import re
import random

def parse_patient_info(conversation_text):
    """Extract patient info from the conversation text"""
    match = re.search(r'Name: (.+?)\nAge: (\d+)\nSex: (Male|Female)\nDisease: (.+?) Diagnosis:', conversation_text)
    if match:
        return {
            'name': match.group(1).strip(),
            'age': int(match.group(2)),
            'gender': 'M' if match.group(3) == 'Male' else 'F',
            'disease': match.group(4).strip()
        }
    return None

def generate_vitals(age, gender, disease, days=5):
    """Generate realistic vital signs based on patient characteristics"""
    vitals = []
    day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    # Base values influenced by age and disease
    base_sys = 120 + (age - 50) * 0.5 + random.randint(-5, 5)
    base_dia = 75 + (age - 50) * 0.3 + random.randint(-3, 3)
    base_hr = 72 + random.randint(-8, 8)
    base_glu = 5.5 + random.uniform(-0.3, 0.3)
    base_spo2 = 97 + random.randint(-2, 2)
    
    # Disease-specific adjustments
    if 'tumor' in disease.lower() or 'cancer' in disease.lower():
        base_sys += random.randint(5, 15)
        base_dia += random.randint(3, 10)
        base_hr += random.randint(5, 10)
        base_spo2 -= random.randint(1, 3)
    
    # Generate trending vitals
    for i in range(days):
        # Add slight trend over time
        trend = i * 0.5
        
        vitals.append({
            't': day_names[i % 7],
            'sys': int(base_sys + trend + random.randint(-3, 3)),
            'dia': int(base_dia + trend * 0.6 + random.randint(-2, 2)),
            'hr': int(base_hr + random.randint(-5, 5)),
            'glu': round(base_glu + trend * 0.1 + random.uniform(-0.2, 0.2), 1),
            'spo2': int(max(85, min(100, base_spo2 + random.randint(-1, 1))))
        })
    
    return vitals

def extract_conditions(disease):
    """Extract medical condition tags from disease description"""
    tags = []
    disease_lower = disease.lower()
    
    if 'tumor' in disease_lower or 'cancer' in disease_lower or 'sarcoma' in disease_lower:
        tags.append('Oncology')
    if 'bone' in disease_lower:
        tags.append('Bone tumor')
    
    return tags if tags else ['General']

print("Loading dataset...")
ds = load_dataset("madushan99/patient-clinical-letters")
data = ds['train']

print(f"Processing {len(data)} patient records...")

patients = []
for i in range(min(7, len(data))):  # Get 7 patients
    conversation = data[i]['conversations']
    human_msg = conversation[0]['value']
    
    patient_info = parse_patient_info(human_msg)
    if patient_info:
        vitals = generate_vitals(
            patient_info['age'],
            patient_info['gender'],
            patient_info['disease']
        )
        
        patient = {
            'id': f"P-{str(i+1).zfill(3)}",
            'name': patient_info['name'],
            'age': patient_info['age'],
            'gender': patient_info['gender'],
            'tags': extract_conditions(patient_info['disease']),
            'vitals': vitals,
            'lastVisit': '2025-11-0' + str((i % 9) + 1)
        }
        patients.append(patient)
        print(f"✓ Processed: {patient['name']} ({patient['age']}{patient['gender']}) - {', '.join(patient['tags'])}")

print(f"\n✅ Generated {len(patients)} patients with vital signs")

# Save to JSON file
output_file = 'patient_data.json'
with open(output_file, 'w') as f:
    json.dump(patients, f, indent=2)

print(f"\n📁 Saved to: {output_file}")

# Also print TypeScript format for easy copy-paste
print("\n" + "="*60)
print("TypeScript format for App.tsx:")
print("="*60)
print("\nconst MOCK_PATIENTS = " + json.dumps(patients, indent=2))

