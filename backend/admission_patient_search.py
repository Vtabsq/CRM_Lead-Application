"""
Helper function to search patients from CRM Admission Sheet1
"""
import os
from typing import List, Dict, Any
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# Get environment variables
ADMISSION_SHEET_ID = os.getenv("PATIENT_ADMISSION_SHEET_ID")
ADMISSION_CREDENTIALS_FILE = "CRM-admission.json"

def search_admission_patients(query: str) -> List[Dict[str, Any]]:
    """
    Search patients from crm_admission Sheet1
    
    Args:
        query: Search query (Member ID or Patient Name)
    
    Returns:
        List of matching patients
    """
    try:
        # Authenticate with Google Sheets
        scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
        creds = ServiceAccountCredentials.from_json_keyfile_name(ADMISSION_CREDENTIALS_FILE, scope)
        client = gspread.authorize(creds)
        
        # Open the sheet
        spreadsheet = client.open_by_key(ADMISSION_SHEET_ID)
        worksheet = spreadsheet.worksheet("Sheet1")  # Use Sheet1 from crm_admission
        
        # Get all values
        all_values = worksheet.get_all_values()
        
        if not all_values or len(all_values) < 2:
            return []
        
        headers = all_values[0]
        header_map = {h.strip().lower(): i for i, h in enumerate(headers)}
        
        # Get column indices
        member_id_col = header_map.get('member id key', header_map.get('member id', -1))
        patient_name_col = header_map.get('patient name', -1)
        
        if member_id_col == -1 or patient_name_col == -1:
            print("[Admission Patient Search] Could not find required columns")
            return []
        
        # Search through rows
        results = []
        query_lower = query.lower().strip()
        
        for row in all_values[1:]:  # Skip header
            if len(row) <= max(member_id_col, patient_name_col):
                continue
            
            member_id = row[member_id_col].strip() if member_id_col < len(row) else ""
            patient_name = row[patient_name_col].strip() if patient_name_col < len(row) else ""
            
            # Check if query matches member ID or patient name
            if (query_lower in member_id.lower()) or (query_lower in patient_name.lower()):
                results.append({
                    "member_id": member_id,
                    "patient_name": patient_name,
                    "display": f"{member_id} - {patient_name}" if member_id else patient_name
                })
        
        return results[:50]  # Limit to 50 results
        
    except Exception as e:
        print(f"[Admission Patient Search] Error: {e}")
        return []
