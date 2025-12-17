
import sys
import os
import json
from datetime import datetime

# We are in backend/ so main is directly importable
try:
    from main import upsert_to_sheet, normalize_field_name, GOOGLE_SHEET_NAME
except ImportError as e:
    print(f"ImportError: {e}")
    sys.exit(1)

def test_sheet1_write():
    print("--- Starting Debug for Sheet1 Write ---")
    
    # 1. Inspect Headers
    from google.oauth2.service_account import Credentials
    from main import CREDENTIALS_FILE, GOOGLE_SHEET_ID, GOOGLE_SHEET_NAME
    
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
    
    import gspread
    client = gspread.authorize(creds)
    
    print(f"Opening Spreadsheet... (ID: {GOOGLE_SHEET_ID or 'ByName'})")
    if GOOGLE_SHEET_ID:
        spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
    else:
        spreadsheet = client.open(GOOGLE_SHEET_NAME)
        
    sheet = spreadsheet.worksheet("Sheet1")
    print(f"Sheet1 Headers: {sheet.row_values(1)}")
    
    # 2. Test Append
    test_id = "DEBUG-FIXED-ID-V2"
    print(f"\nUsing Test ID: {test_id}")
    
    payload = {
        "MemberidKey": test_id,
        "patient_name": "Debug User Initial",
        "patient_blood": "A+",
        "debug_timestamp": str(datetime.now())
    }
    
    print("1. Attempting APPEND (or Update if exists)...")
    res1 = upsert_to_sheet("Sheet1", payload, "admission")
    print(f"Result 1: {res1['action']}")
    
    # 3. Test Update
    print("\n2. Attempting UPDATE (Changing Name)...")
    payload["patient_name"] = "Debug User UPDATED"
    payload["patient_new_field"] = "Verify Column Creation" # Add new col
    
    res2 = upsert_to_sheet("Sheet1", payload, "admission")
    print(f"Result 2: {res2['action']}")
    
    # Verify Content
    updated_vals = sheet.get_all_records()
    found = next((r for r in updated_vals if r.get('MemberidKey') == test_id or r.get('memberidkey') == test_id), None)
    if found:
        print("\nVerifying Data in Sheet:")
        print(f"Name: {found.get('patient_name') or found.get('patientname') or found.get('Patient Name')}")
        print(f"New Field: {found.get('patient_new_field') or found.get('patientnewfield')}")
    else:
        print("\nERROR: Row not found in sheet after operations!")

if __name__ == "__main__":
    test_sheet1_write()
