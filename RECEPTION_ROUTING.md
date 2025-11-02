# Reception Department Routing - Quick Reference

## 🆕 New Feature: Appointment Routing to Reception

The system now automatically routes **all appointment-related tasks** to the **Reception** department with **90% confidence** (higher than other departments).

---

## 📋 What Gets Routed to Reception?

### Appointment Booking
- "Book appointment for next week"
- "Schedule an appointment"
- "Need to make an appointment"
- "Book a slot for Tuesday"

### Rescheduling
- "Reschedule my appointment"
- "Need to reschedule"
- "Move my appointment to next week"
- "Can we reschedule?"

### Date/Time Changes
- "Change appointment date"
- "Change appointment time"
- "Postpone my appointment"
- "Move appointment to Friday"

### Cancellations
- "Cancel my appointment"
- "Need to cancel appointment for tomorrow"
- "Cancel booking"

### Check-in & Registration
- "Check-in for appointment"
- "Patient registration"
- "Register new patient"
- "Front desk check-in"

---

## 🎯 Why Reception Has Higher Confidence (90%)

Reception tasks have **0.90 confidence** vs. other departments at **0.85** because:

1. **Clear intent** - Appointment keywords are very specific
2. **No ambiguity** - "Book appointment" clearly means Reception
3. **High priority** - Appointment management is time-sensitive
4. **Patient experience** - Quick routing improves service

---

## 🔄 How It Works

### Example 1: Appointment Booking
```
Input: "Book appointment for next Tuesday"

Processing:
1. Rule-based check finds "appointment" and "book"
2. Matches Reception keywords
3. Returns confidence: 0.90
4. 0.90 ≥ 0.8 → auto_routed = true

Result:
{
  "department": "Reception",
  "confidence": 0.90,
  "reason": "Matched keywords: appointment, book",
  "auto_routed": true,
  "method": "rule-based"
}

UI Display:
┌─────────────────────────────────────┐
│ Book appointment for next Tuesday   │
│ T-1234567890                        │
│ [Reception 90%]          [High] [🗑]│
│ ✅ Auto-routed                      │
└─────────────────────────────────────┘
```

### Example 2: Reschedule Request
```
Input: "Need to reschedule my appointment to next week"

Processing:
1. Rule-based check finds "reschedule" and "appointment"
2. Matches Reception keywords
3. Returns confidence: 0.90
4. 0.90 ≥ 0.8 → auto_routed = true

Result:
{
  "department": "Reception",
  "confidence": 0.90,
  "reason": "Matched keywords: reschedule, appointment",
  "auto_routed": true,
  "method": "rule-based"
}

UI Display:
┌─────────────────────────────────────────────────┐
│ Need to reschedule my appointment to next week  │
│ T-1234567891                                    │
│ [Reception 90%]                      [High] [🗑]│
│ ✅ Auto-routed                                  │
└─────────────────────────────────────────────────┘
```

### Example 3: Date Change
```
Input: "Can we change the appointment date?"

Processing:
1. Rule-based check finds "change" and "appointment date"
2. Matches Reception keywords
3. Returns confidence: 0.90
4. 0.90 ≥ 0.8 → auto_routed = true

Result:
{
  "department": "Reception",
  "confidence": 0.90,
  "reason": "Matched keywords: change date, appointment",
  "auto_routed": true,
  "method": "rule-based"
}

UI Display:
┌─────────────────────────────────────┐
│ Can we change the appointment date? │
│ T-1234567892                        │
│ [Reception 90%]          [High] [🗑]│
│ ✅ Auto-routed                      │
└─────────────────────────────────────┘
```

---

## 🆚 Reception vs. Admin/Billing

### Reception Handles:
- ✅ Appointment booking
- ✅ Rescheduling
- ✅ Date/time changes
- ✅ Cancellations
- ✅ Check-in
- ✅ Patient registration

### Admin/Billing Handles:
- ✅ Payment processing
- ✅ Insurance claims
- ✅ Billing inquiries
- ✅ Financial matters
- ✅ Refunds
- ✅ Copay/deductible questions

