# Troubleshooting Guide

Common issues and their solutions.

## 🔴 Backend Issues

### Issue: "Excel file not found"

**Error Message**: `Excel file not found: CRM_Lead_Template (1).xlsm`

**Causes**:
- File is not in the backend folder
- File name doesn't match exactly
- File extension is wrong

**Solutions**:
1. Check file exists in `backend/` folder
2. Verify file name is exactly: `CRM_Lead_Template (1).xlsm` (including space and parentheses)
3. Ensure file extension is `.xlsm` not `.xlsx`
4. Check file is not in a subfolder

**Verify**:
```powershell
cd backend
dir "CRM_Lead_Template (1).xlsm"
```

---

### Issue: "Google credentials file not found"

**Error Message**: `Google credentials file not found: google_credentials.json`

**Causes**:
- Credentials file not in backend folder
- File name is incorrect
- File is in wrong format

**Solutions**:
1. Check file exists in `backend/` folder
2. Verify file name is exactly: `google_credentials.json`
3. Ensure it's a valid JSON file
4. Re-download from Google Cloud Console if corrupted

**Verify**:
```powershell
cd backend
dir google_credentials.json
```

---

### Issue: "Permission denied" when uploading to Google Sheets

**Error Message**: `Error uploading to Google Sheets: Permission denied`

**Causes**:
- Google Sheet not shared with service account
- Service account doesn't have Editor permission
- Wrong sheet name

**Solutions**:
1. Open `google_credentials.json`
2. Find the `client_email` field
3. Copy the email address
4. Open your Google Sheet
5. Click "Share"
6. Paste the service account email
7. Set permission to "Editor"
8. Uncheck "Notify people"
9. Click "Share"

**Verify**:
- Check sheet sharing settings
- Verify service account email is listed
- Confirm permission is "Editor"

---

### Issue: Backend won't start

**Error Message**: Various errors or no output

**Causes**:
- Python not installed
- Virtual environment not activated
- Dependencies not installed
- Port 8000 already in use

**Solutions**:

**Check Python**:
```powershell
python --version
# Should show Python 3.8 or higher
```

**Activate Virtual Environment**:
```powershell
cd backend
venv\Scripts\activate
# Prompt should show (venv)
```

**Install Dependencies**:
```powershell
pip install -r requirements.txt
```

**Check Port**:
```powershell
netstat -ano | findstr :8000
# If output shows, port is in use
# Kill the process or use different port
```

---

### Issue: "ModuleNotFoundError"

**Error Message**: `ModuleNotFoundError: No module named 'fastapi'`

**Cause**: Dependencies not installed

