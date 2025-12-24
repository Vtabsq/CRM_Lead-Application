"""
Dropdown API Routes
Handles HTTP requests for dropdown options management
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import dropdown_service

router = APIRouter(prefix="/api/dropdowns", tags=["dropdowns"])


class DropdownOption(BaseModel):
    value: str


@router.get("/{category}")
async def get_dropdown_options(category: str):
    """Get all options for a dropdown category"""
    valid_categories = [
        "visit_id", "care_center", "provider", "sold_by", 
        "external_provider", "discount", "status"
    ]
    
    if category.lower() not in valid_categories:
        raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {', '.join(valid_categories)}")
    
    # Convert category to proper case for storage
    category_map = {
        "visit_id": "Visit ID",
        "care_center": "Care Center",
        "provider": "Provider",
        "sold_by": "Sold By",
        "external_provider": "External Provider",
        "discount": "Discount",
        "status": "Status"
    }
    
    category_name = category_map.get(category.lower(), category)
    options = dropdown_service.get_dropdown_options(category_name)
    return {"options": options}


@router.post("/{category}")
async def add_dropdown_option(category: str, option: DropdownOption):
    """Add a new option to a dropdown category"""
    valid_categories = [
        "visit_id", "care_center", "provider", "sold_by", 
        "external_provider", "discount", "status"
    ]
    
    if category.lower() not in valid_categories:
        raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {', '.join(valid_categories)}")
    
    # Convert category to proper case for storage
    category_map = {
        "visit_id": "Visit ID",
        "care_center": "Care Center",
        "provider": "Provider",
        "sold_by": "Sold By",
        "external_provider": "External Provider",
        "discount": "Discount",
        "status": "Status"
    }
    
    category_name = category_map.get(category.lower(), category)
    created_option = dropdown_service.add_dropdown_option(category_name, option.value)
    return created_option


@router.delete("/{category}/{option_id}")
async def delete_dropdown_option(category: str, option_id: str):
    """Delete a dropdown option"""
    valid_categories = [
        "visit_id", "care_center", "provider", "sold_by", 
        "external_provider", "discount", "status"
    ]
    
    if category.lower() not in valid_categories:
        raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {', '.join(valid_categories)}")
    
    # Convert category to proper case for storage
    category_map = {
        "visit_id": "Visit ID",
        "care_center": "Care Center",
        "provider": "Provider",
        "sold_by": "Sold By",
        "external_provider": "External Provider",
        "discount": "Discount",
        "status": "Status"
    }
    
    category_name = category_map.get(category.lower(), category)
    result = dropdown_service.delete_dropdown_option(category_name, option_id)
    return result
