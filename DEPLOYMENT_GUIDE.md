# CRM Application Deployment Guide - Render

## Overview
This guide will help you deploy the CRM Lead Application to Render.com with all its features including:
- FastAPI Backend with Google Sheets integration
- React Frontend with TailwindCSS
- WhatsApp integration via Twilio
- AI-powered analysis (Groq/Hugging Face)
- Email notifications (Gmail API)
- PDF generation and Excel export

## Prerequisites
1. **Render Account** - Create account at [render.com](https://render.com)
2. **GitHub Account** - Push code to GitHub repository
3. **API Keys** - Prepare all required API keys (see Environment Variables section)

## Step 1: Push Code to GitHub

```bash
# Add all files and commit
git add .
git commit -m "Ready for Render deployment"

# Push to GitHub
git push origin main
```

## Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and create all services

### Option B: Manual Setup
Create three separate web services:

#### Backend Service
- **Name**: crm-backend
- **Environment**: Python 3.10
- **Build Command**: `cd backend && pip install -r requirements.txt`
- **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Health Check**: `/health`

#### Frontend Service
- **Name**: crm-frontend
- **Environment**: Node 18
- **Build Command**: `cd frontend && npm install && npm run build`
- **Start Command**: `cd frontend && npm run preview`
- **Health Check**: `/`

#### WhatsApp Service (Optional)
- **Name**: crm-whatsapp
- **Environment**: Python 3.10
- **Build Command**: `cd backend && pip install -r requirements.txt`
- **Start Command**: `cd backend && python whatsapp_service.py`
- **Health Check**: `/health`

## Step 3: Configure Environment Variables

### Required Environment Variables

#### Core Application
```
EXCEL_FILE_PATH=CRM_Lead_Template (1).xlsm
GOOGLE_SHEET_NAME=CRM Leads
CREDENTIALS_FILE=google_credentials.json
EMAIL_TRANSPORT=gmail_api
EMAIL_SIMPLE_MODE=0
API_HOST=0.0.0.0
API_PORT=8000
WHATSAPP_SERVICE_PORT=5000
FLASK_DEBUG=False
```

#### Email Configuration
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
DEFAULT_NOTIFICATION_EMAIL=your-email@gmail.com
EMAIL_SUBJECT=New CRM Lead Submission
```

#### Google Sheets Integration
```
GOOGLE_SHEET_ID=your-google-sheet-id
PATIENT_ADMISSION_SHEET_ID=your-patient-admission-sheet-id
HOMECARE_SHEET_ID=your-homecare-sheet-id
```

#### AI Configuration
```
AI_PROVIDER=groq
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile
AI_ENABLED=True
HF_TOKEN=your-huggingface-token
HF_MODEL=microsoft/Phi-3-mini-4k-instruct
HF_API_BASE_URL=https://api-inference.huggingface.co/v1
HF_ENABLED=False
```

#### Twilio WhatsApp
```
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

## Step 4: Upload Required Files

### Files to Upload via Render Dashboard
1. **google_credentials.json** - Google Sheets API credentials
2. **CRM_Lead_Template (1).xlsm** - Excel template file
3. **gmail_oauth_credentials.json** - Gmail API credentials (if using Gmail API)

### Upload Method
1. Go to your service in Render Dashboard
2. Click "Files" tab
3. Upload the files to the root directory

## Step 5: Configure Frontend API URL

After backend deployment:
1. Get your backend URL (e.g., `https://crm-backend.onrender.com`)
2. In frontend service environment variables:
   ```
   VITE_API_URL=https://crm-backend.onrender.com
   ```

## Step 6: Test Deployment

### Backend Testing
- Open `https://crm-backend.onrender.com/docs` for API documentation
- Test health endpoint: `https://crm-backend.onrender.com/health`
- Test sample API calls

### Frontend Testing
- Open `https://crm-frontend.onrender.com`
- Test all features:
  - Lead form submission
  - Dashboard functionality
  - PDF generation
  - WhatsApp integration

## Troubleshooting

### Common Issues

#### 1. Backend Fails to Start
- Check environment variables in Render dashboard
- Verify all required files are uploaded
- Check build logs for missing dependencies

#### 2. Frontend Cannot Connect to Backend
- Ensure `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Verify backend is running and accessible

#### 3. Google Sheets Integration Not Working
- Verify `google_credentials.json` is uploaded correctly
- Check Google Sheet IDs are correct
- Ensure service account has access to sheets

#### 4. Email Not Sending
- Verify Gmail app password is correct
- Check if Gmail API is enabled
- Ensure email transport settings are correct

#### 5. WhatsApp Not Working
- Verify Twilio credentials
- Check WhatsApp number configuration
- Ensure webhook URLs are accessible

### Log Viewing
- Go to Render Dashboard → Your Service → Logs
- Check both build logs and runtime logs
- Use search to find specific errors

## Scaling and Performance

### Free Plan Limitations
- **Backend**: 512MB RAM, 750 hours/month
- **Frontend**: 512MB RAM, 750 hours/month
- **Sleeps after 15 minutes inactivity**

### Production Recommendations
- Upgrade to Starter plan for better performance
- Add Redis for session storage
- Consider PostgreSQL for large datasets
- Set up monitoring and alerts

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **API Keys**: Use Render's secret management
3. **HTTPS**: All services automatically get SSL certificates
4. **CORS**: Configure properly for production domains
5. **Rate Limiting**: Implement for API endpoints

## Maintenance

### Regular Tasks
- Monitor logs for errors
- Update dependencies regularly
- Backup Google Sheets data
- Renew API keys as needed

### Updates and Deployment
- Push changes to GitHub
- Render automatically rebuilds and deploys
- Use blue-green deployment for zero downtime

## Support

For issues:
1. Check Render documentation: [docs.render.com](https://docs.render.com)
2. Review application logs
3. Test locally first
4. Check API service status (Google, Twilio, etc.)

## Cost Estimation

### Free Tier (Monthly)
- **Backend**: $0 (with limitations)
- **Frontend**: $0 (with limitations)
- **Total**: $0

### Starter Plan (Monthly)
- **Backend**: $7/month
- **Frontend**: $7/month
- **WhatsApp Service**: $7/month (optional)
- **Total**: $21/month

### Additional Costs
- Twilio WhatsApp: ~$0.005/message
- Google Sheets API: Free tier sufficient
- Email sending: Free via Gmail
- AI API: Varies by usage

---

**Ready to deploy!** Follow these steps carefully and your CRM application will be running on Render in no time.
