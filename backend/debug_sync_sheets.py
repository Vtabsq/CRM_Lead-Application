import gspread
from google.oauth2.service_account import Credentials
import os
import json

CREDENTIALS_FILE = "google_credentials.json"
GOOGLE_SHEET_ID = os.getenv("GOOGLE_SHEET_ID")
PATIENT_ADMISSION_SHEET_ID = os.getenv("PATIENT_ADMISSION_SHEET_ID")

def inspect_sheets():
    try:
        scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
        creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
        client = gspread.authorize(creds)
        
        # Inspect the ONLY file found
        known_id = "1L4jwfA2R_MjT3kSsof93U3V-DKaM4zemGdKeCq2fy9Y"
        print(f"\n--- Inspecting contents of 'CRM Leads' ({known_id}) ---")
        try:
            sheet = client.open_by_key(known_id)
            for ws in sheet.worksheets():
                print(f"SHEET: '{ws.title}' - Headers: {ws.row_values(1)}")
        except Exception as e:
            print(f"Failed to open/read known sheet: {e}")


    except Exception as e:
        print(f"CRITICAL ERROR: {e}")

if __name__ == "__main__":
    # Load env from .env file manually if needed, or rely on file content in folder
    # Simple .env parser
    if os.path.exists(".env"):
        with open(".env", "r") as f:
            for line in f:
                if "=" in line:
                    k,v = line.strip().split("=", 1)
                    os.environ[k] = v
                    
    inspect_sheets()
