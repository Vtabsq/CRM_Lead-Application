"""
Test script to debug billing preview
"""
import requests
import json

# Test billing preview endpoint
response = requests.get("http://localhost:8000/api/patientadmission/billing-preview?days=30")
data = response.json()

print("="*60)
print("BILLING PREVIEW RESPONSE:")
print("="*60)
print(json.dumps(data, indent=2))
print("="*60)
print(f"Status: {data.get('status')}")
print(f"Preview Days: {data.get('preview_days')}")
print(f"Upcoming Bills Count: {len(data.get('upcoming_bills', []))}")
print(f"Total Forecast: ₹{data.get('total_forecast', 0)}")
print("="*60)

if data.get('upcoming_bills'):
    print("\nUPCOMING BILLS:")
    for bill in data['upcoming_bills']:
        print(f"  - {bill['patient_name']}: ₹{bill['amount']} on {bill['billing_date']} ({bill['days_until']} days)")
else:
    print("\nNO UPCOMING BILLS FOUND")
