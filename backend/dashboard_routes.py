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
