"""Test age query to verify all fields are accessible"""
import requests

print("🧪 Testing Age Query")
print("="*60)

# Test 1: Ask about age
response = requests.post(
    'http://localhost:8000/api/ai-crm/chat',
    json={'query': 'What is the age of Vignesh?', 'filter': None},
    timeout=35
)

print("Query: What is the age of Vignesh?")
print(f"Status: {response.status_code}")
data = response.json()
print(f"\nAI Response:")
print(data['response'])
print(f"\nTotal members: {len(data.get('member_ids', []))}")

# Test 2: Ask about gender
print("\n" + "="*60)
response2 = requests.post(
    'http://localhost:8000/api/ai-crm/chat',
    json={'query': 'What is the gender of Sameer?', 'filter': None},
    timeout=35
)

print("Query: What is the gender of Sameer?")
print(f"Status: {response2.status_code}")
data2 = response2.json()
print(f"\nAI Response:")
print(data2['response'])

# Test 3: Ask about email
print("\n" + "="*60)
response3 = requests.post(
    'http://localhost:8000/api/ai-crm/chat',
    json={'query': 'Show me email addresses', 'filter': None},
    timeout=35
)

print("Query: Show me email addresses")
print(f"Status: {response3.status_code}")
data3 = response3.json()
print(f"\nAI Response:")
print(data3['response'][:300])

print("\n" + "="*60)
