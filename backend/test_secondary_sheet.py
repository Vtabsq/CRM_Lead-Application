import requests
import json
import os

BASE_URL = "http://localhost:8000"

def test_secondary_sheet_save():
    print("Testing Secondary Patient Admission Save Endpoint...")
    
    # Payload similar to what frontend usually sends
    payload = {
        "data": {
            "MemberKey": "TEST-SEC-001",
            "firstName": "Secondary",
            "lastName": "User",
            "age": "45",
            "gender": "Male",
            "mobile_number": "9988776655",
            "email": "secondary@test.com",
            # Address
            "door_num": "456",
            "street": "Secondary St",
            "city": "Test City",
            "pincode": "600002",
            # Clinical
            "patient_sugar_level": "None",
            "conditions": ["Hypertension"],
            "admissionDays": 10,
            # Timestamp check
            # We don't send timestamp, backend adds it if header exists
        }
    }
    
    try:
        url = f"{BASE_URL}/patient-admission/save"
        print(f"POST {url}")
        resp = requests.post(url, json=payload)
        
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")
        
        if resp.status_code == 200:
            print("[OK] SUCCESS: Data sent to secondary sheet endpoint.")
            data = resp.json()
            if data.get("status") == "success":
                print(f"Backend Message: {data.get('message')}")
                print(f"Sheet URL: {data.get('details', {}).get('sheet_url')}")
            else:
                print("[WARN] Endpoint returned 200 but status was not success.")
        else:
            print("[FAIL] FAILURE: Endpoint returned error.")
            
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_secondary_sheet_save()
