"""
Check actual data in sheets to understand why cards show 0 records
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
print("CHECKING ACTUAL DATA IN SHEETS")
print("="*80)
print(f"Yesterday: {get_yesterday()}")
print(f"Today: {get_today()}")
print()

client = get_client()

# Check Sheet1 for Leads Converted
print("1. CRM LEADS - Sheet1 (Leads Converted Yesterday)")
print("="*80)
spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
worksheet = spreadsheet.worksheet("Sheet1")
all_values = worksheet.get_all_values()

if all_values and len(all_values) > 1:
    headers = all_values[0]
    print(f"Total rows: {len(all_values) - 1}")
    print(f"Headers: {headers}")
    print()
    
    # Check for Date and Lead Status columns
    date_idx = headers.index("Date") if "Date" in headers else -1
    status_idx = headers.index("Lead Status") if "Lead Status" in headers else -1
    
    print(f"Date column index: {date_idx}")
    print(f"Lead Status column index: {status_idx}")
    print()
    
    # Show first 3 data rows
    print("First 3 data rows:")
    for i in range(1, min(4, len(all_values))):
        row = all_values[i]
        date_val = row[date_idx] if date_idx >= 0 and date_idx < len(row) else "N/A"
        status_val = row[status_idx] if status_idx >= 0 and status_idx < len(row) else "N/A"
        print(f"  Row {i}: Date='{date_val}', Lead Status='{status_val}'")

print()
print("2. CRM ADMISSION - Patient Admission (Patients Admitted/Discharged)")
print("="*80)
spreadsheet = client.open_by_key(PATIENT_ADMISSION_SHEET_ID)
worksheet = spreadsheet.worksheet("Patient Admission")
all_values = worksheet.get_all_values()

if all_values and len(all_values) > 1:
    headers = all_values[0]
    print(f"Total rows: {len(all_values) - 1}")
    print(f"Headers: {headers}")
    print()
    
    # Check for Check In Date and Check Out Date columns
    checkin_idx = -1
    checkout_idx = -1
    for i, h in enumerate(headers):
        if "check in" in h.lower() or "checkin" in h.lower():
            checkin_idx = i
        if "check out" in h.lower() or "checkout" in h.lower():
            checkout_idx = i
    
    print(f"Check In Date column index: {checkin_idx} ({headers[checkin_idx] if checkin_idx >= 0 else 'NOT FOUND'})")
    print(f"Check Out Date column index: {checkout_idx} ({headers[checkout_idx] if checkout_idx >= 0 else 'NOT FOUND'})")
    print()
    
    # Show first 3 data rows
    print("First 3 data rows:")
    for i in range(1, min(4, len(all_values))):
        row = all_values[i]
        checkin_val = row[checkin_idx] if checkin_idx >= 0 and checkin_idx < len(row) else "N/A"
        checkout_val = row[checkout_idx] if checkout_idx >= 0 and checkout_idx < len(row) else "N/A"
        print(f"  Row {i}: Check In='{checkin_val}', Check Out='{checkout_val}'")

print()
print("3. CRM LEADS - Enquiries (Follow-ups Today)")
print("="*80)
spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
worksheet = spreadsheet.worksheet("Enquiries")
all_values = worksheet.get_all_values()

if all_values and len(all_values) > 1:
    headers = all_values[0]
    print(f"Total rows: {len(all_values) - 1}")
    
    # Check for Follow_1 Date column
    follow_idx = -1
    for i, h in enumerate(headers):
        if "follow" in h.lower() and "date" in h.lower():
            follow_idx = i
            break
    
    print(f"Follow-up Date column index: {follow_idx} ({headers[follow_idx] if follow_idx >= 0 else 'NOT FOUND'})")
    print()
    
    # Show first 3 data rows
    if follow_idx >= 0:
        print("First 3 data rows:")
        for i in range(1, min(4, len(all_values))):
            row = all_values[i]
            follow_val = row[follow_idx] if follow_idx < len(row) else "N/A"
            print(f"  Row {i}: Follow Date='{follow_val}'")

print()
print("="*80)
