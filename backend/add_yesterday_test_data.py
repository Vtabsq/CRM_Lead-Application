"""
Add test data with YESTERDAY's date for the 3 non-working dashboard cards
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

yesterday = get_yesterday()
print("="*80)
print(f"ADDING TEST DATA WITH YESTERDAY'S DATE: {yesterday}")
print("="*80)

client = get_client()

# 1. Add test data to Sheet1 for "Leads Converted Yesterday"
print("\n1. Adding test lead conversion to CRM LEADS - Sheet1...")
print(f"   Target: Date={yesterday}, Lead Status=Converted")
try:
    spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
    worksheet = spreadsheet.worksheet("Sheet1")
    
    # Get headers
    headers = worksheet.row_values(1)
    print(f"   Found {len(headers)} columns")
    
    # Create test row
    test_row = [""] * len(headers)
    
    # Set fields
    for i, header in enumerate(headers):
        if header == "Date":
            test_row[i] = yesterday
            print(f"   Set Date = {yesterday}")
        elif "Member ID" in header and "Key" in header:
            test_row[i] = f"CONV-TEST-{datetime.now().strftime('%H%M%S')}"
            print(f"   Set {header} = {test_row[i]}")
        elif header == "Patient Name":
            test_row[i] = "Test Converted Patient"
        elif header == "Lead Status":
            test_row[i] = "Converted"
            print(f"   Set Lead Status = Converted")
        elif header == "Mobile Number":
            test_row[i] = "9876543210"
        elif header == "Email Id":
            test_row[i] = "converted@test.com"
    
    worksheet.append_row(test_row)
    print("   ✓ SUCCESS: Added test conversion record")
except Exception as e:
    print(f"   ✗ ERROR: {e}")
    import traceback
    traceback.print_exc()

# 2. Add test data to CRM ADMISSION Sheet1 for "Patients Admitted"
print("\n2. Adding test patient admission to CRM ADMISSION - Sheet1...")
print(f"   Target: Check In Date={yesterday}")
try:
    spreadsheet = client.open_by_key(PATIENT_ADMISSION_SHEET_ID)
    worksheet = spreadsheet.worksheet("Sheet1")
    
    # Get headers
    headers = worksheet.row_values(1)
    print(f"   Found {len(headers)} columns")
    
    # Print relevant headers
    for i, h in enumerate(headers):
        if "check" in h.lower() or "date" in h.lower():
            print(f"   Column {i}: '{h}'")
    
    # Create test row
    test_row = [""] * len(headers)
    
    # Set fields
    for i, header in enumerate(headers):
        h_lower = header.lower()
        if "check in date" in h_lower or "check-in date" in h_lower or "checkin date" in h_lower:
            test_row[i] = yesterday
            print(f"   Set '{header}' = {yesterday}")
        elif "member id" in h_lower and "key" in h_lower:
            test_row[i] = f"ADM-TEST-{datetime.now().strftime('%H%M%S')}"
            print(f"   Set '{header}' = {test_row[i]}")
        elif "patient name" in h_lower:
            test_row[i] = "Test Admitted Patient"
        elif "mobile" in h_lower:
            test_row[i] = "9876543211"
    
    worksheet.append_row(test_row)
    print("   ✓ SUCCESS: Added test admission record")
except Exception as e:
    print(f"   ✗ ERROR: {e}")
    import traceback
    traceback.print_exc()

# 3. Add test data for "Patients Discharged"
print("\n3. Adding test patient discharge to CRM ADMISSION - Sheet1...")
print(f"   Target: Check Out Date={yesterday}")
try:
    spreadsheet = client.open_by_key(PATIENT_ADMISSION_SHEET_ID)
    worksheet = spreadsheet.worksheet("Sheet1")
    
    # Get headers
    headers = worksheet.row_values(1)
    
    # Create test row
    test_row = [""] * len(headers)
    
    # Set fields
    for i, header in enumerate(headers):
        h_lower = header.lower()
        if "check out date" in h_lower or "check-out date" in h_lower or "checkout date" in h_lower:
            test_row[i] = yesterday
            print(f"   Set '{header}' = {yesterday}")
        elif "member id" in h_lower and "key" in h_lower:
            test_row[i] = f"DIS-TEST-{datetime.now().strftime('%H%M%S')}"
            print(f"   Set '{header}' = {test_row[i]}")
        elif "patient name" in h_lower:
            test_row[i] = "Test Discharged Patient"
        elif "mobile" in h_lower:
            test_row[i] = "9876543212"
    
    worksheet.append_row(test_row)
    print("   ✓ SUCCESS: Added test discharge record")
except Exception as e:
    print(f"   ✗ ERROR: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*80)
print("TEST DATA CREATION COMPLETE!")
print("="*80)
print(f"\nAll test records created with YESTERDAY's date: {yesterday}")
print("\nNow testing the dashboard endpoints...")
print("="*80)

# Test the endpoints
import requests

print("\n4. Testing 'Leads Converted Yesterday' endpoint...")
try:
    response = requests.get("http://localhost:8000/api/dashboard/leads-converted-yesterday")
    data = response.json()
    print(f"   Status: {response.status_code}")
    print(f"   Count: {data.get('count', 0)}")
    print(f"   Date Filter: {data.get('date_filter', 'N/A')}")
    if data.get('count', 0) > 0:
        print("   ✓ SUCCESS: Data found!")
    else:
        print("   ✗ WARNING: Still showing 0 records")
except Exception as e:
    print(f"   ✗ ERROR: {e}")

print("\n5. Testing 'Patients Admitted' endpoint...")
try:
    response = requests.get("http://localhost:8000/api/dashboard/patients-admitted?date_filter=yesterday")
    data = response.json()
    print(f"   Status: {response.status_code}")
    print(f"   Count: {data.get('count', 0)}")
    print(f"   Date Filter: {data.get('date_filter', 'N/A')}")
    if data.get('count', 0) > 0:
        print("   ✓ SUCCESS: Data found!")
    else:
        print("   ✗ WARNING: Still showing 0 records")
except Exception as e:
    print(f"   ✗ ERROR: {e}")

print("\n6. Testing 'Patients Discharged' endpoint...")
try:
    response = requests.get("http://localhost:8000/api/dashboard/patients-discharged")
    data = response.json()
    print(f"   Status: {response.status_code}")
    print(f"   Count: {data.get('count', 0)}")
    print(f"   Date Filter: {data.get('date_filter', 'N/A')}")
    if data.get('count', 0) > 0:
        print("   ✓ SUCCESS: Data found!")
    else:
        print("   ✗ WARNING: Still showing 0 records")
except Exception as e:
    print(f"   ✗ ERROR: {e}")

print("\n" + "="*80)
print("DONE! Check the results above.")
print("="*80)
