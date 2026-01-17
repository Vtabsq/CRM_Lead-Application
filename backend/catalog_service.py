"""
Service Catalog Module
Manages services, packages, and products in Google Sheets
"""

from typing import List, Dict, Any
import gspread
from google.oauth2.service_account import Credentials
import os
from fastapi import HTTPException
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
CREDENTIALS_FILE = os.getenv("CREDENTIALS_FILE", "google_credentials.json")
CRM_ADMISSION_SHEET_ID = os.getenv("PATIENT_ADMISSION_SHEET_ID")


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


def get_catalog_sheet(sheet_name: str):
    """Get catalog worksheet (Services, Packages, or Products)"""
    try:
        client = get_google_sheet_client()
        if not CRM_ADMISSION_SHEET_ID:
            raise HTTPException(status_code=500, detail="CRM_Admission Sheet ID not configured")
        
        spreadsheet = client.open_by_key(CRM_ADMISSION_SHEET_ID)
        
        # Try to get existing worksheet or create new one
        try:
            worksheet = spreadsheet.worksheet(sheet_name)
        except gspread.exceptions.WorksheetNotFound:
            # Create new worksheet with headers
            worksheet = spreadsheet.add_worksheet(title=sheet_name, rows=1000, cols=10)
            worksheet.update('A1:C1', [['ID', 'Name', 'Price']])
        
        return worksheet
    except Exception as e:
        print(f"Error accessing {sheet_name} sheet: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to access {sheet_name} sheet: {str(e)}")


def get_catalog_items(category: str) -> List[Dict[str, Any]]:
    """Get all items from a catalog category (Services, Packages, or Products)"""
    try:
        sheet_name = category.capitalize()
        worksheet = get_catalog_sheet(sheet_name)
        all_values = worksheet.get_all_values()
        
        if not all_values or len(all_values) < 2:
            return []
        
        # Get headers
        headers = all_values[0]
        
        results = []
        for row in all_values[1:]:
            if not any(row):  # Skip empty rows
                continue
            
            item = {}
            for idx, header in enumerate(headers):
                if idx < len(row):
                    item[header.lower()] = row[idx]
            
            # Convert to expected format
            results.append({
                "id": int(item.get("id", 0)) if item.get("id", "").isdigit() else 0,
                "name": item.get("name", ""),
                "price": float(item.get("price", 0)) if item.get("price", "") else 0
            })
        
        return results
    except Exception as e:
        print(f"Error fetching {category}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch {category}: {str(e)}")


def create_catalog_item(category: str, item_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new catalog item"""
    try:
        sheet_name = category.capitalize()
        worksheet = get_catalog_sheet(sheet_name)
        
        # Get all existing items to determine next ID
        all_values = worksheet.get_all_values()
        max_id = 0
        if len(all_values) > 1:
            for row in all_values[1:]:
                if row and row[0].isdigit():
                    max_id = max(max_id, int(row[0]))
        
        new_id = max_id + 1
        
        # Append new row
        new_row = [new_id, item_data.get("name", ""), item_data.get("price", 0)]
        worksheet.append_row(new_row)
        
        return {
            "id": new_id,
            "name": item_data.get("name", ""),
            "price": float(item_data.get("price", 0))
        }
    except Exception as e:
        print(f"Error creating {category} item: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create {category} item: {str(e)}")


def update_catalog_item(category: str, item_id: int, item_data: Dict[str, Any]) -> Dict[str, Any]:
    """Update an existing catalog item"""
    try:
        sheet_name = category.capitalize()
        worksheet = get_catalog_sheet(sheet_name)
        all_values = worksheet.get_all_values()
        
        # Find the row with matching ID
        row_index = None
        for idx, row in enumerate(all_values[1:], start=2):  # Start from row 2 (skip header)
            if row and row[0] == str(item_id):
                row_index = idx
                break
        
        if row_index is None:
            raise HTTPException(status_code=404, detail=f"Item {item_id} not found")
        
        # Update the row
        updated_row = [item_id, item_data.get("name", ""), item_data.get("price", 0)]
        worksheet.update(f'A{row_index}:C{row_index}', [updated_row])
        
        return {
            "id": item_id,
            "name": item_data.get("name", ""),
            "price": float(item_data.get("price", 0))
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating {category} item: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update {category} item: {str(e)}")


def delete_catalog_item(category: str, item_id: int) -> Dict[str, str]:
    """Delete a catalog item"""
    try:
        sheet_name = category.capitalize()
        worksheet = get_catalog_sheet(sheet_name)
        all_values = worksheet.get_all_values()
        
        # Find the row with matching ID
        row_index = None
        for idx, row in enumerate(all_values[1:], start=2):  # Start from row 2 (skip header)
            if row and row[0] == str(item_id):
                row_index = idx
                break
        
        if row_index is None:
            raise HTTPException(status_code=404, detail=f"Item {item_id} not found")
        
        # Delete the row
        worksheet.delete_rows(row_index)
        
        return {"message": f"Item {item_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting {category} item: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete {category} item: {str(e)}")
