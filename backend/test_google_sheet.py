import gspread
from google.oauth2.service_account import Credentials
import os

# Configuration
CREDENTIALS_FILE = "google_credentials.json"
GOOGLE_SHEET_ID = os.getenv("GOOGLE_SHEET_ID")

# Read from .env file if GOOGLE_SHEET_ID not in environment
if not GOOGLE_SHEET_ID:
    try:
        with open("google_sheet_id.txt", "r", encoding="utf-8") as f:
            GOOGLE_SHEET_ID = f.read().strip()
            if not GOOGLE_SHEET_ID:
                print("ERROR: google_sheet_id.txt is empty!")
                exit(1)
    except FileNotFoundError:
        print("ERROR: google_sheet_id.txt not found!")
        exit(1)

print(f"Using Google Sheet ID: {GOOGLE_SHEET_ID}\n")

# Connect to Google Sheets
scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
client = gspread.authorize(creds)

# Open the sheet
spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
sheet = spreadsheet.worksheet("Sheet1")

# Get all records
all_records = sheet.get_all_records()

print(f"Total records: {len(all_records)}\n")

if all_records:
    # Print column names
    print("Column names:")
    for i, col in enumerate(all_records[0].keys(), 1):
        print(f"  {i}. '{col}'")
    
    print("\n" + "="*80)
    print("First 3 records with Member ID and Patient Name columns:")
    print("="*80)
    
    for i, record in enumerate(all_records[:3], 1):
        print(f"\nRecord {i}:")
        
        # Find and print all columns containing 'member' and 'id'
        member_id_cols = [k for k in record.keys() if 'member' in k.lower() and 'id' in k.lower()]
        print(f"  Member ID columns found: {member_id_cols}")
        
        for col in member_id_cols:
            value = record.get(col)
            print(f"    - {col}: '{value}' (type: {type(value).__name__})")
        
        # Print Patient Name
        patient_name = record.get("Patient Name", "")
        print(f"  Patient Name: '{patient_name}'")
