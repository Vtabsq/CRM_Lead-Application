"""
Update Parasuraman's service date to today and generate invoice
"""
import requests
from datetime import datetime

print("="*70)
print("UPDATE PARASURAMAN - SERVICE DATE AND INVOICE")
print("="*70)

# Today's date in YYYY-MM-DD format for API
today_api = datetime.now().strftime("%Y-%m-%d")
today_display = datetime.now().strftime("%d/%m/%Y")

print(f"\nToday's Date: {today_display}")
print(f"API Format: {today_api}")

# Step 1: Update Parasuraman's service start date
print("\n" + "="*70)
print("STEP 1: Updating Parasuraman's SERVICE STARTED ON date")
print("="*70)

update_data = {
    "service_started_on": today_api,
    "home_care_revenue": 56000,  # Keep existing revenue
}

try:
    response = requests.put(
        "http://localhost:8000/api/homecare/clients/Parasuraman",
        json=update_data
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✓ SUCCESS: {result.get('message', 'Updated successfully')}")
        print(f"  Service date updated to: {today_display}")
    else:
        print(f"✗ FAILED: {response.status_code}")
        print(f"  Response: {response.text}")
        exit(1)
except Exception as e:
    print(f"✗ ERROR: {e}")
    exit(1)

# Step 2: Generate invoice for Parasuraman
print("\n" + "="*70)
print("STEP 2: Generating invoice for Parasuraman")
print("="*70)

try:
    response = requests.post(
        "http://localhost:8000/api/homecare/trigger-billing/Parasuraman"
    )
    
    if response.status_code == 200:
        result = response.json()
        if result.get('status') == 'success':
            invoice = result.get('invoice', {})
            print(f"✓ SUCCESS: Invoice generated")
            print(f"  Invoice Ref: {invoice.get('invoice_ref')}")
            print(f"  Amount: ₹{invoice.get('amount')}")
            print(f"  Date: {invoice.get('invoice_date')}")
            print(f"  Status: {invoice.get('status')}")
        else:
            print(f"✗ FAILED: {result.get('detail', 'Unknown error')}")
    else:
        print(f"✗ FAILED: {response.status_code}")
        print(f"  Response: {response.text}")
except Exception as e:
    print(f"✗ ERROR: {e}")

print("\n" + "="*70)
print("COMPLETE")
print("="*70)
print("\nPlease verify in Google Sheets:")
print("1. CRM_HomeCare → Parasuraman → SERVICE STARTED ON = 23/12/2025")
print("2. CRM_HomeCare → Parasuraman → LAST BILLED DATE = 23/12/2025")
print("3. Accounts Receivable → New invoice for Parasuraman")
