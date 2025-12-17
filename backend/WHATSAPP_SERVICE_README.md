# WhatsApp Service - Twilio Integration

A production-ready Flask backend service for sending WhatsApp messages via Twilio API.

## 📋 Features

- ✅ Send WhatsApp messages via Twilio API
- ✅ Form submission handling with validation
- ✅ Comprehensive error handling and logging
- ✅ Phone number validation and formatting
- ✅ Health check endpoint
- ✅ Environment variable configuration
- ✅ Production-ready code structure

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- `flask==3.0.0` - Web framework
- `twilio==8.10.0` - Twilio SDK for WhatsApp

### 2. Configure Environment Variables

Create or update your `.env` file in the backend directory:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_actual_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Service Configuration
WHATSAPP_SERVICE_PORT=5000
FLASK_DEBUG=False
```

**⚠️ IMPORTANT:** Replace `your_actual_auth_token_here` with your real Twilio auth token!

### 3. Run the Service

```bash
python whatsapp_service.py
```

The service will start on `http://localhost:5000`

## 📡 API Endpoints

### POST /submit_form

Send a WhatsApp message to a customer after form submission.

**Request:**
```json
{
  "name": "Harish",
  "phone": "+917890123456",
  "message": "I need help with a quote"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "sid": "SM1234567890abcdef",
  "to": "whatsapp:+917890123456",
  "message": "WhatsApp message sent successfully"
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Missing required fields: phone"
}
```

**Error Response (500):**
```json
{
  "status": "error",
  "message": "Failed to send WhatsApp message. Please try again later.",
  "details": "Error details here"
}
```

### GET /health

Check service health status.

**Response:**
```json
{
  "status": "healthy",
  "service": "WhatsApp Service",
  "twilio_configured": true
}
```

## 🧪 Testing

Run the test suite:

```bash
python test_whatsapp_service.py
```

This will test:
- Health check endpoint
- Input validation
- Form submission with sample data

### Manual Testing with cURL

```bash
# Test form submission
curl -X POST http://localhost:5000/submit_form \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Harish",
    "phone": "+917890123456",
    "message": "I need help with a quote"
  }'

# Test health check
curl http://localhost:5000/health
```

### Testing with Python

```python
import requests

response = requests.post(
    'http://localhost:5000/submit_form',
    json={
        'name': 'Harish',
        'phone': '+917890123456',
        'message': 'I need help with a quote'
    }
)

print(response.json())
```

## 📝 Phone Number Format

Phone numbers must:
- Include country code (e.g., `+91` for India)
- Start with `+` symbol
- Example: `+917890123456`

The service automatically adds the `whatsapp:` prefix required by Twilio.

## 🔒 Security Best Practices

1. **Never commit auth tokens** - Use environment variables
2. **Use HTTPS in production** - Enable SSL/TLS
3. **Rate limiting** - Consider adding rate limiting for production
4. **Input sanitization** - All inputs are validated and sanitized
5. **Error messages** - Generic error messages to clients, detailed logs server-side

## 📊 Logging

The service logs:
- All form submissions with customer details
- WhatsApp message sending attempts
- Twilio API responses
- Errors and exceptions

Logs include timestamps and severity levels.

## 🔧 Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `TWILIO_ACCOUNT_SID` | AC32eb... | Your Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | [AuthToken] | Your Twilio Auth Token |
| `TWILIO_WHATSAPP_FROM` | whatsapp:+14155238886 | Twilio WhatsApp number |
| `WHATSAPP_SERVICE_PORT` | 5000 | Flask server port |
| `FLASK_DEBUG` | False | Enable debug mode |

## 🚨 Troubleshooting

### Common Issues

**1. "Twilio client not initialized"**
- Check your `TWILIO_AUTH_TOKEN` is set correctly
- Verify credentials are valid

**2. "Phone number must start with country code"**
- Ensure phone numbers include `+` and country code
- Example: `+917890123456` (not `7890123456`)

**3. "Failed to send WhatsApp message"**
- Check Twilio account has WhatsApp enabled
- Verify the recipient has joined your Twilio sandbox
- Check Twilio account balance

**4. Connection refused**
- Ensure the service is running: `python whatsapp_service.py`
- Check the port is not already in use

## 📦 Production Deployment

### Using Gunicorn (Recommended)

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 whatsapp_service:app
```

### Using Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY whatsapp_service.py .
COPY .env .

EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "whatsapp_service:app"]
```

### Environment Variables in Production

Set these in your hosting platform:
- Heroku: `heroku config:set TWILIO_AUTH_TOKEN=your_token`
- AWS: Use AWS Secrets Manager
- Azure: Use Azure Key Vault
- Docker: Use `.env` file or Docker secrets

## 📞 Twilio Sandbox Setup

For testing with Twilio sandbox:

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to Messaging > Try it out > Send a WhatsApp message
3. Follow instructions to join your sandbox
4. Send "join [your-sandbox-keyword]" to the Twilio number
5. Now you can receive test messages

## 🔗 Integration Examples

### Frontend Integration (JavaScript)

```javascript
async function submitForm(formData) {
  try {
    const response = await fetch('http://localhost:5000/submit_form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      console.log('WhatsApp sent!', result.sid);
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Usage
submitForm({
  name: 'Harish',
  phone: '+917890123456',
  message: 'I need help with a quote'
});
```

### React Integration

```jsx
import axios from 'axios';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await axios.post('http://localhost:5000/submit_form', {
      name: formData.name,
      phone: formData.phone,
      message: formData.message
    });
    
    if (response.data.status === 'success') {
      alert('WhatsApp message sent successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to send message');
  }
};
```

## 📄 License

This service is part of the CRM project.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Twilio documentation
3. Check service logs for detailed error messages
