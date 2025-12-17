"""
Integration Example: How to use WhatsApp Service with CRM
This shows how to integrate WhatsApp notifications into your existing CRM workflow
"""
import requests
import json


class WhatsAppNotifier:
    """
    Helper class to send WhatsApp notifications
    Can be integrated into your CRM application
    """
    
    def __init__(self, service_url="http://localhost:5000"):
        self.service_url = service_url
        self.submit_endpoint = f"{service_url}/submit_form"
    
    def send_welcome_message(self, name: str, phone: str, message: str = "") -> dict:
        """
        Send a welcome WhatsApp message to a new customer
        
        Args:
            name: Customer name
            phone: Customer phone number (with country code)
            message: Optional customer message/inquiry
            
        Returns:
            dict: Response from WhatsApp service
        """
        payload = {
            "name": name,
            "phone": phone,
            "message": message or "New inquiry"
        }
        
        try:
            response = requests.post(
                self.submit_endpoint,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            return {
                'success': response.status_code == 200,
                'data': response.json(),
                'status_code': response.status_code
            }
            
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': str(e),
                'status_code': 0
            }
    
    def is_service_healthy(self) -> bool:
        """Check if WhatsApp service is running"""
        try:
            response = requests.get(f"{self.service_url}/health", timeout=5)
            return response.status_code == 200
        except:
            return False


# Example 1: Send WhatsApp after CRM form submission
def example_crm_form_submission():
    """
    Example: Send WhatsApp notification when a customer submits a CRM form
    """
    print("\n" + "="*60)
    print("Example 1: CRM Form Submission with WhatsApp Notification")
    print("="*60)
    
    # Simulated CRM form data
    crm_data = {
        "name": "Harish Kumar",
        "phone": "+917890123456",
        "email": "harish@example.com",
        "service": "Elder Care",
        "message": "I need help with elderly care services for my parents"
    }
    
    print(f"\n📝 CRM Form Data:")
    print(json.dumps(crm_data, indent=2))
    
    # Initialize WhatsApp notifier
    notifier = WhatsAppNotifier()
    
    # Check if service is running
    if not notifier.is_service_healthy():
        print("\n⚠️  WhatsApp service is not running!")
        print("Start it with: python whatsapp_service.py")
        return
    
    # Send WhatsApp notification
    print("\n📱 Sending WhatsApp notification...")
    result = notifier.send_welcome_message(
        name=crm_data['name'],
        phone=crm_data['phone'],
        message=crm_data['message']
    )
    
    if result['success']:
        print(f"✅ WhatsApp sent successfully!")
        print(f"Message SID: {result['data'].get('sid')}")
    else:
        print(f"❌ Failed to send WhatsApp")
        print(f"Error: {result.get('error') or result['data'].get('message')}")


# Example 2: Bulk WhatsApp notifications
def example_bulk_notifications():
    """
    Example: Send WhatsApp to multiple customers (e.g., follow-up reminders)
    """
    print("\n" + "="*60)
    print("Example 2: Bulk WhatsApp Notifications")
    print("="*60)
    
    # List of customers needing follow-up
    customers = [
        {"name": "Rajesh", "phone": "+919876543210", "message": "Follow-up for elder care"},
        {"name": "Priya", "phone": "+918765432109", "message": "Service inquiry follow-up"},
        {"name": "Amit", "phone": "+917654321098", "message": "Quote request follow-up"}
    ]
    
    notifier = WhatsAppNotifier()
    
    if not notifier.is_service_healthy():
        print("\n⚠️  WhatsApp service is not running!")
        return
    
    print(f"\n📱 Sending WhatsApp to {len(customers)} customers...\n")
    
    success_count = 0
    for customer in customers:
        result = notifier.send_welcome_message(
            name=customer['name'],
            phone=customer['phone'],
            message=customer['message']
        )
        
        if result['success']:
            print(f"✅ {customer['name']}: Sent successfully")
            success_count += 1
        else:
            print(f"❌ {customer['name']}: Failed")
    
    print(f"\n📊 Summary: {success_count}/{len(customers)} messages sent successfully")


