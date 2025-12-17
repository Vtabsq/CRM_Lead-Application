import requests

# Test query for Vignesh with NO filter
response = requests.post(
    'http://localhost:8000/api/ai-crm/chat',
    json={'query': 'What is the member ID of Vignesh?', 'filter': None},
    timeout=35
)

print("Status:", response.status_code)
data = response.json()
print("\n📊 AI Response:")
print(data['response'])
print(f"\nTotal Member IDs: {len(data.get('member_ids', []))}")

# Check if Vignesh's ID is in the list
vignesh_id = 'MID-2025-11-07-51494'
if vignesh_id in data.get('member_ids', []):
    print(f"\n✅ Vignesh's ID {vignesh_id} is in the member list!")
else:
    print(f"\n❌ Vignesh's ID {vignesh_id} is NOT in the member list")

# Also test: show all names
print("\n" + "="*60)
print("Testing: Show all names")
print("="*60)
response2 = requests.post(
    'http://localhost:8000/api/ai-crm/chat',
    json={'query': 'Show me all member names', 'filter': None},
    timeout=35
)
print(response2.json()['response'][:800])
