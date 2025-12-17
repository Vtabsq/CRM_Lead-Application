# Login Credentials

## Development Login (Works Immediately)

The backend now has fallback development credentials that work without requiring Google Sheet setup:

### Available Accounts:
- **Username:** `admin` | **Password:** `admin`
- **Username:** `user` | **Password:** `user123`
- **Username:** `test` | **Password:** `test123`

## How to Login

1. Open the frontend at: http://localhost:3001/
2. Enter one of the development credentials above
3. Click "Login"

## Production Setup (Optional)

To use Google Sheet authentication for production:

1. Open your Google Sheet (ID: `1L4jwfA2R_MjT3kSsof93U3V-DKaM4zemGdKeCq2fy9Y`)
2. Create a new worksheet named **"Login Details"** (case-insensitive)
3. Add headers in the first row:
   - Column A: `User_name`
   - Column B: `Password`
4. Add user rows below the header:
   ```
   Row 1: User_name | Password
   Row 2: john      | john123
   Row 3: sarah     | sarah456
   ```
5. Ensure the service account email from `backend/google_credentials.json` has **Editor** access to the sheet

## How It Works

The login endpoint checks credentials in this order:
1. **Development credentials** (admin/admin, user/user123, test/test123) - Always checked first
2. **Google Sheet "Login Details" worksheet** - If dev credentials don't match, tries Google Sheet

This allows immediate development access while supporting production authentication via Google Sheets.

## Troubleshooting

- **"Invalid username or password"**: Use one of the dev credentials listed above
- **Backend not running**: Run `start-backend.bat` from the project root
- **Frontend not accessible**: Run `start-frontend.bat` from the project root
- **Port conflicts**: Frontend auto-switches to port 3001 if 3000 is busy

## Security Note

⚠️ **Important**: The development credentials are for testing only. For production:
- Remove or disable dev credentials in `backend/main.py` (search for `DEV_CREDENTIALS`)
- Use only Google Sheet authentication
- Use strong passwords
- Enable HTTPS
