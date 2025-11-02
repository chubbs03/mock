# Department Routing Backend

Flask backend service for automatic department routing in the Predictive Healthcare Workflow system.

## Features

- **Two-Layer Classification**:
  1. Rule-based keyword matching (fast, deterministic)
  2. DeepSeek AI fallback (handles ambiguous cases)

- **Supported Departments**:
  - Cardiology
  - Endocrinology
  - Dermatology
  - Pediatrics
  - Admin/Billing
  - General (fallback)

- **Auto-Routing Logic**:
  - Confidence ≥ 0.8 → Auto-routed to department
  - Confidence < 0.8 → Sent to "Needs Triage" for human review

## Installation

1. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### POST /api/route

Route text to appropriate department.

**Request:**
```json
{
  "text": "Patient needs glucose monitoring"
}
```

**Response:**
```json
{
  "department": "Endocrinology",
  "confidence": 0.85,
  "reason": "Matched keywords: glucose",
  "auto_routed": true,
  "method": "rule-based"
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "department-routing"
}
```

## How Routing Works

### 1. Rule-Based Classification (Layer 1)
- Fast keyword matching using regex patterns
- Each department has predefined keywords
- Returns confidence of 0.85 for matches
- Examples:
  - "glucose" → Endocrinology
  - "heart" → Cardiology
  - "rash" → Dermatology

### 2. DeepSeek AI Classification (Layer 2)
- Activated when rule confidence < 0.8
- Sends text to DeepSeek API with structured prompt
- Returns JSON with department, confidence, and reasoning
- Handles ambiguous or complex cases

### 3. Decision Logic
```python
# Try rule-based first
rule_result = rule_based_classification(text)

# If confidence low, try AI
if rule_result['confidence'] < 0.8:
    ai_result = deepseek_classification(text)
    # Use whichever has higher confidence
    final_result = max(rule_result, ai_result, key=lambda x: x['confidence'])
else:
    final_result = rule_result

# Apply auto-routing threshold
auto_routed = final_result['confidence'] >= 0.8
```

### 4. Confidence Threshold Application
The **0.8 threshold** is applied at the final decision stage:
- **≥ 0.8**: Task is auto-routed to the department (green chip in UI)
- **< 0.8**: Task goes to "Needs Triage" queue (amber chip in UI)

This ensures only high-confidence routing is automated, while uncertain cases get human review.

## Adding New Departments

Edit `DEPARTMENT_RULES` in `app.py`:

```python
DEPARTMENT_RULES = {
    'YourDepartment': {
        'keywords': [
            r'\b(keyword1|keyword2|keyword3)\b'
        ],
        'confidence': 0.85
    }
}
```

Also update the DeepSeek prompt to include the new department in the allowed list.

## Testing

Test the routing endpoint:

```bash
# Test Endocrinology routing
curl -X POST http://localhost:5000/api/route \
  -H "Content-Type: application/json" \
  -d '{"text": "Order HbA1c test for diabetes patient"}'

# Test Cardiology routing
curl -X POST http://localhost:5000/api/route \
  -H "Content-Type: application/json" \
  -d '{"text": "Patient has chest pain and high blood pressure"}'

# Test ambiguous case (should go to triage)
curl -X POST http://localhost:5000/api/route \
  -H "Content-Type: application/json" \
  -d '{"text": "Patient feels unwell"}'
```

## Error Handling

- If DeepSeek API fails, falls back to "General" department with low confidence
- If routing service is unavailable, frontend defaults to "General" department
- All errors are logged to console for debugging

