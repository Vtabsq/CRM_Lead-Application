import sys
import os
import requests
import time
import datetime

# Ensure we can import from backend
sys.path.append(os.path.join(os.getcwd(), 'backend'))
try:
    # Try importing directly if setting up environment is tricky, 
    # but easier to just use `requests` against running server.
    # However, to initialize sheets without running server for "ensure_bed_sheets_google", 
    # we might want to import it. 
    # Let's rely on the API.
    pass
except ImportError:
    pass

API_URL = "http://localhost:8000"

def test_google_sheet_integration():
    print(f"Testing against {API_URL}...")
    
    # 1. Fetch Beds (This should trigger sheet creation)
    print("\n1. Fetching Beds (should init sheets)...")
    try:
        resp = requests.get(f"{API_URL}/api/beds")
        resp.raise_for_status()
        data = resp.json()
        beds = data.get("beds", [])
        print(f"[OK] Success. Found {len(beds)} beds.")
        
        # Verify default rooms exist
        single_rooms = [b for b in beds if b['room_type'] == 'Single']
        twin_rooms = [b for b in beds if b['room_type'] == 'Twin']
        print(f"   Single Rooms: {len(single_rooms)} (Expected 5)")
        print(f"   Twin Beds: {len(twin_rooms)} (Expected 10)")
        
        if len(single_rooms) < 5:
            print("[X] Error: Default single rooms not initialized properly.")
            return
            
    except Exception as e:
        print(f"[X] Error fetching beds: {e}")
        return

    # 2. Allocate Bed
    print("\n2. Allocating Bed 101...")
    payload = {
        "patient_name": "Test Patient Google",
        "member_id": "MEM-GOOGLE-001",
        "gender": "Male",
        "room_no": "101",
        "bed_index": 0,
        "room_type": "Single",
        "admission_date": datetime.date.today().isoformat(),
        "pain_point": "Testing Integration"
    }
    try:
        resp = requests.post(f"{API_URL}/api/beds/allocate", json=payload)
        resp.raise_for_status()
        print(f"[OK] Bed allocated: {resp.json()}")
    except Exception as e:
        print(f"[X] Error allocating bed: {e}")
        # Print detailed error if available
        if hasattr(e, 'response') and e.response:
            print(f"   Details: {e.response.text}")
        return

    # 3. Verify Allocation
    print("\n3. Verifying Allocation Persistence...")
    try:
        resp = requests.get(f"{API_URL}/api/beds")
        beds = resp.json().get("beds", [])
        target = next((b for b in beds if str(b['room_no']) == "101"), None)
        if target and target['status'] == 'Occupied' and target['patient_name'] == "Test Patient Google":
            print(f"[OK] Verified: Bed 101 is Occupied by {target['patient_name']}")
        else:
            print(f"[X] Verification Failed. Bed state: {target}")
    except Exception as e:
        print(f"[X] Error verifying: {e}")

    # 4. Log Complaint
    print("\n4. Logging Complaint...")
    comp_load = {
        "patient_name": "Test Patient Google",
        "room_no": "101",
        "complaint_type": "Maintenance",
        "description": "Test complaint for google sheet"
    }
    try:
        resp = requests.post(f"{API_URL}/api/complaints", json=comp_load)
        resp.raise_for_status()
        print(f"[OK] Complaint logged: {resp.json()}")
    except Exception as e:
        print(f"[X] Error logging complaint: {e}")

    # 5. Submit Feedback
    print("\n5. Submitting Feedback...")
    feed_load = {
        "patient_name": "Test Patient Google",
        "rating_comfort": 5,
        "rating_cleanliness": 4,
        "rating_staff": 5,
        "comments": "Great service!"
    }
    try:
        resp = requests.post(f"{API_URL}/api/feedback", json=feed_load)
        resp.raise_for_status()
        print(f"[OK] Feedback submitted: {resp.json()}")
    except Exception as e:
        print(f"[X] Error submitting feedback: {e}")

if __name__ == "__main__":
    test_google_sheet_integration()
