import requests
import json

# Get active clients
print("Fetching active home care clients...")
response = requests.get("http://localhost:8000/api/homecare/clients?status=ACTIVE")
data = response.json()

print(f"\nStatus: {data.get('status')}")
print(f"Total active clients: {data.get('count')}")

if data.get('clients'):
    print("\nActive clients:")
    for idx, client in enumerate(data['clients'][:5], 1):  # Show first 5
        print(f"\n{idx}. {client['patient_name']}")
        print(f"   Next billing: {client.get('next_billing_date', 'N/A')}")
        print(f"   Revenue: ₹{client.get('home_care_revenue', 0)}")
        print(f"   Billing count: {client.get('billing_count', 0)}")
    
    # Get first two clients for billing test
    if len(data['clients']) >= 2:
        print("\n" + "="*50)
        print("Testing billing for first two clients...")
        print("="*50)
        
        for client in data['clients'][:2]:
            patient_name = client['patient_name']
            print(f"\nGenerating invoice for: {patient_name}")
            
            try:
                billing_response = requests.post(
                    f"http://localhost:8000/api/homecare/trigger-billing/{patient_name}"
                )
                billing_data = billing_response.json()
                
                if billing_data.get('status') == 'success':
                    invoice = billing_data.get('invoice', {})
                    print(f"✓ Invoice generated successfully!")
                    print(f"  Invoice Ref: {invoice.get('invoice_ref')}")
                    print(f"  Amount: ₹{invoice.get('amount')}")
                    print(f"  Status: {invoice.get('status')}")
                else:
                    print(f"✗ Failed: {billing_data.get('detail', 'Unknown error')}")
            except Exception as e:
                print(f"✗ Error: {e}")
else:
    print("No active clients found")
