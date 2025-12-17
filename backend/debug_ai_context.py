"""Debug: Check what context is being sent to AI"""
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
original_headers = [str(h).strip() for h in all_rows[0]]
headers = [h.lower() for h in original_headers]
data_rows = all_rows[1:]

print(f"Total rows: {len(data_rows)}")
print(f"Total headers: {len(original_headers)}")

# Find columns
member_id_col = next((i for i, h in enumerate(headers) if 'member' in h and 'id' in h), None)
patient_name_col = next((i for i, h in enumerate(headers) if 'patient name' in h), None)
attender_name_col = next((i for i, h in enumerate(headers) if 'attender name' in h), None)

print(f"\nMember ID col: {member_id_col}")
print(f"Patient Name col: {patient_name_col}")
print(f"Attender Name col: {attender_name_col}")

# Build member list like the backend does
member_data = []
for row in data_rows:
    if member_id_col < len(row) and row[member_id_col]:
        mid = str(row[member_id_col]).strip()
        
        # Get names
        pat = ""
        if patient_name_col is not None and patient_name_col < len(row):
            pat = str(row[patient_name_col]).strip()
        
        att = ""
        if attender_name_col is not None and attender_name_col < len(row):
            att = str(row[attender_name_col]).strip()
        
        # Format name
        if att and pat and att != pat:
            name_part = f"{att}/{pat}"
        elif att:
            name_part = att
        elif pat:
            name_part = pat
        else:
            name_part = "Unknown"
        
        member_data.append(f"{mid}({name_part})")

# Show all members
print(f"\n{'='*60}")
print("All members in compact format:")
print(f"{'='*60}")
for i, m in enumerate(member_data, 1):
    print(f"{i}. {m}")

# Calculate approximate token count
member_str = ", ".join(member_data)
print(f"\n{'='*60}")
print(f"Total characters in member list: {len(member_str)}")
print(f"Approximate tokens: ~{len(member_str) // 4}")
print(f"{'='*60}")

# Check if Sameer appears
if 'sameer' in member_str.lower():
    print("\n✅ 'Sameer' appears in the member list")
    # Find which members
    for m in member_data:
        if 'sameer' in m.lower():
            print(f"  - {m}")
else:
    print("\n❌ 'Sameer' does NOT appear in the member list")
