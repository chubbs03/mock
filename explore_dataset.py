#!/usr/bin/env python3
"""
Explore the patient clinical letters dataset to understand its structure
"""
from datasets import load_dataset
import json

print("Loading dataset...")
ds = load_dataset("madushan99/patient-clinical-letters")

print("\n=== Dataset Structure ===")
print(f"Dataset: {ds}")
print(f"\nSplits: {list(ds.keys())}")

# Get the first split (usually 'train')
split_name = list(ds.keys())[0]
data = ds[split_name]

print(f"\n=== {split_name.upper()} Split ===")
print(f"Number of examples: {len(data)}")
print(f"\nColumn names: {data.column_names}")

print("\n=== First 5 Examples ===")
for i in range(min(5, len(data))):
    print(f"\n--- Example {i+1} ---")
    example = data[i]
    for key, value in example.items():
        if isinstance(value, str) and len(value) > 200:
            print(f"{key}: {value[:200]}...")
        else:
            print(f"{key}: {value}")

print("\n=== Sample Data for Integration ===")
# Extract useful information from first 10 examples
samples = []
for i in range(min(10, len(data))):
    example = data[i]
    samples.append({
        'index': i,
        'keys': list(example.keys()),
        'preview': {k: str(v)[:100] for k, v in example.items()}
    })

print(json.dumps(samples, indent=2))

