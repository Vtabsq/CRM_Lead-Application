@echo off
echo ========================================
echo   Building CRM Lead Form Desktop App
echo ========================================
echo.

echo Step 1: Building frontend for production...
cd frontend
call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
cd ..
echo ✅ Frontend built successfully!
echo.

echo Step 2: Creating desktop-app structure...
if not exist "desktop-app\backend" mkdir desktop-app\backend
if not exist "desktop-app\frontend\dist" mkdir desktop-app\frontend\dist
echo.

echo Step 3: Copying backend files...
xcopy /E /I /Y backend desktop-app\backend
echo ✅ Backend files copied!
echo.

echo Step 4: Copying frontend build...
xcopy /E /I /Y frontend\dist desktop-app\frontend\dist
echo ✅ Frontend files copied!
echo.

echo Step 5: Installing desktop app dependencies...
cd desktop-app
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo ✅ Dependencies installed!
echo.

echo Step 6: Building Windows EXE...
call npm run build-win
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo   BUILD COMPLETE! 🎉
echo ========================================
echo.
echo Your installer is ready:
echo 📦 Location: desktop-app\dist\CRM Lead Form Setup.exe
echo.
echo You can now distribute this installer to users!
echo.
pause
