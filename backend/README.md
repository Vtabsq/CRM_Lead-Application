# Backend - FastAPI Server

## Overview

FastAPI backend that reads Excel macro files and uploads form data to Google Sheets.

## Files

- `main.py` - Main FastAPI application
- `requirements.txt` - Python dependencies
- `google_credentials.json` - Google service account credentials (not in repo)
- `CRM_Lead_Template (1).xlsm` - Excel template file (not in repo)

## Installation

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

## Configuration

Place these files in the `backend/` directory:
1. `CRM_Lead_Template (1).xlsm` - Your Excel template
2. `google_credentials.json` - Google service account credentials

## Running

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or use the batch file:
```bash
..\start-backend.bat
```

## API Endpoints

### GET /
Health check
```json
{"message": "CRM Lead Form API", "status": "running"}
```

### GET /get_fields
Get form fields from Excel
```json
{
  "fields": [
    {"name": "Full Name", "type": "text"},
    {"name": "Email", "type": "email"}
  ]
}
```

### POST /submit
Submit form data
```json
{
  "data": {
    "Full Name": "John Doe",
    "Email": "john@example.com"
  }
}
```

### GET /health
System health check
```json
{
  "status": "healthy",
  "excel_file": true,
  "google_credentials": true,
  "fields_loaded": 10
}
```

## Environment Variables

Create a `.env` file (optional):
```
EXCEL_FILE_PATH=CRM_Lead_Template (1).xlsm
GOOGLE_SHEET_NAME=CRM Leads
CREDENTIALS_FILE=google_credentials.json
```

## Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test get fields
curl http://localhost:8000/get_fields

# Test submit (example)
curl -X POST http://localhost:8000/submit \
  -H "Content-Type: application/json" \
  -d '{"data": {"Full Name": "Test User", "Email": "test@example.com"}}'
```

## Troubleshooting

See main README.md for detailed troubleshooting steps.
