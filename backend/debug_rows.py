"""Debug: Check how many rows are being processed"""
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

print(f"Total data rows: {len(data_rows)}")
print(f"Headers: {headers[:5]}")

# Find member ID column
member_id_col = None
for i, h in enumerate(headers):
    if 'member' in h.lower() and 'id' in h.lower():
        member_id_col = i
        print(f"\nMember ID column at index {i}: '{headers[i]}'")
        break

# Count rows with member IDs
rows_with_ids = 0
rows_without_ids = []
for idx, row in enumerate(data_rows):
    if member_id_col < len(row) and row[member_id_col].strip():
        rows_with_ids += 1
    else:
        rows_without_ids.append(idx + 2)  # +2 for header and 1-indexing

print(f"\nRows with member IDs: {rows_with_ids}")
print(f"Rows without member IDs: {len(rows_without_ids)}")
if rows_without_ids:
    print(f"Row numbers without IDs: {rows_without_ids}")

# Check last 5 rows
print("\nLast 5 rows (with member IDs):")
for row in data_rows[-5:]:
    if member_id_col < len(row):
        mid = row[member_id_col]
        name_col = 2  # Attender Name
        name = row[name_col] if name_col < len(row) else ''
        print(f"  {mid} - {name}")
