import requests

# Test with explicit None filter
response = requests.post(
    'http://localhost:8000/api/ai-crm/chat',
    json={'query': 'Show all members', 'filter': None},
    timeout=35
)

print("Filter=None")
print("Total members:", len(response.json().get('member_ids', [])))
print("Response:", response.json()['response'][:300])

# Test with empty string filter
response2 = requests.post(
    'http://localhost:8000/api/ai-crm/chat',
    json={'query': 'Show all members', 'filter': ''},
    timeout=35
)

print("\n\nFilter=''")
print("Total members:", len(response2.json().get('member_ids', [])))
print("Response:", response2.json()['response'][:300])
