#!/usr/bin/env python3
"""
Fix App.tsx by properly replacing the MOCK_PATIENTS array with heart disease data
"""

import json
import re

# Read the heart disease patients
with open('heart_disease_patients.json', 'r') as f:
    patients = json.load(f)

# Read the current App.tsx
with open('src/App.tsx', 'r') as f:
    content = f.read()

# Find the start of MOCK_PATIENTS
mock_patients_start = content.find('const MOCK_PATIENTS = [')
if mock_patients_start == -1:
    print("ERROR: Could not find 'const MOCK_PATIENTS = ['")
    exit(1)

# Find the end of MOCK_PATIENTS (look for the closing ] followed by const riskColor)
# We need to find the LAST occurrence of "] const riskColor" pattern
pattern = r'\]\s*const riskColor = \(level: string\) => \(\{'
matches = list(re.finditer(pattern, content))

if not matches:
    print("ERROR: Could not find end of MOCK_PATIENTS array")
    exit(1)

# Use the LAST match (the correct one)
last_match = matches[-1]
mock_patients_end = last_match.start() + 1  # Include the closing ]

print(f"Found MOCK_PATIENTS from position {mock_patients_start} to {mock_patients_end}")
print(f"Length of old MOCK_PATIENTS section: {mock_patients_end - mock_patients_start} characters")

# Extract the parts
before_patients = content[:mock_patients_start]
after_patients = content[mock_patients_end:]

# Create the new MOCK_PATIENTS array
patients_json = json.dumps(patients, indent=2)
new_mock_patients = f"const MOCK_PATIENTS = {patients_json}"

# Combine everything
new_content = before_patients + new_mock_patients + after_patients

# Write the fixed file
with open('src/App.tsx', 'w') as f:
    f.write(new_content)

print(f"✅ Successfully fixed App.tsx!")
print(f"   - Replaced MOCK_PATIENTS with {len(patients)} heart disease patients")
print(f"   - New file size: {len(new_content)} characters")

