# Quick Start Guide - Department Routing

## 🚀 Get Started in 3 Steps

### Step 1: Start the Backend (Terminal 1)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

You should see:
```
🏥 Department Routing Service Starting...
📍 Endpoints:
   POST /api/route - Route text to department
   GET  /api/health - Health check
 * Running on http://127.0.0.1:5000
```

### Step 2: Start the Frontend (Terminal 2)

```bash
npm run dev
```

Open your browser to the URL shown (usually `http://localhost:5173`)

### Step 3: Test the Routing

1. **Add a task** in the Task Queue section
2. **Try these examples:**
   - "Order HbA1c test" → Endocrinology (green chip)
   - "Check blood pressure" → Cardiology (green chip)
   - "Patient feels tired" → General (amber chip, needs triage)

3. **Use the filter tabs:**
   - Click "All" to see all tasks
   - Click "Triage" to see tasks needing review
   - Click department names to filter by department

---

## 🎨 What You'll See

### Task with Auto-Routing (High Confidence)
```
┌─────────────────────────────────────────┐
│ Order HbA1c test                        │
│ T-1234567890                            │
│ [Endocrinology 85%] ⚠ Needs Review      │
│                              [High] [🗑] │
└─────────────────────────────────────────┘
```
- **Green chip** = Auto-routed (≥80% confidence)
- Shows department and confidence percentage

### Task Needing Triage (Low Confidence)
```
┌─────────────────────────────────────────┐
│ Patient feels unwell                    │
│ T-1234567891                            │
│ [General 60%] ⚠ Needs Review            │
│                           [Normal] [🗑]  │
└─────────────────────────────────────────┘
```
- **Amber chip** = Needs triage (<80% confidence)
- Shows warning icon

---

## 🧪 Test Examples

### High-Confidence Routing (Auto-routed)

| Input | Expected Department | Confidence |
|-------|-------------------|------------|
| "Book appointment for next week" | Reception | 90% |
| "Reschedule my appointment" | Reception | 90% |
| "Change appointment date" | Reception | 90% |
| "Order HbA1c test for diabetes patient" | Endocrinology | 85% |
| "Patient has chest pain" | Cardiology | 85% |
| "Skin rash on arm" | Dermatology | 85% |
| "Schedule infant vaccination" | Pediatrics | 85% |
| "Help with insurance payment" | Admin/Billing | 85% |

### Low-Confidence Routing (Needs Triage)

| Input | Expected Department | Confidence |
|-------|-------------------|------------|
| "Patient feels unwell" | General | 50-60% |
| "Follow up needed" | General | 50-60% |
| "Check on patient" | General | 50-60% |

---

## 📊 Department Keywords Reference

### Reception (NEW!)
- **appointment, booking, schedule**
- **reschedule, cancel**
- **change date, change time**
- **postpone, move appointment**
- check-in, registration, register
- front desk, reception

### Cardiology
- heart, cardiac, cardio
- blood pressure, BP, hypertension
- chest pain, palpitation
- arrhythmia, ECG, EKG
- angina, coronary, stroke

### Endocrinology
- diabetes, diabetic
- glucose, blood sugar
- insulin, HbA1c
- thyroid, hormone
- endocrine, metabolic, pancreas

### Dermatology
- skin, rash, derma
- eczema, psoriasis, acne
- melanoma, mole, lesion
- itching, hives, dermatitis

### Pediatrics
- child, children, pediatric
- infant, baby, newborn
- vaccination, growth
- development, adolescent

### Admin/Billing
- bill, billing, payment
- insurance, claim, invoice
- cost, charge, financial
- refund, copay, deductible

---

## 🎯 How It Works (Simple Version)

1. **You type a task** → "Order glucose test"
2. **Backend checks keywords** → Finds "glucose"
3. **Matches to department** → Endocrinology
4. **Calculates confidence** → 85%
5. **Checks threshold** → 85% ≥ 80% ✅
6. **Auto-routes** → Green chip, Endocrinology tab
7. **If confidence was <80%** → Amber chip, Triage tab

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Make sure you're in the backend directory
cd backend

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Try again
python app.py
```

### Frontend can't connect to backend
1. Check backend is running on port 5000
2. Look for this message: `Running on http://127.0.0.1:5000`
3. Check browser console for errors (F12)

### Tasks not routing
1. Open browser console (F12)
2. Add a task
3. Look for errors in console
4. Check Network tab for failed requests

---

## 📖 Next Steps

- Read `DEPARTMENT_ROUTING_GUIDE.md` for detailed documentation
- Customize departments in `backend/app.py`
- Adjust confidence threshold (currently 0.8)
- Add more keywords for better matching

---

## 🎉 You're Ready!

The Department Routing system is now running. Add tasks and watch them automatically route to the correct department!

**Questions?** Check the full guide: `DEPARTMENT_ROUTING_GUIDE.md`

