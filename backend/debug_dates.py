import gspread
from google.oauth2.service_account import Credentials
import os
import pandas as pd

CREDENTIALS_FILE = "google_credentials.json"

def check_dates():
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
        sh = client.open_by_key(sheet_id)
        ws = sh.worksheet("Sheet1")
        
        # Get all records using get_all_values logic to bypass duplicate header error
        all_rows = ws.get_all_values()
        if not all_rows:
            print("Sheet is empty.")
            return

        headers = all_rows[0]
        data = all_rows[1:]
        
        print(f"Headers: {headers}")
        
        # Use pandas with no header inference initially to verify data position
        df = pd.DataFrame(data, columns=headers)
        
        # Check 'Date' column
        if 'Date' in df.columns:
            print("\nFirst 10 'Date' values:")
            # If multiple 'Date' columns, this might return a DataFrame not Series?
            # Check typing
            date_data = df['Date']
            if isinstance(date_data, pd.DataFrame):
                print("WARNING: Multiple 'Date' columns found!")
                print(date_data.head(10))
                # Take first one
                date_data = date_data.iloc[:, 0]
            else:
                print(date_data.head(10).tolist())
            
            # Try parsing with pandas
            print("\nPandas Parsing Check (dayfirst=True):")
            parsed = pd.to_datetime(date_data, errors='coerce', dayfirst=True)
            print(parsed.head(10))
            
            print("\nParsed NaT count:", parsed.isna().sum())
            print("Total rows:", len(parsed))
            
            # Debug sample matching
            print("\nSample Filter Check (2025-12-01 to 2025-12-31):")
            df['temp_date'] = parsed
            mask = (df['temp_date'] >= pd.Timestamp("2025-12-01")) & (df['temp_date'] <= pd.Timestamp("2025-12-31"))
            print(f"Matches found: {mask.sum()}")
            if mask.sum() > 0:
                print("Matched Rows Sample:")
                print(df[mask].head(2))
                
        else:
            print("'Date' column not found in headers.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_dates()
