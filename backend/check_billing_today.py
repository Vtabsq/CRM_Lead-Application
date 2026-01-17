import requests
import json
from datetime import datetime

print("="*70)
print("HOME CARE BILLING - CHECK WHO SHOULD BE BILLED TODAY")
print("="*70)

# Get all active clients
print("\nFetching all active home care clients...")
response = requests.get("http://localhost:8000/api/homecare/clients?status=ACTIVE")
data = response.json()

if data.get('status') == 'success':
    clients = data.get('clients', [])
    print(f"Total active clients: {len(clients)}\n")
    
    print("Client Details:")
    print("-" * 70)
    for client in clients:
        name = client.get('patient_name', 'Unknown')
        service_started = client.get('service_started_on', 'N/A')
        next_billing = client.get('next_billing_date', 'N/A')
        billing_count = client.get('billing_count', 0)
        
        print(f"\n{name}")
        print(f"  Service Started: {service_started}")
        print(f"  Next Billing: {next_billing}")
        print(f"  Billing Count: {billing_count}")
        
        # Check if billing is due today
        today = datetime.now().strftime("%d/%m/%Y")
        if next_billing == today:
            print(f"  >>> BILLING DUE TODAY <<<")
    
    print("\n" + "="*70)
    print("Now running automatic daily billing process...")
    print("="*70)
    
    # Run daily billing
    billing_response = requests.post("http://localhost:8000/api/homecare/run-daily-billing")
    billing_data = billing_response.json()
    
    if billing_data.get('status') == 'success':
        summary = billing_data.get('summary', {})
        print(f"\nBilling Summary:")
        print(f"  Total Active Clients: {summary.get('total_active_clients', 0)}")
        print(f"  Billed: {summary.get('billed_count', 0)}")
        print(f"  Skipped: {summary.get('skipped_count', 0)}")
        print(f"  Errors: {summary.get('error_count', 0)}")
        
        billed_clients = summary.get('billed_clients', [])
        if billed_clients:
            print(f"\nClients Billed Today:")
            for bc in billed_clients:
                print(f"  - {bc.get('patient_name')}: {bc.get('invoice_ref')} (₹{bc.get('amount')})")
        
        errors = summary.get('errors', [])
        if errors:
            print(f"\nErrors:")
            for err in errors:
                print(f"  - {err}")
    else:
        print(f"Error: {billing_data}")
else:
    print(f"Error fetching clients: {data}")
