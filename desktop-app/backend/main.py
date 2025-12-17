from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import openpyxl
import gspread
from google.oauth2.service_account import Credentials
import os
from datetime import datetime

app = FastAPI()

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
EXCEL_FILE_PATH = "CRM_Lead_Template (1).xlsm"
GOOGLE_SHEET_NAME = "CRM Leads"
CREDENTIALS_FILE = "google_credentials.json"

# Global variable to store fields
fields_cache = []


class FormData(BaseModel):
    data: Dict[str, Any]


def read_excel_fields():
    """Read field names from the Excel file header row"""
    global fields_cache
    
    if not os.path.exists(EXCEL_FILE_PATH):
        raise FileNotFoundError(f"Excel file not found: {EXCEL_FILE_PATH}")
    
    try:
        workbook = openpyxl.load_workbook(EXCEL_FILE_PATH, keep_vba=True)
        sheet = workbook.active
        
        # Read the first row as field names
        fields = []
        for cell in sheet[1]:
            if cell.value:
                fields.append({
                    "name": str(cell.value),
                    "type": infer_field_type(str(cell.value))
                })
        
        fields_cache = fields
        workbook.close()
        return fields
    except Exception as e:
        raise Exception(f"Error reading Excel file: {str(e)}")


def infer_field_type(field_name: str) -> str:
    """Infer input type based on field name"""
    field_lower = field_name.lower()
    
    if any(keyword in field_lower for keyword in ['date', 'dob', 'birth']):
        return 'date'
    elif any(keyword in field_lower for keyword in ['email', 'mail']):
        return 'email'
    elif any(keyword in field_lower for keyword in ['phone', 'mobile', 'contact']):
        return 'tel'
    elif any(keyword in field_lower for keyword in ['age', 'number', 'count', 'quantity']):
        return 'number'
    elif any(keyword in field_lower for keyword in ['description', 'comment', 'notes', 'address']):
        return 'textarea'
    else:
        return 'text'


def upload_to_google_sheets(data: Dict[str, Any]):
    """Upload form data to Google Sheets"""
    
    if not os.path.exists(CREDENTIALS_FILE):
        raise FileNotFoundError(
            f"Google credentials file not found: {CREDENTIALS_FILE}. "
            "Please download your service account JSON from Google Cloud Console."
        )
    
    try:
        # Define the scope
        scope = [
            'https://spreadsheets.google.com/feeds',
            'https://www.googleapis.com/auth/drive'
        ]
        
        # Authenticate using service account
        creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=scope)
        client = gspread.authorize(creds)
        
        # Open the Google Sheet (create if doesn't exist)
        try:
            sheet = client.open(GOOGLE_SHEET_NAME).sheet1
        except gspread.SpreadsheetNotFound:
            spreadsheet = client.create(GOOGLE_SHEET_NAME)
            sheet = spreadsheet.sheet1
            
            # Add headers if new sheet
            headers = list(data.keys()) + ['Timestamp']
            sheet.append_row(headers)
        
        # Prepare row data
        row_data = [data.get(field['name'], '') for field in fields_cache]
        row_data.append(datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        
        # Append the data
        sheet.append_row(row_data)
        
        return {"status": "success", "message": "Data uploaded successfully"}
    
    except Exception as e:
        raise Exception(f"Error uploading to Google Sheets: {str(e)}")


@app.on_event("startup")
async def startup_event():
    """Load Excel fields on startup"""
    try:
        read_excel_fields()
        print(f"Loaded {len(fields_cache)} fields from Excel file")
    except Exception as e:
        print(f"Warning: Could not load Excel file on startup: {str(e)}")
        print("Please ensure CRM_Lead_Template (1).xlsm is in the backend directory")


@app.get("/")
async def root():
    return {"message": "CRM Lead Form API", "status": "running"}


@app.get("/get_fields")
async def get_fields():
    """Return the list of fields from the Excel file"""
    if not fields_cache:
        try:
            read_excel_fields()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    return {"fields": fields_cache}


@app.post("/submit")
async def submit_form(form_data: FormData):
    """Submit form data to Google Sheets"""
    try:
        result = upload_to_google_sheets(form_data.data)
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    excel_exists = os.path.exists(EXCEL_FILE_PATH)
    creds_exist = os.path.exists(CREDENTIALS_FILE)
    
    return {
        "status": "healthy",
        "excel_file": excel_exists,
        "google_credentials": creds_exist,
        "fields_loaded": len(fields_cache)
    }
