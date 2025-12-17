import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_admission_sync():
    print("Testing Admission Sync...")
    
    # 1. Submit Admission
    payload = {
        "memberId": "TEST-MEM-001",
        "firstName": "TestPrimary",  # Should merge to patient_name
        "Patient Name": "TestMergedName", # Conflict! Should pick this one.
        "email": "test@example.com",
        "phone": "9998887776",
        "roomRent": 1000,
        "admissionDays": 5,
        "bedCharges": 5000,
        "consultationFee": 500,
        "registrationFee": 100,
        "medicationCharges": 200,
        "miscellaneousCharges": 50,
        "totalAmount": 5850,
        "checkInDate": "2023-10-27",
        "roomType": "General",
        # Normalized field check
        "Emergency Name": "Emerg Contact", # Should normalize to emergencyname
        "Conditions": ["Diabetes", "Other"], # Should normalize to conditions
        "Surgeries": "None" # Should normalize to surgeries -> patientsugarlevel (mapped in frontend?) NO.
        # In frontend, 'patient_sugar_level': formData.surgeries.
        # So we should send 'patient_sugar_level' if we mimic frontend.
        # But if we send 'Surgeries', backend normalizes to 'surgeries'.
        # And Schema has 'surgeries' (Past Surgeries).
        # So it should work if Schema has 'surgeries'.
    }
    
    # Add mapped keys as Frontend does
    frontend_payload = {
        "data": { # Wrapped in "data"
            **payload,
            "patient_name": "TestPrimary", # Explicit mapping
            "patient_sugar_level": "None (Surgeries)",
            "Patient Name": "TestMergedName" # Conflict
        }
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/admission/register", json=frontend_payload)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")
        
        if resp.status_code == 200:
            print("SUCCESS: Admission Registered")
            print("Verify manually in sheets: 'TestMergedName' in 'patient_name' column.")
            print("Verify 'Room Rent' = 1000 in 'roomrent' column.")
        else:
            print("FAILURE")
            
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_admission_sync()
