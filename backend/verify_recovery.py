
import sys
import os
from google.oauth2.service_account import Credentials
import gspread

# Add backend to path
sys.path.append(os.getcwd())
try:
    from main import CREDENTIALS_FILE, GOOGLE_SHEET_ID, GOOGLE_SHEET_NAME, normalize_field_name
except ImportError:
    pass

def check_sheet_status():
    print("--- Checking Sheet Status ---")
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
    client = gspread.authorize(creds)
    
    if GOOGLE_SHEET_ID:
        ss = client.open_by_key(GOOGLE_SHEET_ID)
    else:
        ss = client.open(GOOGLE_SHEET_NAME)
        
    try:
        sheet = ss.worksheet("Sheet1")
        print("Sheet1 EXISTS.")
        print(f"Dimensions: {sheet.row_count} rows x {sheet.col_count} cols")
        headers = sheet.row_values(1)
        print(f"Headers ({len(headers)}): {headers}")
        
        if not headers:
            print("Sheet1 is EMPTY. Attempting to write CLEAN standard headers...")
            # Write only essential headers to start fresh/compact
            standard_headers = [
                "MemberidKey", "patient_name", "patient_blood", "gender", "mobilenumber", "emailid", 
                "admissiondate", "Timestamp"
            ]
            try:
                sheet.resize(rows=100, cols=20) # Shrink it to save space!
                sheet.update('1:1', [standard_headers])
                print("SUCCESS: Clean headers written.")
            except Exception as e:
                print(f"FAILED to write headers: {e}")
                
    except gspread.WorksheetNotFound:
        print("Sheet1 DOES NOT EXIST.")

if __name__ == "__main__":
    check_sheet_status()
