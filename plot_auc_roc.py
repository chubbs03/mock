#!/usr/bin/env python3
"""
Generate AUC-ROC curves comparing all models:
Random Forest, Gradient Boosting, ANN, and GA-optimized variants
"""
import json
import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from datasets import load_dataset
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_curve, auc, accuracy_score
import joblib

print("="*60)
print("📊 GENERATING MULTI-MODEL AUC-ROC COMPARISON")
print("="*60)

# Load scaler and metadata
scaler = joblib.load('heart_disease_scaler.pkl')

with open('heart_disease_metadata.json', 'r') as f:
    metadata = json.load(f)

with open('heart_disease_features.json', 'r') as f:
    feature_names = json.load(f)

# Load all available models
all_models = {}
model_files = {
    'Random Forest': 'heart_disease_rf_model.pkl',
    'Gradient Boosting': 'heart_disease_gb_model.pkl',
    'ANN (Neural Network)': 'heart_disease_ann_model.pkl',
    'RF + GA Features': 'heart_disease_rf_ga_model.pkl',
    'ANN + GA Features': 'heart_disease_ann_ga_model.pkl'
}

for name, path in model_files.items():
    if os.path.exists(path):
        all_models[name] = joblib.load(path)
        print(f"   ✅ Loaded {name}")

# Fallback: load best model if no individual models found
if not all_models:
    all_models['Best Model'] = joblib.load('heart_disease_model.pkl')
    print(f"   ✅ Loaded Best Model ({metadata['model_type']})")

# Load GA feature info
ga_features = None
if os.path.exists('ga_selected_features.json'):
    with open('ga_selected_features.json', 'r') as f:
        ga_features = json.load(f)

# Load dataset
print("\n📥 Loading heart disease dataset...")
ds = load_dataset("skrishna/heart_disease_uci")
data = ds['test']
df = pd.DataFrame(data)
df['ca'] = pd.to_numeric(df['ca'], errors='coerce').fillna(0)
df['thal'] = pd.to_numeric(df['thal'], errors='coerce').fillna(0)

feature_columns = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg',
                   'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']

X = df[feature_columns].values
y = df['target'].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

X_test_scaled = scaler.transform(X_test)
print(f"✅ Test set: {X_test.shape[0]} samples")

# ============================================================
# Calculate ROC curves for all models
# ============================================================
print("\n📈 Calculating ROC curves for all models...")

colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c']
results = {}

fig, ax = plt.subplots(1, 1, figsize=(12, 9))

for i, (name, model_obj) in enumerate(all_models.items()):
    try:
        # Use GA features for GA models
        if 'GA' in name and ga_features:
            X_eval = X_test_scaled[:, ga_features['selected_indices']]
        else:
            X_eval = X_test_scaled

        y_proba = model_obj.predict_proba(X_eval)[:, 1]
        y_pred = model_obj.predict(X_eval)
        acc = accuracy_score(y_test, y_pred)

        fpr, tpr, _ = roc_curve(y_test, y_proba)
        roc_auc = auc(fpr, tpr)

        results[name] = {'auc': roc_auc, 'accuracy': acc, 'fpr': fpr, 'tpr': tpr}

        ax.plot(fpr, tpr, color=colors[i % len(colors)], lw=2.5,
                label=f'{name} (AUC = {roc_auc:.4f}, Acc = {acc:.2%})')

        print(f"   {name}: AUC = {roc_auc:.4f}, Accuracy = {acc:.2%}")
    except Exception as e:
        print(f"   ⚠️  {name}: Error - {e}")

# Plot diagonal
ax.plot([0, 1], [0, 1], color='gray', lw=2, linestyle='--',
        label='Random Classifier (AUC = 0.5000)', alpha=0.7)

ax.set_xlim([0.0, 1.0])
ax.set_ylim([0.0, 1.05])
ax.set_xlabel('False Positive Rate', fontsize=13, fontweight='bold')
ax.set_ylabel('True Positive Rate', fontsize=13, fontweight='bold')
ax.set_title('ROC Curve Comparison - Heart Disease Prediction\n'
             'Random Forest vs Gradient Boosting vs ANN vs GA-Optimized',
             fontsize=14, fontweight='bold', pad=20)
ax.legend(loc="lower right", fontsize=10, framealpha=0.9)
ax.grid(True, alpha=0.3, linestyle='--')

# Info box
info_text = f'Test Samples: {len(y_test)}\nFeatures: {len(feature_columns)}'
if ga_features:
    info_text += f'\nGA Features: {len(ga_features["selected_features"])}'
props = dict(boxstyle='round', facecolor='lightblue', alpha=0.5)
ax.text(0.98, 0.35, info_text, transform=ax.transAxes, fontsize=10,
        verticalalignment='top', horizontalalignment='right', bbox=props)

plt.tight_layout()
plt.savefig('heart_disease_auc_roc_curve.png', dpi=300, bbox_inches='tight')
plt.savefig('heart_disease_auc_roc_curve.pdf', format='pdf', bbox_inches='tight')
print("\n✅ Saved: heart_disease_auc_roc_curve.png")
print("✅ Saved: heart_disease_auc_roc_curve.pdf")

# ============================================================
# Summary Table
# ============================================================
print("\n" + "="*60)
print("📊 MODEL COMPARISON SUMMARY")
print("="*60)
print(f"\n{'Model':<25} {'AUC':>10} {'Accuracy':>12}")
print("-" * 50)
for name, res in sorted(results.items(), key=lambda x: x[1]['auc'], reverse=True):
    marker = "🏆" if res['auc'] == max(r['auc'] for r in results.values()) else "  "
    print(f"{marker} {name:<23} {res['auc']:>9.4f} {res['accuracy']:>11.2%}")

print("\n" + "="*60)
print("✨ Multi-model AUC-ROC comparison complete!")
print("="*60)

