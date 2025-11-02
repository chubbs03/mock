# Department Routing Module - Implementation Guide

## 🎯 Overview

The Department Routing module automatically classifies tasks, questions, and AI suggestions to the appropriate hospital department using a two-layer classification system.

## 🏗️ Architecture

### Backend (Flask API)
- **Location**: `backend/app.py`
- **Port**: 5000
- **Endpoint**: `POST /api/route`

### Frontend (React)
- **Location**: `src/App.tsx`
- **Integration**: Automatic routing on task creation
- **UI**: Department chips and filter tabs

---

## 🔧 How Routing Works

### Two-Layer Classification System

#### Layer 1: Rule-Based Classification
**Fast, deterministic keyword matching**

```python
# Example keywords for each department:
Cardiology: heart, cardiac, blood pressure, chest pain, arrhythmia
Endocrinology: diabetes, glucose, insulin, HbA1c, thyroid
Dermatology: skin, rash, eczema, psoriasis, acne
Pediatrics: child, infant, vaccination, pediatric
Admin/Billing: bill, payment, insurance, appointment
```

**How it works:**
1. Converts input text to lowercase
2. Checks regex patterns for each department
3. Returns first match with **0.85 confidence**
4. Falls back to "General" with **0.5 confidence** if no match

**Code location:** `backend/app.py` lines 73-103

#### Layer 2: DeepSeek AI Classification
**Handles ambiguous cases with AI reasoning**

**Prompt Engineering:**
```
"You are a hospital department router. Choose exactly one department from:
[General, Cardiology, Endocrinology, Dermatology, Pediatrics, Admin/Billing]

Return ONLY valid JSON:
{"department": "DepartmentName", "confidence": 0.85, "reason": "brief explanation"}

Rules:
- If unsure, pick General with confidence ≤ 0.6
- This is for routing only, not medical advice"
```

**How it works:**
1. Activated when rule-based confidence < 0.8
2. Sends text to DeepSeek API with structured prompt
3. Parses JSON response
4. Returns department, confidence, and reasoning
5. Falls back to "General" on API errors

**Code location:** `backend/app.py` lines 106-165

---

## 🎚️ Confidence Threshold Application

### Decision Logic (lines 168-220 in app.py)

```python
# Step 1: Try rule-based first
rule_result = rule_based_classification(text)

# Step 2: If confidence low, try DeepSeek AI
if rule_result['confidence'] < 0.8:
    ai_result = deepseek_classification(text)
    # Use whichever has higher confidence
    final_result = max(rule_result, ai_result, key=lambda x: x['confidence'])
else:
    final_result = rule_result

# Step 3: Apply auto-routing threshold
auto_routed = final_result['confidence'] >= 0.8
```

### Threshold: **0.8 (80%)**

- **≥ 0.8**: Task is **auto-routed** to department
  - Shows green chip in UI
  - Appears in department-specific tab
  
- **< 0.8**: Task goes to **"Needs Triage"** queue
  - Shows amber chip with ⚠ warning
  - Requires human review and manual assignment

**Why 0.8?**
- Balances automation with safety
- Common medical terms (glucose, heart) route confidently
- Ambiguous cases get human oversight
- Reduces misrouting risk

---

## 🎨 UI Implementation

### Task Display with Department Chips

**Location:** `src/App.tsx` lines 400-438

Each task shows:
```tsx
<Badge className={auto_routed ? 'bg-green-50' : 'bg-amber-50'}>
  {department} {confidence}%
</Badge>
```

**Color coding:**
- 🟢 **Green**: Auto-routed (confidence ≥ 80%)
- 🟡 **Amber**: Needs triage (confidence < 80%)

### Department Filter Tabs

**Location:** `src/App.tsx` lines 371-397

Available tabs:
1. **All Tasks** - Shows all tasks with counts
2. **Needs Triage** - Shows low-confidence tasks requiring review
3. **Department-specific tabs** - Dynamically generated from task departments
   - Cardiology
   - Endocrinology
   - Dermatology
   - Pediatrics
   - Admin/Billing
   - General

**How filtering works:**
```typescript
const filteredTasks = useMemo(() => {
  if (departmentFilter === 'All Tasks') return tasks
  if (departmentFilter === 'Needs Triage') return tasks.filter(t => !t.auto_routed)
  return tasks.filter(t => t.department === departmentFilter)
}, [tasks, departmentFilter])
```

---

## 🚀 Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the server:**
   ```bash
   python app.py
   ```

   Server will start on `http://localhost:5000`

### Frontend Setup

1. **The frontend is already configured** in `src/App.tsx`

2. **Start the React dev server:**
   ```bash
   npm run dev
   ```

3. **Ensure backend is running** before testing task creation

---

## 📝 Usage Examples

### Example 1: High-Confidence Auto-Routing

**Input:** "Order HbA1c test for diabetes patient"

**Process:**
1. Rule-based matches "diabetes" and "hba1c"
2. Returns: Endocrinology, 0.85 confidence
3. 0.85 ≥ 0.8 → **auto_routed = true**

**Result:**
```json
{
  "department": "Endocrinology",
  "confidence": 0.85,
  "reason": "Matched keywords: diabetes, hba1c",
  "auto_routed": true,
  "method": "rule-based"
}
```

**UI Display:** Green chip "Endocrinology 85%"

### Example 2: Low-Confidence Triage

