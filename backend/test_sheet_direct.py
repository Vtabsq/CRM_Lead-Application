import gspread
from google.oauth2.service_account import Credentials

# Configuration - use the ID we saw from the file
CREDENTIALS_FILE = "google_credentials.json"
GOOGLE_SHEET_ID = "1L4jwfA2R_MjT3kSsof93U3V-DKaM4zemGdKeCq2fy9Y"  # From google_sheet_id.txt

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
            print(f"    - {col}: '{value}' (type: {type(value).__name__}, is None: {value is None})")
        
        # Print Patient Name
        patient_name = record.get("Patient Name", "")
        print(f"  Patient Name: '{patient_name}'")
