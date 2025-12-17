
import gspread
from google.oauth2.service_account import Credentials
import os

CREDENTIALS_FILE = "google_credentials.json"
SHEET_NAME = "CRM_Leads"  # Adjust if needed, logic will fallback like main.py
WORK_SHEET = "Sheet1"

def cleanup_duplicates():
    if not os.path.exists(CREDENTIALS_FILE):
        print(f"Error: {CREDENTIALS_FILE} not found.")
        return

    scope = [
        'https://spreadsheets.google.com/feeds',
        'https://www.googleapis.com/auth/drive'
    ]
    creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
    client = gspread.authorize(creds)

    sheet = None
    try:
        sheet = client.open(SHEET_NAME).worksheet(WORK_SHEET)
    except Exception:
        try:
            sheet = client.open("Lead CRM").worksheet(WORK_SHEET)
        except Exception as e:
            print(f"Could not open sheet: {e}")
            return

    print(f"Connected to {sheet.title} / {WORK_SHEET}")
    
    # Get all values
    all_values = sheet.get_all_values()
    if not all_values:
        print("Sheet is empty.")
        return

    headers = all_values[0]
    rows = all_values[1:]

    # Identify duplicate map: "Base Name" -> [index_of_base, index_of_dup1, index_of_dup2...]
    # Actually, we want to map suffix columns back to base.
    
    # 1. Map column indices
    col_map = {} # header_name -> index
    normalized_map = {} # base_name -> [indices...]

    for idx, h in enumerate(headers):
        h = str(h).strip()
        if not h: continue
        
        # Check if suffix
        parts = h.split("_")
        base = parts[0]
        # logic: if parts[-1] is numeric or 'copy' etc.
        # Strict rule: "_2", "_3", "_copy"
        # The user said: "A column is considered duplicate if: It has suffix like: _2, _3, _copy"
        
        is_duplicate = False
        if len(parts) > 1:
            suffix = parts[-1]
            if suffix.isdigit() or suffix.lower() == "copy":
                is_duplicate = True
                base = "_".join(parts[:-1]) # Reconstruct base if needed? or just split("_")[0]?
                # Example: "Attender Name_2" -> base "Attender Name"
                # Example: "Some_Thing_2" -> base "Some_Thing"?
                
                # Let's try matching base name exactly
                # If "Attender Name" exists at index X, and "Attender Name_2" exists at index Y.
                # base = "Attender Name"
        
        base = base.strip()
        if base not in normalized_map:
            normalized_map[base] = []
        normalized_map[base].append(idx)

    # 2. Process rows
    # For each base_name, if multiple indices exist:
    # Merge values: prefer first index (primary), if empty, take from others.
    
    updates = [] # List of (row_idx, col_idx, value) to update? 
    # Updating cell by cell is slow. Better update entire column or rows.
    # We will reconstruct the data and overwrite.
    
    new_rows = []
    
    cols_to_delete = set()
    
    # Identify columns to delete (all duplicates)
    for base, indices in normalized_map.items():
        if len(indices) > 1:
            # Assume first index is primary (usually leftmost)
            primary_idx = indices[0]
            duplicates = indices[1:]
            for d in duplicates:
                cols_to_delete.add(d)
                
            print(f"Merging {base}: Primary={primary_idx}, Duplicates={duplicates}")

    if not cols_to_delete:
        print("No duplicates found to merge.")
        return

    # Merge Data
    for r_idx, row in enumerate(rows):
        # Extend row if short
        if len(row) < len(headers):
            row += [""] * (len(headers) - len(row))
            
        for base, indices in normalized_map.items():
            if len(indices) > 1:
                primary_idx = indices[0]
                primary_val = row[primary_idx].strip()
                
                if not primary_val:
                    # Look for value in duplicates
                    for d_idx in indices[1:]:
                        val = row[d_idx].strip()
                        if val:
                            row[primary_idx] = val # Move to primary
                            primary_val = val # Marked as found
                            # We don't need to clear the duplicate cell because the column will be deleted.
                            break
        new_rows.append(row)

    # Update the sheet with merged data?
    # Better: Update the sheet columns?
    # gspread batch_update.
    # We should update the PRIMARY columns first.
    
    # Let's update the entire sheet data?
    # Danger: Deleting columns requires delete_columns or similar.
    
    # Strategy:
    # 1. Update all rows with merged values (only primary columns affected).
    # 2. Delete duplicate columns.
    
    # Optimization: Only update primary columns that changed? 
    # Safest: Update all.
    
    # Batch update the data (excluding headers)
    # sheet.update(range_name=f"A2", values=new_rows) <-- might be offset if columns deleted?
    # No, we update BEFORE deleting.
    
    print("Updating rows with merged data...")
    # Update range A2:end
    validation_range = f"A2:{gspread.utils.rowcol_to_a1(len(new_rows) + 1, len(headers))}"
    sheet.update(range_name=validation_range, values=new_rows)
    
    # Delete columns
    # Delete from right to left to avoid index shifting issues
    sorted_cols = sorted(list(cols_to_delete), reverse=True)
    
    print(f"Deleting {len(sorted_cols)} duplicate columns...")
    
    requests = []
    for c_idx in sorted_cols:
        # grid index is 0-based? gspread delete_columns uses 1-based index?
        # client.delete_columns(sheet_id, col_index) ?
        # sheet.delete_columns(col_index)
        
        # Note: gspread sheet.delete_columns(col_index, 1) deletes 1 column at col_index (1-based)
        print(f" - Deleting column index {c_idx} (Header: {headers[c_idx]})")
        sheet.delete_columns(c_idx + 1) # 1-based index
        
    print("Cleanup complete.")

if __name__ == "__main__":
    cleanup_duplicates()
