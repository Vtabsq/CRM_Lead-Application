"""
Test script to verify Google Sheets connection
Run this to test if the backend can connect to your sheets
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import invoice service
from invoice_service import get_crm_lead_sheet, get_crm_admission_sheet

def test_crm_lead_connection():
    """Test connection to CRM_Lead sheet"""
    print("\n" + "="*60)
    print("Testing CRM_Lead Sheet Connection...")
    print("="*60)
    
    try:
        worksheet = get_crm_lead_sheet()
        print(f"✅ Successfully connected to: {worksheet.title}")
        
        # Get headers
        headers = worksheet.row_values(1)
        print(f"\n📋 Found {len(headers)} columns:")
        for i, header in enumerate(headers[:10], 1):  # Show first 10
            print(f"   {i}. {header}")
        if len(headers) > 10:
            print(f"   ... and {len(headers) - 10} more columns")
        
        # Get row count
        all_records = worksheet.get_all_records()
        print(f"\n📊 Total records: {len(all_records)}")
        
        if all_records:
            print(f"\n🔍 Sample record (first patient):")
            first_record = all_records[0]
            print(f"   Patient Name: {first_record.get('Patient Name', 'N/A')}")
            print(f"   Member ID: {first_record.get('Member ID Key', 'N/A') or first_record.get('Member ID key', 'N/A')}")
            print(f"   Mobile: {first_record.get('Mobile Number', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def test_crm_admission_connection():
    """Test connection to CRM_Admission → Accounts Receivable sheet"""
    print("\n" + "="*60)
    print("Testing CRM_Admission → Accounts Receivable Sheet Connection...")
    print("="*60)
    
    try:
        worksheet = get_crm_admission_sheet()
        print(f"✅ Successfully connected to: {worksheet.title}")
        
        # Get headers
        headers = worksheet.row_values(1)
        print(f"\n📋 Found {len(headers)} columns:")
        for i, header in enumerate(headers, 1):
            print(f"   {i}. {header}")
        
        # Get row count
        all_records = worksheet.get_all_records()
        print(f"\n📊 Total records: {len(all_records)}")
        
        if all_records:
            print(f"\n🔍 Sample record (first invoice):")
            first_record = all_records[0]
            print(f"   Invoice Ref: {first_record.get('Invoice Ref', 'N/A')}")
            print(f"   Patient Name: {first_record.get('Patient Name', 'N/A')}")
            print(f"   Total Amount: {first_record.get('Total Amount', 'N/A')}")
        else:
            print("\n📝 Sheet is empty - ready for new invoices!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("\n💡 Make sure:")
        print("   1. PATIENT_ADMISSION_SHEET_ID is set in .env")
        print("   2. The sheet has a tab named 'Accounts Receivable'")
        print("   3. Credentials file has access to this sheet")
        return False


def check_environment():
    """Check if environment variables are set"""
    print("\n" + "="*60)
    print("Checking Environment Configuration...")
    print("="*60)
    
    google_sheet_id = os.getenv("GOOGLE_SHEET_ID")
    admission_sheet_id = os.getenv("PATIENT_ADMISSION_SHEET_ID")
    credentials_file = os.getenv("CREDENTIALS_FILE", "google_credentials.json")
    
    print(f"\n📌 Configuration:")
    print(f"   GOOGLE_SHEET_ID: {'✅ Set' if google_sheet_id else '❌ Not set'}")
    print(f"   PATIENT_ADMISSION_SHEET_ID: {'✅ Set' if admission_sheet_id else '❌ Not set'}")
    print(f"   CREDENTIALS_FILE: {credentials_file} {'✅' if os.path.exists(credentials_file) else '❌ Not found'}")
    
    if not google_sheet_id or not admission_sheet_id:
        print("\n⚠️  Missing configuration! Add to backend/.env:")
        print("   GOOGLE_SHEET_ID=your_crm_lead_sheet_id")
        print("   PATIENT_ADMISSION_SHEET_ID=your_crm_admission_sheet_id")
        return False
    
    return True


if __name__ == "__main__":
    print("\n🚀 Invoice Module - Google Sheets Connection Test")
    print("="*60)
    
    # Check environment
    if not check_environment():
        sys.exit(1)
    
    # Test CRM_Lead
    lead_ok = test_crm_lead_connection()
    
    # Test CRM_Admission
    admission_ok = test_crm_admission_connection()
    
    # Summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    print(f"CRM_Lead Sheet: {'✅ Connected' if lead_ok else '❌ Failed'}")
    print(f"CRM_Admission Sheet: {'✅ Connected' if admission_ok else '❌ Failed'}")
    
    if lead_ok and admission_ok:
        print("\n🎉 All connections successful! Backend is ready to use.")
    else:
        print("\n⚠️  Some connections failed. Please check the errors above.")
    
    print("="*60 + "\n")
