"""
Gmail API Setup Script
Run this after placing gmail_oauth_credentials.json in the backend folder
"""

import os
import sys

def main():
    print("=" * 60)
    print("Gmail API Setup for CRM Lead Form")
    print("=" * 60)
    print()
    
    # Check if OAuth credentials file exists
    if not os.path.exists('gmail_oauth_credentials.json'):
        print("❌ ERROR: gmail_oauth_credentials.json not found!")
        print()
        print("Please follow these steps:")
        print("1. Read GMAIL_API_SETUP.md in the project root")
        print("2. Download OAuth credentials from Google Cloud Console")
        print("3. Rename the file to: gmail_oauth_credentials.json")
        print("4. Place it in the backend folder")
        print("5. Run this script again")
        print()
        sys.exit(1)
    
    print("✓ Found gmail_oauth_credentials.json")
    print()
    print("Starting OAuth authentication...")
    print("A browser window will open for you to:")
    print("  1. Select your Gmail account (harishkadhi18022001@gmail.com)")
    print("  2. Grant permissions to send emails")
    print()
    input("Press ENTER to continue...")
    print()
    
    try:
        from gmail_api_sender import test_gmail_api
        
        if test_gmail_api():
            print()
            print("=" * 60)
            print("✓✓✓ SUCCESS! Gmail API is configured! ✓✓✓")
            print("=" * 60)
            print()
            print("Next steps:")
            print("1. Restart the backend server")
            print("2. Email notifications will now work via Gmail API")
            print("3. Emails will appear in your Sent folder")
            print()
        else:
            print()
            print("❌ Setup failed. Check the error messages above.")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Error during setup: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
