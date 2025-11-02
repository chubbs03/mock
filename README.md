# Predictive Healthcare Workflow System with Department Routing

A comprehensive healthcare workflow management system with AI-powered department routing, patient risk prediction, and intelligent task management.

## 🌟 Features

### Core Features
- **Patient Management** - Track multiple patients with vitals and medical history
- **Risk Prediction** - AI-powered risk assessment based on patient data
- **Task Queue** - Intelligent task management with priority levels
- **Helper Bot** - DeepSeek AI-powered medical assistant for queries

### 🆕 Department Routing Module
- **Automatic Department Classification** - Routes tasks to appropriate departments
- **Two-Layer AI System** - Rule-based + DeepSeek AI fallback
- **Confidence-Based Routing** - Auto-routes high-confidence tasks, triages uncertain ones
- **Visual Department Chips** - Color-coded confidence indicators
- **Department Filtering** - Filter tasks by department or triage status

## 🏗️ Architecture

### Frontend (React + TypeScript + Vite)
- Modern React 18 with TypeScript
- Tailwind CSS for styling
- shadcn/ui components
- Recharts for data visualization
- Real-time patient vitals tracking

### Backend (Flask + Python)
- RESTful API for department routing
- Two-layer classification system
- DeepSeek AI integration
- CORS-enabled for frontend communication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- DeepSeek API key (already configured)

### 1. Start the Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend will start on `http://localhost:5000`

### 2. Start the Frontend

```bash
npm install  # If not already installed
npm run dev
```

Frontend will start on `http://localhost:5173` (or similar)

### 3. Open in Browser

Navigate to the URL shown by Vite (usually `http://localhost:5173`)

## 📖 Documentation

### Quick References
- **[QUICK_START.md](QUICK_START.md)** - Get started in 3 steps
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Complete implementation overview
- **[DEPARTMENT_ROUTING_GUIDE.md](DEPARTMENT_ROUTING_GUIDE.md)** - Detailed routing documentation
- **[backend/README.md](backend/README.md)** - Backend API documentation

## 🎯 Department Routing

### How It Works

1. **User adds a task** (e.g., "Order HbA1c test")
2. **System analyzes text** using two-layer classification:
   - **Layer 1**: Rule-based keyword matching (fast)
   - **Layer 2**: DeepSeek AI (for ambiguous cases)
3. **Confidence check**: 
   - ≥80% → Auto-route to department (green chip)
   - <80% → Send to triage (amber chip)
4. **Task displayed** with department badge and confidence

### Supported Departments

| Department | Keywords |
|------------|----------|
| **Reception** 🆕 | **appointment, booking, reschedule, change date, cancel** |
| **Cardiology** | heart, cardiac, blood pressure, chest pain, arrhythmia |
| **Endocrinology** | diabetes, glucose, insulin, HbA1c, thyroid |
| **Dermatology** | skin, rash, eczema, psoriasis, acne |
| **Pediatrics** | child, infant, vaccination, pediatric |
| **Admin/Billing** | bill, payment, insurance, financial matters |
| **General** | Fallback for unclear cases |

### Example Routing

```
Input: "Order HbA1c test for diabetes patient"
→ Department: Endocrinology
→ Confidence: 85%
→ Auto-routed: ✅ Yes
→ Display: Green chip "Endocrinology 85%"
```

```
Input: "Patient feels unwell"
→ Department: General
→ Confidence: 60%
→ Auto-routed: ❌ No
→ Display: Amber chip "General 60%" ⚠ Needs Review
```

## 🎨 User Interface

### Main Dashboard
- **Patient List** - Search and select patients
- **Vitals Charts** - Blood pressure, heart rate, glucose trends
- **Risk Assessment** - AI-predicted risk level with confidence
- **Task Queue** - Department-filtered task management
- **Helper Bot** - AI chat assistant

### Task Queue Features
- **Department Tabs** - Filter by All, Triage, or specific department
- **Color-Coded Chips** - Green (auto-routed) or Amber (needs review)
- **Confidence Display** - Shows routing confidence percentage
- **Priority Badges** - High, Normal, Low priority indicators

## 🧪 Testing

### Test Department Routing

Try these examples in the Task Queue:

**High-Confidence (Auto-routed):**
- "Book appointment for next week" → Reception 🆕
- "Reschedule my appointment" → Reception 🆕
- "Change appointment date" → Reception 🆕
- "Order HbA1c test" → Endocrinology
- "Check blood pressure" → Cardiology
- "Skin rash treatment" → Dermatology
- "Child vaccination" → Pediatrics
- "Insurance payment" → Admin/Billing

