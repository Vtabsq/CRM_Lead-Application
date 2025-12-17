import gspread
from google.oauth2.service_account import Credentials
import os
import pandas as pd

CREDENTIALS_FILE = "google_credentials.json"
GOOGLE_SHEET_NAME = "CRM Leads"

def debug_sheet_logic():
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
        if sheet_id:
            spreadsheet = client.open_by_key(sheet_id)
        else:
            spreadsheet = client.open(GOOGLE_SHEET_NAME)
            
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
        
        # DataFrame Creation
        df = pd.DataFrame(rows, columns=headers)
        print(f"DataFrame Shape: {df.shape}")
        
        # FILTER PARAMS (Simulation)
        date_col = "Date"
        filters = {"startDate": "2025-12-01", "endDate": "2025-12-31"}
        print(f"Using Date Column: {date_col}")
        print(f"Using Filters: {filters}")
        
        # Case-insensitive check
        cols_lower = {c.lower(): c for c in df.columns}
        if date_col.lower() not in cols_lower:
             print(f"ERROR: Column '{date_col}' not found.")
             return
             
        actual_date_col = cols_lower[date_col.lower()]
        print(f"Actual Column Name: {actual_date_col}")
        
        print("\n--- Parsing Dates ---")
        # Dual Pass Logic from main.py
        # 1. DayFirst
        df['temp_date'] = pd.to_datetime(df[actual_date_col], dayfirst=True, errors='coerce')
        nat_pass1 = df['temp_date'].isna().sum()
        print(f"NaT after Pass 1: {nat_pass1}")
        
        # 2. ISO Fallback
        mask_nat = df['temp_date'].isna()
        if mask_nat.any():
            print("Running Pass 2 (ISO Fallback)...")
            df.loc[mask_nat, 'temp_date'] = pd.to_datetime(df.loc[mask_nat, actual_date_col], errors='coerce')
            
        nat_final = df['temp_date'].isna().sum()
        print(f"NaT Final: {nat_final}")
        
        if nat_final > 0:
            print("FAILED ROWS:")
            print(df.loc[df['temp_date'].isna(), actual_date_col].head())
        else:
            print("All dates parsed successfully.")
            
        print("\n--- Filtering ---")
        mask = pd.Series([True] * len(df))
        
        if filters.get('startDate'):
            start = pd.to_datetime(filters['startDate']).date()
            print(f"Filter Start: {start}")
            # Debug comparison
            valid_dates = df['temp_date'].dropna()
            if not valid_dates.empty:
                print(f"Min Date in Data: {valid_dates.min().date()}")
                print(f"Max Date in Data: {valid_dates.max().date()}")
            
            mask = mask & (df['temp_date'].dt.date >= start)
            
        if filters.get('endDate'):
            end = pd.to_datetime(filters['endDate']).date()
            print(f"Filter End: {end}")
            mask = mask & (df['temp_date'].dt.date <= end)
            
        matches = mask.sum()
        print(f"\nMatches Found: {matches}")
        
        if matches == 0:
            print("Why 0 matches? Checking raw data vs start date...")
            # Print sample dates that Failed filter
            print(df['temp_date'].dt.date.head(10))

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_sheet_logic()
