"""
Test script for department routing API
"""
import requests
import json

BASE_URL = 'http://localhost:5000/api'

def test_route(text, description):
    """Test a routing request"""
    print(f"\n{'='*60}")
    print(f"Test: {description}")
    print(f"Input: {text}")
    print('-'*60)
    
    try:
        response = requests.post(
            f'{BASE_URL}/route',
            json={'text': text},
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Department: {result['department']}")
            print(f"   Confidence: {result['confidence']*100:.0f}%")
            print(f"   Auto-routed: {result['auto_routed']}")
            print(f"   Reason: {result['reason']}")
            print(f"   Method: {result['method']}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == '__main__':
    print("🧪 Department Routing API Tests")
    print("="*60)

    # Test 1: Reception - Appointment booking
    test_route(
        "Book appointment for next Tuesday",
        "Appointment booking → Reception"
    )

    # Test 2: Reception - Reschedule
    test_route(
        "Need to reschedule my appointment to next week",
        "Reschedule keyword → Reception"
    )

    # Test 3: Reception - Change date
    test_route(
        "Can we change the appointment date?",
        "Change date → Reception"
    )

    # Test 4: Reception - Cancel appointment
    test_route(
        "Cancel my appointment for tomorrow",
        "Cancel appointment → Reception"
    )

    # Test 5: Endocrinology (rule-based)
    test_route(
        "Order HbA1c test for diabetes patient",
        "Diabetes keyword → Endocrinology"
    )

    # Test 6: Cardiology (rule-based)
    test_route(
        "Patient has chest pain and high blood pressure",
        "Cardiac keywords → Cardiology"
    )

    # Test 7: Dermatology (rule-based)
    test_route(
        "Patient has a rash on their arm",
        "Skin keyword → Dermatology"
    )

    # Test 8: Pediatrics (rule-based)
    test_route(
        "Schedule vaccination for infant",
        "Child keyword → Pediatrics"
    )

    # Test 9: Admin/Billing (rule-based)
    test_route(
        "Patient needs help with insurance payment",
        "Payment keyword → Admin/Billing"
    )

    # Test 10: Ambiguous case (should use DeepSeek)
    test_route(
        "Patient feels unwell",
        "Ambiguous → Should go to Triage"
    )

    # Test 11: Glucose monitoring (Endocrinology)
    test_route(
        "Patient needs glucose monitoring",
        "Glucose keyword → Endocrinology"
    )

    print("\n" + "="*60)
    print("✅ Tests complete!")