**Input:** "Patient feels unwell"

**Process:**
1. Rule-based finds no keywords → General, 0.5 confidence
2. 0.5 < 0.8 → Try DeepSeek AI
3. AI returns: General, 0.6 confidence
4. 0.6 < 0.8 → **auto_routed = false**

**Result:**
```json
{
  "department": "General",
  "confidence": 0.6,
  "reason": "Vague symptoms, needs assessment",
  "auto_routed": false,
  "method": "deepseek-ai"
}
```

**UI Display:** Amber chip "General 60%" with ⚠ Needs Review

### Example 3: Cardiology Routing

**Input:** "Patient has chest pain and high blood pressure"

**Process:**
1. Rule-based matches "chest pain" and "blood pressure"
2. Returns: Cardiology, 0.85 confidence
3. 0.85 ≥ 0.8 → **auto_routed = true**

**Result:**
```json
{
  "department": "Cardiology",
  "confidence": 0.85,
  "reason": "Matched keywords: chest pain, blood pressure",
  "auto_routed": true,
  "method": "rule-based"
}
```

**UI Display:** Green chip "Cardiology 85%"

---

## 🧪 Testing

### Manual Testing

1. **Start both servers** (backend on :5000, frontend on :5173)

2. **Add tasks with different keywords:**
   - "Check glucose levels" → Endocrinology
   - "Heart palpitations" → Cardiology
   - "Skin rash treatment" → Dermatology
   - "Child vaccination" → Pediatrics
   - "Insurance billing issue" → Admin/Billing
   - "General checkup" → General (low confidence)

3. **Verify:**
   - Green chips for high-confidence routing
   - Amber chips for low-confidence cases
   - Department tabs show correct counts
   - "Needs Triage" tab shows low-confidence tasks

### Automated Testing

Run the test script:
```bash
cd backend
source venv/bin/activate
python test_routing.py
```

---

## 🔑 Key Features

### ✅ Implemented

1. **Two-layer classification** (rule-based + AI fallback)
2. **Six departments** + General fallback
3. **Confidence-based auto-routing** (0.8 threshold)
4. **Department chips** with color coding
5. **Filter tabs** (All, Triage, Department-specific)
6. **Real-time routing** on task creation
7. **Error handling** with graceful fallbacks
8. **Comprehensive logging** and debugging

### 🎯 Benefits

- **Fast routing** for common cases (rule-based)
- **Intelligent handling** of ambiguous cases (AI)
- **Safety first** - uncertain cases go to triage
- **Visual clarity** - color-coded confidence levels
- **Easy management** - filter by department or triage status
- **Scalable** - easy to add new departments

---

## 🛠️ Customization

### Adding New Departments

1. **Update backend rules** (`backend/app.py`):
   ```python
   DEPARTMENT_RULES = {
       'Neurology': {
           'keywords': [r'\b(brain|neuro|seizure|migraine)\b'],
           'confidence': 0.85
       }
   }
   ```

2. **Update DeepSeek prompt** to include new department in allowed list

3. **Frontend automatically adapts** - no changes needed!

### Adjusting Confidence Threshold

Change the threshold in `backend/app.py` line 215:
```python
auto_routed = final_result['confidence'] >= 0.8  # Change 0.8 to desired value
```

**Recommendations:**
- **0.7**: More automation, slightly higher risk
- **0.8**: Balanced (current setting)
- **0.9**: Very conservative, more manual triage

---

## 📊 System Flow Diagram

```
User adds task
      ↓
Frontend calls /api/route
      ↓
Backend: Rule-based check
      ↓
   Confidence ≥ 0.8?
      ↓
    Yes → Return result
      ↓
    No → Call DeepSeek AI
      ↓
   Compare confidences
      ↓
   Use higher confidence
      ↓
   Apply 0.8 threshold
      ↓
   Return routing result
      ↓
Frontend displays task with:
  - Department chip
  - Confidence %
  - Color coding
  - Filter tab assignment
```

---

## 🐛 Troubleshooting

### Backend not starting
- Check Python version (3.8+)
- Verify virtual environment is activated
- Install dependencies: `pip install -r requirements.txt`

### 403 Errors
- Verify DeepSeek API key is valid
- Check CORS configuration in `app.py`
- Ensure backend is running on port 5000

### Tasks not routing
- Check browser console for errors
- Verify backend URL in `App.tsx` (line 121)
- Test backend directly: `curl -X POST http://localhost:5000/api/route -H "Content-Type: application/json" -d '{"text": "test"}'`

### Low confidence for obvious cases
- Check keyword patterns in `DEPARTMENT_RULES`
- Add more keywords for better matching
- Verify text preprocessing (lowercase conversion)

---

## 📚 Code Comments

All critical sections include detailed comments explaining:
- **How routing works** (two-layer system)
- **Where confidence threshold is applied** (0.8 check)
- **How UI shows results** (chips, colors, tabs)

See inline comments in:
- `backend/app.py` - Full routing logic
- `src/App.tsx` - Frontend integration and UI

---

## ✨ Summary

The Department Routing module provides intelligent, automated task classification with human oversight for uncertain cases. The two-layer system balances speed (rule-based) with accuracy (AI), while the 0.8 confidence threshold ensures safety. The UI clearly communicates routing decisions through color-coded chips and organized department tabs.

**Result:** Efficient workflow automation with appropriate human oversight! 🎉

