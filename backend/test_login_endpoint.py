import requests

response = requests.post(
    'http://localhost:8000/login',
    json={'User_name': 'admin', 'Password': 'admin'}
)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")
