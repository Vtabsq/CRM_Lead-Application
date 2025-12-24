import requests
import json

# Test Patient Admission API endpoints
API_BASE_URL = "http://localhost:8000"

print("=" * 60)
print("Patient Admission Module - API Test")
print("=" * 60)

# Test 1: List all clients
print("\n1. Testing GET /api/patientadmission/clients")
try:
    response = requests.get(f"{API_BASE_URL}/api/patientadmission/clients")
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Success! Found {len(data.get('clients', []))} clients")
    else:
        print(f"   ❌ Error: {response.text}")
except Exception as e:
    print(f"   ❌ Exception: {e}")

# Test 2: Get billing preview
print("\n2. Testing GET /api/patientadmission/billing-preview")
try:
    response = requests.get(f"{API_BASE_URL}/api/patientadmission/billing-preview?days=7")
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Success! Found {len(data.get('upcoming_bills', []))} upcoming bills")
    else:
        print(f"   ❌ Error: {response.text}")
except Exception as e:
    print(f"   ❌ Exception: {e}")

# Test 3: Check if module is loaded
print("\n3. Checking if Patient Admission module is loaded...")
try:
    response = requests.get(f"{API_BASE_URL}/docs")
    if response.status_code == 200:
        if "patientadmission" in response.text.lower():
            print("   ✅ Patient Admission endpoints found in API docs!")
        else:
            print("   ⚠️  Patient Admission endpoints not found in API docs")
    else:
        print(f"   ❌ Could not access API docs: {response.status_code}")
except Exception as e:
    print(f"   ❌ Exception: {e}")

print("\n" + "=" * 60)
print("Test Complete!")
print("=" * 60)
