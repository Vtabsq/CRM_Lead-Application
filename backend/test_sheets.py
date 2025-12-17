import gspread
from google.oauth2.service_account import Credentials

CREDENTIALS_FILE = "google_credentials.json"
GOOGLE_SHEET_ID = "1L4jwfA2R_MjT3kSsof93U3V-DKaM4zemGdKeCq2fy9Y"

scope = [
    'https://spreadsheets.google.com/feeds',
    'https://www.googleapis.com/auth/drive'
]

try:
    creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
    client = gspread.authorize(creds)
    spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
    
    print("✅ Connected to Google Sheets successfully!")
    print(f"Spreadsheet title: {spreadsheet.title}")
    print("\nAvailable worksheets:")
    
    for ws in spreadsheet.worksheets():
        print(f"  - {ws.title} ({ws.row_count} rows, {ws.col_count} cols)")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
