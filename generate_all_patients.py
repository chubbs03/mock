#!/usr/bin/env python3
"""
Generate ALL patient data from the Hugging Face dataset with complete information
"""
from datasets import load_dataset
import json
import re
import random

def parse_patient_info(conversation_text):
    """Extract comprehensive patient info from the conversation text"""
    # Extract basic info
    name_match = re.search(r'Name: (.+?)\n', conversation_text)
    age_match = re.search(r'Age: (\d+)\n', conversation_text)
    sex_match = re.search(r'Sex: (Male|Female)\n', conversation_text)
    disease_match = re.search(r'Disease: (.+?) Diagnosis:', conversation_text)
    
    # Extract diagnosis details
    grade_match = re.search(r'grade=(\w+)', conversation_text)
    histological_match = re.search(r'histological type=(.+?),', conversation_text)
    mskcc_match = re.search(r'MSKCC type=(.+?),', conversation_text)
    site_match = re.search(r'site of primary STS=(.+?),', conversation_text)
    status_match = re.search(r'status=(\w+)', conversation_text)
    treatment_match = re.search(r'Treatment: (.+?)\n', conversation_text)
    
    if name_match and age_match and sex_match:
        return {
            'name': name_match.group(1).strip(),
            'age': int(age_match.group(1)),
            'gender': 'M' if sex_match.group(1) == 'Male' else 'F',
            'disease': disease_match.group(1).strip() if disease_match else 'Unknown',
            'grade': grade_match.group(1) if grade_match else 'Unknown',
            'histological_type': histological_match.group(1).strip() if histological_match else 'Unknown',
            'mskcc_type': mskcc_match.group(1).strip() if mskcc_match else 'Unknown',
            'tumor_site': site_match.group(1).strip() if site_match else 'Unknown',
            'status': status_match.group(1) if status_match else 'Unknown',
            'treatment': treatment_match.group(1).strip() if treatment_match else 'Unknown'
        }
    return None

def generate_vitals(age, gender, disease, grade, status, days=5):
    """Generate realistic vital signs based on comprehensive patient characteristics"""
    vitals = []
    day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    # Base values influenced by age
    base_sys = 110 + (age - 40) * 0.6 + random.randint(-5, 5)
    base_dia = 70 + (age - 40) * 0.4 + random.randint(-3, 3)
    base_hr = 70 + random.randint(-8, 8)
    base_glu = 5.2 + random.uniform(-0.3, 0.5)
    base_spo2 = 97 + random.randint(-2, 2)
    
    # Disease-specific adjustments
    if 'tumor' in disease.lower() or 'cancer' in disease.lower():
        base_sys += random.randint(8, 18)
        base_dia += random.randint(5, 12)
        base_hr += random.randint(8, 15)
        base_spo2 -= random.randint(2, 4)
    
    # Grade-specific adjustments (High grade = worse vitals)
    if grade.lower() == 'high':
        base_sys += random.randint(10, 20)
        base_dia += random.randint(5, 10)
        base_hr += random.randint(10, 15)
        base_spo2 -= random.randint(3, 5)
        base_glu += random.uniform(0.5, 1.5)
    elif grade.lower() == 'intermediate':
        base_sys += random.randint(5, 10)
        base_dia += random.randint(3, 6)
        base_hr += random.randint(5, 10)
        base_spo2 -= random.randint(1, 3)
        base_glu += random.uniform(0.2, 0.8)
    
    # Status-specific adjustments
    if status == 'D':  # Deceased - show declining trend
        trend_multiplier = 1.5
    elif status == 'NED':  # No Evidence of Disease - stable/improving
        trend_multiplier = 0.3
    else:
        trend_multiplier = 0.8
    
    # Generate trending vitals
    for i in range(days):
        # Add trend over time
        trend = i * trend_multiplier
        
        vitals.append({
            't': day_names[i % 7],
            'sys': int(max(90, min(200, base_sys + trend + random.randint(-3, 3)))),
            'dia': int(max(60, min(120, base_dia + trend * 0.6 + random.randint(-2, 2)))),
            'hr': int(max(50, min(140, base_hr + trend * 0.5 + random.randint(-5, 5)))),
            'glu': round(max(3.5, min(15.0, base_glu + trend * 0.15 + random.uniform(-0.2, 0.2))), 1),
            'spo2': int(max(80, min(100, base_spo2 - trend * 0.3 + random.randint(-1, 1))))
        })
    
    return vitals

def extract_tags(patient_info):
    """Extract comprehensive medical condition tags"""
    tags = []
    
    # Add disease category
    if patient_info['disease']:
        tags.append(patient_info['disease'])
    
    # Add tumor grade
    if patient_info['grade'] != 'Unknown':
        tags.append(f"{patient_info['grade']}-grade")
    
    # Add histological type (shortened)
    if patient_info['histological_type'] != 'Unknown':
        hist_type = patient_info['histological_type']
        if 'leiomyosarcoma' in hist_type.lower():
            tags.append('Leiomyosarcoma')
        elif 'synovial' in hist_type.lower():
            tags.append('Synovial sarcoma')
        else:
            tags.append(hist_type[:20])  # Truncate long names
    
    # Add status
    if patient_info['status'] == 'NED':
        tags.append('NED')
    elif patient_info['status'] == 'D':
        tags.append('Deceased')
    
    return tags if tags else ['General']

print("Loading complete dataset from Hugging Face...")
ds = load_dataset("madushan99/patient-clinical-letters")
data = ds['train']

print(f"Processing ALL {len(data)} patient records...")
print("="*60)

patients = []
for i in range(len(data)):  # Process ALL patients
    conversation = data[i]['conversations']
    human_msg = conversation[0]['value']
    
    patient_info = parse_patient_info(human_msg)
    if patient_info:
        vitals = generate_vitals(
            patient_info['age'],
            patient_info['gender'],
            patient_info['disease'],
            patient_info['grade'],
            patient_info['status']
        )
        
        patient = {
            'id': f"P-{str(i+1).zfill(3)}",
            'name': patient_info['name'],
            'age': patient_info['age'],
            'gender': patient_info['gender'],
            'tags': extract_tags(patient_info),
            'diagnosis': {
                'disease': patient_info['disease'],
                'grade': patient_info['grade'],
                'histological_type': patient_info['histological_type'],
                'mskcc_type': patient_info['mskcc_type'],
                'tumor_site': patient_info['tumor_site'],
                'status': patient_info['status'],
                'treatment': patient_info['treatment']
            },
            'vitals': vitals,
            'lastVisit': f"2025-{11 if i < 30 else 12}-{str((i % 28) + 1).zfill(2)}"
        }
        patients.append(patient)
        
        status_emoji = "✅" if patient_info['status'] == 'NED' else "⚠️" if patient_info['status'] == 'D' else "ℹ️"
        print(f"{status_emoji} P-{str(i+1).zfill(3)}: {patient['name']} ({patient['age']}{patient['gender']}) - {patient_info['grade']} grade, {patient_info['status']}")

print("\n" + "="*60)
print(f"✅ Generated {len(patients)} patients with complete information")

# Save to JSON file
output_file = 'all_patients_data.json'
with open(output_file, 'w') as f:
    json.dump(patients, f, indent=2)

print(f"📁 Saved to: {output_file}")
print(f"📊 File size: {len(json.dumps(patients)) / 1024:.1f} KB")

