"""
Test patient search with caching to verify rate limit fix
"""
import requests
import time

print("="*70)
print("PATIENT SEARCH - RATE LIMIT FIX TEST")
print("="*70)

# Test 1: First search (should fetch from Google Sheets)
print("\n1. First search (cache miss - will fetch from Google Sheets)")
try:
    response = requests.get("http://localhost:8000/api/patients/search?q=a")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ SUCCESS: Found {len(data.get('patients', []))} patients")
    else:
        print(f"   ✗ FAILED: Status {response.status_code}")
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   ✗ ERROR: {e}")

# Test 2: Immediate second search (should use cache)
print("\n2. Second search (cache hit - should use cached data)")
try:
    response = requests.get("http://localhost:8000/api/patients/search?q=ar")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ SUCCESS: Found {len(data.get('patients', []))} patients")
    else:
        print(f"   ✗ FAILED: Status {response.status_code}")
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   ✗ ERROR: {e}")

# Test 3: Third search (should still use cache)
print("\n3. Third search (cache hit - should use cached data)")
try:
    response = requests.get("http://localhost:8000/api/patients/search?q=Arun")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ SUCCESS: Found {len(data.get('patients', []))} patients")
        if data.get('patients'):
            print(f"   First result: {data['patients'][0].get('display', 'N/A')}")
    else:
        print(f"   ✗ FAILED: Status {response.status_code}")
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   ✗ ERROR: {e}")

# Test 4: Multiple rapid searches (stress test)
print("\n4. Rapid searches (10 requests - should all use cache)")
success_count = 0
error_count = 0
for i in range(10):
    try:
        response = requests.get(f"http://localhost:8000/api/patients/search?q=test{i}")
        if response.status_code == 200:
            success_count += 1
        else:
            error_count += 1
    except Exception as e:
        error_count += 1

print(f"   ✓ Successful: {success_count}/10")
print(f"   ✗ Errors: {error_count}/10")

print("\n" + "="*70)
print("RESULTS")
print("="*70)
print("\nCache Configuration:")
print("  - TTL (Time To Live): 5 minutes")
print("  - First search: Fetches from Google Sheets and caches")
print("  - Subsequent searches: Use cached data (no API calls)")
print("  - Cache expires after 5 minutes")
print("\nExpected Behavior:")
print("  - No more rate limit errors (429)")
print("  - Fast search responses after first query")
print("  - Reduced Google Sheets API usage")
