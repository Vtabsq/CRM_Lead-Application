import requests
import json

BASE_URL = "http://localhost:8000"

def test_view_admissions():
    print("Testing View Patient Admissions Endpoint...")
    url = f"{BASE_URL}/patient-admission/view"
    
    try:
        resp = requests.get(url)
        print(f"GET {url}")
        print(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            print(f"Status Field: {data.get('status')}")
            print(f"Total Records: {data.get('total')}")
            
            records = data.get('data', [])
            if records:
                print(f"First Record Sample: {records[0]}")
            else:
                print("No records returned (Sheet might be empty).")
                
            if data.get('status') == 'success':
                print("[OK] SUCCESS: View endpoint operational.")
            else:
                print("[WARN] Status not success.")
        else:
            print(f"[FAIL] Error Code: {resp.status_code}")
            print(f"Response: {resp.text}")

    except Exception as e:
        print(f"[ERROR] Exception: {e}")

if __name__ == "__main__":
    test_view_admissions()
