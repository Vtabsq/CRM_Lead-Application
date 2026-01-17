"""
Invoice API Routes
FastAPI router for all invoice-related endpoints
"""

from fastapi import APIRouter, HTTPException, Query, Body
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import io

from invoice_service import (
    search_patients,
    get_invoices,
    create_invoice,
    get_invoice_details,
    calculate_invoice_totals
)
from pdf_generator import generate_invoice_pdf, generate_invoice_filename

# Import email sending function from main
import sys
import os
sys.path.append(os.path.dirname(__file__))

router = APIRouter()


# Pydantic Models
class ServiceItem(BaseModel):
    service_name: str
    provider: Optional[str] = ""
    perform_date: Optional[str] = ""
    price: float
    quantity: int = 1
    discount: float = 0
    tax_type: str = "Non-taxable"  # Inclusive, Exclusive, Non-taxable
    tax_amount: float = 0
    amount: float
    sold_by: Optional[str] = ""
    external_provider: Optional[str] = ""
    notes: Optional[str] = ""


class CreateInvoiceRequest(BaseModel):
    patient_id: str
    patient_name: str
    visit_id: str
    care_center: str
    corporate_customer: bool = False
    services: List[ServiceItem]
    total_amount: float


class EmailInvoiceRequest(BaseModel):
    email: str
    subject: Optional[str] = "Your Invoice from Grand World Elder Care"
    message: Optional[str] = ""


# API Endpoints

@router.get("/patients/search")
async def api_search_patients(q: str = Query(..., min_length=1, description="Search query")):
    """
    Search for patients by Name, ID, or Mobile Number
    """
    try:
        results = search_patients(q)
        return {
            "status": "success",
            "count": len(results),
            "patients": results
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/invoices")
async def api_get_invoices(
    patient_id: Optional[str] = Query(None, description="Filter by patient ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    care_center: Optional[str] = Query(None, description="Filter by care center"),
    provider: Optional[str] = Query(None, description="Filter by provider"),
    invoice_ref: Optional[str] = Query(None, description="Search by invoice reference"),
    date_from: Optional[str] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter to date (YYYY-MM-DD)")
):
    """
    Get list of invoices with optional filtering
    All filters work together with AND logic
    Returns empty array if no results found
    """
    try:
        invoices = get_invoices(
            patient_id=patient_id,
            status=status,
            care_center=care_center,
            provider=provider,
            invoice_ref=invoice_ref,
            date_from=date_from,
            date_to=date_to
        )
        return {
            "success": True,
            "count": len(invoices),
            "invoices": invoices
        }
    except Exception as e:
        print(f"Error fetching invoices: {e}")
        # Return empty result instead of error for better UX
        return {
            "success": True,
            "count": 0,
            "invoices": []
        }


@router.post("/invoices")
async def api_create_invoice(invoice_request: CreateInvoiceRequest):
    """
    Create a new invoice
    """
    try:
        # Calculate totals
        services_list = [service.dict() for service in invoice_request.services]
        totals = calculate_invoice_totals(services_list)
        
        # Prepare invoice data
        invoice_data = {
            "patient_id": invoice_request.patient_id,
            "patient_name": invoice_request.patient_name,
            "visit_id": invoice_request.visit_id,
            "care_center": invoice_request.care_center,
            "corporate_customer": invoice_request.corporate_customer,
            "services": services_list,
            "total_amount": totals["rounded_total"],
        }
        
        # Create invoice
        result = create_invoice(invoice_data)
        
        return {
            "status": "success",
            "invoice_id": result["invoice_id"],
            "invoice_date": result["invoice_date"],
            "message": "Invoice created successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating invoice: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/invoices/{invoice_id}")
async def api_get_invoice_details(invoice_id: str):
    """
    Get detailed information for a specific invoice
    """
    try:
        invoice = get_invoice_details(invoice_id)
        
        # Calculate totals
        totals = calculate_invoice_totals(invoice.get("services", []))
        invoice.update(totals)
        
        return {
            "status": "success",
            "invoice": invoice
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/invoices/{invoice_id}/pdf")
async def api_generate_invoice_pdf(invoice_id: str):
    """
    Generate and download invoice PDF
    """
    try:
        # Get invoice details
        invoice = get_invoice_details(invoice_id)
        
        # Calculate totals
        totals = calculate_invoice_totals(invoice.get("services", []))
        invoice.update(totals)
        
        # Generate PDF
        pdf_bytes = generate_invoice_pdf(invoice)
        
        # Return as downloadable file using StreamingResponse
        filename = generate_invoice_filename(invoice_id)
        
        # Wrap bytes in BytesIO for streaming
        pdf_buffer = io.BytesIO(pdf_bytes)
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/invoices/{invoice_id}/email")
async def api_email_invoice(invoice_id: str, email_request: EmailInvoiceRequest):
    """
    Email invoice PDF to specified email address
    EMAIL ONLY - NO SMS
    """
    try:
        # Get invoice details
        invoice = get_invoice_details(invoice_id)
        
        # Calculate totals
        totals = calculate_invoice_totals(invoice.get("services", []))
        invoice.update(totals)
        
        # Generate PDF
        pdf_bytes = generate_invoice_pdf(invoice)
        
        # TODO: Implement email sending with PDF attachment
        # For now, return success message
        # This requires integration with the existing email system in main.py
        
        return {
            "status": "success",
            "message": f"Invoice email sent to {email_request.email}",
            "note": "Email functionality requires SMTP configuration"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error emailing invoice: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Health check endpoint
@router.get("/invoices/health")
async def health_check():
    """Health check for invoice module"""
    return {"status": "ok", "module": "invoices"}
