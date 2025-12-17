# Frequently Asked Questions (FAQ)

## 📋 General Questions

### Q: What does this application do?

**A**: This application reads an Excel macro file to determine form fields, displays them in a paginated web form (10 fields per page), and uploads submitted data to Google Sheets automatically.

---

### Q: Do I need coding knowledge to use this?

**A**: No! Just follow the setup guide. You only need to:
1. Place your Excel file
2. Configure Google Sheets
3. Run the startup scripts

---

### Q: Is this free to use?

**A**: Yes! All technologies used are free:
- Python (free)
- Node.js (free)
- React (free)
- FastAPI (free)
- Google Sheets (free for personal use)

---

### Q: Can I use this for commercial purposes?

**A**: Yes, but check Google Sheets API quotas for high-volume usage.

---

## 🔧 Setup Questions

### Q: What are the system requirements?

**A**: 
- **OS**: Windows (batch scripts), Mac/Linux (manual commands)
- **Python**: 3.8 or higher
- **Node.js**: 16 or higher
- **RAM**: 2GB minimum
- **Disk Space**: ~500MB for dependencies

---

### Q: How long does setup take?

**A**: 
- **First time**: 15-30 minutes (including Google setup)
- **Subsequent runs**: < 1 minute (just run start-app.bat)

---

### Q: Do I need a Google Cloud account?

**A**: Yes, you need a Google account to:
1. Create a Google Cloud project (free)
2. Enable APIs (free)
3. Create service account (free)
4. Use Google Sheets (free)

---

### Q: Can I skip the Google Sheets integration?

**A**: Not currently. The app is designed to upload to Google Sheets. However, you could modify the code to save to a database or file instead.

---

## 📊 Excel Template Questions

### Q: What Excel version do I need?

**A**: Any version that supports `.xlsm` files (Excel 2007 or later).

---

### Q: Can I use a regular .xlsx file instead of .xlsm?

**A**: The code reads `.xlsm` files, but you can modify `EXCEL_FILE_PATH` in `main.py` to use `.xlsx` files. Just update the filename.

---

### Q: How many fields can I have?

**A**: Unlimited! The form automatically paginates (10 fields per page by default).

---

### Q: Can I change the number of fields per page?

**A**: Yes! Edit `frontend/src/App.jsx`:
```javascript
const FIELDS_PER_PAGE = 15;  // Change from 10 to any number
```

---

### Q: What if my Excel file has multiple sheets?

**A**: The app reads the **active sheet** (usually the first one). Make sure your headers are in the first sheet.

---

### Q: Can I have empty columns in my Excel file?

**A**: No, the app reads until it finds an empty cell in the first row. Remove empty columns or place them at the end.

---

### Q: Do I need macros in my Excel file?

**A**: No! The `.xlsm` format is used, but macros are not required. The app only reads the headers.

---

## 🎨 Frontend Questions

### Q: Can I customize the look and feel?

**A**: Yes! The app uses TailwindCSS. You can:
1. Edit colors in `frontend/src/App.jsx`
2. Modify `tailwind.config.js` for theme changes
3. Update CSS classes in the components

---

### Q: Does it work on mobile devices?

**A**: The UI is responsive and works on tablets. For phones, you may need additional CSS adjustments.

---

### Q: Can I add a logo or branding?

**A**: Yes! Edit `frontend/src/App.jsx` and add your logo image in the header section.

---

### Q: Can I change the form title?

**A**: Yes! Edit `frontend/src/App.jsx`:
```javascript
<h1 className="text-3xl font-bold text-gray-800 mb-2">Your Custom Title</h1>
```

---

## 🔐 Security Questions

### Q: Is my data secure?

**A**: 
- Data is sent over HTTP (localhost) during development
- For production, use HTTPS
- Google Sheets uses OAuth2 authentication
- Credentials are stored locally (not in cloud)

---

### Q: Should I commit google_credentials.json to Git?

