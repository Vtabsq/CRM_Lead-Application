# 🚀 CRM Lead Form — Full Project README

A complete project for generating dynamic forms from an Excel macro file and uploading submissions to Google Sheets, with a modern React + TailwindCSS frontend, a FastAPI backend, and an optional Electron desktop app.

—

## ⚡ Quick Start

- New here? Open `START_HERE.md` for a fast intro.
- Want a 5‑minute setup? Use `QUICK_START.md`.
- Need a deeper guide? See `DOCUMENTATION_INDEX.md`.

—

## 🎯 Key Features

- **Dynamic form generation** from Excel headers
- **Paginated UI** (default 10 fields/page)
- **Smart field types** inferred from names (date, email, phone, number, textarea)
- **Google Sheets integration** via service account
- **Modern UI** with TailwindCSS
- **Health checks and diagnostics** endpoints
- **Desktop app build** (Electron) for one‑click distribution

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  React Frontend │ ◄─────► │  FastAPI Backend │ ◄─────► │  Google Sheets  │
│    (3000)       │  HTTP   │     (8000)       │   API   │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │
                                     │ Reads
                                     ▼
                            ┌─────────────────┐
                            │   Excel File    │
                            │     .xlsm       │
                            └─────────────────┘
```

## 📦 Tech Stack

- Frontend: React 18, Vite, TailwindCSS, Axios, Lucide React
- Backend: FastAPI, Uvicorn, OpenPyXL, gspread, Google Auth
- Desktop: Electron + electron‑builder

## 📁 Monorepo Structure

```
CRM-Projects/
├─ backend/                      # FastAPI server
│  ├─ main.py
│  ├─ requirements.txt
│  ├─ README.md
│  ├─ PLACE_FILES_HERE.txt
│  ├─ sample_excel_structure.md
│  └─ (place) CRM_Lead_Template (1).xlsm, google_credentials.json
│
├─ frontend/                     # React app (Vite + Tailwind)
│  ├─ src/
│  │  ├─ App.jsx
│  │  ├─ main.jsx
│  │  └─ index.css
│  ├─ index.html
│  ├─ package.json
│  ├─ tailwind.config.js
│  ├─ vite.config.js
│  └─ README.md
│
├─ desktop-app/                  # Electron desktop wrapper
│  ├─ main.js, preload.js
│  ├─ package.json
│  ├─ backend/ (bundled backend)
│  └─ dist/ (electron build output)
│
├─ scripts & helpers
│  ├─ start-app.bat, start-backend.bat, start-frontend.bat
│  ├─ build-desktop-app.bat, launch-desktop-app.bat
│  ├─ test-api.ps1, find-crm-window.ps1, check-window.ps1
│  └─ create-app-icon.py, create-icon-simple.py
│
├─ docs (selected)
│  ├─ START_HERE.md, QUICK_START.md, SETUP_GUIDE.md
│  ├─ GOOGLE_SHEETS_SETUP.md, EXCEL_TEMPLATE_GUIDE.md
│  ├─ TESTING_GUIDE.md, TROUBLESHOOTING.md, FAQ.md
│  ├─ DOCUMENTATION_INDEX.md, PROJECT_OVERVIEW.md
│  ├─ BUILD_DESKTOP_APP.md, DESKTOP_APP_GUIDE.md
│  └─ INSTALLATION_SUMMARY.md, PROJECT_COMPLETE.md
└─ README.md (this file)
```

## ✅ Prerequisites

- Windows recommended (batch scripts provided); Mac/Linux supported via manual commands
- Python 3.8+
- Node.js 16+
- Excel `.xlsm` file: `CRM_Lead_Template (1).xlsm`
- Google Cloud service account JSON for Sheets/Drive APIs

## ⚙️ Setup

### 1) Prepare Files

- Place `CRM_Lead_Template (1).xlsm` in `backend/`
- Place `google_credentials.json` in `backend/`
- Share your Google Sheet with the service account `client_email` (Editor)

### 2) Backend (FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3) Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Access the app at `http://localhost:3000`.

