"""
Dashboard Service Module
Handles data fetching and processing for the CRM Home Page Dashboard
"""

from typing import List, Dict, Any, Optional
import gspread
from google.oauth2.service_account import Credentials
import os
from datetime import datetime, timedelta
from fastapi import HTTPException
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
CREDENTIALS_FILE = os.getenv("CREDENTIALS_FILE", "google_credentials.json")
GOOGLE_SHEET_ID = os.getenv("GOOGLE_SHEET_ID")
PATIENT_ADMISSION_SHEET_ID = os.getenv("PATIENT_ADMISSION_SHEET_ID")


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


def get_today() -> str:
    """Get today's date in DD-MM-YYYY format"""
    return datetime.now().strftime("%d-%m-%Y")


def get_yesterday() -> str:
    """Get yesterday's date in DD-MM-YYYY format"""
    yesterday = datetime.now() - timedelta(days=1)
    return yesterday.strftime("%d-%m-%Y")


def parse_date(date_str: str) -> Optional[datetime]:
    """Parse date string in various formats to datetime object"""
    if not date_str or not isinstance(date_str, str):
        return None
    
    date_str = date_str.strip()
    if not date_str:
        return None
    
    # Try different date formats
    formats = [
        "%d-%m-%Y",
        "%Y-%m-%d",
        "%d/%m/%Y",
        "%Y/%m/%d",
        "%d.%m.%Y",
        "%Y.%m.%d"
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    
    return None


def compare_dates(date_str: str, target_date: str) -> bool:
    """Compare two date strings (returns True if they match)"""
    parsed_date = parse_date(date_str)
    parsed_target = parse_date(target_date)
    
    if not parsed_date or not parsed_target:
        return False
    
    return parsed_date.date() == parsed_target.date()


def calculate_follow_up_days(follow_up_date: str) -> str:
    """Calculate days until/since follow-up date"""
    if not follow_up_date:
        return "-"
    
    parsed_date = parse_date(follow_up_date)
    if not parsed_date:
        return "-"
    
    today = datetime.now().date()
    delta = (parsed_date.date() - today).days
    
    if delta == 0:
        return "Today"
    elif delta > 0:
        return f"In {delta} days"
    else:
        return f"{abs(delta)} days ago"


def transform_to_table_format(row: Dict[str, Any], row_type: str = "enquiry") -> Dict[str, Any]:
    """Transform raw sheet row to consistent table format"""
    
    # Helper to get value with multiple possible keys
    def get_value(*keys):
        for key in keys:
            val = row.get(key, "")
            if val and str(val).strip():
                return str(val).strip()
        return ""
    
    # Extract common fields
    member_id = get_value("Member ID Key", "Member ID key", "Member ID", "Memberidkey", "member id key")
    
    if row_type == "admission":
        name = get_value("Patient Name", "patient name", "Name", "name")
    else:
        name = get_value("Patient Name", "patient name", "Attender Name", "attender name", "Name", "name")
    
    mobile = get_value("Mobile Number", "mobile number", "Mobile", "mobile", "Phone", "phone")
    email = get_value("Email Id", "Email ID", "email id", "Email", "email")
    pain_point = get_value("Pain Point", "pain point", "Diagnosis", "diagnosis")
    
    # Follow-up date handling
    follow_up_date = get_value(
        "Follow_1 Date", "Follow1 Date", "Follow-Up Date", 
        "follow up date", "Next Follow Up", "next follow up"
    )
    follow_up_days = calculate_follow_up_days(follow_up_date)
    
    # Status
    if row_type == "admission":
        status = get_value("Patient Current Status", "patient current status", "Status", "status")
    else:
        status = get_value("Lead Status", "lead status", "Status", "status")
    
    return {
        "member_id_key": member_id,
        "name": name,
        "mobile": mobile,
        "email_id": email,
        "pain_point": pain_point,
        "follow_up_days": follow_up_days,
        "status": status
    }


def get_previous_day_enquiries() -> Dict[str, Any]:
    """Get all enquiries created yesterday"""
    try:
        client = get_google_sheet_client()
        if not GOOGLE_SHEET_ID:
            raise HTTPException(status_code=500, detail="Google Sheet ID not configured")
        
        spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
        worksheet = spreadsheet.worksheet("Enquiries")
        
        all_values = worksheet.get_all_values()
        if not all_values or len(all_values) < 2:
            return {"data": [], "count": 0, "date_filter": get_yesterday()}
        
        headers = all_values[0]
        yesterday = get_yesterday()
        
        results = []
        for row in all_values[1:]:
            if not any(row):
                continue
            
            row_dict = {}
            for idx, header in enumerate(headers):
                if idx < len(row):
                    row_dict[header] = row[idx]
            
            # Filter by date
            enquiry_date = row_dict.get("Date", "")
            if compare_dates(enquiry_date, yesterday):
                results.append(transform_to_table_format(row_dict, "enquiry"))
        
        return {
            "data": results,
            "count": len(results),
            "date_filter": yesterday
        }
    
    except Exception as e:
        print(f"Error fetching previous day enquiries: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch enquiries: {str(e)}")


def get_leads_converted_yesterday() -> Dict[str, Any]:
    """Get enquiries converted to admission yesterday"""
    try:
        client = get_google_sheet_client()
        if not GOOGLE_SHEET_ID:
            raise HTTPException(status_code=500, detail="Google Sheet ID not configured")
        
        spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
        worksheet = spreadsheet.worksheet("Enquiries")
        
        all_values = worksheet.get_all_values()
        if not all_values or len(all_values) < 2:
            return {"data": [], "count": 0, "date_filter": get_yesterday()}
        
        headers = all_values[0]
        yesterday = get_yesterday()
        
        # Conversion statuses as specified
        conversion_statuses = ["converted", "contact", "interested", "clost-lost"]
        
        results = []
        for row in all_values[1:]:
            if not any(row):
                continue
            
            row_dict = {}
            for idx, header in enumerate(headers):
                if idx < len(row):
                    row_dict[header] = row[idx]
            
            # Filter by date AND status
            enquiry_date = row_dict.get("Date", "")
            lead_status = str(row_dict.get("Lead Status", "")).strip().lower()
            
            if compare_dates(enquiry_date, yesterday) and lead_status in conversion_statuses:
                results.append(transform_to_table_format(row_dict, "enquiry"))
        
        return {
            "data": results,
            "count": len(results),
            "date_filter": yesterday
        }
    
    except Exception as e:
        print(f"Error fetching converted leads: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch converted leads: {str(e)}")


def get_patients_admitted(date_filter: str = "yesterday") -> Dict[str, Any]:
    """Get patients admitted (yesterday or today)"""
    try:
        client = get_google_sheet_client()
        if not PATIENT_ADMISSION_SHEET_ID:
            raise HTTPException(status_code=500, detail="Patient Admission Sheet ID not configured")
        
        spreadsheet = client.open_by_key(PATIENT_ADMISSION_SHEET_ID)
        worksheet = spreadsheet.worksheet("Sheet1")
        
        all_values = worksheet.get_all_values()
        if not all_values or len(all_values) < 2:
            target_date = get_yesterday() if date_filter == "yesterday" else get_today()
            return {"data": [], "count": 0, "date_filter": target_date}
        
        headers = all_values[0]
        target_date = get_yesterday() if date_filter == "yesterday" else get_today()
        
        results = []
        for row in all_values[1:]:
            if not any(row):
                continue
            
            row_dict = {}
            for idx, header in enumerate(headers):
                if idx < len(row):
                    row_dict[header] = row[idx]
            
            # Filter by check-in date
            check_in_date = row_dict.get("Check In Date", "") or row_dict.get("Check-In Date", "")
            if compare_dates(check_in_date, target_date):
                results.append(transform_to_table_format(row_dict, "admission"))
        
        return {
            "data": results,
            "count": len(results),
            "date_filter": target_date
        }
    
    except Exception as e:
        print(f"Error fetching admitted patients: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch admitted patients: {str(e)}")


def get_patients_discharged() -> Dict[str, Any]:
    """Get patients discharged yesterday"""
    try:
        client = get_google_sheet_client()
        if not PATIENT_ADMISSION_SHEET_ID:
            raise HTTPException(status_code=500, detail="Patient Admission Sheet ID not configured")
        
        spreadsheet = client.open_by_key(PATIENT_ADMISSION_SHEET_ID)
        worksheet = spreadsheet.worksheet("Sheet1")
        
        all_values = worksheet.get_all_values()
        if not all_values or len(all_values) < 2:
            return {"data": [], "count": 0, "date_filter": get_yesterday()}
        
        headers = all_values[0]
        yesterday = get_yesterday()
        
        results = []
        for row in all_values[1:]:
            if not any(row):
                continue
            
            row_dict = {}
            for idx, header in enumerate(headers):
                if idx < len(row):
                    row_dict[header] = row[idx]
            
            # Filter by check-out date
            check_out_date = row_dict.get("Check Out Date", "") or row_dict.get("Check-Out Date", "")
            if compare_dates(check_out_date, yesterday):
                results.append(transform_to_table_format(row_dict, "admission"))
        
        return {
            "data": results,
            "count": len(results),
            "date_filter": yesterday
        }
    
    except Exception as e:
        print(f"Error fetching discharged patients: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch discharged patients: {str(e)}")


def get_follow_ups_today() -> Dict[str, Any]:
    """Get enquiries with follow-up due today"""
    try:
        client = get_google_sheet_client()
        if not GOOGLE_SHEET_ID:
            raise HTTPException(status_code=500, detail="Google Sheet ID not configured")
        
        spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
        worksheet = spreadsheet.worksheet("Enquiries")
        
        all_values = worksheet.get_all_values()
        if not all_values or len(all_values) < 2:
            return {"data": [], "count": 0, "date_filter": get_today()}
        
        headers = all_values[0]
        today = get_today()
        
        results = []
        for row in all_values[1:]:
            if not any(row):
                continue
            
            row_dict = {}
            for idx, header in enumerate(headers):
                if idx < len(row):
                    row_dict[header] = row[idx]
            
            # Check all follow-up date columns
            follow_up_dates = [
                row_dict.get("Follow_1 Date", ""),
                row_dict.get("Follow_2 Date", ""),
                row_dict.get("Follow_3 Date", ""),
                row_dict.get("Follow_4 Date", "")
            ]
            
            # If any follow-up date matches today
            for follow_date in follow_up_dates:
                if compare_dates(follow_date, today):
                    results.append(transform_to_table_format(row_dict, "enquiry"))
                    break  # Only add once per row
        
        return {
            "data": results,
            "count": len(results),
            "date_filter": today
        }
    
    except Exception as e:
        print(f"Error fetching follow-ups: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch follow-ups: {str(e)}")
