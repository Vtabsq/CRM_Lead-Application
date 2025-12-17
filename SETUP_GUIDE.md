# Quick Setup Guide

## Step-by-Step Instructions

### 1️⃣ Prepare Your Files

**Excel File**:
- Place `CRM_Lead_Template (1).xlsm` in the `backend/` folder
- Ensure the first row contains your field names (e.g., "Full Name", "Email", "Phone")

**Google Credentials**:
1. Go to https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Enable these APIs:
   - Google Sheets API
   - Google Drive API
4. Create credentials:
   - Click "Create Credentials" → "Service Account"
   - Fill in the details and create
   - Click on the created service account
   - Go to "Keys" tab → "Add Key" → "Create new key" → JSON
5. Download the JSON file
6. Rename it to `google_credentials.json`
7. Place it in the `backend/` folder

### 2️⃣ Install Backend

Open terminal in the `backend/` folder:

```bash
# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

### 3️⃣ Install Frontend

Open a NEW terminal in the `frontend/` folder:

```bash
npm install
```

### 4️⃣ Configure Google Sheet

1. Create a new Google Sheet or use existing one
2. Name it "CRM Leads" (or update the name in `backend/main.py`)
3. Open the `google_credentials.json` file
4. Find the `client_email` field (looks like: `xxx@xxx.iam.gserviceaccount.com`)
5. Share your Google Sheet with this email address (give Editor access)

### 5️⃣ Run the Application

**Terminal 1 - Backend**:
```bash
cd backend
venv\Scripts\activate  # If not already activated
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

### 6️⃣ Access the App

Open your browser and go to: **http://localhost:3000**

## ✅ Verification Checklist

Before running, ensure:

- [ ] `CRM_Lead_Template (1).xlsm` is in `backend/` folder
- [ ] `google_credentials.json` is in `backend/` folder
- [ ] Python virtual environment is activated
- [ ] All Python packages are installed (`pip install -r requirements.txt`)
- [ ] All npm packages are installed (`npm install`)
- [ ] Google Sheet is shared with service account email
- [ ] Backend is running on port 8000
- [ ] Frontend is running on port 3000

## 🎯 Testing the Setup

1. **Check Backend Health**:
   - Open: http://localhost:8000/health
   - Should show: `{"status": "healthy", "excel_file": true, "google_credentials": true, "fields_loaded": X}`

2. **Check Fields Loading**:
   - Open: http://localhost:8000/get_fields
   - Should show your Excel column names

3. **Test the Frontend**:
   - Open: http://localhost:3000
   - You should see the form with fields from your Excel file
   - Fill in some test data
   - Click through pages using Next/Previous
   - On the last page, click "Save & Upload"
   - Check your Google Sheet for the new row

## 🐛 Common Issues

### "Excel file not found"
- Make sure the file name is exactly: `CRM_Lead_Template (1).xlsm`
- Check it's in the `backend/` folder (same folder as `main.py`)

### "Google credentials file not found"
- Ensure `google_credentials.json` is in the `backend/` folder
- Check the file name is exactly: `google_credentials.json`

### "Permission denied" on Google Sheets
- Open your Google Sheet
- Click "Share" button
- Add the email from `client_email` in `google_credentials.json`
- Give "Editor" permission

### "Cannot connect to backend"
- Make sure backend is running (check Terminal 1)
- Verify it's on port 8000
- Check for any error messages in the backend terminal

### "CORS error"
- Ensure frontend is running on port 3000
- If using a different port, update `allow_origins` in `backend/main.py`

## 📞 Need Help?

If you encounter issues:
1. Check both terminal windows for error messages
2. Verify all files are in the correct locations
3. Ensure all services are running
4. Check the browser console (F12) for frontend errors
