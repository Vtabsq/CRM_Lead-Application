import requests
import json

url = "http://localhost:8000/api/ai-crm/chat"
payload = {
    "query": "What are member IDs I need to follow up today?",
    "filter": "today"
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response:\n{json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
