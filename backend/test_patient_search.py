import requests
import json

# Test the patient search API with better formatting
try:
    response = requests.get("http://localhost:8000/api/patients/search?q=a")
    print(f"Status Code: {response.status_code}\n")
    
    data = response.json()
    print("Response Data:")
    print(json.dumps(data, indent=2, ensure_ascii=False))
    
    # Check if patients have member_id
    if data.get("status") == "success":
        patients = data.get("patients", [])
        print(f"\nTotal patients found: {len(patients)}")
        
        if patients:
            print("\nFirst patient details:")
            first_patient = patients[0]
            print(f"  - patient_name: '{first_patient.get('patient_name')}'")
            print(f"  - member_id: '{first_patient.get('member_id')}'")
            print(f"  - display: '{first_patient.get('display')}'")
            
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
