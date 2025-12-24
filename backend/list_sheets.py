"""
Simple check - just list all worksheets in both sheets
"""
import gspread
from google.oauth2.service_account import Credentials
import os
from dotenv import load_dotenv

load_dotenv()

CREDENTIALS_FILE = os.getenv("CREDENTIALS_FILE", "google_credentials.json")
GOOGLE_SHEET_ID = os.getenv("GOOGLE_SHEET_ID")
PATIENT_ADMISSION_SHEET_ID = os.getenv("PATIENT_ADMISSION_SHEET_ID")

def get_client():
    scope = [
        'https://spreadsheets.google.com/feeds',
        'https://www.googleapis.com/auth/drive'
    ]
    creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
    return gspread.authorize(creds)

client = get_client()

print("CRM LEADS SHEET TABS:")
if GOOGLE_SHEET_ID:
    ss = client.open_by_key(GOOGLE_SHEET_ID)
    for ws in ss.worksheets():
        print(f"  - {ws.title} ({ws.row_count} rows)")

print("\nCRM ADMISSION SHEET TABS:")
if PATIENT_ADMISSION_SHEET_ID:
    ss = client.open_by_key(PATIENT_ADMISSION_SHEET_ID)
    for ws in ss.worksheets():
        print(f"  - {ws.title} ({ws.row_count} rows)")
