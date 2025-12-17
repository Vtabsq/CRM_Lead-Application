const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');

let mainWindow;
let backendProcess;

// Start the Python backend server
function startBackend() {
  // In production, files marked for asarUnpack are in app.asar.unpacked
  let backendPath;
  if (isDev) {
    backendPath = path.join(__dirname, 'backend');
  } else {
    // Handle asar unpacked path
    backendPath = path.join(__dirname, 'backend').replace('app.asar', 'app.asar.unpacked');
  }

  console.log('Starting backend server...');
  console.log('Backend path:', backendPath);

  if (isDev) {
    // Development: run uvicorn via system Python for fast iteration
    backendProcess = spawn('python', [
      '-m',
      'uvicorn',
      'main:app',
      '--host',
      '0.0.0.0',
      '--port',
      '8001'
    ], {
      cwd: backendPath,
      windowsHide: true
    });
  } else {
    // Production: run bundled backend executable
    const exePath = path.join(backendPath, 'bin', 'crm_backend.exe');
    console.log('Backend exe path:', exePath);
    backendProcess = spawn(exePath, [], {
      cwd: backendPath,
      windowsHide: true  // Hide console window
    });
  }

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });

  backendProcess.on('error', (err) => {
    console.error('Failed to start backend process:', err);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

// Wait for backend to be ready
function waitForBackend(callback) {
  const http = require('http');
  let attempts = 0;
  const maxAttempts = 60; // Increased from 30 to 60 seconds

  const checkBackend = () => {
    attempts++;
    console.log(`Checking backend... attempt ${attempts}/${maxAttempts}`);
    
    const req = http.get('http://127.0.0.1:8001/health', (res) => {
      let data = '';
      
      // Consume response data
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('Backend is ready!');
          callback();
        } else {
          console.log(`Backend responded with status ${res.statusCode}, retrying...`);
          retryCheck();
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`Backend not ready yet (${err.message}), retrying...`);
      retryCheck();
    });
    
    req.end();
  };

  const retryCheck = () => {
    if (attempts < maxAttempts) {
      setTimeout(checkBackend, 2000); // Increased from 1 to 2 seconds between checks
    } else {
      console.error('Backend failed to start after 2 minutes');
      app.quit();
    }
  };

  checkBackend();
}

// Create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true,
    title: 'CRM Lead Form'
  });

  // Load the React app
  if (isDev) {
    // In development, use Vite dev server
    mainWindow.loadURL('http://localhost:3000');
  } else {
    // In production, load built frontend from unpacked asar
    const frontendPath = path.join(__dirname, 'frontend', 'dist', 'index.html').replace('app.asar', 'app.asar.unpacked');
    console.log('Loading frontend from:', frontendPath);
    mainWindow.loadFile(frontendPath);
  }

  // Open DevTools for debugging
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  startBackend();
  
  // Wait for backend to be ready, then create window
  waitForBackend(() => {
    createWindow();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean up backend process on quit
app.on('before-quit', () => {
  if (backendProcess) {
    console.log('Stopping backend server...');
    backendProcess.kill();
  }
});

app.on('quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
