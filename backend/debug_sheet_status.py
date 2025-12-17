import gspread
from google.oauth2.service_account import Credentials
import os

CREDENTIALS_FILE = "google_credentials.json"
GOOGLE_SHEET_ID = None

# Load Sheet ID
if os.path.exists("google_sheet_id.txt"):
    with open("google_sheet_id.txt", "r") as f:
        GOOGLE_SHEET_ID = f.read().strip()

if not os.path.exists(CREDENTIALS_FILE):
    print("Error: google_credentials.json not found")
    exit(1)

scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
client = gspread.authorize(creds)

with open("debug_output.txt", "w") as out:
    def log(msg):
        print(msg)
        out.write(str(msg) + "\n")

    log("Connecting to Spreadsheet...")
    if GOOGLE_SHEET_ID:
        spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
    else:
        spreadsheet = client.open("CRM Leads") # Fallback name

    log(f"Spreadsheet Title: {spreadsheet.title}")
    log("-" * 30)
    log("Available Worksheets:")
    worksheets = spreadsheet.worksheets()

    target_sheet = None
    for ws in worksheets:
        log(f"- '{ws.title}' (ID: {ws.id}, Rows: {ws.row_count})")
        if ws.title.lower() == "patient admission":
            target_sheet = ws

    log("-" * 30)
    if target_sheet:
        log(f"Target Sheet Found: '{target_sheet.title}'")
        values = target_sheet.get_all_values()
        log(f"Total Rows with Data: {len(values)}")
        if len(values) > 0:
            log("Last Row Data:")
            log(values[-1])
    else:
        log("Target Sheet 'patient admission' NOT FOUND (case-insensitive search).")