## 🔧 Configuration

### Backend (`backend/main.py`)

```python
EXCEL_FILE_PATH = "CRM_Lead_Template (1).xlsm"
GOOGLE_SHEET_NAME = "CRM Leads"
CREDENTIALS_FILE = "google_credentials.json"
```

Optional `.env` in `backend/`:
```
EXCEL_FILE_PATH=CRM_Lead_Template (1).xlsm
GOOGLE_SHEET_NAME=CRM Leads
CREDENTIALS_FILE=google_credentials.json
```

### Frontend (`frontend/src/App.jsx`)

```javascript
const API_BASE_URL = 'http://localhost:8000';
const FIELDS_PER_PAGE = 10;
```

## 🚀 One‑Command Start (Windows)

- `start-app.bat` – starts backend and frontend
- `start-backend.bat` – backend only
- `start-frontend.bat` – frontend only

## 📊 API Endpoints (Backend)

| Method | Endpoint      | Description        |
|--------|---------------|--------------------|
| GET    | `/`           | Health check       |
| GET    | `/health`     | System status      |
| GET    | `/get_fields` | Fetch field schema |
| POST   | `/submit`     | Submit form data   |

Example responses are in `backend/README.md`.

## 🎨 UI Highlights

- Responsive layout, progress bar, field counter
- Smart input types, validation, success/error messages
- Automatic form reset after successful submission

## 🧪 Verification & Testing

Manual checks:
- Open `http://localhost:8000/health` and `http://localhost:8000/get_fields`
- Use the app at `http://localhost:3000` and confirm rows appear in your Sheet

Scripts and guides:
- `test-api.ps1` for API checks
- See `TESTING_GUIDE.md` for workflows

## 🖥️ Desktop App (Electron)

- Source lives under `desktop-app/`
- Typical flow:
  1. Build frontend: `cd frontend && npm run build`
  2. Ensure backend artifacts and files are present under `desktop-app/backend/`
  3. Build installer: run `build-desktop-app.bat` (produces `.exe` in `desktop-app/dist/`)
- Quick launch for dev: `launch-desktop-app.bat`
- Guides: `BUILD_DESKTOP_APP.md`, `DESKTOP_APP_GUIDE.md`

## 🐛 Troubleshooting

- Excel not found: ensure `CRM_Lead_Template (1).xlsm` is in `backend/` and spelled exactly
- Credentials issues: verify `google_credentials.json` location and Sheet sharing
- Cannot connect frontend→backend: confirm ports 3000/8000 and CORS settings
- See `TROUBLESHOOTING.md` and `FAQ.md` for detailed fixes

## 🔒 Security Notes

- Do not commit `google_credentials.json` (ensure it’s in `.gitignore`)
- Use environment variables for secrets in production
- Add auth/rate limiting/HTTPS for internet‑facing deployments

## 🛠️ Production & Deployment

Frontend build:
```bash
cd frontend
npm run build
```

Backend (example ASGI server):
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

Network access:
- Start backend with `--host 0.0.0.0`
- Update CORS in `backend/main.py`

Cloud/Server options:
- VM/VPS (AWS/GCP/Azure/DigitalOcean)
- Reverse proxy (nginx/Apache), HTTPS, firewall rules

## 📚 Documentation Index

- Getting started: `START_HERE.md`, `QUICK_START.md`
- Setup: `SETUP_GUIDE.md`, `GOOGLE_SHEETS_SETUP.md`, `EXCEL_TEMPLATE_GUIDE.md`
- Dev/Test: `TESTING_GUIDE.md`, `TROUBLESHOOTING.md`
- Overviews: `PROJECT_OVERVIEW.md`, `DOCUMENTATION_INDEX.md`
- Desktop: `BUILD_DESKTOP_APP.md`, `DESKTOP_APP_GUIDE.md`

## 📄 License & Support

- License: Internal use only (see notes in docs)
- Support: Check docs first, then contact your development team

—

Version: 1.0.0  ·  Last Updated: November 2025  ·  Status: Production Ready
