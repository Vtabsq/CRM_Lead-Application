# Gmail API Setup Instructions

## Step 1: Enable Gmail API in Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. Select your project: **crm-lead-form**
3. Go to: **APIs & Services** → **Library**
4. Search for: **Gmail API**
5. Click **Enable**

## Step 2: Create OAuth 2.0 Credentials

1. Go to: **APIs & Services** → **Credentials**
2. Click: **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, configure OAuth consent screen:
   - User Type: **External**
   - App name: **CRM Lead Form**
   - User support email: **harishkadhi18022001@gmail.com**
   - Developer contact: **harishkadhi18022001@gmail.com**
   - Click **Save and Continue** through all steps
4. Create OAuth client ID:
   - Application type: **Desktop app**
   - Name: **CRM Email Sender**
   - Click **Create**
5. **Download the JSON file** (it will be named like `client_secret_xxx.json`)
6. Rename it to: **gmail_oauth_credentials.json**
7. Place it in the `backend` folder

## Step 3: Run the Setup Script

After placing the file, I'll create a script that will:
1. Authenticate with your Gmail account
2. Generate a token file
3. Use that token to send emails

## Benefits of This Approach:
- ✅ Reliable email delivery
- ✅ Emails appear in your Sent folder
- ✅ No Gmail blocking issues
- ✅ Uses your actual Gmail account
- ✅ Free (no SendGrid needed)

Let me know when you've completed Steps 1 & 2 and downloaded the OAuth credentials file!
