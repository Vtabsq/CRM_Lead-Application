# Google Sheets Setup Guide

## Overview

This guide will help you set up Google Sheets integration for the CRM Lead Form application.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: `CRM Lead Form` (or your preferred name)
5. Click "Create"
6. Wait for the project to be created (you'll see a notification)

### 2. Enable Required APIs

1. In the Google Cloud Console, ensure your new project is selected
2. Go to "APIs & Services" → "Library" (use the search bar or navigation menu)
3. Search for "Google Sheets API"
4. Click on it and click "Enable"
5. Go back to the Library
6. Search for "Google Drive API"
7. Click on it and click "Enable"

### 3. Create Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in the details:
   - **Service account name**: `crm-lead-form-service`
   - **Service account ID**: (auto-generated)
   - **Description**: `Service account for CRM Lead Form application`
4. Click "Create and Continue"
5. Skip the optional steps (click "Continue" then "Done")

### 4. Generate Credentials JSON

1. In the "Credentials" page, find your service account in the list
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" → "Create new key"
5. Select "JSON" format
6. Click "Create"
7. The JSON file will download automatically
8. **Important**: Save this file securely!

### 5. Configure the Application

1. Rename the downloaded JSON file to: `google_credentials.json`
2. Move it to the `backend/` folder of your project
3. **Security Note**: Never commit this file to version control!

### 6. Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new blank spreadsheet
3. Name it: `CRM Leads` (or update the name in `backend/main.py`)
4. Note: You don't need to add headers - the app will do this automatically

### 7. Share the Sheet with Service Account

This is a **critical step**:

1. Open your `google_credentials.json` file
2. Find the `client_email` field (looks like: `xxx@xxx.iam.gserviceaccount.com`)
3. Copy this email address
4. In your Google Sheet, click the "Share" button (top right)
5. Paste the service account email
6. Change permission to "Editor"
7. **Uncheck** "Notify people" (it's a service account, not a real person)
8. Click "Share" or "Send"

### 8. Verify Setup

1. Start your backend server
2. Visit: http://localhost:8000/health
3. Check the response:
   ```json
   {
     "status": "healthy",
     "excel_file": true,
     "google_credentials": true,
     "fields_loaded": X
   }
   ```
4. All values should be `true` (except `fields_loaded` which shows a number)

## Configuration Options

### Change Google Sheet Name

In `backend/main.py`, modify:
```python
GOOGLE_SHEET_NAME = "CRM Leads"  # Change to your sheet name
```

### Use Multiple Sheets

To use different sheets for different purposes, you can:
1. Create multiple Google Sheets
2. Share each with the service account
3. Modify the code to specify which sheet to use

## Security Best Practices

### ✅ DO:
- Keep `google_credentials.json` secure
- Add it to `.gitignore`
- Limit service account permissions
- Regularly rotate credentials
- Use environment variables in production

### ❌ DON'T:
- Commit credentials to version control
- Share credentials publicly
- Use the same credentials across multiple projects
- Give unnecessary permissions

## Troubleshooting

### "Permission denied" Error

**Cause**: Service account doesn't have access to the sheet

**Solution**:
1. Open your Google Sheet
2. Click "Share"
3. Verify the service account email is listed
4. Ensure it has "Editor" permission
5. If not listed, add it again

### "Spreadsheet not found" Error

**Cause**: Sheet name doesn't match or doesn't exist

**Solution**:
1. Check the sheet name in Google Sheets
2. Verify it matches `GOOGLE_SHEET_NAME` in `main.py`
3. Names are case-sensitive!

### "Credentials file not found" Error

**Cause**: JSON file is missing or in wrong location

**Solution**:
1. Check `google_credentials.json` is in `backend/` folder
2. Verify the file name is exactly: `google_credentials.json`
3. Ensure it's a valid JSON file

### "Invalid credentials" Error

**Cause**: Credentials file is corrupted or invalid

**Solution**:
1. Re-download the credentials from Google Cloud Console
2. Ensure the file wasn't modified
3. Check it's a valid JSON file (open in a text editor)

## Data Structure in Google Sheets

### Automatic Headers

When the first submission is made:
- The app creates headers in row 1
- Headers match your Excel template fields
- An additional "Timestamp" column is added

### Example Sheet Structure

| Full Name | Email | Phone | Company | ... | Timestamp |
|-----------|-------|-------|---------|-----|-----------|
| John Doe | john@example.com | 123-456-7890 | Acme Inc | ... | 2024-01-15 10:30:45 |

### Data Appending

- Each form submission adds a new row
- Data is appended to the bottom
- Existing data is never modified
- Timestamp is added automatically

## Advanced Configuration

### Using Environment Variables

For production, use environment variables:

1. Create a `.env` file in `backend/`:
   ```
   GOOGLE_CREDENTIALS_PATH=/path/to/credentials.json
   GOOGLE_SHEET_NAME=CRM Leads
   ```

2. Modify `main.py` to read from environment:
   ```python
   import os
   from dotenv import load_dotenv
   
   load_dotenv()
   
   CREDENTIALS_FILE = os.getenv('GOOGLE_CREDENTIALS_PATH', 'google_credentials.json')
   GOOGLE_SHEET_NAME = os.getenv('GOOGLE_SHEET_NAME', 'CRM Leads')
   ```

### Multiple Sheet Support

To write to different sheets based on form type:

```python
# In main.py, modify upload_to_google_sheets function
def upload_to_google_sheets(data: Dict[str, Any], sheet_name: str = None):
    if sheet_name is None:
        sheet_name = GOOGLE_SHEET_NAME
    # ... rest of the code
```

## Testing the Integration

### Test Submission

1. Start the application
2. Fill out the form
3. Submit the data
4. Check your Google Sheet
5. Verify the new row appears

### Bulk Testing

For testing multiple submissions:
1. Use the frontend to submit several forms
2. Check that all rows appear in the sheet
3. Verify timestamps are correct
4. Ensure no data is lost

## Monitoring and Logs

### Backend Logs

Check the backend terminal for:
- Successful uploads: `Data uploaded successfully`
- Errors: Detailed error messages

### Google Sheets Activity

1. In Google Sheets, go to "File" → "Version history"
2. See all changes made by the service account
3. Useful for debugging and auditing

## Support Resources

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google Cloud Console](https://console.cloud.google.com/)
- [gspread Library Docs](https://docs.gspread.org/)

## FAQ

**Q: Can I use an existing Google Sheet?**  
A: Yes! Just share it with the service account and update the sheet name in the config.

**Q: How many rows can I store?**  
A: Google Sheets supports up to 10 million cells. With 10 columns, that's ~1 million rows.

**Q: Can multiple users submit simultaneously?**  
A: Yes! The app handles concurrent submissions safely.

**Q: How do I backup my data?**  
A: Google Sheets has built-in version history. You can also export to Excel regularly.

**Q: Can I use multiple Google accounts?**  
A: The service account is independent of personal accounts. Anyone with the app can submit data.
