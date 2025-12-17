import requests
import json

BASE_URL = "http://localhost:8000"

def check_headers():
    print("--- Checking /get_sheet_headers ---")
    try:
        res = requests.get(f"{BASE_URL}/get_sheet_headers")
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            fields = res.json().get('fields', [])
            names = [f['name'] for f in fields]
            print(f"Fields found: {names[:5]}...")
            if "Date" in names:
                print("SUCCESS: Found 'Date' column.")
                return True
            else:
                print("WARNING: 'Date' column not found in headers.")
        else:
            print(f"ERROR: Endpoint returned {res.status_code}. (Likely server not restarted)")
    except Exception as e:
        print(f"Connection Failed: {e}")
    return False

def check_preview():
    print("\n--- Checking /delete/preview ---")
    # Try with "Date" (assuming headers check passed or we force it)
    payload = {
        "filters": {"startDate": "2025-12-01", "endDate": "2025-12-31"},
        "date_column": "Date",
        "preview_columns": ["Member ID key", "Date"]
    }
    try:
        res = requests.post(f"{BASE_URL}/delete/preview", json=payload)
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            count = data.get('count', 0)
            print(f"Matches count: {count}")
            if count > 0:
                print("SUCCESS: Found matches.")
                print(f"Sample: {data['rows'][:1]}")
            else:
                print("FAILURE: 0 matches found.")
                if 'debug_info' in data:
                    print(f"DEBUG INFO: {json.dumps(data['debug_info'], indent=2)}")
                else:
                    print("DEBUG INFO NOT FOUND (Server likely not restarted).")
                print(f"Response data (partial): {str(data)[:200]}...")
        else:
            print(f"Error Response: {res.text}")
            
            # Retry with lowercase "date" if 400
            if res.status_code == 500 or res.status_code == 400:
                print("Retrying with 'date'...")
                payload["date_column"] = "date"
                res = requests.post(f"{BASE_URL}/delete/preview", json=payload)
                print(f"Retry Status: {res.status_code}")
                print(f"Retry Response: {res.text}")

    except Exception as e:
        print(f"Request Failed: {e}")

if __name__ == "__main__":
    if check_headers():
        check_preview()
    else:
        print("\nSkipping preview test because headers endpoint failed.")