**Low-Confidence (Needs Triage):**
- "Patient feels tired" → General (triage)
- "Follow up needed" → General (triage)

### Automated Testing

```bash
cd backend
source venv/bin/activate
python test_routing.py
```

## 🔧 Configuration

### Confidence Threshold

**Location:** `backend/app.py` line 215

```python
auto_routed = final_result['confidence'] >= 0.8
```

**Adjust threshold:**
- `0.7` - More automation, slightly higher risk
- `0.8` - Balanced (current, recommended)
- `0.9` - Very conservative, more manual triage

### Add New Department

**1. Update backend rules** (`backend/app.py`):
```python
DEPARTMENT_RULES = {
    'Neurology': {
        'keywords': [r'\b(brain|neuro|seizure|migraine)\b'],
        'confidence': 0.85
    }
}
```

**2. Update DeepSeek prompt** to include new department

**3. Frontend automatically adapts!** No changes needed.

## 📊 System Architecture

```
┌─────────────┐
│   User UI   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│  Frontend (React + TypeScript)  │
│  - Patient Management           │
│  - Task Queue with Routing      │
│  - Helper Bot Chat              │
│  - Vitals Visualization         │
└──────┬──────────────────────────┘
       │
       │ POST /api/route
       ▼
┌─────────────────────────────────┐
│    Backend (Flask + Python)     │
│  ┌───────────────────────────┐  │
│  │  Rule-Based Classifier    │  │
│  │  (Keyword Matching)       │  │
│  └───────────┬───────────────┘  │
│              │                   │
│              ▼                   │
│  ┌───────────────────────────┐  │
│  │  DeepSeek AI Classifier   │  │
│  │  (Ambiguous Cases)        │  │
│  └───────────┬───────────────┘  │
│              │                   │
│              ▼                   │
│  ┌───────────────────────────┐  │
│  │  Confidence Threshold     │  │
│  │  (0.8 = 80%)              │  │
│  └───────────┬───────────────┘  │
│              │                   │
│              ▼                   │
│  ┌───────────────────────────┐  │
│  │  Return Routing Result    │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **OpenAI SDK** - DeepSeek integration

### Backend
- **Flask 3.0** - Web framework
- **Flask-CORS** - Cross-origin support
- **OpenAI SDK** - DeepSeek API client
- **Python 3.8+** - Runtime

## 📝 Code Structure

```
.
├── src/
│   ├── App.tsx              # Main application component
│   ├── components/          # UI components
│   └── main.tsx            # Entry point
├── backend/
│   ├── app.py              # Flask routing service
│   ├── requirements.txt    # Python dependencies
│   ├── test_routing.py     # Automated tests
│   └── README.md           # Backend documentation
├── QUICK_START.md          # Quick start guide
├── DEPARTMENT_ROUTING_GUIDE.md  # Detailed routing docs
├── IMPLEMENTATION_SUMMARY.md    # Implementation overview
└── README.md               # This file
```

## 🐛 Troubleshooting

### Backend won't start
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Frontend can't connect
1. Ensure backend is running on port 5000
2. Check browser console (F12) for errors
3. Verify CORS is enabled in backend

### Tasks not routing
1. Check backend is running
2. Open browser console (F12)
3. Look for network errors
4. Verify API endpoint URL in `App.tsx`

## 📚 Learn More

- **DeepSeek API**: [https://platform.deepseek.com](https://platform.deepseek.com)
- **Flask Documentation**: [https://flask.palletsprojects.com](https://flask.palletsprojects.com)
- **React Documentation**: [https://react.dev](https://react.dev)
- **Tailwind CSS**: [https://tailwindcss.com](https://tailwindcss.com)

## 🎉 Features Summary

✅ Patient management with vitals tracking  
✅ AI-powered risk prediction  
✅ Intelligent task queue  
✅ DeepSeek AI helper bot  
✅ **Automatic department routing**  
✅ **Two-layer classification (rule-based + AI)**  
✅ **Confidence-based auto-routing**  
✅ **Visual department chips**  
✅ **Department filtering tabs**  
✅ **Triage queue for uncertain cases**  

## 📄 License

This is a demo/academic project for healthcare workflow management.

---

**Built with ❤️ using React, Flask, and DeepSeek AI**

