"""
Simple test to see what patient search returns
"""
import requests
import json

print("Testing patient search...")
response = requests.get("http://localhost:8000/api/patients/search?q=a")

if response.status_code == 200:
    data = response.json()
    patients = data.get('patients', [])
    
    print(f"\nFound {len(patients)} patients")
    
    if patients:
        print("\nFirst 3 patients:")
        for i, p in enumerate(patients[:3], 1):
            print(f"\n{i}. {json.dumps(p, indent=2)}")
    else:
        print("No patients found")
else:
    print(f"Error: {response.status_code}")
    print(response.text)
