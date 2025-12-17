import requests
import json

def test():
    url = "http://localhost:8000/delete/preview"
    payload = {
        "filters": {"startDate": "2024-01-01"},
        "date_column": "date", # Intentionally lowercase
        "preview_columns": ["Member ID key"]
    }
    
    print(f"Testing {url} with payload: {payload}")
    try:
        res = requests.post(url, json=payload)
        print(f"Status Code: {res.status_code}")
        print(f"Response: {res.text}")
    except Exception as e:
        print(f"Request Failed: {e}")

if __name__ == "__main__":
    test()
