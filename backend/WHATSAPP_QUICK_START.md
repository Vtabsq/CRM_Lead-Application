# 🚀 WhatsApp Service - Quick Start Guide

## ⚡ 3-Step Setup

### Step 1: Install Dependencies
```bash
pip install flask twilio python-dotenv
```

### Step 2: Configure Auth Token
Edit `.env` file and replace `[AuthToken]` with your actual Twilio auth token:
```env
TWILIO_AUTH_TOKEN=your_actual_token_here
```

### Step 3: Start the Service
```bash
python whatsapp_service.py
```

✅ Service running at: `http://localhost:5000`

---

## 📞 Send Your First WhatsApp

### Using cURL
```bash
curl -X POST http://localhost:5000/submit_form \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Harish",
    "phone": "+917890123456",
    "message": "I need help with a quote"
  }'
```

### Using Python
```python
import requests

response = requests.post('http://localhost:5000/submit_form', json={
    'name': 'Harish',
    'phone': '+917890123456',
    'message': 'I need help with a quote'
})

print(response.json())
# Output: {"status": "success", "sid": "SM...", ...}
```

### Using JavaScript/Fetch
```javascript
fetch('http://localhost:5000/submit_form', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Harish',
    phone: '+917890123456',
    message: 'I need help with a quote'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 📋 API Reference

### Endpoint: `POST /submit_form`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ Yes | Customer name |
| phone | string | ✅ Yes | Phone with country code (e.g., +91...) |
| message | string | ✅ Yes | Customer message/inquiry |

**Success Response (200):**
```json
{
  "status": "success",
  "sid": "SM1234567890abcdef",
  "to": "whatsapp:+917890123456",
  "message": "WhatsApp message sent successfully"
}
```

**Error Response (400/500):**
```json
{
  "status": "error",
  "message": "Error description here"
}
```

---

## 🔧 Configuration

### Environment Variables (.env)
```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_token_here          # ⚠️ Replace this!
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
WHATSAPP_SERVICE_PORT=5000
```

---

## ✅ Testing

### Run Test Suite
```bash
python test_whatsapp_service.py
```

### Check Service Health
```bash
curl http://localhost:5000/health
```

---

## 📱 Phone Number Format

✅ **Correct:**
- `+917890123456` (India)
- `+14155551234` (USA)
- `+442071234567` (UK)

❌ **Incorrect:**
- `7890123456` (missing country code)
- `917890123456` (missing + symbol)

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| "Twilio client not initialized" | Check `TWILIO_AUTH_TOKEN` in `.env` |
| "Phone number must start with country code" | Add `+` and country code to phone |
| "Connection refused" | Start service: `python whatsapp_service.py` |
| "Failed to send WhatsApp message" | Join Twilio sandbox first |

---

## 🎯 Integration with CRM

Add to your CRM form submission:

```python
import requests

def notify_customer_via_whatsapp(customer_data):
    """Send WhatsApp after CRM form submission"""
    try:
        response = requests.post(
            'http://localhost:5000/submit_form',
            json={
                'name': customer_data['name'],
                'phone': customer_data['phone'],
                'message': customer_data.get('message', 'New inquiry')
            },
            timeout=10
        )
        return response.status_code == 200
    except:
        return False

# Use it
success = notify_customer_via_whatsapp({
    'name': 'Harish',
    'phone': '+917890123456',
    'message': 'Elder care inquiry'
})
```

---

## 📚 Files Overview

| File | Purpose |
|------|---------|
| `whatsapp_service.py` | Main Flask service |
| `test_whatsapp_service.py` | Test suite |
| `integration_example.py` | Integration examples |
| `WHATSAPP_SERVICE_README.md` | Full documentation |
| `.env` | Configuration |

---

## 🔗 Quick Links

- **Twilio Console:** https://console.twilio.com/
- **WhatsApp Sandbox:** https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
- **Twilio Docs:** https://www.twilio.com/docs/whatsapp

---

## 💡 Pro Tips

1. **Test with Sandbox First** - Join Twilio sandbox before sending messages
2. **Use Environment Variables** - Never hardcode auth tokens
3. **Add Error Handling** - Always wrap API calls in try-catch
4. **Log Everything** - Service logs all requests and errors
5. **Rate Limiting** - Consider adding rate limits for production

---

## 🎉 You're Ready!

Start the service and send your first WhatsApp message:

```bash
python whatsapp_service.py
```

Then test it:

```bash
python test_whatsapp_service.py
```

**Need help?** Check `WHATSAPP_SERVICE_README.md` for detailed documentation.
