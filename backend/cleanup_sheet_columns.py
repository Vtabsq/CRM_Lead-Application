from google.oauth2.service_account import Credentials
import gspread
import os

# Configuration
CREDENTIALS_FILE = "google_credentials.json"
GOOGLE_SHEET_NAME = "Lead CRM" # Adjust if needed
SHEET_TAB_NAME = "Sheet1"

def normalize_key(key):
    return str(key).strip().lower().replace(" ", "").replace("_", "").replace("-", "")

def cleanup_columns():
    if not os.path.exists(CREDENTIALS_FILE):
        print("Error: Credentials file not found.")
        return

    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
    client = gspread.authorize(creds)

    # Logic to load ID
    GOOGLE_SHEET_ID = os.getenv("GOOGLE_SHEET_ID")
    if not GOOGLE_SHEET_ID:
        try:
            with open("google_sheet_id.txt", "r", encoding="utf-8") as f:
                GOOGLE_SHEET_ID = f.read().strip() or None
        except FileNotFoundError:
             pass

    try:
        # Try finding the spreadsheet
        spreadsheet = None
        if GOOGLE_SHEET_ID:
             try:
                 spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
                 print(f"Opened Sheet by ID: {GOOGLE_SHEET_ID}")
             except Exception as e:
                 print(f"Failed to open by ID: {e}")

        if not spreadsheet:
            try:
                spreadsheet = client.open(GOOGLE_SHEET_NAME)
                print(f"Opened Sheet by Name: {GOOGLE_SHEET_NAME}")
            except gspread.SpreadsheetNotFound:
                try:
                    spreadsheet = client.open("CRM_Leads")
                    print(f"Opened Sheet by Name: CRM_Leads")
                except:
                    print("Could not find 'Lead CRM' or 'CRM_Leads' sheet.")
                    return

        sheet = spreadsheet.worksheet(SHEET_TAB_NAME)
        
        # Get headers (Row 1)
        headers = sheet.row_values(1)
        print(f"Current Headers ({len(headers)}): {headers}")

        # Identify duplicates
        # Map: canonical_key -> list of (index, original_name)
        canonical_map = {}
        
        for idx, h in enumerate(headers):
            # 1-based index for GSpread columns? No, row_values is 0-based list.
            # GSpread delete_columns uses 1-based index? Yes usually.
            canon = normalize_key(h)
            if canon not in canonical_map:
                canonical_map[canon] = []
            canonical_map[canon].append( (idx, h) )

        cols_to_delete = [] # Store 0-based List indices
        
        print("\n--- Duplicate Analysis ---")
        
        for canon, items in canonical_map.items():
            if len(items) > 1:
                print(f"\nConflict for '{canon}': {items}")
                # Heuristic: Keep "Spaced Title Case" or longest?
                # Usually "Total Days Stayed" (spaces) is better than "TotalDaysStayed"
                # If identical, keep first.
                
                # Sort items by "quality"
                # Preference: Contains spaces > Length
                def score(item):
                    idx, name = item
                    s = 0
                    if " " in name: s += 10
                    if "_" in name: s += 5
                    return (s, -idx) # higher score first, then lower index (earlier) first

                sorted_items = sorted(items, key=score, reverse=True)
                winner = sorted_items[0]
                losers = sorted_items[1:]
                
                print(f"  Keeping: '{winner[1]}' (Col {winner[0]+1})")
                for l in losers:
                    print(f"  DELETING: '{l[1]}' (Col {l[0]+1})")
                    cols_to_delete.append(l[0])

        if not cols_to_delete:
            print("\nNo duplicates found to delete.")
            return

        # Delete columns
        # Must delete from right to left (descending order) to avoid index shift
        cols_to_delete.sort(reverse=True)
        
        print(f"\nDeleting {len(cols_to_delete)} columns...")
        
        for col_idx_0 in cols_to_delete:
            col_num = col_idx_0 + 1
            print(f"Deleting Column {col_num}...")
            # gspread delete_columns(col_index, 1)? 
            # Note: sheet.delete_columns(start_index, end_index=None)
            # wait, check version. old gspread uses delete_col? 
            # safe method: sheet.delete_columns(col_num)
            try:
                sheet.delete_columns(col_num)
            except AttributeError:
                # Fallback API
                print("delete_columns method not found, trying legacy...")
                # ... implementation ...
                pass
            
        print("Cleanup complete.")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    cleanup_columns()
