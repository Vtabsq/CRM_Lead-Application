"""
Home Care Routes Module
FastAPI routes for home care billing management
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime

from homecare_service import (
    get_all_homecare_clients,
    get_homecare_client_by_id,
    get_billing_history,
    generate_homecare_invoice,
    calculate_next_billing_date,
    parse_date,
    format_date,
    process_daily_billing,
)

router = APIRouter()


@router.get("/homecare/scheduler/status")
async def get_scheduler_status_endpoint():
    """
    Get the status of the home care billing scheduler.
    
    Returns:
        Scheduler status information including next run time
    """
    try:
        from homecare_scheduler import get_scheduler_status
        status = get_scheduler_status()
        return {
            "status": "success",
            **status
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to get scheduler status: {str(e)}"
        }



class HomeCareClientCreate(BaseModel):
    patient_name: str
    gender: Optional[str] = ""
    age: Optional[str] = ""
    pain_point: Optional[str] = ""
    location: Optional[str] = ""
    service_started_on: str
    service_type: Optional[str] = "Home Care"
    home_care_revenue: float
    additional_nursing_charges: float = 0
    discount: float = 0
    shift: Optional[str] = "Regular"
    active_inactive: str = "ACTIVE"


class HomeCareClientUpdate(BaseModel):
    gender: Optional[str] = None
    age: Optional[str] = None
    pain_point: Optional[str] = None
    location: Optional[str] = None
    service_type: Optional[str] = None
    home_care_revenue: Optional[float] = None
    additional_nursing_charges: Optional[float] = None
    discount: Optional[float] = None
    shift: Optional[str] = None
    active_inactive: Optional[str] = None
    service_stopped_on: Optional[str] = None


@router.get("/homecare/clients")
async def list_homecare_clients(
    status: Optional[str] = Query(None, description="Filter by ACTIVE or INACTIVE")
):
    """
    Get list of all home care clients.
    
    Query Parameters:
        status: Filter by ACTIVE or INACTIVE (optional)
    
    Returns:
        List of home care clients with billing information
    """
    try:
        clients = get_all_homecare_clients()
        
        # OPTIMIZATION: Fetch ALL billing history in ONE API call instead of 67 separate calls
        # This prevents Google Sheets API rate limit errors
        try:
            from homecare_service import get_accounts_receivable_sheet
            ar_sheet = get_accounts_receivable_sheet()
            all_invoices = ar_sheet.get_all_values()
            
            # Build a map of patient_name -> list of invoices
            billing_history_map = {}
            if len(all_invoices) > 1:
                headers = all_invoices[0]
                header_map = {h.strip().lower(): i for i, h in enumerate(headers)}
                
                patient_col = header_map.get('patient name')
                invoice_date_col = header_map.get('invoice date')
                
                if patient_col is not None and invoice_date_col is not None:
                    for row in all_invoices[1:]:
                        if len(row) > max(patient_col, invoice_date_col):
                            patient = row[patient_col].strip()
                            invoice_date = row[invoice_date_col].strip()
                            
                            if patient and invoice_date:
                                if patient not in billing_history_map:
                                    billing_history_map[patient] = []
                                billing_history_map[patient].append({
                                    "invoice_date": invoice_date
                                })
        except Exception as e:
            print(f"[Home Care] Warning: Could not fetch billing history in batch: {e}")
            billing_history_map = {}
        
        # Add next billing date to each client
        enriched_clients = []
        for client in clients:
            service_start_str = client.get("SERVICE STARTED ON", "")
            service_start_date = parse_date(service_start_str)
            patient_name = client.get("PATIENT NAME", "")
            
            next_billing = None
            billing_count = 0
            
            if service_start_date:
                # Get billing history from the pre-fetched map (NO API CALL)
                billing_history = billing_history_map.get(patient_name, [])
                billing_count = len(billing_history)
                
                last_billed_date = None
                if billing_history:
                    # Sort by date and get most recent
                    last_invoice_date_str = billing_history[0].get("invoice_date", "")
                    last_billed_date = parse_date(last_invoice_date_str)
                
                # Calculate next FUTURE billing (handles old service start dates)
                from homecare_service import calculate_next_future_billing_date
                next_billing_dt = calculate_next_future_billing_date(service_start_date, last_billed_date)
                
                next_billing = format_date(next_billing_dt)
            
            enriched_clients.append({
                "patient_name": patient_name,
                "gender": client.get("GENDER", ""),
                "age": client.get("AGE", ""),
                "location": client.get("LOCATION", ""),
                "pain_point": client.get("PAIN POINT", ""),
                "service_started_on": client.get("SERVICE STARTED ON", ""),
                "service_type": client.get("SERVICE TYPE", "Home Care"),
                "home_care_revenue": client.get("Home Care Revenue", 0),
                "additional_nursing_charges": client.get("Additional Nursing Charges", 0),
                "discount": client.get("Discount", 0),
                "revenue": client.get("REVENUE", 0),
                "shift": client.get("SHIFT", ""),
                "status": client.get("ACTIVE / INACTIVE", "ACTIVE"),
                "next_billing_date": next_billing,
                "billing_count": billing_count,
            })
        
        # Apply status filter if provided
        if status:
            status_upper = status.upper()
            enriched_clients = [c for c in enriched_clients if c["status"] == status_upper]
        
        return {
            "status": "success",
            "count": len(enriched_clients),
            "clients": enriched_clients
        }
        
    except Exception as e:
        print(f"Error listing home care clients: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list clients: {str(e)}")


@router.get("/homecare/clients/{patient_name}")
async def get_homecare_client(patient_name: str):
    """
    Get specific home care client details.
    
    Path Parameters:
        patient_name: Patient name
    
    Returns:
        Client details with billing history
    """
    try:
        client = get_homecare_client_by_id(patient_name)
        
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Get billing history
        billing_history = get_billing_history(patient_name)
        
        # Calculate next billing date
        service_start_str = client.get("SERVICE STARTED ON", "")
        service_start_date = parse_date(service_start_str)
        
        next_billing = None
        if service_start_date:
            last_billed_date = None
            if billing_history:
                last_invoice_date_str = billing_history[0].get("invoice_date", "")
                last_billed_date = parse_date(last_invoice_date_str)
            
            if last_billed_date:
                next_billing_dt = calculate_next_billing_date(service_start_date, last_billed_date)
            else:
                next_billing_dt = calculate_next_billing_date(service_start_date, service_start_date)
            
            next_billing = format_date(next_billing_dt)
        
        return {
            "status": "success",
            "client": {
                "patient_name": client.get("PATIENT NAME", ""),
                "gender": client.get("GENDER", ""),
                "age": client.get("AGE", ""),
                "location": client.get("LOCATION", ""),
                "pain_point": client.get("PAIN POINT", ""),
                "service_started_on": client.get("SERVICE STARTED ON", ""),
                "service_stopped_on": client.get("SERVICE STOPPED ON", ""),
                "service_type": client.get("SERVICE TYPE", "Home Care"),
                "home_care_revenue": client.get("Home Care Revenue", 0),
                "additional_nursing_charges": client.get("Additional Nursing Charges", 0),
                "discount": client.get("Discount", 0),
                "revenue": client.get("REVENUE", 0),
                "shift": client.get("SHIFT", ""),
                "status": client.get("ACTIVE / INACTIVE", "ACTIVE"),
                "next_billing_date": next_billing,
            },
            "billing_history": billing_history
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching home care client: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch client: {str(e)}")


@router.get("/homecare/billing-history/{patient_name}")
async def get_client_billing_history(patient_name: str):
    """
    Get billing history for a home care client.
    
    Path Parameters:
        patient_name: Patient name
    
    Returns:
        List of invoices for the client
    """
    try:
        billing_history = get_billing_history(patient_name)
        
        return {
            "status": "success",
            "patient_name": patient_name,
            "count": len(billing_history),
            "history": billing_history
        }
        
    except Exception as e:
        print(f"Error fetching billing history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch billing history: {str(e)}")


@router.post("/homecare/trigger-billing/{patient_name}")
async def trigger_manual_billing(patient_name: str):
    """
    Manually trigger billing for a specific home care client.
    
    Path Parameters:
        patient_name: Patient name
    
    Returns:
        Invoice details
    """
    try:
        client = get_homecare_client_by_id(patient_name)
        
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Check if client is active
        status = str(client.get("ACTIVE / INACTIVE", "")).strip().upper()
        service_stopped = str(client.get("SERVICE STOPPED ON", "")).strip()
        
        if status != "ACTIVE" or service_stopped:
            raise HTTPException(
                status_code=400, 
                detail="Cannot bill inactive client or client with stopped service"
            )
        
        # Generate invoice
        invoice = generate_homecare_invoice(client)
        
        return {
            "status": "success",
            "message": "Invoice generated successfully",
            "invoice": invoice
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error triggering manual billing: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to trigger billing: {str(e)}")


@router.get("/homecare/billing-preview")
async def get_billing_preview(
    days: int = Query(30, description="Number of days to preview (7, 30, or 90)")
):
    """
    Preview upcoming billing for all active clients.
    
    Query Parameters:
        days: Number of days to preview (default: 30)
    
    Returns:
        List of upcoming bills
    """
    try:
        clients = get_all_homecare_clients()
        
        # OPTIMIZATION: Fetch ALL billing history in ONE API call
        try:
            from homecare_service import get_accounts_receivable_sheet
            ar_sheet = get_accounts_receivable_sheet()
            all_invoices = ar_sheet.get_all_values()
            
            # Build a map of patient_name -> list of invoices
            billing_history_map = {}
            if len(all_invoices) > 1:
                headers = all_invoices[0]
                header_map = {h.strip().lower(): i for i, h in enumerate(headers)}
                
                patient_col = header_map.get('patient name')
                invoice_date_col = header_map.get('invoice date')
                
                if patient_col is not None and invoice_date_col is not None:
                    for row in all_invoices[1:]:
                        if len(row) > max(patient_col, invoice_date_col):
                            patient = row[patient_col].strip()
                            invoice_date = row[invoice_date_col].strip()
                            
                            if patient and invoice_date:
                                if patient not in billing_history_map:
                                    billing_history_map[patient] = []
                                billing_history_map[patient].append({
                                    "invoice_date": invoice_date
                                })
        except Exception as e:
            print(f"[Home Care] Warning: Could not fetch billing history in batch: {e}")
            billing_history_map = {}
        
        today = datetime.now().date()
        preview_until = today + timedelta(days=days)
        
        upcoming_bills = []
        total_forecast = 0
        
        for client in clients:
            # Skip inactive clients
            status = client.get("ACTIVE / INACTIVE", "").strip().upper()
            if status != "ACTIVE":
                continue
                
            service_start_str = client.get("SERVICE STARTED ON", "")
            service_start_date = parse_date(service_start_str)
            patient_name = client.get("PATIENT NAME", "")
            
            if not service_start_date:
                continue
            
            # Get billing history from pre-fetched map (NO API CALL)
            billing_history = billing_history_map.get(patient_name, [])
            last_billed_date = None
            
            if billing_history:
                last_invoice_date_str = billing_history[0].get("invoice_date", "")
                last_billed_date = parse_date(last_invoice_date_str)
            
            # Calculate next FUTURE billing (handles old service start dates)
            from homecare_service import calculate_next_future_billing_date
            next_billing_dt = calculate_next_future_billing_date(service_start_date, last_billed_date)
            
            # Check if within preview period
            if today <= next_billing_dt.date() <= preview_until:
                # Safe float conversion - handle empty strings and whitespace
                def safe_float(value):
                    if value is None:
                        return 0.0
                    if isinstance(value, (int, float)):
                        return float(value)
                    # Handle string values
                    str_value = str(value).strip()
                    if not str_value or str_value == '':
                        return 0.0
                    try:
                        return float(str_value)
                    except (ValueError, TypeError):
                        return 0.0
                
                home_care_revenue = safe_float(client.get("Home Care Revenue", 0))
                additional_nursing = safe_float(client.get("Additional Nursing Charges", 0))
                discount = safe_float(client.get("Discount", 0))
                amount = (home_care_revenue + additional_nursing) - discount
                
                upcoming_bills.append({
                    "patient_name": patient_name,
                    "billing_date": format_date(next_billing_dt),
                    "amount": amount,
                    "days_until": (next_billing_dt.date() - today).days,
                })
                
                total_forecast += amount
        
        # Sort by billing date
        upcoming_bills.sort(key=lambda x: x["billing_date"])
        
        return {
            "status": "success",
            "preview_days": days,
            "count": len(upcoming_bills),
            "total_forecast": total_forecast,
            "upcoming_bills": upcoming_bills
        }
        
    except Exception as e:
        print(f"Error generating billing preview: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate preview: {str(e)}")


@router.post("/homecare/run-daily-billing")
async def run_daily_billing():
    """
    Manually trigger the daily billing process.
    This endpoint is useful for testing and manual execution.
    
    Returns:
        Summary of billing operations
    """
    try:
        summary = process_daily_billing()
        return {
            "status": "success",
            "summary": summary
        }
    except Exception as e:
        print(f"Error running daily billing: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/homecare/clients")
async def create_client(client_data: dict):
    """
    Create a new home care client.
    
    Request body should contain:
    - patient_name (required)
    - gender
    - age
    - pain_point
    - location
    - service_started_on (YYYY-MM-DD format)
    - home_care_revenue (required)
    - additional_nursing_charges
    - discount
    - shift
    - active_inactive
    """
    try:
        from homecare_service import create_homecare_client
        
        # Validate required fields
        if not client_data.get('patient_name'):
            raise HTTPException(status_code=400, detail="Patient name is required")
        
        if not client_data.get('home_care_revenue'):
            raise HTTPException(status_code=400, detail="Home care revenue is required")
        
        result = create_homecare_client(client_data)
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating home care client: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/homecare/clients/{patient_name}")
async def update_client(patient_name: str, client_data: dict):
    """
    Update an existing home care client.
    
    Path parameter:
    - patient_name: Name of the patient to update
    
    Request body can contain:
    - gender
    - age
    - pain_point
    - location
    - service_started_on (YYYY-MM-DD format)
    - home_care_revenue
    - additional_nursing_charges
    - discount
    - shift
    - active_inactive
    - service_stopped_on (YYYY-MM-DD format, only if inactive)
    """
    try:
        from homecare_service import update_homecare_client
        
        result = update_homecare_client(patient_name, client_data)
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating home care client: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Import timedelta for billing preview
from datetime import timedelta
