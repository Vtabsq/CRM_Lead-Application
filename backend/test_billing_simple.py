import requests
import json

print("="*60)
print("HOME CARE BILLING TEST")
print("="*60)

# Test 1: Get active clients
print("\n1. Fetching active home care clients...")
try:
    response = requests.get("http://localhost:8000/api/homecare/clients?status=ACTIVE")
    response.raise_for_status()
    data = response.json()
    
    print(f"   Status: {data.get('status')}")
    print(f"   Total active clients: {data.get('count')}")
    
    if data.get('clients') and len(data['clients']) >= 2:
        client1 = data['clients'][0]
        client2 = data['clients'][1]
        
        print(f"\n   Selected clients for billing:")
        print(f"   - {client1['patient_name']} (Revenue: ₹{client1.get('home_care_revenue', 0)})")
        print(f"   - {client2['patient_name']} (Revenue: ₹{client2.get('home_care_revenue', 0)})")
        
        # Test 2: Generate invoice for first client
        print(f"\n2. Generating invoice for {client1['patient_name']}...")
        try:
            billing_response = requests.post(
                f"http://localhost:8000/api/homecare/trigger-billing/{client1['patient_name']}"
            )
            billing_data = billing_response.json()
            
            if billing_data.get('status') == 'success':
                invoice = billing_data.get('invoice', {})
                print(f"   ✓ SUCCESS")
                print(f"   Invoice Ref: {invoice.get('invoice_ref')}")
                print(f"   Amount: ₹{invoice.get('amount')}")
            else:
                print(f"   ✗ FAILED: {billing_data.get('detail', 'Unknown error')}")
        except Exception as e:
            print(f"   ✗ ERROR: {str(e)}")
        
        # Test 3: Generate invoice for second client
        print(f"\n3. Generating invoice for {client2['patient_name']}...")
        try:
            billing_response = requests.post(
                f"http://localhost:8000/api/homecare/trigger-billing/{client2['patient_name']}"
            )
            billing_data = billing_response.json()
            
            if billing_data.get('status') == 'success':
                invoice = billing_data.get('invoice', {})
                print(f"   ✓ SUCCESS")
                print(f"   Invoice Ref: {invoice.get('invoice_ref')}")
                print(f"   Amount: ₹{invoice.get('amount')}")
            else:
                print(f"   ✗ FAILED: {billing_data.get('detail', 'Unknown error')}")
        except Exception as e:
            print(f"   ✗ ERROR: {str(e)}")
        
        print("\n" + "="*60)
        print("BILLING TEST COMPLETE")
        print("="*60)
        print("\nNext steps:")
        print("1. Check CRM_HomeCare Google Sheet")
        print("2. Verify LAST BILLED DATE column is updated")
        print("3. Confirm no duplicate rows were created")
        
    else:
        print("   ✗ Not enough active clients (need at least 2)")
        
except Exception as e:
    print(f"   ✗ ERROR: {str(e)}")
