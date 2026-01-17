"""
Test Dashboard API Endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoint(name, url):
    """Test a single endpoint"""
    print(f"\n{'='*60}")
    print(f"Testing: {name}")
    print(f"URL: {url}")
    print(f"{'='*60}")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Success!")
            print(f"Count: {data.get('count', 0)}")
            print(f"Date Filter: {data.get('date_filter', 'N/A')}")
            print(f"Records: {len(data.get('data', []))}")
            
            # Show first record if available
            if data.get('data'):
                print(f"\nFirst Record:")
                print(json.dumps(data['data'][0], indent=2))
        else:
            print(f"✗ Failed!")
            print(f"Response: {response.text}")
    
    except Exception as e:
        print(f"✗ Error: {e}")

def main():
    print("="*60)
    print("Dashboard API Endpoint Tests")
    print("="*60)
    
    endpoints = [
        ("Previous Day Enquiries", f"{BASE_URL}/api/dashboard/previous-day-enquiries"),
        ("Leads Converted Yesterday", f"{BASE_URL}/api/dashboard/leads-converted-yesterday"),
        ("Patients Admitted", f"{BASE_URL}/api/dashboard/patients-admitted?date_filter=yesterday"),
        ("Patients Discharged", f"{BASE_URL}/api/dashboard/patients-discharged"),
        ("Follow-Ups Today", f"{BASE_URL}/api/dashboard/follow-ups-today"),
    ]
    
    for name, url in endpoints:
        test_endpoint(name, url)
    
    print(f"\n{'='*60}")
    print("All tests completed!")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
