import requests

# Test query for Sameer
response = requests.post(
    'http://localhost:8000/api/ai-crm/chat',
    json={'query': 'What is the member ID of Sameer?', 'filter': None},
    timeout=35
)

print("Status:", response.status_code)
data = response.json()
print("\n📊 AI Response:")
print(data['response'])
print(f"\nTotal Member IDs: {len(data.get('member_ids', []))}")

# Check if any Sameer IDs are in the list
sameer_ids = ['MID-2025-11-04-16090', 'MID-2025-11-05-106479', 'MID-2025-11-07-51494']
found = [sid for sid in sameer_ids if sid in data.get('member_ids', [])]
print(f"\nSameer-related IDs found: {found}")

if 'sameer' in data['response'].lower():
    print("\n✅ AI found Sameer!")
else:
    print("\n❌ AI did NOT find Sameer")
