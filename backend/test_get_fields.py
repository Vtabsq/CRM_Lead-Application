import requests
import json

def test():
    url = "http://localhost:8000/get_fields"
    print(f"Testing {url}")
    try:
        res = requests.get(url)
        print(f"Status Code: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            fields = data.get('fields', [])
            names = [f['name'] for f in fields]
            print(f"Fields returned ({len(names)}): {names[:10]}")
            if 'date' in names:
                print("Found 'date' (lowercase)!")
            if 'Date' in names:
                print("Found 'Date' (Titlecase)!")
        else:
            print(f"Response: {res.text}")
    except Exception as e:
        print(f"Request Failed: {e}")

if __name__ == "__main__":
    test()
