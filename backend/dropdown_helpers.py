# Required imports for dropdown management
import os
import json
import gspread
from google.oauth2.service_account import Credentials
from fastapi import HTTPException

# Import constants from main module (will be accessed via main.py)
# These are defined in main.py and passed through function calls
CREDENTIALS_FILE = "google_credentials.json"
GOOGLE_SHEET_ID = os.getenv("GOOGLE_SHEET_ID")
GOOGLE_SHEET_NAME = "Sheet1"  
DROPDOWN_OPTION_SHEET = "DropdownOption"
SCHEMA_CACHE_FILE = "schema_cache.json"

# Global reference to fields cache (updated via main.py)
fields_cache = []

# Dropdown Management Helper Functions

def get_dropdown_option_sheet():
    """Get or create the DropdownOption worksheet from Google Sheets."""
    if not os.path.exists(CREDENTIALS_FILE):
        raise HTTPException(status_code=500, detail="Google credentials not found")
    
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
    client = gspread.authorize(creds)
    
    spreadsheet = client.open_by_key(GOOGLE_SHEET_ID) if GOOGLE_SHEET_ID else client.open(GOOGLE_SHEET_NAME)
    
    # Try to get existing sheet
    try:
        sheet = spreadsheet.worksheet(DROPDOWN_OPTION_SHEET)
        return sheet, spreadsheet
    except gspread.exceptions.WorksheetNotFound:
       # Create new sheet if doesn't exist
        sheet = spreadsheet.add_worksheet(title=DROPDOWN_OPTION_SHEET, rows=100, cols=20)
        # Initialize with some default columns from schema
        initialize_dropdown_sheet(sheet)
        return sheet, spreadsheet


def initialize_dropdown_sheet(sheet):
    """Initialize DropdownOption sheet with existing dropdown fields from schema."""
    try:
        # Load current schema
        if not fields_cache:
            # load_schema() call removed to avoid NameError/Circular Import
            pass

        
        # Find all dropdown fields
        dropdown_fields = [f for f in fields_cache if f.get('data_type') == 'dropdown' and f.get('options')]
        
        if not dropdown_fields:
            # Add some default headers
            sheet.update('1:1', [['Service Location', 'Room Type', 'Pain Point', 'Gender', 'Blood Group']], value_input_option='USER_ENTERED')
            return
        
        # Create headers from field names
        headers = [f['name'] for f in dropdown_fields]
        
        # Find max options length
        max_options = max(len(f.get('options', [])) for f in dropdown_fields)
        
        # Build data grid
        data = [headers]
        for row_idx in range(max_options):
            row = []
            for field in dropdown_fields:
                options = field.get('options', [])
                if row_idx < len(options):
                    row.append(options[row_idx])
                else:
                    row.append('')
            data.append(row)
        
        # Update sheet with data
        sheet.update(f'A1:{chr(65 + len(headers) - 1)}{len(data)}', data, value_input_option='USER_ENTERED')
        print(f"[DropdownOption] Initialized sheet with {len(headers)} dropdown fields")
        
    except Exception as e:
        print(f"[DropdownOption] Error initializing sheet: {e}")
        # Set minimal headers if error
        sheet.update('1:1', [['Service Location']], value_input_option='USER_ENTERED')


def get_all_dropdown_options():
    """Get all dropdown options from DropdownOption sheet."""
    sheet, _ = get_dropdown_option_sheet()
    data = sheet.get_all_values()
    
    if not data or len(data) < 1:
        return {}
    
    headers = data[0]
    result = {}
    
    for col_idx, field_name in enumerate(headers):
        if not field_name.strip():
            continue
        
        options = []
        for row in data[1:]:
            if col_idx < len(row) and row[col_idx].strip():
                options.append(row[col_idx].strip())
        
        result[field_name] = options
    
    return result


def get_dropdown_options_for_field(field_name: str):
    """Get dropdown options for a specific field."""
    sheet, _ = get_dropdown_option_sheet()
    data = sheet.get_all_values()
    
    if not data or len(data) < 1:
        return []
    
    headers = data[0]
    
    # Find column index for field
    try:
        col_idx = headers.index(field_name)
    except ValueError:
        # Field not found - return empty
        return []
    
    options = []
    for row in data[1:]:
        if col_idx < len(row) and row[col_idx].strip():
            options.append(row[col_idx].strip())
    
    return options


