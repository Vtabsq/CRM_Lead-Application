"""
Dashboard API Routes
Handles HTTP requests for the CRM Home Page Dashboard
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any
import dashboard_service

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/previous-day-enquiries")
async def get_previous_day_enquiries() -> Dict[str, Any]:
    """
    Get all enquiries created yesterday
    
    Returns:
        {
            "data": [...],
            "count": int,
            "date_filter": "DD-MM-YYYY"
        }
    """
    try:
        return dashboard_service.get_previous_day_enquiries()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in previous day enquiries endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/leads-converted-yesterday")
async def get_leads_converted_yesterday() -> Dict[str, Any]:
    """
    Get enquiries converted to admission yesterday
    
    Filters by Lead Status: Converted, contact, interested, clost-lost
    
    Returns:
        {
            "data": [...],
            "count": int,
            "date_filter": "DD-MM-YYYY"
        }
    """
    try:
        return dashboard_service.get_leads_converted_yesterday()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in leads converted endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/converted-leads-yesterday")
async def get_converted_leads_yesterday() -> Dict[str, Any]:
    """
    Alias for /leads-converted-yesterday
    Get enquiries converted to admission yesterday
    
    Returns:
        {
            "data": [...],
            "count": int,
            "date_filter": "DD-MM-YYYY"
        }
    """
    try:
        return dashboard_service.get_leads_converted_yesterday()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in converted leads yesterday endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/patients-admitted")
async def get_patients_admitted(
    date_filter: str = Query("yesterday", description="Filter by 'yesterday' or 'today'")
) -> Dict[str, Any]:
    """
    Get patients admitted
    
    Query Parameters:
        date_filter: "yesterday" (default) or "today"
    
    Returns:
        {
            "data": [...],
            "count": int,
            "date_filter": "DD-MM-YYYY"
        }
    """
    if date_filter not in ["yesterday", "today"]:
        raise HTTPException(
            status_code=400, 
            detail="Invalid date_filter. Must be 'yesterday' or 'today'"
        )
    
    try:
        return dashboard_service.get_patients_admitted(date_filter)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in patients admitted endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admitted-patients-yesterday")
async def get_admitted_patients_yesterday() -> Dict[str, Any]:
    """
    Alias for /patients-admitted?date_filter=yesterday
    Get patients admitted yesterday
    
    Returns:
        {
            "data": [...],
            "count": int,
            "date_filter": "DD-MM-YYYY"
        }
    """
    try:
        return dashboard_service.get_patients_admitted("yesterday")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in admitted patients yesterday endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/patients-discharged")
async def get_patients_discharged() -> Dict[str, Any]:
    """
    Get patients discharged yesterday
    
    Returns:
        {
            "data": [...],
            "count": int,
            "date_filter": "DD-MM-YYYY"
        }
    """
    try:
        return dashboard_service.get_patients_discharged()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in patients discharged endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/follow-ups-today")
async def get_follow_ups_today() -> Dict[str, Any]:
    """
    Get enquiries with follow-up due today
    
    Returns:
        {
            "data": [...],
            "count": int,
            "date_filter": "DD-MM-YYYY"
        }
    """
    try:
        return dashboard_service.get_follow_ups_today()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in follow-ups endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/follow-ups-due-today")
async def get_follow_ups_due_today() -> Dict[str, Any]:
    """
    Alias for /follow-ups-today endpoint
    Get enquiries with follow-up due today
    
    Returns:
        {
            "data": [...],
            "count": int,
            "date_filter": "DD-MM-YYYY"
        }
    """
    try:
        return dashboard_service.get_follow_ups_today()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in follow-ups-due-today endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/complaints-received-yesterday")
async def get_complaints_received_yesterday() -> Dict[str, Any]:
    """
    Get complaints received yesterday
    
    Returns:
        {
            "data": [...],
            "count": int,
            "date_filter": "DD-MM-YYYY"
        }
    """
    try:
        return dashboard_service.get_complaints_received_yesterday()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in complaints received endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/complaints-resolved-yesterday")
async def get_complaints_resolved_yesterday() -> Dict[str, Any]:
    """
    Get complaints resolved yesterday
    
    Returns:
        {
            "data": [...],
            "count": int,
            "date_filter": "DD-MM-YYYY"
        }
    """
    try:
        return dashboard_service.get_complaints_resolved_yesterday()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in complaints resolved endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admissions-by-center")
async def get_admissions_by_center(
    care_center: str = Query(..., description="Care center name: RS Puram, Ram Nagar, or Chennai"),
    date_filter: str = Query("today", description="Filter by 'yesterday' or 'today'")
) -> Dict[str, Any]:
    """
    Get admissions for a specific care center
    
    Query Parameters:
        care_center: "RS Puram", "Ram Nagar", or "Chennai"
        date_filter: "yesterday" or "today" (default: today)
    
    Returns:
        {
            "data": [...],
            "count": int,
            "date_filter": "DD-MM-YYYY",
            "care_center": str
        }
    """
    valid_centers = ["RS Puram", "Ram Nagar", "Chennai", "ram nagar", "chennai"]
    if care_center not in valid_centers:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid care_center. Must be one of: {', '.join(valid_centers)}"
        )
    
    if date_filter not in ["yesterday", "today"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid date_filter. Must be 'yesterday' or 'today'"
        )
    
    try:
        return dashboard_service.get_admissions_by_center(care_center, date_filter)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in admissions by center endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/discharges-by-center")
async def get_discharges_by_center(
    care_center: str = Query(..., description="Care center name: RS Puram, Ram Nagar, or Chennai"),
    date_filter: str = Query("today", description="Filter by 'yesterday' or 'today'")
) -> Dict[str, Any]:
    """
    Get discharges for a specific care center
    
    Query Parameters:
        care_center: "RS Puram", "Ram Nagar", or "Chennai"
        date_filter: "yesterday" or "today" (default: today)
    
    Returns:
        {
            "data": [...],
            "count": int,
            "date_filter": "DD-MM-YYYY",
            "care_center": str
        }
    """
    valid_centers = ["RS Puram", "Ram Nagar", "Chennai", "ram nagar", "chennai"]
    if care_center not in valid_centers:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid care_center. Must be one of: {', '.join(valid_centers)}"
        )
    
    if date_filter not in ["yesterday", "today"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid date_filter. Must be 'yesterday' or 'today'"
        )
    
    try:
        return dashboard_service.get_discharges_by_center(care_center, date_filter)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in discharges by center endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
