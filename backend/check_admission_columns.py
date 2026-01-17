"""
Debug: Check exact column names in CRM Admission Sheet1
"""
import gspread
from google.oauth2.service_account import Credentials
import os
from dotenv import load_dotenv

load_dotenv()

CREDENTIALS_FILE = os.getenv("CREDENTIALS_FILE", "google_credentials.json")
PATIENT_ADMISSION_SHEET_ID = os.getenv("PATIENT_ADMISSION_SHEET_ID")

def get_client():
    scope = [
        'https://spreadsheets.google.com/feeds',
        'https://www.googleapis.com/auth/drive'
    ]
    creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
    return gspread.authorize(creds)

client = get_client()

print("="*80)
print("CRM ADMISSION - Sheet1 Column Names")
print("="*80)

spreadsheet = client.open_by_key(PATIENT_ADMISSION_SHEET_ID)
worksheet = spreadsheet.worksheet("Sheet1")

headers = worksheet.row_values(1)

print(f"\nTotal columns: {len(headers)}\n")

# Print all headers with index
for i, header in enumerate(headers):
    print(f"{i:3d}. '{header}'")

# Check for date-related columns
print("\n" + "="*80)
print("DATE-RELATED COLUMNS:")
print("="*80)
for i, header in enumerate(headers):
    if "date" in header.lower() or "check" in header.lower():
        print(f"{i:3d}. '{header}'")

# Get first data row to see format
print("\n" + "="*80)
print("FIRST DATA ROW (for reference):")
print("="*80)
all_values = worksheet.get_all_values()
if len(all_values) > 1:
    first_row = all_values[1]
    for i, header in enumerate(headers):
        if "date" in header.lower() or "check" in header.lower() or "member" in header.lower() or "patient" in header.lower():
            value = first_row[i] if i < len(first_row) else ""
            print(f"  {header}: '{value}'")
