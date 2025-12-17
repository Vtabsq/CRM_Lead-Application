# 🖥️ Building Desktop Application (EXE)

This guide will help you create a standalone Windows desktop application.

## 📋 Prerequisites

- Node.js installed
- Python installed
- Frontend and backend working

## 🚀 Quick Build Steps

### Step 1: Build the Frontend for Production

```powershell
cd frontend
npm run build
```

This creates optimized files in `frontend/dist/`

### Step 2: Copy Files to Desktop App Folder

```powershell
cd ..
# Copy backend folder
xcopy /E /I backend desktop-app\backend

# Copy frontend build
xcopy /E /I frontend\dist desktop-app\frontend\dist
```

### Step 3: Install Desktop App Dependencies

```powershell
cd desktop-app
npm install
```

### Step 4: Test the Desktop App

```powershell
npm start
```

This opens the app in a desktop window (not browser)!

### Step 5: Build the EXE Installer

```powershell
npm run build-win
```

This creates:
- `desktop-app/dist/CRM Lead Form Setup.exe` - Installer
- Located in: `desktop-app/dist/`

## 📦 What You Get

After building, you'll have:
- **Installer**: `CRM Lead Form Setup.exe` (~150MB)
- **Portable**: Unpacked folder if needed
- **Desktop Shortcut**: Created during installation
- **Start Menu Entry**: Appears in Windows Start Menu

## 🎯 How It Works

The desktop app:
1. ✅ Starts Python backend automatically
2. ✅ Opens in its own window (not browser)
3. ✅ Has app icon
4. ✅ Closes cleanly when you close the window
5. ✅ Works offline (no browser needed)

## 📁 Distribution

To share with others:
1. Give them `CRM Lead Form Setup.exe`
2. They run the installer
3. App appears in Start Menu
4. They need:
   - Python installed
   - The Excel file
   - Google credentials (if using Google Sheets)

## 🔧 Customization

### Change App Icon

1. Replace `desktop-app/icon.ico` with your icon (256x256 .ico file)
2. Rebuild with `npm run build-win`

### Change App Name

Edit `desktop-app/package.json`:
```json
"productName": "Your App Name"
```

### Change Window Size

Edit `desktop-app/main.js`:
```javascript
width: 1400,  // Change width
height: 900,  // Change height
```

## 🐛 Troubleshooting

### "Python not found"
- Ensure Python is in system PATH
- Or bundle Python with the app (advanced)

### "Backend won't start"
- Check Python dependencies are installed
- Verify `backend/requirements.txt` packages are available

### "Build fails"
- Run `npm install` again in desktop-app folder
- Check Node.js version (need 16+)

## 📝 Development vs Production

**Development** (`npm start`):
- Opens DevTools
- Uses Vite dev server
- Hot reload enabled
- Good for testing

**Production** (`npm run build-win`):
- Optimized build
- Smaller file size
- No DevTools
- Ready for distribution

## 🎉 Success!

After building, you have a standalone desktop application!

Users can:
- ✅ Install like any Windows app
- ✅ Launch from Start Menu
- ✅ Use without opening browser
- ✅ Have a dedicated app window

The app works just like the web version but feels like a native Windows application!
