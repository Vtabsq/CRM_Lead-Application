"""
Dropdown Options Service with Caching (Column-based format)
Manages dynamic dropdown options stored in Google Sheets with local caching to avoid quota limits
Each category has its own column, values are stored in rows
"""

from typing import List, Dict, Any
import gspread
from google.oauth2.service_account import Credentials
import os
from fastapi import HTTPException
from dotenv import load_dotenv
from datetime import datetime, timedelta
import json

# Load environment variables
load_dotenv()

# Configuration
CREDENTIALS_FILE = os.getenv("CREDENTIALS_FILE", "google_credentials.json")
CRM_ADMISSION_SHEET_ID = os.getenv("PATIENT_ADMISSION_SHEET_ID")

# Cache configuration
CACHE_FILE = "dropdown_cache.json"
CACHE_DURATION_MINUTES = 5  # Cache for 5 minutes

# In-memory cache
_cache = {
    "data": {},
    "timestamp": None
}

# Column mapping for categories
CATEGORY_COLUMNS = {
    "Visit ID": "A",
    "Care Center": "B",
    "Provider": "C",
    "Sold By": "D",
    "External Provider": "E",
    "Discount": "F",
    "Status": "G"
}


def get_google_sheet_client(credentials_file: str = CREDENTIALS_FILE):
    """Get authenticated gspread client"""
    if not os.path.exists(credentials_file):
        raise HTTPException(status_code=404, detail=f"Credentials file not found: {credentials_file}")
    
    scope = [
        'https://spreadsheets.google.com/feeds',
        'https://www.googleapis.com/auth/drive'
    ]
    creds = Credentials.from_service_account_file(credentials_file, scopes=scope)
    client = gspread.authorize(creds)
    return client


def is_cache_valid():
    """Check if cache is still valid"""
    if _cache["timestamp"] is None:
        return False
    
    cache_age = datetime.now() - _cache["timestamp"]
    return cache_age < timedelta(minutes=CACHE_DURATION_MINUTES)


def load_cache_from_file():
    """Load cache from file"""
    try:
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE, 'r') as f:
                file_cache = json.load(f)
                timestamp = datetime.fromisoformat(file_cache.get("timestamp", ""))
                cache_age = datetime.now() - timestamp
                
                if cache_age < timedelta(minutes=CACHE_DURATION_MINUTES):
                    _cache["data"] = file_cache.get("data", {})
                    _cache["timestamp"] = timestamp
                    print(f"Loaded dropdown cache from file (age: {cache_age.seconds}s)")
                    return True
    except Exception as e:
        print(f"Error loading cache from file: {e}")
    
    return False


def save_cache_to_file():
    """Save cache to file"""
    try:
        cache_data = {
            "data": _cache["data"],
            "timestamp": _cache["timestamp"].isoformat() if _cache["timestamp"] else None
        }
        with open(CACHE_FILE, 'w') as f:
            json.dump(cache_data, f)
        print("Saved dropdown cache to file")
    except Exception as e:
        print(f"Error saving cache to file: {e}")


