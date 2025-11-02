"""
Flask Backend for Predictive Healthcare Workflow System
Provides department routing with two-layer classification:
1. Rule-based keyword matching (fast, high confidence for known patterns)
2. DeepSeek AI fallback (handles ambiguous cases)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import os
from openai import OpenAI

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# DeepSeek API configuration
DEEPSEEK_API_KEY = 'sk-34c1116b28e24ad4add008420062d489'
client = OpenAI(
    api_key=DEEPSEEK_API_KEY,
    base_url='https://api.deepseek.com'
)

# ============================================================================
# RULE-BASED DEPARTMENT CLASSIFICATION
# ============================================================================
# Each department has keywords and patterns that trigger high-confidence routing
# Confidence is based on keyword match strength and specificity

DEPARTMENT_RULES = {
    'Reception': {
        'keywords': [
            r'\b(appointment|schedule|reschedule|book|booking|cancel|'
            r'change date|change time|postpone|move appointment|'
            r'appointment time|appointment date|reception|front desk|'
            r'check.?in|registration|register)\b'
        ],
        'confidence': 0.9  # High confidence for appointment-related tasks
    },
    'Cardiology': {
        'keywords': [
            r'\b(heart|cardiac|cardio|blood pressure|bp|hypertension|chest pain|'
            r'arrhythmia|ecg|ekg|palpitation|angina|coronary|stroke|cvd)\b'
        ],
        'confidence': 0.85
    },
    'Endocrinology': {
        'keywords': [
            r'\b(diabetes|diabetic|glucose|blood sugar|insulin|hba1c|thyroid|'
            r'hormone|endocrine|metabolic|pancreas|glycemic)\b'
        ],
        'confidence': 0.85
    },
    'Dermatology': {
        'keywords': [
            r'\b(skin|rash|derma|eczema|psoriasis|acne|melanoma|mole|lesion|'
            r'itching|hives|dermatitis)\b'
        ],
        'confidence': 0.85
    },
    'Pediatrics': {
        'keywords': [
            r'\b(child|children|pediatric|infant|baby|newborn|vaccination|'
            r'growth|development|adolescent)\b'
        ],
        'confidence': 0.85
    },
    'Admin/Billing': {
        'keywords': [
            r'\b(bill|billing|payment|insurance|claim|invoice|cost|charge|'
            r'financial|refund|copay|deductible)\b'
        ],
        'confidence': 0.85
    }
}

def rule_based_classification(text):
    """
    Rule-based classifier using regex keyword matching.
    
    How it works:
    - Converts text to lowercase for case-insensitive matching
    - Checks each department's keyword patterns
    - Returns first match with predefined confidence (0.85)
    - Falls back to 'General' with low confidence (0.5) if no match
    
    Args:
        text (str): Input text to classify
        
    Returns:
        dict: {department, confidence, reason, method}
    """
    text_lower = text.lower()
    
    for department, rules in DEPARTMENT_RULES.items():
        for pattern in rules['keywords']:
            if re.search(pattern, text_lower, re.IGNORECASE):
                matched_terms = re.findall(pattern, text_lower, re.IGNORECASE)
                return {
                    'department': department,
                    'confidence': rules['confidence'],
                    'reason': f"Matched keywords: {', '.join(set(matched_terms))}",
                    'method': 'rule-based'
                }
    
    # No rule matched - return General with low confidence
    return {
        'department': 'General',
        'confidence': 0.5,
        'reason': 'No specific keywords matched',
        'method': 'rule-based'
    }


def deepseek_classification(text):
    """
    DeepSeek AI-based classifier for ambiguous cases.
    
    How it works:
    - Sends text to DeepSeek with strict JSON output instructions
    - Model chooses from predefined department list
    - Returns structured response with department, confidence, and reasoning
    - Handles API errors gracefully with fallback to General
    
    Prompt engineering:
    - Instructs model to return ONLY valid JSON
    - Limits departments to specific list
    - Requests confidence score and reasoning
    - Emphasizes no medical advice (routing only)
    
    Args:
        text (str): Input text to classify
        
    Returns:
        dict: {department, confidence, reason, method}
    """
    try:
        system_prompt = """You are a hospital department router. Choose exactly one department from this list:
[General, Reception, Cardiology, Endocrinology, Dermatology, Pediatrics, Admin/Billing]

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{"department": "DepartmentName", "confidence": 0.85, "reason": "brief explanation"}

