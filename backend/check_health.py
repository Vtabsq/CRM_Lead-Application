import requests
try:
    res = requests.get("http://localhost:8000/health", timeout=5)
    print(res.status_code)
    print(res.text)
except Exception as e:
    print(e)
