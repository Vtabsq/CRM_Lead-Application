
import sys
import os
import datetime
from google.oauth2.service_account import Credentials
import gspread

# Add backend to path
sys.path.append(os.getcwd())
try:
    from main import CREDENTIALS_FILE, GOOGLE_SHEET_ID, GOOGLE_SHEET_NAME, normalize_field_name
except ImportError:
    pass

def fix_sheet_limit():
    print("--- Starting Sheet Recovery ---")
    
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    
    if not os.path.exists(CREDENTIALS_FILE):
        print(f"Error: Credentials file not found at {CREDENTIALS_FILE}")
        return

    creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
    client = gspread.authorize(creds)
    
    print(f"Opening Spreadsheet... (ID: {GOOGLE_SHEET_ID or 'ByName'})")
    try:
        if GOOGLE_SHEET_ID:
            spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
        else:
            spreadsheet = client.open(GOOGLE_SHEET_NAME)
    except Exception as e:
        print(f"Error opening spreadsheet: {e}")
        return

    # 1. Find target sheet (Sheet1)
    target_name = "Sheet1"
    try:
        sheet = spreadsheet.worksheet(target_name)
        print(f"Found '{target_name}'. Reading headers...")
        
        # Try to read headers for copying
        try:
             headers = sheet.row_values(1)
             print(f"Captured {len(headers)} headers.")
        except Exception:
             print("Could not read headers (maybe sheet is completely broken?), starting fresh.")
             headers = []
        
        # 2. Rename (Archive)
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"{target_name}_Backup_{timestamp}"
        print(f"Renaming '{target_name}' to '{backup_name}'...")
        sheet.update_title(backup_name)
        print("Rename successful.")
        
    except gspread.WorksheetNotFound:
        print(f"'{target_name}' not found. It might have been deleted already.")
        headers = []

    # 3. Create New Sheet
    print(f"Creating fresh '{target_name}'...")
    try:
        new_sheet = spreadsheet.add_worksheet(title=target_name, rows=1000, cols=20)
        print("Created successfully.")
        
        # 4. Restore Headers
        if headers:
            print("Restoring headers...")
            new_sheet.update('1:1', [headers])
            print("Headers restored.")
        else:
            print("No headers to restore. App will initialize them on next run.")
            
    except Exception as e:
        print(f"Error creating new sheet: {e}")
        
    print("\n--- Recovery Complete ---")
    print("Please restart your backend server if it caches sheet objects.")

if __name__ == "__main__":
    fix_sheet_limit()
