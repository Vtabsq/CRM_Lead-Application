# Setup Checklist ✅

Use this checklist to ensure everything is properly configured.

## 📋 Pre-Installation

- [ ] Python 3.8+ installed (`python --version`)
- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (optional)
- [ ] Text editor/IDE installed

## 📁 File Preparation

- [ ] Excel file `CRM_Lead_Template (1).xlsm` ready
- [ ] Excel file has headers in first row
- [ ] Google Cloud project created
- [ ] Google Sheets API enabled
- [ ] Google Drive API enabled
- [ ] Service account created
- [ ] Service account JSON credentials downloaded
- [ ] Credentials renamed to `google_credentials.json`

## 🔧 Backend Setup

- [ ] Navigated to `backend/` folder
- [ ] Created virtual environment (`python -m venv venv`)
- [ ] Activated virtual environment
- [ ] Installed dependencies (`pip install -r requirements.txt`)
- [ ] Placed `CRM_Lead_Template (1).xlsm` in `backend/` folder
- [ ] Placed `google_credentials.json` in `backend/` folder
- [ ] Verified files exist in correct location

## 🎨 Frontend Setup

- [ ] Navigated to `frontend/` folder
- [ ] Installed dependencies (`npm install`)
- [ ] No error messages during installation

## 🔐 Google Sheets Configuration

- [ ] Created or selected Google Sheet
- [ ] Named sheet "CRM Leads" (or updated config)
- [ ] Opened `google_credentials.json`
- [ ] Found `client_email` value
- [ ] Shared Google Sheet with service account email
- [ ] Granted "Editor" permission
- [ ] Unchecked "Notify people"

## 🚀 Running the Application

- [ ] Backend started (`uvicorn main:app --reload`)
- [ ] Backend running on port 8000
- [ ] No error messages in backend terminal
- [ ] Frontend started (`npm run dev`)
- [ ] Frontend running on port 3000
- [ ] No error messages in frontend terminal

## ✅ Verification

- [ ] Visited http://localhost:8000/health
- [ ] `excel_file` shows `true`
- [ ] `google_credentials` shows `true`
- [ ] `fields_loaded` shows a number > 0
- [ ] Visited http://localhost:8000/get_fields
- [ ] Fields list displays correctly
- [ ] Visited http://localhost:3000
- [ ] Form loads without errors
- [ ] Fields display correctly
- [ ] Pagination works (Next/Previous buttons)

## 🧪 Testing

- [ ] Filled out test form
- [ ] Navigated through all pages
- [ ] Data persists when going back
- [ ] Submitted form successfully
- [ ] Success message displayed
- [ ] Checked Google Sheet
- [ ] New row appeared in sheet
- [ ] All data is correct
- [ ] Timestamp is present
- [ ] Form reset after submission

## 🐛 Troubleshooting (If Needed)

If any checks fail, refer to:

- [ ] README.md for general help
- [ ] SETUP_GUIDE.md for detailed setup
- [ ] GOOGLE_SHEETS_SETUP.md for Google issues
- [ ] EXCEL_TEMPLATE_GUIDE.md for Excel issues
- [ ] TESTING_GUIDE.md for testing help

## 📝 Common Issues Checklist

### Backend Won't Start
- [ ] Python is installed
- [ ] Virtual environment is activated
- [ ] All dependencies installed
- [ ] No port conflicts (8000 is free)
- [ ] Correct directory (`backend/`)

### Frontend Won't Start
- [ ] Node.js is installed
- [ ] Dependencies installed (`node_modules/` exists)
- [ ] No port conflicts (3000 is free)
- [ ] Correct directory (`frontend/`)

### Fields Don't Load
- [ ] Backend is running
- [ ] Excel file exists in `backend/` folder
- [ ] Excel file name is correct (exact match)
- [ ] Excel file has headers in row 1
- [ ] No spaces or special characters in headers

### Submit Fails
- [ ] Backend is running
- [ ] Google credentials file exists
- [ ] Google Sheet is shared with service account
- [ ] Service account has Editor permission
- [ ] Internet connection is active
- [ ] Sheet name matches config

### Google Sheets Issues
- [ ] APIs are enabled in Google Cloud
- [ ] Service account exists
- [ ] Credentials file is valid JSON
- [ ] Sheet is shared with correct email
- [ ] Email has Editor permission

## 🎉 Success Criteria

You're ready when:

- ✅ Both servers running without errors
- ✅ Health check shows all `true`
- ✅ Form displays all fields
- ✅ Can navigate between pages
- ✅ Can submit data successfully
- ✅ Data appears in Google Sheet
- ✅ No console errors

## 📞 Getting Help

If you're stuck:

1. **Check the error message** - Read it carefully
2. **Check the logs** - Backend terminal and browser console
3. **Review documentation** - Relevant guide for your issue
4. **Run test script** - `.\test-api.ps1`
5. **Verify files** - All files in correct locations
6. **Restart servers** - Sometimes helps
7. **Check versions** - Python, Node.js compatibility

## 🔄 Daily Startup Checklist

For subsequent uses:

- [ ] Open terminal in project folder
- [ ] Run `start-app.bat` OR
- [ ] Start backend: `cd backend && venv\Scripts\activate && uvicorn main:app --reload`
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Open http://localhost:3000

## 💾 Backup Checklist

Recommended backups:

- [ ] Excel template file
- [ ] Google credentials file (secure location)
- [ ] Configuration files
- [ ] Custom modifications

## 🔒 Security Checklist

- [ ] `google_credentials.json` in `.gitignore`
- [ ] Excel file in `.gitignore`
- [ ] No credentials in code
- [ ] Service account has minimal permissions
- [ ] Google Sheet access is restricted

---

**Print this checklist and check off items as you complete them!**

Last Updated: October 2024
