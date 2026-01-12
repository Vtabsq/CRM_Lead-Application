#!/usr/bin/env python3
"""
Generate Gmail OAuth Refresh Token
Run this script locally to generate a refresh token for Gmail API.
The refresh token can then be used on servers like Render.
"""

import os
import json
import base64
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials

# Gmail API scopes
SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly'
]

def generate_refresh_token():
    """Generate and save refresh token for Gmail API"""
    
    print("=== Gmail OAuth Token Generator ===\n")
    
    # Check if credentials file exists
    if not os.path.exists('gmail_oauth_credentials.json'):
        print("❌ ERROR: gmail_oauth_credentials.json not found!")
        print("\nPlease download your OAuth credentials from Google Cloud Console:")
        print("1. Go to https://console.cloud.google.com/")
        print("2. Select your project")
        print("3. Go to APIs & Services > Credentials")
        print("4. Create OAuth 2.0 Client ID (Desktop App)")
        print("5. Download JSON and save as 'gmail_oauth_credentials.json'")
        return
    
    try:
        # Run OAuth flow
        print("🔑 Starting OAuth flow...")
        flow = InstalledAppFlow.from_client_secrets_file(
            'gmail_oauth_credentials.json', 
            SCOPES
        )
        
        # This will open a browser for authentication
        print("🌐 Opening browser for authentication...")
        creds = flow.run_local_server(port=0)
        
        # Save the full token as pickle (for local use)
        with open('gmail_token.pickle', 'wb') as token:
            pickle.dump(creds, token)
        print("✅ Saved full token to gmail_token.pickle")
        
        # Create credentials dict for environment variable
        creds_dict = {
            'token': creds.token,
            'refresh_token': creds.refresh_token,
            'token_uri': creds.token_uri,
            'client_id': creds.client_id,
            'client_secret': creds.client_secret,
            'scopes': creds.scopes
        }
        
        # Save as JSON for easy copying
        with open('gmail_credentials.json', 'w') as f:
            json.dump(creds_dict, f, indent=2)
        print("✅ Saved credentials to gmail_credentials.json")
        
        # Encode for environment variable
        creds_b64 = base64.b64encode(json.dumps(creds_dict).encode()).decode()
        
        print("\n" + "="*60)
        print("🎉 SUCCESS! Your refresh token has been generated.")
        print("="*60)
        
        print("\n📧 Email:", creds.client_id)
        print("🔑 Has Refresh Token:", "✅" if creds.refresh_token else "❌")
        
        print("\n" + "="*60)
        print("📋 FOR RENDER DEPLOYMENT:")
        print("="*60)
        print("\nAdd this environment variable to your Render service:")
        print("\nGMAIL_REFRESH_TOKEN_B64=" + creds_b64[:50] + "...")
        
        print("\nOr copy the full value from gmail_credentials.json")
        
        # Save the base64 token to a file for easy access
        with open('gmail_refresh_token_b64.txt', 'w') as f:
            f.write(creds_b64)
        print("\n✅ Base64 token saved to gmail_refresh_token_b64.txt")
        
        print("\n" + "="*60)
        print("📝 NEXT STEPS:")
        print("="*60)
        print("1. Copy the GMAIL_REFRESH_TOKEN_B64 value to Render")
        print("2. Set EMAIL_TRANSPORT=gmail_api in Render")
        print("3. Set DEFAULT_SENDER_EMAIL to your Gmail address")
        print("4. Test with the /test-email endpoint")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print("\nTroubleshooting:")
        print("- Ensure your OAuth app is configured for 'Desktop App'")
        print("- Check that Gmail API is enabled in Google Cloud Console")
        print("- Verify the credentials file is valid JSON")

if __name__ == "__main__":
    generate_refresh_token()
