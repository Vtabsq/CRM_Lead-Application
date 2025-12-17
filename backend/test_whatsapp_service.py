"""
Test script for WhatsApp Service
Demonstrates how to call the /submit_form endpoint
"""
import requests
import json

# Service URL
SERVICE_URL = "http://localhost:5000"

def test_submit_form():
    """Test the /submit_form endpoint"""
    
    # Test data
    test_data = {
        "name": "Harish",
        "phone": "+917890123456",
        "message": "I need help with a quote"
    }
    
    print("=" * 60)
    print("Testing WhatsApp Service - /submit_form endpoint")
    print("=" * 60)
    print(f"\nSending request to: {SERVICE_URL}/submit_form")
    print(f"Request payload:\n{json.dumps(test_data, indent=2)}\n")
    
    try:
        # Make POST request
        response = requests.post(
            f"{SERVICE_URL}/submit_form",
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Response Status Code: {response.status_code}")
        print(f"Response Body:\n{json.dumps(response.json(), indent=2)}\n")
        
        if response.status_code == 200:
            print("✅ SUCCESS: WhatsApp message sent successfully!")
        else:
            print("❌ ERROR: Failed to send WhatsApp message")
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Could not connect to the service.")
        print("Make sure the Flask server is running on port 5000")
        print("Run: python whatsapp_service.py")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")


def test_health_check():
    """Test the /health endpoint"""
    
    print("\n" + "=" * 60)
    print("Testing Health Check endpoint")
    print("=" * 60)
    
    try:
        response = requests.get(f"{SERVICE_URL}/health")
        print(f"\nResponse:\n{json.dumps(response.json(), indent=2)}\n")
        
        if response.status_code == 200:
            print("✅ Service is healthy")
        else:
            print("❌ Service health check failed")
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Service is not running")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")


def test_validation():
    """Test input validation"""
    
    print("\n" + "=" * 60)
    print("Testing Input Validation")
    print("=" * 60)
    
    # Test case 1: Missing fields
    print("\n1. Testing with missing fields...")
    invalid_data = {"name": "Test"}
    
    try:
        response = requests.post(
            f"{SERVICE_URL}/submit_form",
            json=invalid_data,
            headers={'Content-Type': 'application/json'}
        )
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 400:
            print("✅ Validation working correctly")
        else:
            print("❌ Validation not working as expected")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    # Test case 2: Invalid phone format
    print("\n2. Testing with invalid phone format...")
    invalid_phone_data = {
        "name": "Test",
        "phone": "1234567890",  # Missing country code
        "message": "Test message"
    }
    
    try:
        response = requests.post(
            f"{SERVICE_URL}/submit_form",
            json=invalid_phone_data,
            headers={'Content-Type': 'application/json'}
        )
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 400:
            print("✅ Phone validation working correctly")
        else:
            print("❌ Phone validation not working as expected")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")


if __name__ == "__main__":
    print("\n🚀 WhatsApp Service Test Suite\n")
    
    # Run tests
    test_health_check()
    test_validation()
    test_submit_form()
    
    print("\n" + "=" * 60)
    print("Test suite completed!")
    print("=" * 60 + "\n")