**Solution**:
```powershell
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

---

### Issue: CORS errors

**Error Message**: `Access to XMLHttpRequest blocked by CORS policy`

**Causes**:
- Frontend URL not in allowed origins
- Backend not running
- Wrong port

**Solutions**:
1. Check backend is running on port 8000
2. Check frontend is running on port 3000 or 5173
3. Verify CORS settings in `backend/main.py`:
   ```python
   allow_origins=["http://localhost:3000", "http://localhost:5173"]
   ```

---

## 🔵 Frontend Issues

### Issue: Frontend won't start

**Error Message**: Various npm errors

**Causes**:
- Node.js not installed
- Dependencies not installed
- Port 3000 in use

**Solutions**:

**Check Node.js**:
```powershell
node --version
npm --version
```

**Install Dependencies**:
```powershell
cd frontend
npm install
```

**Use Different Port**:
Edit `frontend/vite.config.js`:
```javascript
server: {
  port: 3001,  // Change to different port
}
```

---

### Issue: "Cannot connect to backend"

**Error Message**: `Failed to load form fields. Please ensure the backend is running`

**Causes**:
- Backend not running
- Wrong backend URL
- CORS issues

**Solutions**:
1. Start backend server
2. Check backend is running: http://localhost:8000/health
3. Verify `API_BASE_URL` in `frontend/src/App.jsx`:
   ```javascript
   const API_BASE_URL = 'http://localhost:8000';
   ```

---

### Issue: Fields not displaying

**Causes**:
- Backend not returning fields
- Excel file not loaded
- JavaScript errors

**Solutions**:
1. Check browser console (F12) for errors
2. Verify backend endpoint: http://localhost:8000/get_fields
3. Check Excel file is in backend folder
4. Restart backend server

---

### Issue: Form submission fails

**Error Message**: `Failed to submit data`

**Causes**:
- Backend not running
- Google Sheets not configured
- Network issues

**Solutions**:
1. Check backend is running
2. Verify Google credentials are configured
3. Check browser console for detailed error
4. Check backend terminal for error messages

---

## 🟡 Google Sheets Issues

### Issue: "Spreadsheet not found"

**Error Message**: `gspread.SpreadsheetNotFound`

**Causes**:
- Sheet name doesn't match
- Sheet doesn't exist
- Service account doesn't have access

**Solutions**:
1. Check sheet name in `backend/main.py`:
   ```python
   GOOGLE_SHEET_NAME = "CRM Leads"
   ```
2. Verify sheet exists in Google Sheets
3. Ensure sheet is shared with service account
4. Check spelling (case-sensitive!)

---

### Issue: "Invalid credentials"

**Error Message**: `google.auth.exceptions.RefreshError`

**Causes**:
- Credentials file is corrupted
- Wrong credentials file
- APIs not enabled

**Solutions**:
1. Re-download credentials from Google Cloud Console
2. Verify it's a service account JSON file
3. Check Google Sheets API is enabled
4. Check Google Drive API is enabled

---

### Issue: Data not appearing in sheet

**Causes**:
- Wrong sheet name
- Sheet not shared
- Network issues

**Solutions**:
1. Check sheet name matches config
2. Verify sheet is shared with service account
3. Check internet connection
4. Look for error messages in backend

---

## 🟢 Excel Template Issues

### Issue: "No fields loaded"

**Causes**:
- First row is empty
- Excel file is corrupted
- Wrong file format

**Solutions**:
1. Open Excel file
2. Verify first row has headers
3. Remove any empty columns
4. Save as `.xlsm` format
5. Restart backend

---

### Issue: Wrong field types detected

**Cause**: Field names don't match detection keywords

**Solution**:
Rename fields to include keywords:
- Add "Email" for email fields
- Add "Phone" for phone fields
- Add "Date" for date fields
- Add "Description" for textarea fields

Or modify `infer_field_type()` in `backend/main.py`

---

## 🟣 Installation Issues

### Issue: "python is not recognized"

**Cause**: Python not installed or not in PATH

**Solutions**:
1. Download Python from python.org
2. Run installer
3. **Check "Add Python to PATH"**
4. Restart terminal

---

### Issue: "npm is not recognized"

**Cause**: Node.js not installed or not in PATH

**Solutions**:
1. Download Node.js from nodejs.org
2. Run installer
3. Restart terminal
4. Verify: `node --version`

---

### Issue: "pip install fails"

**Causes**:
- No internet connection
- Firewall blocking
- Wrong Python version

**Solutions**:
1. Check internet connection
2. Try: `pip install --upgrade pip`
3. Use: `python -m pip install -r requirements.txt`
4. Check Python version: `python --version` (need 3.8+)

---

### Issue: "npm install fails"

**Causes**:
- No internet connection
- Corrupted cache
- Permission issues

**Solutions**:
1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules/` folder
3. Delete `package-lock.json`
4. Run `npm install` again

---

## 🔧 General Debugging Steps

### Step 1: Check Logs

**Backend Logs**:
- Look at terminal where backend is running
- Check for error messages
- Note the line numbers

**Frontend Logs**:
- Open browser console (F12)
- Check Console tab for errors
- Check Network tab for failed requests

### Step 2: Verify Files

```powershell
# Check backend files
cd backend
dir CRM_Lead_Template*.xlsm
dir google_credentials.json
dir main.py

# Check frontend files
cd frontend
dir package.json
dir src\App.jsx
```

### Step 3: Test Endpoints

```powershell
# Test backend health
Invoke-RestMethod -Uri "http://localhost:8000/health"

# Test get fields
Invoke-RestMethod -Uri "http://localhost:8000/get_fields"
```

### Step 4: Restart Everything

1. Stop backend (Ctrl+C)
2. Stop frontend (Ctrl+C)
3. Close all terminals
4. Start backend again
5. Start frontend again
6. Clear browser cache
7. Refresh page

---

## 🆘 Still Having Issues?

### Collect Information

1. **Error Message**: Copy the exact error
2. **Steps**: What were you doing?
3. **Environment**: 
   - Python version: `python --version`
   - Node version: `node --version`
   - OS: Windows version
4. **Logs**: Copy relevant log output

### Check Documentation

- `README.md` - General overview
- `SETUP_GUIDE.md` - Setup instructions
- `GOOGLE_SHEETS_SETUP.md` - Google configuration
- `TESTING_GUIDE.md` - Testing procedures

### Run Diagnostics

```powershell
# Run API test
.\test-api.ps1

# Check health
Invoke-RestMethod -Uri "http://localhost:8000/health"
```

### Reset and Retry

1. Delete `backend/venv/` folder
2. Delete `frontend/node_modules/` folder
3. Reinstall everything
4. Follow setup guide step-by-step

---

## 📋 Quick Checklist

When something doesn't work, verify:

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] Virtual environment activated
- [ ] Dependencies installed (both backend and frontend)
- [ ] Excel file in `backend/` folder
- [ ] Google credentials in `backend/` folder
- [ ] Google Sheet shared with service account
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] No firewall blocking
- [ ] Internet connection active

---

**Most issues are solved by**:
1. Checking file locations
2. Verifying credentials
3. Restarting servers
4. Reinstalling dependencies
