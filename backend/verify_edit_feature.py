import requests
import json
import time

BASE_URL = "http://localhost:8000"

def verify_edit_feature():
    print("Verifying Edit Feature...")
    
    # 1. Search to check for _row_index
    print("Step 1: Search and check for row index...")
    search_payload = {
        "date": "",
        "name": "", 
        "memberId": ""
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/search", json=search_payload)
        data = resp.json()
        
        if data.get("status") == "success":
            results = data.get("data", [])
            if results:
                first_row = results[0]
                if "_row_index" in first_row:
                    print(f"SUCCESS: Found _row_index in search results: {first_row['_row_index']}")
                    
                    # 2. Test Update (Read-only / No-op test effectively, or just minimal update)
                    # We don't want to corrupt data, so we'll just update with SAME data
                    print("Step 2: Testing /update_row with same data...")
                    
                    row_idx = first_row['_row_index']
                    # Use existing data to update
                    update_payload = {
                        "row_index": row_idx,
                        "data": first_row
                    }
                    
                    # Ensure we don't send internal fields back if backend doesn't filter them?
                    # Backend uses headers to filter, so extra keys in payload might be ignored or used if header matches.
                    # _row_index is not in headers, so safe.
                    
                    upd_resp = requests.post(f"{BASE_URL}/update_row", json=update_payload)
                    print(f"Update Response: {upd_resp.json()}")
                    
                    if upd_resp.status_code == 200 and upd_resp.json().get("status") == "success":
                         print("SUCCESS: Row updated successfully (dry run).")
                    else:
                         print("FAILURE: Update failed.")
                else:
                    print("FAILURE: _row_index NOT found in search results.")
            else:
                print("WARNING: No data found in sheet to verify row index.")
        else:
            print("FAILURE: Search failed.")
            print(data)
            
    except Exception as e:
        print(f"Exception during verification: {e}")

if __name__ == "__main__":
    verify_edit_feature()
