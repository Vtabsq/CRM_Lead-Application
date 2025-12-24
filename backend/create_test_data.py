"""
Create test data for all dashboard cards
This will add records with TODAY's date so we can verify the dashboard works
"""
import gspread
from google.oauth2.service_account import Credentials
import os
from dotenv import load_dotenv
from datetime import datetime

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

def get_today():
    return datetime.now().strftime("%d-%m-%Y")

today = get_today()
print("="*80)
print(f"CREATING TEST DATA FOR TODAY: {today}")
print("="*80)

client = get_client()

# 1. Add test data to Sheet1 for "Leads Converted Yesterday"
print("\n1. Adding test lead conversion to CRM LEADS - Sheet1...")
try:
    spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
    worksheet = spreadsheet.worksheet("Sheet1")
    
    # Get headers to find the right columns
    headers = worksheet.row_values(1)
    
    # Create a test row with today's date and "Converted" status
    test_row = [""] * len(headers)
    
    # Set key fields
    if "Date" in headers:
        test_row[headers.index("Date")] = today
    if "Member ID Key" in headers or "Member ID key" in headers:
        idx = headers.index("Member ID Key") if "Member ID Key" in headers else headers.index("Member ID key")
        test_row[idx] = f"TEST-CONV-{datetime.now().strftime('%H%M%S')}"
    if "Patient Name" in headers:
        test_row[headers.index("Patient Name")] = "Test Patient - Converted"
    if "Lead Status" in headers:
        test_row[headers.index("Lead Status")] = "Converted"
    if "Mobile Number" in headers:
        test_row[headers.index("Mobile Number")] = "9999999999"
    if "Email Id" in headers:
        test_row[headers.index("Email Id")] = "test@example.com"
    
    worksheet.append_row(test_row)
    print("   ✓ Added test conversion record")
except Exception as e:
    print(f"   ✗ Error: {e}")

# 2. Add test data to CRM ADMISSION Sheet1 for "Patients Admitted"
print("\n2. Adding test patient admission to CRM ADMISSION - Sheet1...")
try:
    spreadsheet = client.open_by_key(PATIENT_ADMISSION_SHEET_ID)
    worksheet = spreadsheet.worksheet("Sheet1")
    
    # Get headers
    headers = worksheet.row_values(1)
    
    # Create a test row
    test_row = [""] * len(headers)
    
    # Set key fields
    for i, header in enumerate(headers):
        h_lower = header.lower()
        if "check in" in h_lower or "checkin" in h_lower:
            test_row[i] = today
        elif "member id" in h_lower:
            test_row[i] = f"TEST-ADM-{datetime.now().strftime('%H%M%S')}"
        elif "patient name" in h_lower and "check" not in h_lower:
            test_row[i] = "Test Patient - Admitted"
        elif "mobile" in h_lower:
            test_row[i] = "8888888888"
    
    worksheet.append_row(test_row)
    print("   ✓ Added test admission record")
except Exception as e:
    print(f"   ✗ Error: {e}")

# 3. Add test data for "Patients Discharged"
print("\n3. Adding test patient discharge to CRM ADMISSION - Sheet1...")
try:
    spreadsheet = client.open_by_key(PATIENT_ADMISSION_SHEET_ID)
    worksheet = spreadsheet.worksheet("Sheet1")
    
    # Get headers
    headers = worksheet.row_values(1)
    
    # Create a test row
    test_row = [""] * len(headers)
    
    # Set key fields
    for i, header in enumerate(headers):
        h_lower = header.lower()
        if "check out" in h_lower or "checkout" in h_lower:
            test_row[i] = today
        elif "member id" in h_lower:
            test_row[i] = f"TEST-DIS-{datetime.now().strftime('%H%M%S')}"
        elif "patient name" in h_lower and "check" not in h_lower:
            test_row[i] = "Test Patient - Discharged"
        elif "mobile" in h_lower:
            test_row[i] = "7777777777"
    
    worksheet.append_row(test_row)
    print("   ✓ Added test discharge record")
except Exception as e:
    print(f"   ✗ Error: {e}")

# 4. Add test data to Enquiries for "Follow-ups Today"
print("\n4. Adding test follow-up to CRM LEADS - Enquiries...")
try:
    spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
    worksheet = spreadsheet.worksheet("Enquiries")
    
    # Get headers
    headers = worksheet.row_values(1)
    
    # Create a test row
    test_row = [""] * len(headers)
    
    # Set key fields
    for i, header in enumerate(headers):
        h_lower = header.lower()
        if "follow" in h_lower and "1" in header and "date" in h_lower:
            test_row[i] = today
        elif "date" in h_lower and "follow" not in h_lower and "reminder" not in h_lower:
            # Set enquiry date to a few days ago
            test_row[i] = "20-12-2025"
        elif "member id" in h_lower:
            test_row[i] = f"TEST-FOL-{datetime.now().strftime('%H%M%S')}"
        elif "patient name" in h_lower:
            test_row[i] = "Test Patient - Follow-up"
        elif "mobile" in h_lower:
            test_row[i] = "6666666666"
    
    worksheet.append_row(test_row)
    print("   ✓ Added test follow-up record")
except Exception as e:
    print(f"   ✗ Error: {e}")

print("\n" + "="*80)
print("TEST DATA CREATION COMPLETE!")
print("="*80)
print(f"\nNOTE: All test records were created with TODAY's date: {today}")
print("To see them in the dashboard, you need to:")
print("  1. Change the date filter to 'today' for Patients Admitted")
print("  2. The other cards filter by 'yesterday', so they won't show today's data")
print("\nAlternatively, wait until tomorrow and these records will appear in:")
print("  - Leads Converted Yesterday")
print("  - Patients Admitted (yesterday)")
print("  - Patients Discharged")
print("  - Follow-ups will only show if the follow-up date matches")
