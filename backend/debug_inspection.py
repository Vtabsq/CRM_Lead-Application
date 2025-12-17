
import sys
import os
import json
from google.oauth2.service_account import Credentials
import gspread

# Add backend to path
sys.path.append(os.getcwd())
try:
    from main import normalize_field_name, CREDENTIALS_FILE, GOOGLE_SHEET_ID, GOOGLE_SHEET_NAME
except ImportError as e:
    print(f"ImportError: {e}")
    sys.exit(1)

def inspect_sheet1():
    print("--- Inspecting Sheet1 ---")
    
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
    client = gspread.authorize(creds)
    
    print(f"Opening Spreadsheet... (ID: {GOOGLE_SHEET_ID or 'ByName'})")
    if GOOGLE_SHEET_ID:
        spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
    else:
        spreadsheet = client.open(GOOGLE_SHEET_NAME)
             
    sheet = spreadsheet.worksheet("Sheet1")

    # 1. Headers
    headers = sheet.row_values(1)
    print(f"Raw Headers ({len(headers)}): {headers}")
    
    headers_norm = [normalize_field_name(h) for h in headers]
    print(f"Norm Headers: {headers_norm}")
    
    # 2. Find MemberID Col
    id_keys = ["memberidkey", "member id", "member_id", "memberid", "mid", "memberidkey", "patientid", "id"]
    id_col_idx = -1
    
    for idx, h_norm in enumerate(headers_norm):
        if h_norm in [normalize_field_name(ik) for ik in id_keys]:
            id_col_idx = idx
            print(f"Found MemberID match at Index {idx} (Column {idx+1}): '{headers[idx]}' maps to '{h_norm}'")
            # Don't break, see if there are multiple
            # break 
            
    if id_col_idx != -1:
        # Inspect Values in that column
        print(f"Reading Column {id_col_idx+1} values...")
        col_vals = sheet.col_values(id_col_idx + 1)
        print(f"Column Values ({len(col_vals)}): {col_vals}")
        
        test_val = "DEBUG-FIXED-ID-123"
        if test_val in [str(x).strip() for x in col_vals]:
            print(f"SUCCESS: Found '{test_val}' in column!")
        else:
            print(f"FAILURE: '{test_val}' NOT found in column.")
            
    else:
        print("FAILURE: No MemberID column found!")

if __name__ == "__main__":
    inspect_sheet1()