def get_all_dropdown_options_from_sheet():
    """Fetch all dropdown options from Google Sheets (column-based format)"""
    try:
        client = get_google_sheet_client()
        if not CRM_ADMISSION_SHEET_ID:
            raise HTTPException(status_code=500, detail="CRM_Admission Sheet ID not configured")
        
        spreadsheet = client.open_by_key(CRM_ADMISSION_SHEET_ID)
        
        # Try to get existing worksheet or create new one
        try:
            worksheet = spreadsheet.worksheet("Dropdown Options")
        except gspread.exceptions.WorksheetNotFound:
            # Create new worksheet with column headers
            worksheet = spreadsheet.add_worksheet(title="Dropdown Options", rows=1000, cols=10)
            
            # Set up column headers (row 1) - matching the user's sheet format
            headers = ['Visit ID', 'Care Center', 'Provider', 'Sold BY', 'External Provider', 'Discount', 'Status']
            worksheet.update('A1:G1', [headers])
            
            # Add default options in columns
            default_data = [
                ['6276666', 'HC CBE', 'Provider 1', 'Company', 'External Provider 1', '500', 'Invoiced'],
                ['6276667', 'RSP SNF', 'Provider 2', 'Partner', 'External Provider 2', '1000', 'Paid'],
                ['6276668', 'Clinic - Ram Nagar', '', '', '', '2000', 'Pending'],
            ]
            
            for idx, row in enumerate(default_data, start=2):
                worksheet.update(f'A{idx}:G{idx}', [row])
        
        # Get all values
        all_values = worksheet.get_all_values()
        
        if not all_values or len(all_values) < 1:
            return {}
        
        # Parse into dictionary by category (column-based)
        headers = all_values[0]  # First row contains category names
        options_by_category = {}
        
        # Create a mapping of normalized names to actual header names
        header_mapping = {}
        
        # Process each column
        for col_idx, category in enumerate(headers):
            if not category:
                continue
            
            # Normalize the category name (lowercase, strip spaces)
            normalized_category = category.strip().lower()
            
            # Store options under the normalized category name
            if normalized_category not in options_by_category:
                options_by_category[normalized_category] = []
            
            # Get all values in this column (skip header row)
            for row_idx in range(1, len(all_values)):
                if col_idx < len(all_values[row_idx]):
                    value = all_values[row_idx][col_idx].strip()
                    if value:  # Only add non-empty values
                        options_by_category[normalized_category].append({
                            "id": str(row_idx),  # Use row number as ID
                            "value": value,
                            "category": category  # Keep original category name
                        })
        
        # Also create entries with standard capitalization for common lookups
        standardized_mapping = {
            'visit id': 'Visit ID',
            'care center': 'Care Center',
            'provider': 'Provider',
            'sold by': 'Sold By',
            'external provider': 'External Provider',
            'discount': 'Discount',
            'status': 'Status'
        }
        
        # Add entries with standardized names
        final_options = {}
        for norm_key, options in options_by_category.items():
            # Add with normalized key
            final_options[norm_key] = options
            # Also add with standardized capitalization if available
            if norm_key in standardized_mapping:
                final_options[standardized_mapping[norm_key]] = options
        
        return final_options
    except Exception as e:
        print(f"Error fetching all dropdown options: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch dropdown options: {str(e)}")


def refresh_cache():
    """Refresh the cache from Google Sheets"""
    print("Refreshing dropdown cache from Google Sheets...")
    options_by_category = get_all_dropdown_options_from_sheet()
    _cache["data"] = options_by_category
    _cache["timestamp"] = datetime.now()
    save_cache_to_file()
    print(f"Cache refreshed with {len(options_by_category)} categories")


def get_dropdown_options(category: str) -> List[Dict[str, Any]]:
    """Get all options for a specific dropdown category (uses cache)"""
    try:
        # Check if cache is valid
        if not is_cache_valid():
            # Try to load from file first
            if not load_cache_from_file():
                # If file cache is also invalid, refresh from Google Sheets
                refresh_cache()
        
        # Try to get from cache with exact match first
        options = _cache["data"].get(category, None)
        
        # If not found, try normalized (lowercase) version
        if options is None:
            normalized_category = category.lower().strip()
            options = _cache["data"].get(normalized_category, [])
        
        return options
    except Exception as e:
        print(f"Error fetching dropdown options for {category}: {e}")
        # Return empty list on error to allow fallback to default options in frontend
        return []



