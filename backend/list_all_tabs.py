"""
List all worksheets and save to file
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

output = []
output.append("="*80)
output.append("CRM LEADS SHEET TABS:")
output.append("="*80)
if GOOGLE_SHEET_ID:
    ss = client.open_by_key(GOOGLE_SHEET_ID)
    for ws in ss.worksheets():
        output.append(f"  - '{ws.title}' ({ws.row_count} rows, {ws.col_count} cols)")

output.append("")
output.append("="*80)
output.append("CRM ADMISSION SHEET TABS:")
output.append("="*80)
if PATIENT_ADMISSION_SHEET_ID:
    ss = client.open_by_key(PATIENT_ADMISSION_SHEET_ID)
    for ws in ss.worksheets():
        output.append(f"  - '{ws.title}' ({ws.row_count} rows, {ws.col_count} cols)")

# Write to file
with open("sheet_tabs.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(output))

# Also print
for line in output:
    print(line)

print("\nOutput saved to sheet_tabs.txt")
