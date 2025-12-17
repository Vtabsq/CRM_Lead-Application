# Quick Start Guide

Get your CRM Lead Form application running in **5 minutes**!

## 📋 Prerequisites

- ✅ Python 3.8+ installed
- ✅ Node.js 16+ installed
- ✅ Excel file: `CRM_Lead_Template (1).xlsm`
- ✅ Google credentials: `google_credentials.json`

## 🚀 Quick Setup (Windows)

### Option 1: Use Batch Files (Easiest)

1. **Place your files**:
   - Put `CRM_Lead_Template (1).xlsm` in the `backend/` folder
   - Put `google_credentials.json` in the `backend/` folder

2. **Double-click** `start-app.bat`

3. **Done!** The app will open at http://localhost:3000

### Option 2: Manual Setup

#### Step 1: Backend Setup (Terminal 1)

```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Step 2: Frontend Setup (Terminal 2)

```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

#### Step 3: Open Browser

Go to: **http://localhost:3000**

## ✅ Verify Setup

1. **Check Backend**: http://localhost:8000/health
   - Should show: `"excel_file": true, "google_credentials": true`

2. **Check Frontend**: http://localhost:3000
   - Should display the form with your Excel fields

3. **Test Submission**:
   - Fill out the form
   - Click "Save & Upload"
   - Check your Google Sheet for the new row

## 🧪 Run Tests

```powershell
# Test the API
.\test-api.ps1
```

## 📚 Need More Help?

- **Detailed Setup**: See `SETUP_GUIDE.md`
- **Google Sheets**: See `GOOGLE_SHEETS_SETUP.md`
- **Excel Template**: See `EXCEL_TEMPLATE_GUIDE.md`
- **Testing**: See `TESTING_GUIDE.md`

## 🐛 Troubleshooting

### Backend won't start
- Check Python is installed: `python --version`
- Ensure you're in the `backend/` folder
- Check for error messages in the terminal

### Frontend won't start
- Check Node.js is installed: `node --version`
- Ensure you're in the `frontend/` folder
- Try deleting `node_modules/` and running `npm install` again

### Form doesn't load
- Ensure backend is running (check http://localhost:8000/health)
- Check browser console (F12) for errors
- Verify Excel file is in the backend folder

### Submit fails
- Check Google credentials are in place
- Verify Google Sheet is shared with service account
- Check backend terminal for error messages

## 🎉 You're Ready!

Your CRM Lead Form application is now running. Start collecting leads! 🚀
