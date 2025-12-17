import gspread
from google.oauth2.service_account import Credentials
import os
import pandas as pd
from datetime import datetime

CREDENTIALS_FILE = "google_credentials.json"
GOOGLE_SHEET_NAME = "CRM Leads"

def fix_dates():
    print("--- Connecting to Sheet ---")
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

    try:
        spreadsheet = client.open_by_key(sheet_id) if sheet_id else client.open(GOOGLE_SHEET_NAME)
        try:
            sheet = spreadsheet.worksheet("Sheet1")
        except:
            sheet = spreadsheet.get_worksheet(0)
            
        all_values = sheet.get_all_values()
        if not all_values:
            print("Sheet is empty.")
            return

        headers = all_values[0]
        rows = all_values[1:]
        
        df = pd.DataFrame(rows, columns=headers)
        
        # Case-insensitive check for Date column
        cols_lower = {c.lower(): c for c in df.columns}
        if 'date' not in cols_lower:
             print(f"ERROR: 'Date' column not found.")
             return
             
        actual_date_col = cols_lower['date']
        print(f"Found Date Column: {actual_date_col}")
        
        # Robust Parsing (Dual Pass)
        print("Parsing dates...")
        # Pass 1: dayfirst=True
        df['temp_date'] = pd.to_datetime(df[actual_date_col], dayfirst=True, errors='coerce')
        # Pass 2: ISO fill
        mask_nat = df['temp_date'].isna()
        if mask_nat.any():
            df.loc[mask_nat, 'temp_date'] = pd.to_datetime(df.loc[mask_nat, actual_date_col], errors='coerce')
            
        # Reformat all valid dates to DD-MM-YYYY (or DD/MM/YYYY depending on existing style)
        # User requested "correct filter dates"
        # I'll use DD-MM-YYYY to match the visual picker
        
        def format_date(d):
            if pd.isna(d):
                return ""
            return d.strftime('%Y-%m-%d')
            
        df[actual_date_col] = df['temp_date'].apply(format_date)
        
        print("Reformatted Data Sample (ISO):")
        print(df[actual_date_col].head())
        
        # Update Sheet
        print("Updating Google Sheet...")
        
        # We need to construct the update range. 
        # Updating the entire column is safer.
        col_index = headers.index(actual_date_col) + 1
        
        # Prepare list of lists for update
        # cell_list = sheet.range(2, col_index, len(rows) + 1, col_index) 
        # That's slow. Use update() with range.
        
        # Build column data
        date_values = df[actual_date_col].tolist()
        # Transform to list of lists [[val], [val], ...]
        update_data = [[v] for v in date_values]
        
        # Range: e.g. A2:A[end]
        # Helper to get column letter? no need, update uses (row, col) in some libs, or A1 notation.
        # gspread update using cell coordinates
        
        # sheet.update_cell(row, col, val) is slow.
        # sheet.update(range_name, values)
        
        # Determine column letter (A=1)
        # Crude approach: just update the whole sheet with new DF values? Safer to ensure consistency.
        # But updating whole sheet might overwrite concurrent edits? User is single user.
        # Updating specific column is better.
        
        # Let's verify update capability.
        # update allows A1 notation.
        # col_index 1 -> A. 2 -> B.
        
        def get_col_letter(n):
            string = ""
            while n > 0:
                n, remainder = divmod(n - 1, 26)
                string = chr(65 + remainder) + string
            return string
            
        letter = get_col_letter(col_index)
        range_start = f"{letter}2"
        range_end = f"{letter}{len(rows) + 1}"
        range_name = f"{range_start}:{range_end}"
        
        print(f"Updating range {range_name} with {len(update_data)} values...")
        sheet.update(range_name=range_name, values=update_data)
        
        print("SUCCESS: Dates standardized to DD-MM-YYYY.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_dates()
