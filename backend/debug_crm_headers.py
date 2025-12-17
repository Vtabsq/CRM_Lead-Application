import gspread
from google.oauth2.service_account import Credentials
import os

CREDENTIALS_FILE = "google_credentials.json"

def check():
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    try:
        creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
        client = gspread.authorize(creds)
    except Exception as e:
        print(f"Auth Error: {e}")
        return

    sheet_id = None
    if os.path.exists("google_sheet_id.txt"):
        with open("google_sheet_id.txt", "r") as f:
            sheet_id = f.read().strip()
            
    print(f"Using Sheet ID: {sheet_id}")
    
    if not sheet_id:
        print("No Sheet ID found.")
        return

    try:
        sh = client.open_by_key(sheet_id)
        print(f"Spreadsheet Title: {sh.title}")
    except Exception as e:
        print(f"Open Error: {e}")
        return

    try:
        ws = sh.worksheet("Sheet1")
        print("Found 'Sheet1'")
    except:
        print("Sheet1 not found, using index 0")
        ws = sh.get_worksheet(0)
        
    try:
        headers = ws.row_values(1)
        print(f"Headers: {headers}")
    except Exception as e:
        print(f"Read Error: {e}")

if __name__ == "__main__":
    check()