**A**: **NO! Never!** This file contains sensitive credentials. It's already in `.gitignore` to prevent accidental commits.

---

### Q: Can multiple users access the form simultaneously?

**A**: Yes! FastAPI handles concurrent requests. Multiple users can submit forms at the same time.

---

### Q: How do I protect the form with a password?

**A**: Currently, there's no authentication. You would need to add:
1. User authentication in FastAPI
2. Login page in React
3. Session management

---

## 📈 Data & Storage Questions

### Q: How much data can Google Sheets store?

**A**: Up to 10 million cells. With 10 columns, that's about 1 million rows.

---

### Q: What happens if Google Sheets is full?

**A**: You'll get an error. You should:
1. Archive old data
2. Create a new sheet
3. Update the sheet name in config

---

### Q: Can I export data from Google Sheets?

**A**: Yes! Google Sheets supports export to:
- Excel (.xlsx)
- CSV
- PDF
- And more

---

### Q: Is there a backup of submitted data?

**A**: Data is only in Google Sheets. Google provides version history, but you should:
1. Regularly export data
2. Enable Google Drive backup
3. Consider database integration for critical data

---

### Q: Can I send data to multiple Google Sheets?

**A**: Not by default, but you can modify the code to:
1. Create multiple sheet connections
2. Append to different sheets based on criteria
3. Duplicate data to backup sheets

---

## 🚀 Performance Questions

### Q: How fast is form submission?

**A**: Typically 1-3 seconds, depending on:
- Internet speed
- Google Sheets API response time
- Number of fields

---

### Q: Can I handle 100+ submissions per day?

**A**: Yes! Google Sheets API has generous quotas:
- 300 requests per minute per project
- 60 requests per minute per user

---

### Q: Will it slow down with lots of data?

**A**: The app itself won't slow down. Google Sheets may slow down with 100,000+ rows.

---

## 🔄 Modification Questions

### Q: Can I add file upload functionality?

**A**: Yes, but requires code changes:
1. Add file input in React
2. Handle file upload in FastAPI
3. Store files (Google Drive, local storage, etc.)
4. Add file URL to Google Sheets

---

### Q: Can I add email notifications?

**A**: Yes! You can add:
1. Email library to backend (e.g., `smtplib`)
2. Send email after successful submission
3. Configure SMTP settings

---

### Q: Can I add data validation rules?

**A**: Yes! You can add:
1. Frontend validation in React (before submit)
2. Backend validation in FastAPI (server-side)
3. Custom validation logic for specific fields

---

### Q: Can I use a database instead of Google Sheets?

**A**: Yes! Replace the Google Sheets code with database code:
1. Install database library (SQLAlchemy, etc.)
2. Create database schema
3. Replace `upload_to_google_sheets()` function
4. Keep the same API endpoints

---

## 🐛 Troubleshooting Questions

### Q: What if the backend won't start?

**A**: See `TROUBLESHOOTING.md` for detailed solutions. Common fixes:
1. Activate virtual environment
2. Install dependencies
3. Check Python version
4. Verify port 8000 is free

---

### Q: What if fields don't load?

**A**: Check:
1. Excel file is in `backend/` folder
2. File name matches exactly
3. First row has headers
4. Backend is running
5. No errors in backend terminal

---

### Q: What if submission fails?

**A**: Check:
1. Google credentials are configured
2. Sheet is shared with service account
3. Internet connection is active
4. Backend terminal for error messages

---

### Q: How do I reset everything?

**A**: 
```powershell
# Delete virtual environment
Remove-Item -Recurse -Force backend\venv

# Delete node modules
Remove-Item -Recurse -Force frontend\node_modules

# Reinstall
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

cd ..\frontend
npm install
```

---

## 📱 Deployment Questions

### Q: Can I deploy this to a server?

**A**: Yes! You can deploy to:
- Local network server
- Cloud platforms (AWS, GCP, Azure)
- VPS (DigitalOcean, Linode, etc.)

