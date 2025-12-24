"""
Test creating a new home care client to see the actual error
"""
import requests
import json

print("="*70)
print("TEST: CREATE NEW HOME CARE CLIENT")
print("="*70)

# Test data
client_data = {
    "patient_name": "Test Patient",
    "gender": "Male",
    "age": "45",
    "pain_point": "Test diagnosis",
    "location": "Test Location",
    "service_started_on": "2025-12-23",
    "service_type": "Home Care",
    "home_care_revenue": 50000,
    "additional_nursing_charges": 0,
    "discount": 0,
    "shift": "Regular",
    "active_inactive": "ACTIVE"
}

print("\nSending request to create client...")
print(f"Data: {json.dumps(client_data, indent=2)}")

try:
    response = requests.post(
        "http://localhost:8000/api/homecare/clients",
        json=client_data
    )
    
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("\n✓ SUCCESS: Client created")
    else:
        print("\n✗ FAILED: Could not create client")
        
except Exception as e:
    print(f"\n✗ ERROR: {e}")
    import traceback
    traceback.print_exc()
