"""Quick test to verify Google Sheets connection works"""
import os
import sys
from google.oauth2.service_account import Credentials
import gspread

print("Testing Google Sheets Connection...")
print("-" * 50)

# Check credentials
creds_file = "google_credentials.json"
if not os.path.exists(creds_file):
    print(f"ERROR: {creds_file} not found")
    sys.exit(1)
print(f"[OK] Found {creds_file}")

# Authenticate
try:
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    creds = Credentials.from_service_account_file(creds_file, scopes=scope)
    client = gspread.authorize(creds)
    print("[OK] Authentication successful")
except Exception as e:
    print(f"[ERROR] Authentication failed: {e}")
    sys.exit(1)

# Test CRM Lead Sheet
try:
    sheet_id = "1L4jwfA2R_MjT3kSsof93U3V-DKaM4zemGdKeCq2fy9Y"
    spreadsheet = client.open_by_key(sheet_id)
    print(f"[OK] Opened CRM Lead Sheet: {spreadsheet.title}")
    worksheets = spreadsheet.worksheets()
    print(f"     Found {len(worksheets)} worksheets:")
    for ws in worksheets:
        print(f"     - {ws.title}")
except Exception as e:
    print(f"[ERROR] Cannot access CRM Lead Sheet: {e}")
    print("     Make sure you shared the sheet with:")
    print("     crm-sheets-access@crm-lead-form.iam.gserviceaccount.com")

# Test CRM Admission Sheet
try:
    sheet_id = "13NOTcuCrFDrTVbow0GsWobcX84oGmAkjepOLCDRZKzw"
    spreadsheet = client.open_by_key(sheet_id)
    print(f"[OK] Opened CRM Admission Sheet: {spreadsheet.title}")
    worksheets = spreadsheet.worksheets()
    print(f"     Found {len(worksheets)} worksheets:")
    for ws in worksheets:
        print(f"     - {ws.title}")
except Exception as e:
    print(f"[ERROR] Cannot access CRM Admission Sheet: {e}")
    print("     Make sure you shared the sheet with:")
    print("     crm-sheets-access@crm-lead-form.iam.gserviceaccount.com")

print("-" * 50)
print("Test complete!")