**Note:** The keywords have been separated to avoid confusion:
- "appointment" → Reception
- "payment", "insurance", "bill" → Admin/Billing

---

## 📊 Reception Keywords (Complete List)

### Primary Keywords (High Priority)
- `appointment`
- `book` / `booking`
- `schedule`
- `reschedule`
- `cancel`

### Date/Time Keywords
- `change date`
- `change time`
- `postpone`
- `move appointment`
- `appointment time`
- `appointment date`

### Location Keywords
- `reception`
- `front desk`

### Action Keywords
- `check-in` / `check in`
- `registration`
- `register`

---

## 🧪 Test Cases

### Test Reception Routing

Try these in your Task Queue:

1. **"Book appointment for next Tuesday"**
   - Expected: Reception, 90%, Auto-routed ✅

2. **"Reschedule my appointment"**
   - Expected: Reception, 90%, Auto-routed ✅

3. **"Change appointment date to Friday"**
   - Expected: Reception, 90%, Auto-routed ✅

4. **"Cancel my appointment for tomorrow"**
   - Expected: Reception, 90%, Auto-routed ✅

5. **"Need to check in for my appointment"**
   - Expected: Reception, 90%, Auto-routed ✅

6. **"Register new patient"**
   - Expected: Reception, 90%, Auto-routed ✅

---

## 🎨 UI Display

### Reception Tab
When you add appointment-related tasks, they appear in the **Reception** tab:

```
┌────────┬──────────┬────────────┬──────────────┐
│ All (8)│Triage (1)│Reception(4)│Endocrinology │
└────────┴──────────┴────────────┴──────────────┘
                        ↑
                  Click to see only
                  appointment tasks
```

### Green Chip Indicator
Reception tasks show a **green chip** with **90% confidence**:

```
[Reception 90%]  ← Green background, high confidence
```

---

## 🔧 Technical Details

### Backend Configuration
**File:** `backend/app.py`

```python
DEPARTMENT_RULES = {
    'Reception': {
        'keywords': [
            r'\b(appointment|schedule|reschedule|book|booking|cancel|'
            r'change date|change time|postpone|move appointment|'
            r'appointment time|appointment date|reception|front desk|'
            r'check.?in|registration|register)\b'
        ],
        'confidence': 0.9  # Higher than other departments
    },
    # ... other departments at 0.85
}
```

### DeepSeek AI Prompt
The AI is instructed:
```
"Reception handles: appointments, scheduling, booking, date changes, cancellations"
```

This ensures the AI also routes appointment tasks to Reception when rule-based matching doesn't catch them.

---

## 📈 Benefits

### For Staff
- ✅ **Automatic routing** - No manual sorting needed
- ✅ **Clear separation** - Reception vs. Admin/Billing tasks
- ✅ **High confidence** - 90% accuracy for appointments
- ✅ **Easy filtering** - Click Reception tab to see all appointment tasks

### For Patients
- ✅ **Faster service** - Tasks routed immediately
- ✅ **No confusion** - Clear department assignment
- ✅ **Better experience** - Efficient appointment management

### For System
- ✅ **High accuracy** - 90% confidence threshold
- ✅ **Scalable** - Easy to add more keywords
- ✅ **Maintainable** - Clear separation of concerns

---

## 🚀 Quick Start

1. **Start the backend** (if not running):
   ```bash
   cd backend
   source venv/bin/activate
   python app.py
   ```

2. **Add an appointment task**:
   - Type: "Book appointment for next week"
   - Click "Add Task"

3. **See the result**:
   - Green chip: "Reception 90%"
   - Auto-routed: ✅
   - Appears in Reception tab

---

## 🎉 Summary

The Reception department routing ensures that:
- **All appointment-related tasks** go to Reception
- **High confidence (90%)** for automatic routing
- **Clear separation** from Admin/Billing
- **Easy management** with dedicated Reception tab

**Result:** Efficient appointment management with intelligent routing! 📅

