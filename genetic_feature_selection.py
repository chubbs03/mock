#!/usr/bin/env python3
"""
Genetic Algorithm for Feature Selection in Heart Disease Prediction
Uses DEAP (Distributed Evolutionary Algorithms in Python) library
"""
import json
import random
import numpy as np
import pandas as pd
from datasets import load_dataset
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
from deap import base, creator, tools, algorithms
import joblib

print("="*60)
print("🧬 GENETIC ALGORITHM FOR FEATURE SELECTION")
print("="*60)

# Load dataset
print("\n📥 Loading heart disease dataset...")
ds = load_dataset("skrishna/heart_disease_uci")
data = ds['test']
df = pd.DataFrame(data)

# Handle string columns
df['ca'] = pd.to_numeric(df['ca'], errors='coerce').fillna(0)
df['thal'] = pd.to_numeric(df['thal'], errors='coerce').fillna(0)

feature_columns = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg',
                   'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']

X = df[feature_columns].values
y = df['target'].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print(f"✅ Loaded {len(df)} records, {len(feature_columns)} features")

# ============================================================
# DEAP Genetic Algorithm Setup
# ============================================================

NUM_FEATURES = len(feature_columns)
POPULATION_SIZE = 30
NUM_GENERATIONS = 20
CROSSOVER_PROB = 0.7
MUTATION_PROB = 0.2
TOURNAMENT_SIZE = 3

# Create fitness and individual classes
creator.create("FitnessMax", base.Fitness, weights=(1.0,))
creator.create("Individual", list, fitness=creator.FitnessMax)

toolbox = base.Toolbox()

# Each gene is 0 or 1 (feature selected or not)
toolbox.register("attr_bool", random.randint, 0, 1)
toolbox.register("individual", tools.initRepeat, creator.Individual,
                 toolbox.attr_bool, n=NUM_FEATURES)
toolbox.register("population", tools.initRepeat, list, toolbox.individual)


def evaluate_features(individual):
    """Fitness function: evaluate a feature subset using cross-validation"""
    selected_indices = [i for i, bit in enumerate(individual) if bit == 1]

    # Penalize empty feature sets
    if len(selected_indices) == 0:
        return (0.0,)

    # Select features
    X_subset = X_train_scaled[:, selected_indices]

    # Evaluate with Random Forest using cross-validation
    model = RandomForestClassifier(
        n_estimators=50, random_state=42, class_weight='balanced'
    )
    cv_scores = cross_val_score(model, X_subset, y_train, cv=3, scoring='accuracy')

    # Fitness = accuracy - small penalty for number of features (encourage parsimony)
    fitness = cv_scores.mean() - 0.005 * len(selected_indices)
    return (fitness,)


# Register genetic operators
toolbox.register("evaluate", evaluate_features)
toolbox.register("mate", tools.cxTwoPoint)
toolbox.register("mutate", tools.mutFlipBit, indpb=0.1)
toolbox.register("select", tools.selTournament, tournsize=TOURNAMENT_SIZE)

# ============================================================
# Run Genetic Algorithm
# ============================================================
print(f"\n🧬 GA Configuration:")
print(f"   Population: {POPULATION_SIZE}")
print(f"   Generations: {NUM_GENERATIONS}")
print(f"   Crossover: {CROSSOVER_PROB}")
print(f"   Mutation: {MUTATION_PROB}")
print(f"   Features: {NUM_FEATURES}")

print("\n🚀 Running Genetic Algorithm...")

# Initialize population
random.seed(42)
np.random.seed(42)
population = toolbox.population(n=POPULATION_SIZE)

# Statistics
stats = tools.Statistics(lambda ind: ind.fitness.values)
stats.register("avg", np.mean)
stats.register("max", np.max)
stats.register("min", np.min)

# Hall of Fame (best individuals)
hof = tools.HallOfFame(5)

# Run the GA
population, logbook = algorithms.eaSimple(
    population, toolbox,
    cxpb=CROSSOVER_PROB,
    mutpb=MUTATION_PROB,
    ngen=NUM_GENERATIONS,
    stats=stats,
    halloffame=hof,
    verbose=True
)

# ============================================================
# Analyze Results
# ============================================================
print("\n" + "="*60)
print("🏆 GENETIC ALGORITHM RESULTS")
print("="*60)

# Best individual
best_individual = hof[0]
best_features_mask = [bool(bit) for bit in best_individual]
selected_features = [feature_columns[i] for i, selected in enumerate(best_features_mask) if selected]
removed_features = [feature_columns[i] for i, selected in enumerate(best_features_mask) if not selected]

print(f"\n✅ Best Feature Subset ({len(selected_features)}/{NUM_FEATURES} features):")
for i, feat in enumerate(selected_features, 1):
    print(f"   {i}. {feat}")

