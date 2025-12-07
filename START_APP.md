# 🚀 How to Start the Application

## ⚡ Quick Start (1 Step Only!)

Since we removed the department routing feature, **you only need to start the frontend!**

### Start the Frontend (React)

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

✅ Frontend is now running on **http://localhost:5173**

---

## 🌐 Open in Browser

Navigate to: **http://localhost:5173**

You should see the Predictive AI Clinic Assistant with:
- ✅ 7 real patients from the Hugging Face dataset
- ✅ Vitals charts (BP, HR, Glucose, **SpO2**)
- ✅ Task queue (simplified, no department routing)
- ✅ AI Helper Bot powered by DeepSeek

---

## 🛑 To Stop the Application

Press `Ctrl+C` in the terminal

---

## ℹ️ Backend Not Needed

**Note:** Since we removed the department routing feature, the Flask backend is **no longer required**. The app runs entirely in the browser with:
- Patient data loaded from the Hugging Face dataset
- AI chat powered by DeepSeek API (called directly from frontend)
- All features work without a backend server!

---

## ⚠️ Troubleshooting

### Error: "can't open file 'app.py'"
**Problem:** You're not in the backend directory

**Solution:**
```bash
cd backend
python3 app.py
```

---

### Error: "Address already in use" (Port 5001)
**Problem:** Another process is using port 5001

**Solution:**
```bash
# Find and kill the process
lsof -ti:5001 | xargs kill -9

# Then restart
python3 app.py
```

---

### Error: "Module not found"
**Problem:** Python dependencies not installed

**Solution:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

---

### Error: "npm: command not found"
**Problem:** Node.js not installed

**Solution:**
1. Install Node.js from https://nodejs.org
2. Then run `npm install` and `npm run dev`

---

## 📁 Directory Structure

```
mock/
├── backend/          ← Flask backend (port 5001)
│   ├── app.py       ← Start this first
│   ├── venv/        ← Virtual environment
│   └── requirements.txt
├── src/             ← React frontend
│   └── App.tsx      ← Main app component
├── package.json     ← Frontend dependencies
└── START_APP.md     ← This file
```

---

## ✅ Checklist

Before starting:
- [ ] Backend virtual environment activated
- [ ] Python dependencies installed (`pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`npm install`)

To start:
- [ ] Terminal 1: `cd backend && source venv/bin/activate && python3 app.py`
- [ ] Terminal 2: `npm run dev`
- [ ] Browser: Open http://localhost:5173

---

## 🎯 What You'll See

### Patient List (Left Panel)
- 7 real patients from Hugging Face dataset
- Search functionality
- Patient demographics

### Vitals Charts (Center)
- Blood Pressure (BP)
- Heart Rate (HR)
- Glucose
- **Oxygen Saturation (SpO2)** ← NEW!

### Risk Assessment
- AI-predicted risk level
- Confidence percentage
- Suggested next steps

### Task Queue (Right Panel)
- Add tasks with priority
- Simple task management
- No department routing (removed as requested)

### Helper Bot (Bottom)
- DeepSeek AI-powered chat
- Ask medical questions
- Context-aware responses

---

## 🎉 You're All Set!

Your Predictive Healthcare Workflow system is now running with:
- ✅ Real patient data from Hugging Face
- ✅ Oxygen saturation monitoring
- ✅ Simplified task management
- ✅ AI-powered chat assistant

**Enjoy exploring the application!** 🏥