def add_dropdown_option(category: str, value: str) -> Dict[str, Any]:
    """Add a new option to a dropdown category (column-based)"""
    try:
        print(f"=== ADDING DROPDOWN OPTION ===")
        print(f"Category: {category}")
        print(f"Value: {value}")
        
        client = get_google_sheet_client()
        if not CRM_ADMISSION_SHEET_ID:
            raise HTTPException(status_code=500, detail="CRM_Admission Sheet ID not configured")
        
        spreadsheet = client.open_by_key(CRM_ADMISSION_SHEET_ID)
        
        try:
            worksheet = spreadsheet.worksheet("Dropdown Options")
        except gspread.exceptions.WorksheetNotFound:
            print("Dropdown Options sheet not found, creating...")
            # Create worksheet if it doesn't exist
            refresh_cache()  # This will create the worksheet
            worksheet = spreadsheet.worksheet("Dropdown Options")
        
        # Get all values to find the right column and next empty row
        all_values = worksheet.get_all_values()
        print(f"Sheet has {len(all_values)} rows")
        
        if not all_values:
            raise HTTPException(status_code=500, detail="Worksheet is empty")
        
        headers = all_values[0]
        print(f"Headers: {headers}")
        
        # Find the column index for this category (case-insensitive)
        col_idx = -1
        for idx, header in enumerate(headers):
            if header.strip().lower() == category.lower():
                col_idx = idx
                break
        
        if col_idx == -1:
            raise HTTPException(
                status_code=400, 
                detail=f"Category '{category}' not found in headers. Available: {headers}. Please check the column names in your Google Sheet."
            )
        
        print(f"Column index for '{category}': {col_idx}")
        
        # Find the last non-empty row in this column
        last_filled_row = 0
        for row_idx in range(1, len(all_values)):
            if col_idx < len(all_values[row_idx]):
                if all_values[row_idx][col_idx].strip():
                    last_filled_row = row_idx
        
        # Next row is one after the last filled row
        next_row = last_filled_row + 2  # +1 for 0-indexed to 1-indexed, +1 for next row
        print(f"Last filled row: {last_filled_row + 1}, Next row: {next_row}")
        
        # Convert column index to letter
        col_letter = chr(65 + col_idx)  # A=65 in ASCII
        
        # Update the cell
        cell_address = f"{col_letter}{next_row}"
        print(f"Writing '{value}' to cell {cell_address}")
        worksheet.update(cell_address, [[value]])
        
        # Invalidate cache to force refresh on next request
        _cache["timestamp"] = None
        
        print(f"✓ Successfully added: {category} - {value} at {cell_address}")
        
        return {
            "id": str(next_row),
            "value": value,
            "category": category
        }
    except Exception as e:
        print(f"✗ Error adding dropdown option: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to add dropdown option: {str(e)}")


def delete_dropdown_option(category: str, option_id: str) -> Dict[str, str]:
    """Delete a dropdown option (column-based)"""
    try:
        client = get_google_sheet_client()
        if not CRM_ADMISSION_SHEET_ID:
            raise HTTPException(status_code=500, detail="CRM_Admission Sheet ID not configured")
        
        spreadsheet = client.open_by_key(CRM_ADMISSION_SHEET_ID)
        worksheet = spreadsheet.worksheet("Dropdown Options")
        all_values = worksheet.get_all_values()
        
        if not all_values:
            raise HTTPException(status_code=500, detail="Worksheet is empty")
        
        headers = all_values[0]
        
        # Find the column index for this category
        try:
            col_idx = headers.index(category)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Category '{category}' not found")
        
        # option_id is the row number
        row_idx = int(option_id)
        
        if row_idx < 2 or row_idx > len(all_values):
            raise HTTPException(status_code=404, detail=f"Invalid row number: {option_id}")
        
        # Convert column index to letter
        col_letter = chr(65 + col_idx)
        cell_address = f"{col_letter}{row_idx}"
        
        # Clear the cell
        worksheet.update(cell_address, [[""]])
        
        # Invalidate cache
        _cache["timestamp"] = None
        
        print(f"Deleted option: {category} at {cell_address}")
        
        return {"message": f"Option deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting dropdown option: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete dropdown option: {str(e)}")