# Example 3: Integration with FastAPI CRM backend
def example_fastapi_integration():
    """
    Example: How to integrate WhatsApp service into your FastAPI CRM backend
    """
    print("\n" + "="*60)
    print("Example 3: FastAPI Integration Code")
    print("="*60)
    
    code = '''
# Add this to your main.py FastAPI application

import requests
from typing import Optional

WHATSAPP_SERVICE_URL = "http://localhost:5000"

async def send_whatsapp_notification(
    name: str, 
    phone: str, 
    message: str
) -> Optional[str]:
    """
    Send WhatsApp notification via the WhatsApp service
    Returns message SID if successful, None otherwise
    """
    try:
        response = requests.post(
            f"{WHATSAPP_SERVICE_URL}/submit_form",
            json={
                "name": name,
                "phone": phone,
                "message": message
            },
            timeout=10
        )
        
        if response.status_code == 200:
            return response.json().get('sid')
        else:
            print(f"WhatsApp failed: {response.json()}")
            return None
            
    except Exception as e:
        print(f"WhatsApp error: {e}")
        return None


# Use it in your submit endpoint
@app.post("/submit")
async def submit_crm_form(data: dict):
    # ... your existing CRM logic ...
    
    # Send WhatsApp notification
    whatsapp_sid = await send_whatsapp_notification(
        name=data.get('name'),
        phone=data.get('phone'),
        message=data.get('message', 'New CRM submission')
    )
    
    return {
        "status": "success",
        "whatsapp_sent": whatsapp_sid is not None,
        "whatsapp_sid": whatsapp_sid
    }
'''
    
    print(code)


# Example 4: Error handling and retry logic
def example_error_handling():
    """
    Example: Proper error handling and retry logic
    """
    print("\n" + "="*60)
    print("Example 4: Error Handling & Retry Logic")
    print("="*60)
    
    code = '''
import time
from typing import Optional

def send_whatsapp_with_retry(
    name: str, 
    phone: str, 
    message: str,
    max_retries: int = 3
) -> Optional[str]:
    """
    Send WhatsApp with automatic retry on failure
    """
    notifier = WhatsAppNotifier()
    
    for attempt in range(max_retries):
        try:
            result = notifier.send_welcome_message(name, phone, message)
            
            if result['success']:
                print(f"✅ WhatsApp sent on attempt {attempt + 1}")
                return result['data'].get('sid')
            else:
                print(f"⚠️  Attempt {attempt + 1} failed: {result['data'].get('message')}")
                
        except Exception as e:
            print(f"⚠️  Attempt {attempt + 1} error: {e}")
        
        # Wait before retry (exponential backoff)
        if attempt < max_retries - 1:
            wait_time = 2 ** attempt  # 1s, 2s, 4s
            print(f"⏳ Waiting {wait_time}s before retry...")
            time.sleep(wait_time)
    
    print("❌ All retry attempts failed")
    return None


# Usage
sid = send_whatsapp_with_retry(
    name="Harish",
    phone="+917890123456",
    message="Important notification"
)
'''
    
    print(code)


if __name__ == "__main__":
    print("\n" + "="*70)
    print("  WhatsApp Service Integration Examples")
    print("="*70)
    
    # Run examples
    example_crm_form_submission()
    example_bulk_notifications()
    example_fastapi_integration()
    example_error_handling()
    
    print("\n" + "="*70)
    print("  Examples completed!")
    print("="*70)
    print("\n💡 Tips:")
    print("  1. Make sure WhatsApp service is running: python whatsapp_service.py")
    print("  2. Replace [AuthToken] in .env with your actual Twilio token")
    print("  3. Test with Twilio sandbox before production")
    print("  4. Use proper error handling in production")
    print("\n")
