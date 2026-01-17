"""
Script to list ALL usernames and passwords from Login Details worksheet
"""
import gspread
from google.oauth2.service_account import Credentials
import os

# Configuration
CREDENTIALS_FILE = "GOOGLE_CREDENTIALS.json"
GOOGLE_SHEET_ID = "1L4jwfA2R_MjT3kSsof93U3V-DKaM4zemGdKeCq2fy9Y"

def list_all_users():
    """List all usernames and passwords from Login Details worksheet."""
    if not os.path.exists(CREDENTIALS_FILE):
        print(f"❌ Error: {CREDENTIALS_FILE} not found")
        return
    
    try:
        # Authenticate
        scope = [
            'https://spreadsheets.google.com/feeds',
            'https://www.googleapis.com/auth/drive'
        ]
        creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
        client = gspread.authorize(creds)
        
        # Open spreadsheet
        print(f"📊 Connecting to Google Sheet...")
        spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
        print(f"✅ Spreadsheet: {spreadsheet.title}")
        print(f"   URL: {spreadsheet.url}\n")
        
        # Find Login Details worksheet (case-insensitive)
        login_ws = None
        try:
            login_ws = spreadsheet.worksheet("Login Details")
        except gspread.WorksheetNotFound:
            for ws in spreadsheet.worksheets():
                if ws.title.strip().lower() == 'login details':
                    login_ws = ws
                    break
        
        if not login_ws:
            print("❌ 'Login Details' worksheet not found!")
            print("\n📋 Available worksheets:")
            for ws in spreadsheet.worksheets():
                print(f"   - {ws.title}")
            return
        
        print(f"✅ Found worksheet: {login_ws.title}\n")
        
        # Get all values
        values = login_ws.get_all_values()
        
        if not values:
            print("❌ Worksheet is empty!")
            return
        
        if len(values) < 2:
            print("❌ No user data found (only headers)")
            print(f"Headers: {values[0] if values else 'None'}")
            return
        
        # Parse headers
        headers = values[0]
        print(f"📋 Headers: {headers}\n")
        
        # Find username and password columns
        header_map = {str(h).strip().lower(): i for i, h in enumerate(headers)}
        user_col = (
            header_map.get('user_name')
            or header_map.get('user name')
            or header_map.get('username')
            or header_map.get('user-name')
        )
        pass_col = header_map.get('password')
        
        if user_col is None or pass_col is None:
            print("❌ Required columns not found!")
            print(f"   Looking for: 'User_name' or 'username' AND 'Password'")
            print(f"   Found headers: {headers}")
            return
        
        # Display all users
        print("=" * 70)
        print(f"{'Row':<6} | {'Username':<25} | {'Password':<30}")
        print("=" * 70)
        
        user_count = 0
        for i, row in enumerate(values[1:], start=2):
            username = row[user_col].strip() if user_col < len(row) else ''
            password = row[pass_col].strip() if pass_col < len(row) else ''
            
            # Show all rows, even empty ones
            if username or password:
                print(f"{i:<6} | {username:<25} | {password:<30}")
                user_count += 1
        
        print("=" * 70)
        print(f"\n✅ Total users found: {user_count}")
        
        # Summary
        print("\n📊 Summary:")
        print(f"   - Total rows (including header): {len(values)}")
        print(f"   - User rows: {len(values) - 1}")
        print(f"   - Non-empty users: {user_count}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    list_all_users()
