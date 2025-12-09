#!/usr/bin/env python3
"""
Convert heart disease patients to App.tsx format
"""
import json

print("🔄 Converting heart disease patients to App.tsx...")

# Load patients
with open('heart_disease_patients.json', 'r') as f:
    patients = json.load(f)

# Read the original App.tsx to get the template structure
with open('src/App.tsx.bone_tumor_backup', 'r') as f:
    original_content = f.read()

# Find where MOCK_PATIENTS starts and ends
start_marker = "const MOCK_PATIENTS"
end_marker = "];"

# Find the start of MOCK_PATIENTS
start_idx = original_content.find(start_marker)
if start_idx == -1:
    print("❌ Could not find MOCK_PATIENTS in original file")
    exit(1)

# Find the end of MOCK_PATIENTS array (find the matching ];)
# We need to find the line that starts with ];
lines = original_content[start_idx:].split('\n')
end_line_idx = 0
for i, line in enumerate(lines):
    if line.strip().startswith('];'):
        end_line_idx = i
        break

# Get the content before and after MOCK_PATIENTS
before_patients = '\n'.join(original_content[:start_idx].split('\n'))
after_patients_start = start_idx + len('\n'.join(lines[:end_line_idx+1])) + 1
after_patients = original_content[after_patients_start:]

# Generate the new MOCK_PATIENTS array
patients_ts = "const MOCK_PATIENTS = [\n"
for patient in patients:
    patients_ts += "  " + json.dumps(patient, indent=2).replace('\n', '\n  ') + ",\n"
patients_ts += "];"

# Combine everything
new_content = before_patients + patients_ts + after_patients

# Now we need to update the diagnosis card section to show heart disease info
# Find and replace the diagnosis card rendering

# Update the diagnosis card to show heart disease information
diagnosis_card_old = '''<Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Diagnostic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {patient.diagnosis && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Disease:</span>
                          <span className="font-medium">{patient.diagnosis.disease}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Grade:</span>
                          <span className="font-medium">{patient.diagnosis.grade}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Histological Type:</span>
                          <span className="font-medium text-xs">{patient.diagnosis.histological_type}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">MSKCC Type:</span>
                          <span className="font-medium text-xs">{patient.diagnosis.mskcc_type}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tumor Site:</span>
                          <span className="font-medium text-xs">{patient.diagnosis.tumor_site}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Status:</span>
                          <span className={`font-medium ${
                            patient.diagnosis.status === 'NED' ? 'text-green-600' :
                            patient.diagnosis.status === 'AWD' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>{patient.diagnosis.status}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Treatment:</span>
                          <span className="font-medium text-xs">{patient.diagnosis.treatment}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>'''

diagnosis_card_new = '''<Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Diagnostic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {patient.diagnosis && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Condition:</span>
                          <span className={`font-medium ${
                            patient.diagnosis.condition === 'No Heart Disease' ? 'text-green-600' : 'text-red-600'
                          }`}>{patient.diagnosis.condition}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Risk Category:</span>
                          <span className={`font-medium ${
                            patient.diagnosis.risk_category === 'Low Risk' ? 'text-green-600' :
                            patient.diagnosis.risk_category === 'Moderate Risk' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>{patient.diagnosis.risk_category}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Chest Pain:</span>
                          <span className="font-medium text-xs">{patient.diagnosis.chest_pain_type}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Resting BP:</span>
                          <span className="font-medium">{patient.diagnosis.resting_bp} mmHg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Cholesterol:</span>
                          <span className="font-medium">{patient.diagnosis.cholesterol} mg/dl</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Max Heart Rate:</span>
                          <span className="font-medium">{patient.diagnosis.max_heart_rate} bpm</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Exercise Angina:</span>
                          <span className="font-medium">{patient.diagnosis.exercise_angina}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Fasting Blood Sugar:</span>
                          <span className="font-medium">{patient.diagnosis.fasting_blood_sugar}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>'''

# Replace the diagnosis card
if diagnosis_card_old in new_content:
    new_content = new_content.replace(diagnosis_card_old, diagnosis_card_new)
    print("✅ Updated diagnosis card")
else:
    print("⚠️ Could not find exact diagnosis card match - will need manual update")

# Write the new file
with open('src/App.tsx', 'w') as f:
    f.write(new_content)

print(f"✅ Created new App.tsx with {len(patients)} heart disease patients")
print(f"📄 Original backed up to src/App.tsx.bone_tumor_backup")

