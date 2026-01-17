"""
Script to save all usernames and passwords to a file
"""
import gspread
from google.oauth2.service_account import Credentials
import os

# Configuration
CREDENTIALS_FILE = "GOOGLE_CREDENTIALS.json"
GOOGLE_SHEET_ID = "1L4jwfA2R_MjT3kSsof93U3V-DKaM4zemGdKeCq2fy9Y"
OUTPUT_FILE = "all_login_users.txt"

def save_all_users():
    """Save all usernames and passwords to a text file."""
    if not os.path.exists(CREDENTIALS_FILE):
        return {"error": f"{CREDENTIALS_FILE} not found"}
    
    try:
        # Authenticate
        scope = [
            'https://spreadsheets.google.com/feeds',
            'https://www.googleapis.com/auth/drive'
        ]
        creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
        client = gspread.authorize(creds)
        
        # Open spreadsheet
        spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
        
        # Find Login Details worksheet
        login_ws = None
        try:
            login_ws = spreadsheet.worksheet("Login Details")
        except gspread.WorksheetNotFound:
            for ws in spreadsheet.worksheets():
                if ws.title.strip().lower() == 'login details':
                    login_ws = ws
                    break
        
        if not login_ws:
            return {"error": "Login Details worksheet not found"}
        
        # Get all values
        values = login_ws.get_all_values()
        
        if len(values) < 2:
            return {"error": "No user data found"}
        
        # Parse headers
        headers = values[0]
        header_map = {str(h).strip().lower(): i for i, h in enumerate(headers)}
        user_col = (
            header_map.get('user_name')
            or header_map.get('user name')
            or header_map.get('username')
            or header_map.get('user-name')
        )
        pass_col = header_map.get('password')
        
        if user_col is None or pass_col is None:
            return {"error": "Required columns not found"}
        
        # Collect users
        users = []
        for i, row in enumerate(values[1:], start=2):
            username = row[user_col].strip() if user_col < len(row) else ''
            password = row[pass_col].strip() if pass_col < len(row) else ''
            
            if username or password:
                users.append({
                    'row': i,
                    'username': username,
                    'password': password
                })
        
        # Write to file
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write("=" * 70 + "\n")
            f.write("ALL LOGIN USERS FROM GOOGLE SHEET\n")
            f.write("=" * 70 + "\n\n")
            f.write(f"Spreadsheet: {spreadsheet.title}\n")
            f.write(f"URL: {spreadsheet.url}\n")
            f.write(f"Worksheet: {login_ws.title}\n\n")
            f.write("=" * 70 + "\n")
            f.write(f"{'Row':<6} | {'Username':<25} | {'Password':<30}\n")
            f.write("=" * 70 + "\n")
            
            for user in users:
                f.write(f"{user['row']:<6} | {user['username']:<25} | {user['password']:<30}\n")
            
            f.write("=" * 70 + "\n")
            f.write(f"\nTotal users: {len(users)}\n")
        
        # Also print to console
        print(f"✅ Saved {len(users)} users to {OUTPUT_FILE}")
        print("\n" + "=" * 70)
        print(f"{'Row':<6} | {'Username':<25} | {'Password':<30}")
        print("=" * 70)
        for user in users:
            print(f"{user['row']:<6} | {user['username']:<25} | {user['password']:<30}")
        print("=" * 70)
        print(f"\nTotal users: {len(users)}")
        
        return {"success": True, "users": users, "file": OUTPUT_FILE}
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    result = save_all_users()
    if "error" in result:
        print(f"❌ Error: {result['error']}")
