import requests
import json
import os

BASE_URL = "http://localhost:8000"

def test_admission_details():
    print("\n--- Testing GET /admission-details ---")
    # Finding a valid ID might be hard without reading sheets.
    # Trying a likely ID pattern or failing gracefully
    member_id = "MID-2025-01-01-1001" # Mock ID
    
    print(f"Searching for {member_id}...")
    try:
        response = requests.get(f"{BASE_URL}/admission-details?member_id={member_id}")
        if response.status_code == 200:
            print("SUCCESS: Found member!")
            print(json.dumps(response.json(), indent=2))
            return response.json(), member_id
        elif response.status_code == 404:
            print("INFO: Member not found (Expected if ID is mock)")
            return None, member_id
        else:
            print(f"ERROR: Status {response.status_code}")
            print(response.text)
            return None, member_id
    except Exception as e:
        print(f"EXCEPTION: {e}")
        return None, member_id

def test_export(member_id, patient_data):
    print("\n--- Testing POST /billing-summary/export ---")
    
    # Mock data if patient_data is None
    if not patient_data:
        patient_data = {
            "Member ID": member_id,
            "Name": "Test Patient",
            "Age": 30,
            "Gender": "Male"
        }
        
    payload = {
        "member_id": member_id,
        "patient_data": patient_data,
        "billing_inputs": {
            "room_charge": 1000,
            "bed_charge": 500,
            "nurse_payment": 200,
            "hospital_payment": 300,
            "doctor_fee": 800,
            "service_charge": 150
        },
        "total_amount": 5000
    }
    
    try:
        response = requests.post(f"{BASE_URL}/billing-summary/export", json=payload)
        if response.status_code == 200:
            print("SUCCESS: Export endpoint responded 200 OK")
            print("Headers:", response.headers)
            content_type = response.headers.get('content-type', '')
            if 'spreadsheet' in content_type or 'excel' in content_type:
                 print("Content-Type looks correct.")
                 
            with open(f"test_billing_{member_id}.xlsx", "wb") as f:
                f.write(response.content)
            print("Saved test_billing.xlsx")
                
        else:
            print(f"ERROR: Status {response.status_code}")
            print(response.text)
    except Exception as e:
         print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    data, mid = test_admission_details()
    test_export(mid, data)
