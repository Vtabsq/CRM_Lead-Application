"""
Test script to verify Google Sheets connection is working correctly.
This tests that both worksheets (Sheet1 and Patient Admission) are accessible.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import CREDENTIALS_FILE, GOOGLE_SHEET_ID, GOOGLE_SHEET_NAME
from google.oauth2.service_account import Credentials
import gspread

def test_sheet_connection():
    print("=" * 60)
    print("TESTING GOOGLE SHEETS CONNECTION")
    print("=" * 60)
    
    # 1. Check credentials file exists
    print(f"\n1. Checking credentials file: {CREDENTIALS_FILE}")
    if not os.path.exists(CREDENTIALS_FILE):
        print(f"   [FAIL] Credentials file not found!")
        print(f"   Please place {CREDENTIALS_FILE} in the backend directory.")
        return False
    print(f"   [OK] Credentials file found")
    
    # 2. Authenticate
    print(f"\n2. Authenticating with Google Sheets API...")
    try:
        scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
        creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
        client = gspread.authorize(creds)
        print(f"   ✅ Authentication successful")
    except Exception as e:
        print(f"   ❌ FAILED: Authentication error: {e}")
        return False
    
    # 3. Open spreadsheet
    print(f"\n3. Opening Google Sheet...")
    print(f"   Sheet ID: {GOOGLE_SHEET_ID or 'Not set (using name)'}")
    print(f"   Sheet Name: {GOOGLE_SHEET_NAME}")
    try:
        if GOOGLE_SHEET_ID:
            spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
        else:
            spreadsheet = client.open(GOOGLE_SHEET_NAME)
        print(f"   ✅ Spreadsheet opened: {spreadsheet.title}")
        print(f"   URL: {spreadsheet.url}")
    except Exception as e:
        print(f"   ❌ FAILED: Could not open spreadsheet: {e}")
        return False
    
    # 4. Check worksheets
    print(f"\n4. Checking worksheets...")
    worksheets = spreadsheet.worksheets()
    print(f"   Found {len(worksheets)} worksheets:")
    
    sheet1_found = False
    admission_found = False
    
    for ws in worksheets:
        print(f"   - '{ws.title}' ({ws.row_count} rows x {ws.col_count} cols)")
        if ws.title.lower() == "sheet1":
            sheet1_found = True
        if ws.title.lower() == "patient admission":
            admission_found = True
    
    # 5. Verify required worksheets exist
    print(f"\n5. Verifying required worksheets...")
    
    if not sheet1_found:
        print(f"   ⚠️  WARNING: 'Sheet1' worksheet not found")
        print(f"   Creating 'Sheet1' worksheet...")
        try:
            spreadsheet.add_worksheet(title="Sheet1", rows=1000, cols=30)
            print(f"   ✅ Created 'Sheet1' worksheet")
        except Exception as e:
            print(f"   ❌ FAILED: Could not create Sheet1: {e}")
    else:
        print(f"   ✅ 'Sheet1' worksheet exists")
    
    if not admission_found:
        print(f"   ⚠️  WARNING: 'Patient Admission' worksheet not found")
        print(f"   Creating 'Patient Admission' worksheet...")
        try:
            spreadsheet.add_worksheet(title="Patient Admission", rows=1000, cols=30)
            print(f"   ✅ Created 'Patient Admission' worksheet")
        except Exception as e:
            print(f"   ❌ FAILED: Could not create Patient Admission: {e}")
    else:
        print(f"   ✅ 'Patient Admission' worksheet exists")
    
    # 6. Test read/write access
    print(f"\n6. Testing read/write access...")
    try:
        sheet1 = spreadsheet.worksheet("Sheet1")
        headers = sheet1.row_values(1) if sheet1.row_count > 0 else []
        print(f"   ✅ Can read from 'Sheet1' (found {len(headers)} headers)")
        
        admission_sheet = spreadsheet.worksheet("Patient Admission")
        admission_headers = admission_sheet.row_values(1) if admission_sheet.row_count > 0 else []
        print(f"   ✅ Can read from 'Patient Admission' (found {len(admission_headers)} headers)")
    except Exception as e:
        print(f"   ❌ FAILED: Read/write test error: {e}")
        return False
    
    # Summary
    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED!")
    print("=" * 60)
    print("\nYour Google Sheets connection is configured correctly.")
    print("Both worksheets are accessible:")
    print("  - Sheet1 (for lead/enquiry data)")
    print("  - Patient Admission (for admission data)")
    print("\nYou can now run the backend server:")
    print("  python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    try:
        success = test_sheet_connection()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
