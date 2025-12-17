import requests
r = requests.post('http://localhost:8000/api/ai-crm/chat', json={'query': 'Where are patients located?', 'filter': 'today'}, timeout=35)
print("Response:", r.json()['response'][:300])
