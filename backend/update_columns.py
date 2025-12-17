import gspread
from google.oauth2.service_account import Credentials
import os
import json

CREDENTIALS_FILE = "google_credentials.json"
GOOGLE_SHEET_NAME = "Sheet1"
# Try to get ID from file if exists
GOOGLE_SHEET_ID = None
if os.path.exists("google_sheet_id.txt"):
    with open("google_sheet_id.txt", "r") as f:
        GOOGLE_SHEET_ID = f.read().strip()

FIELD_SCHEMA_FILE = "field_schema.json"

def add_columns():
    if not os.path.exists(CREDENTIALS_FILE):
        print("Credentials not found.")
        return

    # Load schema
    with open(FIELD_SCHEMA_FILE, 'r', encoding='utf-8') as f:
        schema = json.load(f)
    
    schema_headers = [x['name'] for x in schema]

    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
    client = gspread.authorize(creds)

    print("Connecting to Google Sheet...")
    if GOOGLE_SHEET_ID:
        sheet = client.open_by_key(GOOGLE_SHEET_ID).sheet1
    else:
        sheet = client.open(GOOGLE_SHEET_NAME).sheet1

    print(f"Opened sheet: {sheet.title}")
    
    # Get existing headers
    existing_headers = sheet.row_values(1)
    print(f"Existing headers ({len(existing_headers)}): {existing_headers}")

    # Determine missing
    missing = []
    # convert to set for fast check, strict case? User said don't touch, so we respect existing.
    # We want to append NEW schema fields that are NOT in existing.
    
    # Normalizing check? 
    # Schema has "patient_name", existing might have "Patient Name".
    # User said "add this column names ... just add new extra columns".
    # So if "patient_name" is not exactly there, we add it. 
    # Even if "Patient Name" exists, "patient_name" is requested as new.
    
    existing_set = set(existing_headers)
    
    print(f"Total Schema items: {len(schema_headers)}")
    print(f"Total Existing items: {len(existing_set)}")
    
    for h in schema_headers:
        if h not in existing_set:
            missing.append(h)

    print(f"Missing columns to add ({len(missing)}): {missing}")

    if not missing:
        print("No new columns to add.")
        return

    # Append to header row
    new_full_headers = existing_headers + missing
    print(f"New header count: {len(new_full_headers)}")
    
    sheet.update('1:1', [new_full_headers], value_input_option='USER_ENTERED')
    print("Successfully updated headers.")

if __name__ == "__main__":
    add_columns()
