import requests
import json
import random

BASE_URL = "http://localhost:8000"

def test_billing_save():
    print("Testing Billing Save...")
    
    # 1. Create a dummy member ID or use an existing one?
    # Better to likely use a dummy one, but the backend requires the ID to exist in Sheet1 to Update.
    # So first let's create a dummy lead submission to ensure a row exists.
    
    # Generate random ID
    mid = f"MID-TEST-{random.randint(1000, 9999)}"
    
    # A. Submit Dummy Enquiry
    print(f"1. Creating Dummy Lead: {mid}")
    payload = {
        "User_name": "TestUser", # Not needed for submission but good for context
        "data": {
            "MemberidKey": mid,
            "First Name": "Test",
            "Last Name": "Patient",
            "Phone": "9999988888",
            "Email": "test@example.com",
            "Date": "2025-12-12"
        }
    }
    
    try:
        res = requests.post(f"{BASE_URL}/submit", json=payload)
        if res.status_code == 200:
            print("   -> Lead created successfully")
        else:
            print(f"   -> Failed to create lead: {res.text}")
            return
            
        # B. Check if it exists via search (optional, skip)
        
        # C. Call Billing Save
        print(f"2. Saving Billing for {mid}")
        
        billing_payload = {
            "member_id": mid,
            "billing_data": {
                "room_charge": 1000.0,
                "bed_charge": 500.0,
                "nurse_payment": 200.0,
                "hospital_payment": 300.0,
                "doctor_fee": 1500.0,
                "service_charge": 100.0
            },
            "patient_data": {
                "name": "Test Patient"
            },
            "total_days": 5,
            "grand_total": (2000.0 * 5) + 1600.0 # (1000+500+200+300)*5 + (1500+100) = 2000*5 + 1600 = 11600
        }
        
        res_save = requests.post(f"{BASE_URL}/billing-summary/save", json=billing_payload)
        
        if res_save.status_code == 200:
             print("   -> Billing Save Success:", res_save.json())
        else:
             print(f"   -> Billing Save Failed: {res_save.text}")
             
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_billing_save()