if removed_features:
    print(f"\n❌ Removed Features ({len(removed_features)}):")
    for feat in removed_features:
        print(f"   - {feat}")

# Evaluate best subset on test set
selected_indices = [i for i, bit in enumerate(best_individual) if bit == 1]
X_train_ga = X_train_scaled[:, selected_indices]
X_test_ga = X_test_scaled[:, selected_indices]

# Train and evaluate with all three model types
print("\n" + "="*60)
print("📊 MODEL PERFORMANCE WITH GA-SELECTED FEATURES")
print("="*60)

# Random Forest
rf_ga = RandomForestClassifier(n_estimators=200, random_state=42, class_weight='balanced')
rf_ga.fit(X_train_ga, y_train)
rf_ga_acc = accuracy_score(y_test, rf_ga.predict(X_test_ga))
print(f"\n🌲 Random Forest:  {rf_ga_acc:.2%}")

# ANN
ann_ga = MLPClassifier(hidden_layer_sizes=(100, 50, 25), activation='relu',
                       solver='adam', max_iter=500, random_state=42,
                       early_stopping=True, validation_fraction=0.1)
ann_ga.fit(X_train_ga, y_train)
ann_ga_acc = accuracy_score(y_test, ann_ga.predict(X_test_ga))
print(f"🧠 ANN:            {ann_ga_acc:.2%}")

# Compare with all features
print("\n📊 Comparison (All Features vs GA-Selected):")
rf_all = RandomForestClassifier(n_estimators=200, random_state=42, class_weight='balanced')
rf_all.fit(X_train_scaled, y_train)
rf_all_acc = accuracy_score(y_test, rf_all.predict(X_test_scaled))

ann_all = MLPClassifier(hidden_layer_sizes=(100, 50, 25), activation='relu',
                        solver='adam', max_iter=500, random_state=42,
                        early_stopping=True, validation_fraction=0.1)
ann_all.fit(X_train_scaled, y_train)
ann_all_acc = accuracy_score(y_test, ann_all.predict(X_test_scaled))

print(f"   {'Model':<25} {'All Features':>15} {'GA-Selected':>15} {'Diff':>10}")
print(f"   {'-'*65}")
print(f"   {'Random Forest':<25} {rf_all_acc:>14.2%} {rf_ga_acc:>14.2%} {(rf_ga_acc-rf_all_acc):>+9.2%}")
print(f"   {'ANN (Neural Network)':<25} {ann_all_acc:>14.2%} {ann_ga_acc:>14.2%} {(ann_ga_acc-ann_all_acc):>+9.2%}")

# GA Evolution Statistics
print("\n" + "="*60)
print("📈 GA EVOLUTION STATISTICS")
print("="*60)
gen_stats = logbook.select("gen", "avg", "max", "min")
print(f"   Generation 1:  avg={logbook[0]['avg']:.4f}, max={logbook[0]['max']:.4f}")
print(f"   Generation {NUM_GENERATIONS}: avg={logbook[-1]['avg']:.4f}, max={logbook[-1]['max']:.4f}")
print(f"   Improvement: {logbook[-1]['max'] - logbook[0]['max']:+.4f}")

# Save GA results
ga_results = {
    'selected_features': selected_features,
    'removed_features': removed_features,
    'feature_mask': [int(bit) for bit in best_individual],
    'num_selected': len(selected_features),
    'num_total': NUM_FEATURES,
    'ga_config': {
        'population_size': POPULATION_SIZE,
        'generations': NUM_GENERATIONS,
        'crossover_prob': CROSSOVER_PROB,
        'mutation_prob': MUTATION_PROB,
        'tournament_size': TOURNAMENT_SIZE
    },
    'performance': {
        'rf_all_features': float(rf_all_acc),
        'rf_ga_features': float(rf_ga_acc),
        'ann_all_features': float(ann_all_acc),
        'ann_ga_features': float(ann_ga_acc)
    }
}

with open('ga_feature_selection_results.json', 'w') as f:
    json.dump(ga_results, f, indent=2)

# Save GA-optimized models
joblib.dump(rf_ga, 'heart_disease_rf_ga_model.pkl')
joblib.dump(ann_ga, 'heart_disease_ann_ga_model.pkl')

# Save GA scaler with selected features info
ga_scaler_info = {
    'selected_indices': selected_indices,
    'selected_features': selected_features
}
with open('ga_selected_features.json', 'w') as f:
    json.dump(ga_scaler_info, f, indent=2)

print("\n✅ Saved: ga_feature_selection_results.json")
print("✅ Saved: heart_disease_rf_ga_model.pkl")
print("✅ Saved: heart_disease_ann_ga_model.pkl")
print("✅ Saved: ga_selected_features.json")

print("\n" + "="*60)
print("✨ Genetic Algorithm feature selection complete!")
print("="*60)

