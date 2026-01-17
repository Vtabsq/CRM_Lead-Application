"""
Script to check Login Details worksheet in Google Sheets
"""
import gspread
from google.oauth2.service_account import Credentials
import os

# Configuration
CREDENTIALS_FILE = "GOOGLE_CREDENTIALS.json"
GOOGLE_SHEET_ID = "1L4jwfA2R_MjT3kSsof93U3V-DKaM4zemGdKeCq2fy9Y"

def check_login_details():
    """Check the Login Details worksheet for usernames and passwords."""
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
        print(f"📊 Opening Google Sheet: {GOOGLE_SHEET_ID}")
        spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
        print(f"✅ Spreadsheet: {spreadsheet.title}")
        print(f"   URL: {spreadsheet.url}\n")
        
        # List all worksheets
        print("📋 Available worksheets:")
        for ws in spreadsheet.worksheets():
            print(f"   - {ws.title}")
        print()
        
        # Try to find Login Details worksheet (case-insensitive)
        login_ws = None
        try:
            login_ws = spreadsheet.worksheet("Login Details")
            print("✅ Found 'Login Details' worksheet (exact match)")
        except gspread.WorksheetNotFound:
            # Try case-insensitive search
            for ws in spreadsheet.worksheets():
                if ws.title.strip().lower() == 'login details':
                    login_ws = ws
                    print(f"✅ Found '{ws.title}' worksheet (case-insensitive match)")
                    break
        
        if not login_ws:
            print("❌ 'Login Details' worksheet not found!")
            print("\n💡 To fix this:")
            print("   1. Open the Google Sheet")
            print("   2. Create a new worksheet named 'Login Details'")
            print("   3. Add headers: User_name | Password")
            print("   4. Add user rows below the header")
            return
        
        # Get all values
        values = login_ws.get_all_values()
        
        if not values:
            print("❌ 'Login Details' worksheet is empty!")
            return
        
        print(f"\n📄 Worksheet: {login_ws.title}")
        print(f"   Total rows: {len(values)}")
        
        if len(values) < 2:
            print("❌ No user data found (only headers or empty)")
            return
        
        # Parse headers
        headers = values[0]
        print(f"\n📋 Headers: {headers}")
        
        # Find username and password columns
        header_map = {str(h).strip().lower(): i for i, h in enumerate(headers)}
        user_col = (
            header_map.get('user_name')
            or header_map.get('user name')
            or header_map.get('username')
            or header_map.get('user-name')
        )
        pass_col = header_map.get('password')
        
        if user_col is None:
            print("❌ Username column not found! Expected: 'User_name', 'username', etc.")
            return
        
        if pass_col is None:
            print("❌ Password column not found! Expected: 'Password'")
            return
        
        print(f"✅ Username column: {headers[user_col]} (index {user_col})")
        print(f"✅ Password column: {headers[pass_col]} (index {pass_col})")
        
        # Display users
        print(f"\n👥 Found {len(values) - 1} user(s):\n")
        print("=" * 60)
        print(f"{'Username':<20} | {'Password':<30}")
        print("=" * 60)
        
        for i, row in enumerate(values[1:], start=2):
            username = row[user_col].strip() if user_col < len(row) else ''
            password = row[pass_col].strip() if pass_col < len(row) else ''
            
            if username:  # Only show non-empty usernames
                # Mask password for security (show first 2 chars + ***)
                masked_pass = password[:2] + '*' * (len(password) - 2) if len(password) > 2 else '***'
                print(f"{username:<20} | {masked_pass:<30}")
        
        print("=" * 60)
        
        # Check for "Harish"
        print("\n🔍 Checking for 'Harish' user...")
        harish_found = False
        for row in values[1:]:
            username = row[user_col].strip() if user_col < len(row) else ''
            password = row[pass_col].strip() if pass_col < len(row) else ''
            
            if username.lower() == 'harish':
                harish_found = True
                print(f"✅ User 'Harish' found!")
                print(f"   Username: {username}")
                print(f"   Password: {password}")
                break
        
        if not harish_found:
            print("❌ User 'Harish' NOT found in the sheet")
            print("\n💡 Available development credentials:")
            print("   - admin / admin")
            print("   - user / user123")
            print("   - test / test123")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_login_details()
