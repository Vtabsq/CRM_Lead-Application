"""
Setup Script for Accounts Receivable Sheet
This script will create the "Accounts Receivable" sheet in your CRM_Admission Google Sheet
with all the required columns for the Invoice module.
"""

import os
import gspread
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
CREDENTIALS_FILE = os.getenv("CREDENTIALS_FILE", "google_credentials.json")
ADMISSION_CREDENTIALS_FILE = "CRM-admission.json"
CRM_ADMISSION_SHEET_ID = os.getenv("PATIENT_ADMISSION_SHEET_ID")

# Required columns for Accounts Receivable sheet
INVOICE_COLUMNS = [
    "Date",
    "Invoice Date",
    "Invoice Ref",
    "Member ID Key",
    "Patient ID",
    "Patient Name",
    "Patient Last Name",
    "Gender",
    "Date of Birth",
    "Age",
    "Blood Group",
    "Patient Marital",
    "Nationality",
    "Religion",
    "Aadhaar",
    "ID Proof Type",
    "ID Proof Number",
    "Door Number",
    "Street",
    "City",
    "District",
    "State",
    "Pin Code",
    "Mobile Number",
    "Email Id",
    "Visit ID",
    "Care Center",
    "Corporate Customer",
    "Service Name",
    "Provider",
    "Perform Date",
    "Price",
    "Quantity",
    "Discount",
    "Tax Type",
    "Tax Amount",
    "Amount",
    "Sold By",
    "External Provider",
    "Notes",
    "Total Amount",
    "Status",
    "Created At",
    "Updated At"
]


def get_google_sheet_client():
    """Get authenticated gspread client"""
    # Try CRM-admission.json first, fallback to google_credentials.json
    creds_file = ADMISSION_CREDENTIALS_FILE if os.path.exists(ADMISSION_CREDENTIALS_FILE) else CREDENTIALS_FILE
    
    if not os.path.exists(creds_file):
        raise Exception(f"Credentials file not found: {creds_file}")
    
    scope = [
        'https://spreadsheets.google.com/feeds',
        'https://www.googleapis.com/auth/drive'
    ]
    creds = Credentials.from_service_account_file(creds_file, scopes=scope)
    client = gspread.authorize(creds)
    return client


def create_accounts_receivable_sheet():
    """Create Accounts Receivable sheet with proper columns"""
    
    print("\n" + "="*70)
    print("Setting up Accounts Receivable Sheet")
    print("="*70)
    
    # Check if sheet ID is configured
    if not CRM_ADMISSION_SHEET_ID:
        print("\n❌ Error: PATIENT_ADMISSION_SHEET_ID not found in .env file")
        print("\nPlease add to backend/.env:")
        print("PATIENT_ADMISSION_SHEET_ID=your_crm_admission_sheet_id")
        return False
    
    try:
        # Connect to Google Sheets
        print(f"\n📡 Connecting to CRM_Admission sheet...")
        client = get_google_sheet_client()
        spreadsheet = client.open_by_key(CRM_ADMISSION_SHEET_ID)
        print(f"✅ Connected to: {spreadsheet.title}")
        
        # Check if "Accounts Receivable" sheet already exists
        try:
            existing_sheet = spreadsheet.worksheet("Accounts Receivable")
            print(f"\n⚠️  'Accounts Receivable' sheet already exists!")
            
            response = input("\nDo you want to recreate it? This will DELETE all existing data! (yes/no): ")
            if response.lower() != 'yes':
                print("\n✋ Cancelled. Existing sheet preserved.")
                return False
            
            # Delete existing sheet
            spreadsheet.del_worksheet(existing_sheet)
            print("🗑️  Deleted existing 'Accounts Receivable' sheet")
            
        except gspread.exceptions.WorksheetNotFound:
            print("\n📝 'Accounts Receivable' sheet does not exist. Creating new one...")
        
        # Create new sheet
        print(f"\n🔨 Creating 'Accounts Receivable' sheet with {len(INVOICE_COLUMNS)} columns...")
        new_sheet = spreadsheet.add_worksheet(
            title="Accounts Receivable",
            rows=1000,
            cols=len(INVOICE_COLUMNS)
        )
        
        # Add header row
        print("📋 Adding column headers...")
        new_sheet.update('A1', [INVOICE_COLUMNS])
        
        # Format header row
        print("🎨 Formatting header row...")
        new_sheet.format('A1:AO1', {
            "backgroundColor": {
                "red": 0.2,
                "green": 0.6,
                "blue": 0.4
            },
            "textFormat": {
                "foregroundColor": {
                    "red": 1.0,
                    "green": 1.0,
                    "blue": 1.0
                },
                "fontSize": 11,
                "bold": True
            },
            "horizontalAlignment": "CENTER"
        })
        
        # Freeze header row
        new_sheet.freeze(rows=1)
        
        print("\n✅ Successfully created 'Accounts Receivable' sheet!")
        print(f"\n📊 Sheet Details:")
        print(f"   Name: {new_sheet.title}")
        print(f"   Columns: {len(INVOICE_COLUMNS)}")
        print(f"   Rows: 1000")
        print(f"   URL: {spreadsheet.url}")
        
        print(f"\n📋 Columns created:")
        for i, col in enumerate(INVOICE_COLUMNS, 1):
            print(f"   {i:2d}. {col}")
        
        print("\n" + "="*70)
        print("✨ Setup Complete!")
        print("="*70)
        print("\nYou can now:")
        print("1. Test the connection: python test_sheets_connection.py")
        print("2. Start creating invoices from the frontend")
        print("3. View the sheet at:", spreadsheet.url)
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("\n🚀 CRM Invoice Module - Sheet Setup")
    print("="*70)
    print("\nThis script will create the 'Accounts Receivable' sheet")
    print("in your CRM_Admission Google Sheet with all required columns.")
    print("\n⚠️  Make sure you have:")
    print("   1. PATIENT_ADMISSION_SHEET_ID set in backend/.env")
    print("   2. google_credentials.json (or CRM-admission.json) in backend/")
    print("   3. Service account has Editor access to the sheet")
    
    input("\nPress Enter to continue or Ctrl+C to cancel...")
    
    success = create_accounts_receivable_sheet()
    
    if success:
        print("\n🎉 All done! Your Invoice module is ready to use.")
    else:
        print("\n⚠️  Setup incomplete. Please check the errors above.")
