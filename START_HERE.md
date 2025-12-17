# 🚀 START HERE - CRM Lead Form Application

Welcome! This is your complete CRM Lead Form desktop application.

## 🎯 What This App Does

1. **Reads** your Excel macro file (`CRM_Lead_Template (1).xlsm`)
2. **Generates** a beautiful multi-page form automatically
3. **Collects** user data (10 fields per page)
4. **Uploads** submissions to Google Sheets

## ⚡ Quick Start (3 Steps)

### Step 1: Get Your Files Ready

You need two files:

1. **Excel Template**: `CRM_Lead_Template (1).xlsm`
   - Must have field names in the first row
   - Example: "Full Name", "Email", "Phone", etc.

2. **Google Credentials**: `google_credentials.json`
   - Download from Google Cloud Console
   - See `GOOGLE_SHEETS_SETUP.md` for instructions

### Step 2: Place Files

Put both files in the `backend/` folder:
```
CRM-Projects/
└── backend/
    ├── CRM_Lead_Template (1).xlsm  ← Place here
    └── google_credentials.json      ← Place here
```

### Step 3: Run the App

**Option A - Easy Way (Windows)**:
- Double-click `start-app.bat`

**Option B - Manual Way**:
```powershell
# Terminal 1 - Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

Then open: **http://localhost:3000**

## ✅ First-Time Setup Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] Excel file ready with headers
- [ ] Google credentials downloaded
- [ ] Files placed in `backend/` folder
- [ ] Google Sheet created and shared with service account

**Detailed checklist**: See `CHECKLIST.md`

## 📚 Documentation Guide

| Document | When to Read |
|----------|--------------|
| **QUICK_START.md** | First time setup (5 min) |
| **SETUP_GUIDE.md** | Detailed installation help |
| **GOOGLE_SHEETS_SETUP.md** | Setting up Google integration |
| **EXCEL_TEMPLATE_GUIDE.md** | Creating your Excel template |
| **TESTING_GUIDE.md** | Testing the application |
| **CHECKLIST.md** | Verify everything works |
| **PROJECT_OVERVIEW.md** | Technical details |
| **README.md** | Complete documentation |

## 🎨 What You'll Get

A beautiful form that:
- ✨ Automatically generates from your Excel file
- 📄 Shows 10 fields per page
- ⬅️➡️ Has Next/Previous navigation
- 📊 Displays progress bar
- ✅ Validates input types
- 💾 Saves to Google Sheets
- 🔄 Auto-resets after submission

## 🔧 Technology Stack

**Frontend**: React + TailwindCSS + Vite  
**Backend**: Python + FastAPI  
**Storage**: Google Sheets  
**Data Source**: Excel (.xlsm)

## 🆘 Need Help?

### Common Issues

**"Excel file not found"**
→ Check file is in `backend/` folder and named exactly `CRM_Lead_Template (1).xlsm`

**"Google credentials not found"**
→ Check `google_credentials.json` is in `backend/` folder

**"Permission denied" on Google Sheets**
→ Share your Google Sheet with the email from `google_credentials.json`

**"Backend won't start"**
→ Make sure Python is installed and you're in the `backend/` folder

**"Frontend won't start"**
→ Make sure Node.js is installed and you ran `npm install`

### Getting More Help

1. **Read the docs** - Check the relevant guide above
2. **Run tests** - Execute `test-api.ps1` to test backend
3. **Check logs** - Look at terminal output for errors
4. **Verify setup** - Use `CHECKLIST.md` to verify each step

## 🧪 Test Your Setup

After starting the app, verify:

1. **Backend Health**: http://localhost:8000/health
   - Should show `excel_file: true` and `google_credentials: true`

2. **Fields Loaded**: http://localhost:8000/get_fields
   - Should show your Excel field names

3. **Frontend**: http://localhost:3000
   - Should display the form

4. **Submit Test**: Fill and submit the form
   - Check your Google Sheet for the new row

## 📞 Quick Reference

| Item | Value |
|------|-------|
| Frontend URL | http://localhost:3000 |
| Backend URL | http://localhost:8000 |
| Health Check | http://localhost:8000/health |
| Excel File Location | `backend/CRM_Lead_Template (1).xlsm` |
| Credentials Location | `backend/google_credentials.json` |
| Start Script | `start-app.bat` |
| Test Script | `test-api.ps1` |

## 🎓 Learning Path

**Beginner**:
1. Read this file (START_HERE.md)
2. Follow QUICK_START.md
3. Use CHECKLIST.md to verify

**Intermediate**:
1. Read SETUP_GUIDE.md for details
2. Understand GOOGLE_SHEETS_SETUP.md
3. Learn from EXCEL_TEMPLATE_GUIDE.md

**Advanced**:
1. Study PROJECT_OVERVIEW.md
2. Review the code in `backend/main.py` and `frontend/src/App.jsx`
3. Customize for your needs

## 🔐 Security Reminder

**IMPORTANT**: Never commit these files to version control:
- ❌ `google_credentials.json`
- ❌ `CRM_Lead_Template (1).xlsm`

They're already in `.gitignore` for your safety.

## 🎉 Ready to Go!

You now have everything you need:

✅ Complete application code  
✅ Comprehensive documentation  
✅ Setup scripts  
✅ Testing tools  
✅ Troubleshooting guides  

**Next Step**: Open `QUICK_START.md` and follow the 5-minute setup!

---

**Questions?** Check the documentation files listed above.  
**Issues?** See `TESTING_GUIDE.md` and `CHECKLIST.md`.  
**Want to customize?** See `PROJECT_OVERVIEW.md` for technical details.

**Good luck! 🚀**
