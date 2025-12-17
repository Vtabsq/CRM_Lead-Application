"""Check raw Google Sheets data to see if Vignesh exists"""
import gspread
from google.oauth2.service_account import Credentials
import os
from dotenv import load_dotenv

load_dotenv()

CREDENTIALS_FILE = os.getenv('CREDENTIALS_FILE', 'google_credentials.json')
GOOGLE_SHEET_NAME = os.getenv('GOOGLE_SHEET_NAME', 'CRM Leads')

# Connect to Google Sheets
scope = [
    'https://spreadsheets.google.com/feeds',
    'https://www.googleapis.com/auth/drive'
]
creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
client = gspread.authorize(creds)

# Open the sheet
spreadsheet = client.open(GOOGLE_SHEET_NAME)
worksheet = spreadsheet.sheet1

# Get all data
all_rows = worksheet.get_all_values()
headers = all_rows[0]
data_rows = all_rows[1:]

print(f"Total rows in sheet: {len(data_rows)}")
print(f"Headers: {headers[:10]}...")

# Find Patient Name column
patient_name_col = None
for i, h in enumerate(headers):
    if 'patient name' in h.lower() or 'name' in h.lower():
        patient_name_col = i
        print(f"\nFound name column at index {i}: '{headers[i]}'")
        break

if patient_name_col is not None:
    print("\nSearching for 'Vignesh' in the sheet...")
    found = False
    for idx, row in enumerate(data_rows):
        if patient_name_col < len(row):
            name = str(row[patient_name_col]).strip()
            if 'vignesh' in name.lower():
                print(f"\n✅ FOUND at row {idx + 2}: {name}")
                print(f"Full row data (first 10 cols): {row[:10]}")
                found = True
                break
    
    if not found:
        print("\n❌ 'Vignesh' NOT FOUND in the sheet")
        print("\nLast 5 names in sheet:")
        for row in data_rows[-5:]:
            if patient_name_col < len(row):
                print(f"  - {row[patient_name_col]}")
else:
    print("Could not find name column!")
