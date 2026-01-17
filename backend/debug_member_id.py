"""
Debug script to check if Member ID is being captured correctly
"""
import requests
import json

print("="*70)
print("DEBUG: PATIENT SEARCH - MEMBER ID CHECK")
print("="*70)

# Test patient search
print("\n1. Testing patient search for 'Arun'...")
try:
    response = requests.get("http://localhost:8000/api/patients/search?q=Arun")
    if response.status_code == 200:
        data = response.json()
        patients = data.get('patients', [])
        
        print(f"   Found {len(patients)} patients")
        
        if patients:
            print("\n   Patient details:")
            for i, patient in enumerate(patients[:3], 1):
                print(f"\n   Patient {i}:")
                print(f"     - patient_name: '{patient.get('patient_name', 'N/A')}'")
                print(f"     - member_id: '{patient.get('member_id', 'N/A')}'")
                print(f"     - display: '{patient.get('display', 'N/A')}'")
        else:
            print("   No patients found")
    else:
        print(f"   ERROR: Status {response.status_code}")
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   ERROR: {e}")

# Test creating a client with Member ID
print("\n" + "="*70)
print("2. Testing client creation with Member ID")
print("="*70)

test_data = {
    "member_id": "TEST123",
    "patient_name": "Test Patient Debug",
    "gender": "Male",
    "age": "50",
    "pain_point": "Test",
    "location": "Test Location",
    "service_started_on": "2025-12-23",
    "home_care_revenue": 50000,
    "additional_nursing_charges": 0,
    "discount": 0,
    "shift": "Regular",
    "active_inactive": "ACTIVE"
}

print(f"\nSending data:")
print(f"  member_id: '{test_data['member_id']}'")
print(f"  patient_name: '{test_data['patient_name']}'")

try:
    response = requests.post(
        "http://localhost:8000/api/homecare/clients",
        json=test_data
    )
    
    print(f"\nResponse Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if response.status_code == 200:
        print("\n✓ Client created - Check CRM_HomeCare sheet for Member ID Key")
    else:
        print("\n✗ Failed to create client")
        
except Exception as e:
    print(f"\n✗ ERROR: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*70)