def add_dropdown_option(field_name: str, option: str):
    """Add a new option to a dropdown field."""
    sheet, _ = get_dropdown_option_sheet()
    data = sheet.get_all_values()
    
    if not data or len(data) < 1:
        # Initialize with this field
        sheet.update('1:1', [[field_name]], value_input_option='USER_ENTERED')
        sheet.update('A2', [[option]], value_input_option='USER_ENTERED')
        return {"status": "success", "message": f"Added {option} to new field {field_name}"}
    
    headers = data[0]
    
    # Find or create column
    try:
        col_idx = headers.index(field_name)
    except ValueError:
        # Add new column
        col_idx = len(headers)
        headers.append(field_name)
        sheet.update('1:1', [headers], value_input_option='USER_ENTERED')
    
    # Find next empty row in column
    next_row = 2  # Start at row 2 (row 1 is headers)
    for row in data[1:]:
        if col_idx < len(row) and row[col_idx].strip():
            next_row += 1
        else:
            break
    
    # Add option
    col_letter = chr(65 + col_idx)  # A, B, C, etc.
    cell = f"{col_letter}{next_row}"
    sheet.update(cell, [[option]], value_input_option='USER_ENTERED')
    
    # Update schema cache
    sync_dropdown_options_to_schema()
    
    return {"status": "success", "message": f"Added {option} to {field_name}"}


def delete_dropdown_option(field_name: str, option: str):
    """Remove an option from a dropdown field."""
    sheet, _ = get_dropdown_option_sheet()
    data = sheet.get_all_values()
    
    if not data or len(data) < 1:
        raise HTTPException(status_code=404, detail="DropdownOption sheet is empty")
    
    headers = data[0]
    
    # Find column
    try:
        col_idx = headers.index(field_name)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Field {field_name} not found")
    
    # Find and remove option
    found = False
    for row_idx, row in enumerate(data[1:], start=2):
        if col_idx < len(row) and row[col_idx].strip() == option:
            col_letter = chr(65 + col_idx)
            cell = f"{col_letter}{row_idx}"
            sheet.update(cell, [['']], value_input_option='USER_ENTERED')
            found = True
            break
    
    if not found:
        raise HTTPException(status_code=404, detail=f"Option {option} not found in {field_name}")
    
    # Update schema cache
    sync_dropdown_options_to_schema()
    
    return {"status": "success", "message": f"Removed {option} from {field_name}"}


def sync_dropdown_options_to_schema():
    """Update schema_cache.json with dropdown options from DropdownOption sheet."""
    try:
        # Get all dropdown options from sheet
        dropdown_options = get_all_dropdown_options()
        
        # Load current schema
        if not os.path.exists(SCHEMA_CACHE_FILE):
            return
        
        with open(SCHEMA_CACHE_FILE, 'r', encoding='utf-8') as f:
            schema = json.load(f)
        
        # Update dropdown options in schema
        updated = False
        for field in schema:
            field_name = field.get('name', '')
            if field.get('data_type') == 'dropdown' and field_name in dropdown_options:
                field['options'] = dropdown_options[field_name]
                updated = True
        
        # Save updated schema
        if updated:
            with open(SCHEMA_CACHE_FILE, 'w', encoding='utf-8') as f:
                json.dump(schema, f, indent=2, ensure_ascii=False)
            
            # Reload fields cache
            global fields_cache
            fields_cache = schema
            
            print(f"[DropdownSync] Updated schema with dropdown options from sheet")
        
    except Exception as e:
        print(f"[DropdownSync] Error syncing to schema: {e}")


def sync_schema_to_dropdown_sheet():
    """Create columns in DropdownOption sheet for new schema dropdown fields."""
    try:
        # Load schema
        if not fields_cache:
            load_schema()
        
        # Get dropdown fields from schema
        schema_dropdowns = {f['name']: f.get('options', []) 
                           for f in fields_cache 
                           if f.get('data_type') == 'dropdown'}
        
        # Get existing columns from sheet
        sheet, _ = get_dropdown_option_sheet()
        data = sheet.get_all_values()
        
        if not data:
            data = [[]]
        
        headers = data[0] if data else []
        
        # Find new columns
        new_fields = [name for name in schema_dropdowns.keys() if name not in headers]
        
        if new_fields:
            # Add new columns
            for field_name in new_fields:
                headers.append(field_name)
            
            # Update headers
            sheet.update('1:1', [headers], value_input_option='USER_ENTERED')
            
            # Add options for new fields
            for col_idx, field_name in enumerate(headers):
                if field_name in schema_dropdowns:
                    options = schema_dropdowns[field_name]
                    col_letter = chr(65 + col_idx)
                    
                    for row_idx, option in enumerate(options, start=2):
                        cell = f"{col_letter}{row_idx}"
                        sheet.update(cell, [[option]], value_input_option='USER_ENTERED')
            
            print(f"[DropdownSync] Added {len(new_fields)} new columns to DropdownOption sheet")
        
        # Also sync back to ensure consistency
        sync_dropdown_options_to_schema()
        
    except Exception as e:
        print(f"[DropdownSync] Error syncing from schema: {e}")
