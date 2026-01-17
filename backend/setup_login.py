# Script to create Login Details worksheet with your user
import gspread
from google.oauth2.service_account import Credentials

# Configuration
SHEET_ID = "13NOTcuCrFDrTVbow0GsWobcX84oGmAkjepOLCDRZKzw"
CREDENTIALS_FILE = "google_credentials.json"

# Your login credentials
USERNAME = "Harish"
PASSWORD = "your_password_here"  # Replace with your actual password

def create_login_worksheet():
    """Create Login Details worksheet with user credentials"""
    try:
        # Connect to Google Sheets
        scope = [
            'https://spreadsheets.google.com/feeds',
            'https://www.googleapis.com/auth/drive'
        ]
        creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
        client = gspread.authorize(creds)
        spreadsheet = client.open_by_key(SHEET_ID)
        
        # Check if Login Details worksheet already exists
        try:
            login_ws = spreadsheet.worksheet("Login Details")
            print("✅ 'Login Details' worksheet already exists")
            print(f"   Current data: {login_ws.get_all_values()}")
            return
        except:
            pass
        
        # Create new worksheet
        print("Creating 'Login Details' worksheet...")
        login_ws = spreadsheet.add_worksheet(title="Login Details", rows=100, cols=10)
        
        # Add headers
        headers = ["User_Name", "Password"]
        login_ws.append_row(headers)
        
        # Add your user
        login_ws.append_row([USERNAME, PASSWORD])
        
        print(f"✅ Created 'Login Details' worksheet")
        print(f"   Added user: {USERNAME}")
        print(f"   Password: {PASSWORD}")
        print("\n⚠️  IMPORTANT: Update the PASSWORD variable in this script with your actual password!")
        print("   Then run this script again to update the worksheet.")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    create_login_worksheet()
