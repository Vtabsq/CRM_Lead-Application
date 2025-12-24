"""
Simple check - just find the Check In/Out Date column names
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
spreadsheet = client.open_by_key(PATIENT_ADMISSION_SHEET_ID)
worksheet = spreadsheet.worksheet("Sheet1")
headers = worksheet.row_values(1)

print("Looking for Check In/Out Date columns...")
print()

checkin_found = False
checkout_found = False

for i, h in enumerate(headers):
    h_lower = h.lower()
    if "check" in h_lower and "in" in h_lower:
        print(f"CHECK IN column found at index {i}: '{h}'")
        checkin_found = True
    if "check" in h_lower and "out" in h_lower:
        print(f"CHECK OUT column found at index {i}: '{h}'")
        checkout_found = True

if not checkin_found:
    print("WARNING: No 'Check In' column found!")
    print("\nAll columns with 'date':")
    for i, h in enumerate(headers):
        if "date" in h.lower():
            print(f"  {i}: '{h}'")

if not checkout_found:
    print("WARNING: No 'Check Out' column found!")
