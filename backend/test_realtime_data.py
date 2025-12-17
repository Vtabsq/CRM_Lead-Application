"""
Test real-time data access: Create a new row and verify AI can immediately find it
"""
import requests
import time
import random

# Generate unique test name
test_name = f"TestUser{random.randint(1000, 9999)}"
print(f"🧪 Creating test entry with name: {test_name}")

# Step 1: Submit a new form entry
print("\n1️⃣ Submitting new form...")
form_data = {
    "Attender Name": test_name,
    "Patient Name": "TestPatient",
    "Patient Location": "TestCity",
    "Gender": "Male",
    "Age": "30",
    "Email Id": "test@test.com",
    "Mobile Number": "+919999999999",
    "Service": "Test Service",
    "Location": "TestLocation",
    "Date": "07/11/2025",
    "Source": "Test",
    "CRM Agent Name": "TestAgent",
    "Enquiry made for": "Test",
    "Lead Status": "New / Fresh Lead",
    "Active/Inactive": "Active",
    "Closed Date": ""
}

submit_response = requests.post(
    'http://localhost:8000/submit',
    json={'data': form_data},
    timeout=30
)

if submit_response.status_code == 200:
    print(f"✅ Form submitted successfully")
    print(f"Response: {submit_response.json().get('message', '')}")
else:
    print(f"❌ Form submission failed: {submit_response.status_code}")
    print(submit_response.text)
    exit(1)

# Wait a moment for Google Sheets to sync
print("\n⏳ Waiting 2 seconds for Google Sheets sync...")
time.sleep(2)

# Step 2: Query AI about the new entry
print(f"\n2️⃣ Querying AI for '{test_name}'...")
ai_response = requests.post(
    'http://localhost:8000/api/ai-crm/chat',
    json={'query': f'What is the member ID of {test_name}?', 'filter': None},
    timeout=35
)

if ai_response.status_code == 200:
    data = ai_response.json()
    response_text = data['response']
    member_ids = data.get('member_ids', [])
    
    print(f"\n📊 AI Response:")
    print(response_text)
    print(f"\nTotal members in system: {len(member_ids)}")
    
    # Check if AI found the test user
    if test_name.lower() in response_text.lower():
        print(f"\n✅ SUCCESS! AI found {test_name} in real-time!")
        
        # Try to extract the member ID from response
        if 'MID-' in response_text:
            import re
            mid_match = re.search(r'MID-\d{4}-\d{2}-\d{2}-\d+', response_text)
            if mid_match:
                print(f"✅ Member ID: {mid_match.group()}")
    else:
        print(f"\n❌ FAILED! AI did not find {test_name}")
        print(f"This could mean:")
        print(f"  - Google Sheets hasn't synced yet (try waiting longer)")
        print(f"  - AI context limit is too small")
        print(f"  - Data fetch is cached")
else:
    print(f"❌ AI query failed: {ai_response.status_code}")
    print(ai_response.text)

# Step 3: Verify with direct sheet query
print(f"\n3️⃣ Verifying with another query...")
verify_response = requests.post(
    'http://localhost:8000/api/ai-crm/chat',
    json={'query': 'Show me the last 5 members added', 'filter': None},
    timeout=35
)

if verify_response.status_code == 200:
    verify_text = verify_response.json()['response']
    print(f"\nLast 5 members:")
    print(verify_text[:500])
    
    if test_name in verify_text:
        print(f"\n✅ {test_name} appears in last 5 members!")
    else:
        print(f"\n⚠️ {test_name} not in last 5 members (might be older)")

print(f"\n{'='*60}")
print(f"Test completed for: {test_name}")
print(f"{'='*60}")
