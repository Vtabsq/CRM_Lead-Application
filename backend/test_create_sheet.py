import os
from dotenv import load_dotenv
import gspread
from google.oauth2.service_account import Credentials

load_dotenv()

SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
CREDENTIALS_FILE = os.getenv("CREDENTIALS_FILE", "google_credentials.json")
PATIENT_ADMISSION_SHEET_ID = os.getenv("PATIENT_ADMISSION_SHEET_ID")

print(f"Sheet ID: {PATIENT_ADMISSION_SHEET_ID}")
print(f"Credentials: {CREDENTIALS_FILE}")

try:
    creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=SCOPES)
    client = gspread.authorize(creds)
    print("✅ Authorized successfully")
    
    spreadsheet = client.open_by_key(PATIENT_ADMISSION_SHEET_ID)
    print(f"✅ Opened spreadsheet: {spreadsheet.title}")
    
    # Try to get or create worksheet
    try:
        worksheet = spreadsheet.worksheet("Accounts Receivable")
        print(f"⚠️  Sheet 'Accounts Receivable' already exists!")
    except gspread.exceptions.WorksheetNotFound:
        print("Creating new worksheet...")
        worksheet = spreadsheet.add_worksheet(title="Accounts Receivable", rows=1000, cols=50)
        print(f"✅ Created worksheet: {worksheet.title}")
        
        # Add headers
        headers = ["Date", "Invoice Date", "Invoice Ref", "Member ID Key", "Patient ID", "Patient Name"]
        worksheet.update('A1:F1', [headers])
        print("✅ Added headers")
        
except Exception as e:
    print(f"❌ Error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
