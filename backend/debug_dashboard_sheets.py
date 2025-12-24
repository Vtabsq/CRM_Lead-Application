"""
Debug Dashboard Data - Check actual sheet contents
"""
import gspread
from google.oauth2.service_account import Credentials
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

CREDENTIALS_FILE = os.getenv("CREDENTIALS_FILE", "google_credentials.json")
GOOGLE_SHEET_ID = os.getenv("GOOGLE_SHEET_ID")
PATIENT_ADMISSION_SHEET_ID = os.getenv("PATIENT_ADMISSION_SHEET_ID")

def get_client():
    scope = [
        'https://spreadsheets.google.com/feeds',
        'https://www.googleapis.com/auth/drive'
    ]
    creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
    return gspread.authorize(creds)

def get_yesterday():
    yesterday = datetime.now() - timedelta(days=1)
    return yesterday.strftime("%d-%m-%Y")

def get_today():
    return datetime.now().strftime("%d-%m-%Y")

print("="*80)
print("DASHBOARD DATA DEBUG")
print("="*80)
print(f"Yesterday: {get_yesterday()}")
print(f"Today: {get_today()}")
print()

try:
    client = get_client()
    
    # Check CRM Leads - Sheet1
    print("="*80)
    print("1. CRM LEADS - Sheet1 (for Leads Converted Yesterday)")
    print("="*80)
    if GOOGLE_SHEET_ID:
        spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
        try:
            worksheet = spreadsheet.worksheet("Sheet1")
            all_values = worksheet.get_all_values()
            if all_values:
                headers = all_values[0]
                print(f"Headers: {headers[:10]}...")  # First 10 headers
                print(f"Total rows: {len(all_values) - 1}")
                
                # Show first data row
                if len(all_values) > 1:
                    print(f"\nFirst data row:")
                    row_dict = {headers[i]: all_values[1][i] if i < len(all_values[1]) else "" for i in range(len(headers))}
                    for key in ["Date", "Lead Status", "Member ID Key", "Patient Name"]:
                        print(f"  {key}: {row_dict.get(key, 'NOT FOUND')}")
        except Exception as e:
            print(f"Error accessing Sheet1: {e}")
    
    print()
    
    # Check CRM Leads - Enquiries
    print("="*80)
    print("2. CRM LEADS - Enquiries (for Previous Day Enquiries & Follow-ups)")
    print("="*80)
    if GOOGLE_SHEET_ID:
        spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
        try:
            worksheet = spreadsheet.worksheet("Enquiries")
            all_values = worksheet.get_all_values()
            if all_values:
                headers = all_values[0]
                print(f"Headers: {headers[:10]}...")
                print(f"Total rows: {len(all_values) - 1}")
                
                if len(all_values) > 1:
                    print(f"\nFirst data row:")
                    row_dict = {headers[i]: all_values[1][i] if i < len(all_values[1]) else "" for i in range(len(headers))}
                    for key in ["Date", "Follow_1 Date", "Member ID Key", "Patient Name"]:
                        print(f"  {key}: {row_dict.get(key, 'NOT FOUND')}")
        except Exception as e:
            print(f"Error accessing Enquiries: {e}")
    
    print()
    
    # Check CRM Admission - Sheet1
    print("="*80)
    print("3. CRM ADMISSION - Sheet1 (for Patients Admitted & Discharged)")
    print("="*80)
    if PATIENT_ADMISSION_SHEET_ID:
        spreadsheet = client.open_by_key(PATIENT_ADMISSION_SHEET_ID)
        try:
            worksheet = spreadsheet.worksheet("Sheet1")
            all_values = worksheet.get_all_values()
            if all_values:
                headers = all_values[0]
                print(f"Headers: {headers[:10]}...")
                print(f"Total rows: {len(all_values) - 1}")
                
                if len(all_values) > 1:
                    print(f"\nFirst data row:")
                    row_dict = {headers[i]: all_values[1][i] if i < len(all_values[1]) else "" for i in range(len(headers))}
                    for key in ["Check In Date", "Check-In Date", "Check Out Date", "Check-Out Date", "Patient Name"]:
                        print(f"  {key}: {row_dict.get(key, 'NOT FOUND')}")
        except Exception as e:
            print(f"Error accessing Sheet1: {e}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

print()
print("="*80)
print("DEBUG COMPLETE")
print("="*80)
