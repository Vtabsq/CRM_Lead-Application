# Gmail OAuth Setup for Server Deployment (Render, etc.)

This guide shows how to set up Gmail API for sending emails from servers without browser access (like Render).

## Overview

The OAuth flow requires a browser for initial authorization. We'll generate a refresh token locally and use it on the server.

## Step 1: Create Google Cloud OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Select **Desktop app** as the application type
6. Name it something like "CRM Gmail API"
7. Click **Create**
8. Download the JSON file and save it as `gmail_oauth_credentials.json` in your backend directory

## Step 2: Generate Refresh Token Locally

Run the token generator script on your local machine:

```bash
cd backend
python generate_gmail_token.py
```

This will:
- Open a browser for OAuth authorization
- Generate and save the refresh token
- Create files:
  - `gmail_token.pickle` (for local development)
  - `gmail_credentials.json` (JSON format)
  - `gmail_refresh_token_b64.txt` (base64 encoded for copy-paste)

## Step 3: Configure Environment Variables

### For Local Development
No extra configuration needed - it will use `gmail_token.pickle`

### For Server Deployment (Render)

Add these environment variables in your Render service:

1. **GMAIL_REFRESH_TOKEN_B64**
   - Copy the value from `gmail_refresh_token_b64.txt`
   - OR base64 encode the contents of `gmail_credentials.json`

2. **EMAIL_TRANSPORT**
   ```
   EMAIL_TRANSPORT=gmail_api
   ```

3. **DEFAULT_SENDER_EMAIL**
   ```
   DEFAULT_SENDER_EMAIL=your-email@gmail.com
   ```

## Step 4: Test the Setup

### Test Locally
```bash
curl -X POST http://localhost:8000/test-email \
  -H "Content-Type: application/json" \
  -d '{"recipient_email": "test@example.com"}'
```

### Test on Render
```bash
curl -X POST https://your-app.onrender.com/test-email \
  -H "Content-Type: application/json" \
  -d '{"recipient_email": "test@example.com"}'
```

## How It Works

1. The code first checks for `GMAIL_REFRESH_TOKEN_B64` environment variable
2. If found, it decodes and uses the credentials from the environment
3. If not found, it falls back to local file-based authentication
4. When the access token expires, it automatically refreshes using the refresh token

## Troubleshooting

### "invalid_grant" Error
- The refresh token has expired or been revoked
- Regenerate the token using `python generate_gmail_token.py`

### "redirect_uri_mismatch" Error
- Ensure you selected "Desktop app" when creating OAuth credentials
- Web application credentials won't work with this flow

### "File not found" Error
- Make sure `gmail_oauth_credentials.json` is in the backend directory
- Check that the JSON file is valid

## Security Notes

- Never commit `gmail_oauth_credentials.json` or any token files to version control
- The refresh token has access to your Gmail account - keep it secure
- If you suspect the token is compromised, revoke it in Google Cloud Console

## Multiple Gmail Accounts

If you need to send from multiple Gmail accounts:
1. Generate separate refresh tokens for each account
2. Use environment variables like `GMAIL_REFRESH_TOKEN_B64_ACCOUNT1`, `GMAIL_REFRESH_TOKEN_B64_ACCOUNT2`
3. Modify the code to select the appropriate token based on the sender email
