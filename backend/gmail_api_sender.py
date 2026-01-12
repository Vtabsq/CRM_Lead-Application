"""
Gmail API Email Sender
Uses OAuth2 credentials to send emails via Gmail API
Supports both local file-based tokens and environment variable tokens for server deployment
"""

import os
import base64
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import pickle

# Gmail API scopes
# Include readonly for setup profile check; send is used for actual email sending
SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly'
]

def get_gmail_service():
    """Get authenticated Gmail API service"""
    creds = None
    
    # Try to load from environment variable first (for server deployment)
    refresh_token_b64 = os.getenv('GMAIL_REFRESH_TOKEN_B64')
    
    if refresh_token_b64:
        print("[Gmail API] Loading credentials from environment variable")
        try:
            # Decode and load credentials from environment
            creds_dict = json.loads(base64.b64decode(refresh_token_b64).decode())
            creds = Credentials(
                token=creds_dict.get('token'),
                refresh_token=creds_dict.get('refresh_token'),
                token_uri=creds_dict.get('token_uri'),
                client_id=creds_dict.get('client_id'),
                client_secret=creds_dict.get('client_secret'),
                scopes=creds_dict.get('scopes', SCOPES)
            )
            
            # Refresh if expired
            if creds.expired and creds.refresh_token:
                creds.refresh(Request())
                print("[Gmail API] Token refreshed successfully")
                
        except Exception as e:
            print(f"[Gmail API] Error loading from environment: {e}")
            creds = None
    
    # If no environment token, try local file (for development)
    if not creds:
        print("[Gmail API] Loading credentials from local file")
        token_file = 'gmail_token.pickle'
        
        # Load existing token
        if os.path.exists(token_file):
            with open(token_file, 'rb') as token:
                creds = pickle.load(token)
        
        # If no valid credentials, authenticate
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists('gmail_oauth_credentials.json'):
                    raise FileNotFoundError(
                        "gmail_oauth_credentials.json not found. "
                        "Please run 'python generate_gmail_token.py' to generate tokens."
                    )
                print("[Gmail API] Starting OAuth flow - browser will open...")
                flow = InstalledAppFlow.from_client_secrets_file(
                    'gmail_oauth_credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
            
            # Save token for future use
            with open(token_file, 'wb') as token:
                pickle.dump(creds, token)
    
    return build('gmail', 'v1', credentials=creds)

def send_email_via_gmail_api(sender_email, recipient_email, subject, body_text, cc_emails=None, bcc_emails=None):
    """
    Send email using Gmail API
    
    Args:
        sender_email: Sender's email address
        recipient_email: Recipient's email address
        subject: Email subject
        body_text: Email body (plain text)
        cc_emails: List of CC email addresses (optional)
    
    Returns:
        dict: Response from Gmail API
    """
    try:
        service = get_gmail_service()
        
        # Create message
        message = MIMEMultipart()
        message['From'] = f"CRM Lead Form <{sender_email}>"
        message['To'] = recipient_email
        message['Subject'] = subject
        
        if cc_emails:
            message['Cc'] = ', '.join(cc_emails)
        if bcc_emails:
            message['Bcc'] = ', '.join(bcc_emails)
        
        # Add body
        message.attach(MIMEText(body_text, 'plain'))
        
        # Encode message
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
        
        # Send message
        send_result = service.users().messages().send(
            userId='me',
            body={'raw': raw_message}
        ).execute()
        
        print(f"[Gmail API] Email sent successfully! Message ID: {send_result['id']}")
        return send_result
        
    except Exception as e:
        print(f"[Gmail API ERROR] Failed to send email: {e}")
        raise

def test_gmail_api():
    """Test function to verify Gmail API setup"""
    try:
        print("Testing Gmail API connection...")
        service = get_gmail_service()
        
        # Get user profile to verify connection
        profile = service.users().getProfile(userId='me').execute()
        print(f"✓ Connected to Gmail API")
        print(f"✓ Email: {profile['emailAddress']}")
        print(f"✓ Total messages: {profile['messagesTotal']}")
        
        return True
    except Exception as e:
        print(f"✗ Gmail API test failed: {e}")
        return False

if __name__ == "__main__":
    # Run test when executed directly
    test_gmail_api()
