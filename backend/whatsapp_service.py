"""
WhatsApp Service using Twilio API
Handles sending WhatsApp messages to customers
"""
from flask import Flask, request, jsonify
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Twilio Configuration
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', '')
TWILIO_WHATSAPP_FROM = os.getenv('TWILIO_WHATSAPP_FROM', 'whatsapp:+14155238886')

# Initialize Twilio client
try:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    logger.info("Twilio client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Twilio client: {e}")
    twilio_client = None


def validate_phone_number(phone: str) -> str:
    """
    Validate and format phone number for WhatsApp
    
    Args:
        phone: Phone number string
        
    Returns:
        Formatted phone number with whatsapp: prefix
        
    Raises:
        ValueError: If phone number is invalid
    """
    if not phone:
        raise ValueError("Phone number is required")
    
    # Remove any whitespace
    phone = phone.strip()
    
    # Ensure phone starts with +
    if not phone.startswith('+'):
        raise ValueError("Phone number must start with country code (e.g., +91)")
    
    # Add whatsapp: prefix if not present
    if not phone.startswith('whatsapp:'):
        phone = f'whatsapp:{phone}'
    
    return phone


def send_whatsapp_message(to_phone: str, name: str, custom_message: str = None) -> dict:
    """
    Send WhatsApp message via Twilio
    
    Args:
        to_phone: Recipient phone number
        name: Recipient name
        custom_message: Optional custom message body
        
    Returns:
        dict: Response containing status and message SID
        
    Raises:
        TwilioRestException: If Twilio API call fails
        Exception: For other errors
    """
    if not twilio_client:
        raise Exception("Twilio client not initialized. Check your credentials.")
    
    # Validate and format phone number
    formatted_phone = validate_phone_number(to_phone)
    
    # Create message body
    if custom_message:
        message_body = custom_message
    else:
        message_body = f"Hi {name}, thanks for submitting your form! We'll reach out to you soon."
    
    logger.info(f"Attempting to send WhatsApp message to {formatted_phone}")
    
    try:
        # Send message via Twilio
        message = twilio_client.messages.create(
            from_=TWILIO_WHATSAPP_FROM,
            body=message_body,
            to=formatted_phone
        )
        
        logger.info(f"WhatsApp message sent successfully. SID: {message.sid}")
        
        return {
            'status': 'success',
            'sid': message.sid,
            'to': formatted_phone,
            'message': 'WhatsApp message sent successfully'
        }
        
    except TwilioRestException as e:
        logger.error(f"Twilio API error: {e.code} - {e.msg}")
        raise Exception(f"Failed to send WhatsApp message: {e.msg}")
    
    except Exception as e:
        logger.error(f"Unexpected error sending WhatsApp: {str(e)}")
        raise


@app.route('/submit_form', methods=['POST'])
def submit_form():
    """
    Handle form submission and send WhatsApp notification
    
    Expected JSON body:
    {
        "name": "Customer Name",
        "phone": "+917890123456",
        "message": "Customer message/inquiry"
    }
    
    Returns:
        JSON response with status and message SID
    """
    try:
        # Validate request content type
        if not request.is_json:
            return jsonify({
                'status': 'error',
                'message': 'Content-Type must be application/json'
            }), 400
        
        # Get request data
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'phone', 'message']
        missing_fields = [field for field in required_fields if field not in data or not data[field]]
        
        if missing_fields:
            return jsonify({
                'status': 'error',
                'message': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        name = data['name'].strip()
        phone = data['phone'].strip()
        customer_message = data['message'].strip()
        
        # Log the submission
        logger.info(f"Form submission received from {name} ({phone})")
        logger.info(f"Customer message: {customer_message}")
        
        # Send WhatsApp message
        result = send_whatsapp_message(
            to_phone=phone,
            name=name
        )
        
        # Return success response
        return jsonify(result), 200
        
    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400
        
    except Exception as e:
        logger.error(f"Error processing form submission: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to send WhatsApp message. Please try again later.',
            'details': str(e)
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'WhatsApp Service',
        'twilio_configured': twilio_client is not None
    }), 200


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'status': 'error',
        'message': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({
        'status': 'error',
        'message': 'Internal server error'
    }), 500


if __name__ == '__main__':
    # Run the Flask app
    port = int(os.getenv('WHATSAPP_SERVICE_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting WhatsApp Service on port {port}")
    logger.info(f"Twilio Account SID: {TWILIO_ACCOUNT_SID[:10]}...")
    logger.info(f"WhatsApp From Number: {TWILIO_WHATSAPP_FROM}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
