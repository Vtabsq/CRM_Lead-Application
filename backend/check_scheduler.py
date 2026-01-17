"""
Check if the Home Care billing scheduler is running
"""
import requests

print("="*70)
print("HOME CARE SCHEDULER STATUS CHECK")
print("="*70)

# Check if there's a scheduler status endpoint
try:
    # Try to get scheduler status via API
    response = requests.get("http://localhost:8000/api/homecare/scheduler/status")
    
    if response.status_code == 200:
        data = response.json()
        print("\n✓ Scheduler Status Endpoint Found")
        print(f"  Running: {data.get('running', False)}")
        print(f"  Billing Time: {data.get('billing_time', 'N/A')}")
        print(f"  Next Run: {data.get('next_run', 'N/A')}")
        print(f"  Message: {data.get('message', 'N/A')}")
    else:
        print(f"\n✗ Scheduler status endpoint returned: {response.status_code}")
        print("  Note: Endpoint may not exist yet")
        
except Exception as e:
    print(f"\n⚠ Could not check scheduler status via API: {e}")
    print("  This is normal if the endpoint doesn't exist")

# Test manual billing trigger
print("\n" + "="*70)
print("TESTING MANUAL BILLING TRIGGER")
print("="*70)

try:
    response = requests.post("http://localhost:8000/api/homecare/run-daily-billing")
    
    if response.status_code == 200:
        data = response.json()
        if data.get('status') == 'success':
            summary = data.get('summary', {})
            print("\n✓ Manual Billing Trigger Works!")
            print(f"  Total Active Clients: {summary.get('total_active_clients', 0)}")
            print(f"  Billed: {summary.get('billed_count', 0)}")
            print(f"  Skipped: {summary.get('skipped_count', 0)}")
            print(f"  Errors: {summary.get('error_count', 0)}")
            
            billed = summary.get('billed_clients', [])
            if billed:
                print(f"\n  Clients Billed:")
                for client in billed:
                    print(f"    - {client.get('patient_name')}: {client.get('invoice_ref')}")
        else:
            print(f"\n✗ Billing failed: {data}")
    else:
        print(f"\n✗ Manual billing returned: {response.status_code}")
        print(f"  Response: {response.text}")
        
except Exception as e:
    print(f"\n✗ Error testing manual billing: {e}")

print("\n" + "="*70)
print("SCHEDULER CONFIGURATION")
print("="*70)
print("\nScheduler Settings:")
print("  - Default Billing Time: 09:00 AM (daily)")
print("  - Can be changed via HOMECARE_BILLING_TIME env variable")
print("  - Logs written to: homecare_billing.log")
print("\nHow It Works:")
print("  1. Scheduler starts automatically when backend starts")
print("  2. Runs daily at configured time (default 9 AM)")
print("  3. Checks all active clients")
print("  4. Bills clients whose billing date matches today")
print("  5. Updates LAST BILLED DATE in CRM_HomeCare sheet")
print("  6. Creates invoices in Accounts Receivable sheet")

print("\n" + "="*70)
