import requests

# Test query for Vignesh with NO filter
response = requests.post(
    'http://localhost:8000/api/ai-crm/chat',
    json={'query': 'Member ID of Vignesh', 'filter': ''},
    timeout=35
)

print("Status:", response.status_code)
data = response.json()
print("Response:", data['response'][:800])
print("\nTotal Member IDs returned:", len(data.get('member_ids', [])))
print("First 15 IDs:", data.get('member_ids', [])[:15])

# Also test: show all members
response2 = requests.post(
    'http://localhost:8000/api/ai-crm/chat',
    json={'query': 'Show all member names', 'filter': ''},
    timeout=35
)
print("\n\nAll members query:")
print(response2.json()['response'][:1000])
