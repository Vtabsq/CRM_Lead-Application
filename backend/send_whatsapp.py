"""Send a WhatsApp message to a specific number for testing"""
import requests

payload = {
    "name": "Harish",
    "phone": "+919629631022",
    "message": "Test message for WhatsApp sandbox"
}

response = requests.post("http://localhost:5000/submit_form", json=payload)

print("Status Code:", response.status_code)
try:
    print("Response:", response.json())
except ValueError:
    print("Response Text:", response.text)
