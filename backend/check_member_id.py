"""
Check if member_id is in the patient search response
"""
import requests

response = requests.get("http://localhost:8000/api/patients/search?q=a")
data = response.json()
patients = data.get('patients', [])

if patients:
    first = patients[0]
    print("Keys in first patient:")
    for key in first.keys():
        print(f"  - {key}: {first[key]}")
    
    print(f"\nmember_id present: {'member_id' in first}")
    print(f"member_id value: {first.get('member_id', 'KEY NOT FOUND')}")
