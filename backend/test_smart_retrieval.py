"""
Test smart retrieval: Verify it scans ALL rows and finds specific queries
"""
import requests
import time

print("🧪 Testing Smart Retrieval System")
print("="*70)

# Test 1: Specific name query
print("\n1️⃣ Test: Specific name (Sameer)")
response = requests.post(
    'http://localhost:8000/api/ai-crm/chat',
    json={'query': 'Member ID of Sameer', 'filter': None},
    timeout=35
)
print(f"Response: {response.json()['response'][:200]}...")
print(f"✅ Found Sameer" if 'sameer' in response.json()['response'].lower() else "❌ Did NOT find Sameer")

time.sleep(1)

# Test 2: Location query
print("\n2️⃣ Test: Location query (Namakkal)")
response = requests.post(
    'http://localhost:8000/api/ai-crm/chat',
    json={'query': 'Who is in Namakkal?', 'filter': None},
    timeout=35
)
print(f"Response: {response.json()['response'][:200]}...")
print(f"✅ Found Namakkal" if 'namakkal' in response.json()['response'].lower() else "❌ Did NOT find Namakkal")

time.sleep(1)

# Test 3: Specific member ID query
print("\n3️⃣ Test: Specific member ID (MID-2025-11-07-51494)")
response = requests.post(
    'http://localhost:8000/api/ai-crm/chat',
    json={'query': 'Tell me about MID-2025-11-07-51494', 'filter': None},
    timeout=35
)
print(f"Response: {response.json()['response'][:200]}...")
print(f"✅ Found member ID" if 'MID-2025-11-07-51494' in response.json()['response'] else "❌ Did NOT find member ID")

time.sleep(1)

# Test 4: General query (should scan all)
print("\n4️⃣ Test: General query (How many total members?)")
response = requests.post(
    'http://localhost:8000/api/ai-crm/chat',
    json={'query': 'How many total members do we have?', 'filter': None},
    timeout=35
)
data = response.json()
print(f"Response: {data['response'][:200]}...")
print(f"Total members in system: {len(data.get('member_ids', []))}")
print(f"✅ Scanned all rows" if len(data.get('member_ids', [])) >= 31 else f"⚠️ Only found {len(data.get('member_ids', []))} members")

time.sleep(1)

# Test 5: Recently added member
print("\n5️⃣ Test: Recently added member (TestUser9669)")
response = requests.post(
    'http://localhost:8000/api/ai-crm/chat',
    json={'query': 'Member ID of TestUser9669', 'filter': None},
    timeout=35
)
print(f"Response: {response.json()['response'][:200]}...")
print(f"✅ Found TestUser9669" if 'testuser9669' in response.json()['response'].lower() else "❌ Did NOT find TestUser9669")

print("\n" + "="*70)
print("✅ Smart Retrieval Test Complete!")
print("="*70)
