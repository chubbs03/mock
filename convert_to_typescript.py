#!/usr/bin/env python3
"""
Convert all_patients_data.json to TypeScript format for App.tsx
"""
import json

# Load the patient data
with open('all_patients_data.json', 'r') as f:
    patients = json.load(f)

print(f"Converting {len(patients)} patients to TypeScript format...")
print("="*60)

# Create TypeScript code
ts_code = """// Patient data loaded from Hugging Face dataset: madushan99/patient-clinical-letters
// ALL 60 patients with complete diagnostic information and generated vital signs
const MOCK_PATIENTS = """

ts_code += json.dumps(patients, indent=2)

# Save to file
output_file = 'patients_typescript.txt'
with open(output_file, 'w') as f:
    f.write(ts_code)

print(f"✅ Converted {len(patients)} patients")
print(f"📁 Saved to: {output_file}")
print(f"📊 Total lines: {len(ts_code.splitlines())}")
print("\n" + "="*60)
print("INSTRUCTIONS:")
print("="*60)
print("1. Open src/App.tsx")
print("2. Find the MOCK_PATIENTS constant (around line 22)")
print("3. Replace it with the content from patients_typescript.txt")
print("4. Save the file")
print("5. The app will now show all 60 patients!")
print("="*60)

# Print summary statistics
print("\n📊 PATIENT STATISTICS:")
print("="*60)

# Count by status
status_counts = {}
for p in patients:
    status = p['diagnosis']['status']
    status_counts[status] = status_counts.get(status, 0) + 1

print(f"Total Patients: {len(patients)}")
print(f"\nBy Status:")
for status, count in sorted(status_counts.items()):
    emoji = "✅" if status == 'NED' else "⚠️" if status == 'D' else "ℹ️"
    status_name = {
        'NED': 'No Evidence of Disease',
        'D': 'Deceased',
        'AWD': 'Alive with Disease'
    }.get(status, status)
    print(f"  {emoji} {status_name}: {count} patients")

# Count by grade
grade_counts = {}
for p in patients:
    grade = p['diagnosis']['grade']
    grade_counts[grade] = grade_counts.get(grade, 0) + 1

print(f"\nBy Tumor Grade:")
for grade, count in sorted(grade_counts.items()):
    print(f"  • {grade}: {count} patients")

# Age statistics
ages = [p['age'] for p in patients]
print(f"\nAge Range:")
print(f"  • Youngest: {min(ages)} years")
print(f"  • Oldest: {max(ages)} years")
print(f"  • Average: {sum(ages)/len(ages):.1f} years")

# Gender distribution
gender_counts = {'M': 0, 'F': 0}
for p in patients:
    gender_counts[p['gender']] += 1

print(f"\nGender Distribution:")
print(f"  • Male: {gender_counts['M']} patients ({gender_counts['M']/len(patients)*100:.1f}%)")
print(f"  • Female: {gender_counts['F']} patients ({gender_counts['F']/len(patients)*100:.1f}%)")

print("\n" + "="*60)
print("✨ Ready to integrate into App.tsx!")
print("="*60)

