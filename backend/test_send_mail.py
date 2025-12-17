import requests

payload = {
    "query": "Send mail about follow Vignesh",
    "filter": None
}

response = requests.post("http://localhost:8000/api/ai-crm/chat", json=payload, timeout=35)
print("Status:", response.status_code)
print("Response:", response.json())
