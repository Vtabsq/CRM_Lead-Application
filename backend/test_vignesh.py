import requests

# Test query for Vignesh
response = requests.post(
    'http://localhost:8000/api/ai-crm/chat',
    json={'query': 'Member ID of Vignesh', 'filter': None},
    timeout=35
)

print("Status:", response.status_code)
print("Response:", response.json()['response'][:500])
print("\nMember IDs returned:", response.json().get('member_ids', [])[:10])