Rules:
- confidence must be a number between 0 and 1
- If unsure, pick General with confidence ≤ 0.6
- This is for routing only, not medical advice
- Be concise in reason (max 10 words)
- Reception handles: appointments, scheduling, booking, date changes, cancellations
- Admin/Billing handles: payments, insurance, billing, financial matters"""

        response = client.chat.completions.create(
            model='deepseek-chat',
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': f'Route this to a department: {text}'}
            ],
            temperature=0.3,  # Lower temperature for more consistent routing
            max_tokens=150
        )
        
        result_text = response.choices[0].message.content.strip()
        
        # Parse JSON response
        import json
        # Remove markdown code blocks if present
        result_text = re.sub(r'```json\s*|\s*```', '', result_text)
        result = json.loads(result_text)
        
        return {
            'department': result.get('department', 'General'),
            'confidence': float(result.get('confidence', 0.5)),
            'reason': result.get('reason', 'AI classification'),
            'method': 'deepseek-ai'
        }
        
    except Exception as e:
        # Fallback on any error
        return {
            'department': 'General',
            'confidence': 0.4,
            'reason': f'AI classification failed: {str(e)[:50]}',
            'method': 'deepseek-ai-error'
        }


# ============================================================================
# ROUTING ENDPOINT
# ============================================================================

@app.route('/api/route', methods=['POST'])
def route_department():
    """
    Main routing endpoint with two-layer classification.
    
    Decision Logic:
    1. Try rule-based classification first (fast, deterministic)
    2. If rule confidence < 0.8, try DeepSeek AI classification
    3. Use whichever has higher confidence
    4. Apply auto-routing threshold (0.8):
       - confidence ≥ 0.8 → auto_routed = true (send to department)
       - confidence < 0.8 → auto_routed = false (send to "Needs Triage")
    
    This two-layer approach balances speed and accuracy:
    - Common cases (glucose, heart, etc.) route instantly via rules
    - Ambiguous cases get AI analysis
    - Low-confidence cases go to human triage
    
    Request JSON:
        {"text": "Patient needs glucose monitoring"}
        
    Response JSON:
        {
            "department": "Endocrinology",
            "confidence": 0.85,
            "reason": "Matched keywords: glucose",
            "auto_routed": true,
            "method": "rule-based"
        }
    """
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({
                'error': 'No text provided',
                'department': 'General',
                'confidence': 0.0,
                'auto_routed': False
            }), 400
        
        # Layer 1: Rule-based classification
        rule_result = rule_based_classification(text)
        
        # Layer 2: If rule confidence is low, try DeepSeek
        if rule_result['confidence'] < 0.8:
            ai_result = deepseek_classification(text)
            
            # Use whichever has higher confidence
            if ai_result['confidence'] > rule_result['confidence']:
                final_result = ai_result
            else:
                final_result = rule_result
        else:
            final_result = rule_result
        
        # Apply auto-routing threshold (0.8)
        # This is where the confidence threshold is applied:
        # - High confidence (≥0.8) → auto-route to department
        # - Low confidence (<0.8) → send to triage for human review
        auto_routed = final_result['confidence'] >= 0.8
        
        return jsonify({
            'department': final_result['department'],
            'confidence': round(final_result['confidence'], 2),
            'reason': final_result['reason'],
            'auto_routed': auto_routed,
            'method': final_result['method']
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'department': 'General',
            'confidence': 0.0,
            'auto_routed': False
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'department-routing'})


if __name__ == '__main__':
    print("🏥 Department Routing Service Starting...")
    print("📍 Endpoints:")
    print("   POST /api/route - Route text to department")
    print("   GET  /api/health - Health check")
    print("\n🔧 Configuration:")
    print(f"   Departments: {', '.join(DEPARTMENT_RULES.keys())}, General")
    print(f"   Auto-routing threshold: ≥0.8 confidence")
    print(f"   DeepSeek API: {'Configured' if DEEPSEEK_API_KEY else 'Missing'}")
    print("\n📋 Special Routing:")
    print("   Reception: Appointments, scheduling, booking, date changes")
    print("   Admin/Billing: Payments, insurance, billing, financial matters")
    print("\n🚀 Starting server on http://localhost:5001")
    app.run(debug=True, port=5001)