---

### Q: How do I make it accessible on my network?

**A**: 
1. Find your computer's IP address
2. Update CORS in `backend/main.py` to include your IP
3. Start backend with `--host 0.0.0.0`
4. Access from other devices: `http://YOUR_IP:8000`

---

### Q: Can I use a custom domain?

**A**: Yes! You'll need:
1. A domain name
2. Web hosting or server
3. SSL certificate (for HTTPS)
4. Reverse proxy (nginx, Apache)

---

### Q: How do I build for production?

**A**: 
```powershell
# Build frontend
cd frontend
npm run build

# Serve with production server
cd backend
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

---

## 💡 Feature Questions

### Q: Can I add conditional fields?

**A**: Not currently, but you can add logic to:
1. Show/hide fields based on other field values
2. Modify the React component to handle conditions
3. Add business logic in the backend

---

### Q: Can I have dropdown menus?

**A**: Not automatically, but you can:
1. Modify the `renderField()` function in `App.jsx`
2. Add dropdown/select inputs
3. Define options in the code or read from Excel

---

### Q: Can I add a preview before submission?

**A**: Yes! Add a review page:
1. Create a new page state
2. Show all filled data
3. Add "Confirm" button
4. Submit on confirmation

---

### Q: Can I edit submitted data?

**A**: Not in the current app, but you can:
1. Edit directly in Google Sheets
2. Add edit functionality to the app
3. Fetch and update existing rows

---

## 📚 Learning Questions

### Q: Where can I learn more about FastAPI?

**A**: 
- Official docs: https://fastapi.tiangolo.com/
- Tutorial: https://fastapi.tiangolo.com/tutorial/

---

### Q: Where can I learn more about React?

**A**: 
- Official docs: https://react.dev/
- Tutorial: https://react.dev/learn

---

### Q: Where can I learn more about TailwindCSS?

**A**: 
- Official docs: https://tailwindcss.com/docs
- Components: https://tailwindui.com/

---

### Q: Can I contribute to this project?

**A**: This is a template project. You can:
1. Fork it for your own use
2. Modify as needed
3. Share improvements with your team

---

## 🎯 Best Practices

### Q: How often should I backup my data?

**A**: 
- Daily exports for critical data
- Weekly for moderate use
- Google Sheets has automatic version history

---

### Q: Should I use this for production?

**A**: It's production-ready for:
- Small to medium teams
- Internal tools
- Low to moderate traffic

For high-traffic or critical applications, consider:
- Database instead of Google Sheets
- User authentication
- Rate limiting
- Error monitoring
- Automated testing

---

### Q: How do I update the application?

**A**: 
1. Pull latest code changes
2. Update dependencies: `pip install -r requirements.txt` and `npm install`
3. Restart servers
4. Test thoroughly

---

## 🔮 Future Features

### Q: Will there be a mobile app?

**A**: Not currently planned, but the web app is responsive and works on tablets.

---

### Q: Will there be user authentication?

**A**: Not in the current version. You can add it using:
- FastAPI security utilities
- OAuth2
- JWT tokens
- React authentication libraries

---

### Q: Will there be analytics/reporting?

**A**: Not built-in, but you can:
- Use Google Sheets built-in charts
- Export to Excel for Analytics
- Add a dashboard page to the React app
- Integrate with BI tools

---

## 📞 Support

### Q: Where can I get help?

**A**: Check these resources in order:
1. `START_HERE.md` - Quick start
2. `TROUBLESHOOTING.md` - Common issues
3. `FAQ.md` - This file
4. Documentation files in the project
5. Error messages in terminals
6. Browser console (F12)

---

### Q: How do I report a bug?

**A**: Document:
1. What you were doing
2. What happened (error message)
3. What you expected
4. Steps to reproduce
5. Your environment (Python version, Node version, OS)

---

**Still have questions?** Check the comprehensive documentation in the project folder!
