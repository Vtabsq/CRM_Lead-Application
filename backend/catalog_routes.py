"""
Catalog API Routes
Handles HTTP requests for service catalog management
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import catalog_service

router = APIRouter(prefix="/api/catalog", tags=["catalog"])


class CatalogItem(BaseModel):
    name: str
    price: float


class CatalogItemUpdate(BaseModel):
    name: str
    price: float


@router.get("/{category}")
async def get_catalog_items(category: str):
    """Get all items from a category (services, packages, or products)"""
    if category not in ["services", "packages", "products"]:
        raise HTTPException(status_code=400, detail="Invalid category. Must be 'services', 'packages', or 'products'")
    
    items = catalog_service.get_catalog_items(category)
    return {"items": items}


@router.post("/{category}")
async def create_catalog_item(category: str, item: CatalogItem):
    """Create a new catalog item"""
    if category not in ["services", "packages", "products"]:
        raise HTTPException(status_code=400, detail="Invalid category. Must be 'services', 'packages', or 'products'")
    
    item_data = {"name": item.name, "price": item.price}
    created_item = catalog_service.create_catalog_item(category, item_data)
    return created_item


@router.put("/{category}/{item_id}")
async def update_catalog_item(category: str, item_id: int, item: CatalogItemUpdate):
    """Update an existing catalog item"""
    if category not in ["services", "packages", "products"]:
        raise HTTPException(status_code=400, detail="Invalid category. Must be 'services', 'packages', or 'products'")
    
    item_data = {"name": item.name, "price": item.price}
    updated_item = catalog_service.update_catalog_item(category, item_id, item_data)
    return updated_item


@router.delete("/{category}/{item_id}")
async def delete_catalog_item(category: str, item_id: int):
    """Delete a catalog item"""
    if category not in ["services", "packages", "products"]:
        raise HTTPException(status_code=400, detail="Invalid category. Must be 'services', 'packages', or 'products'")
    
    result = catalog_service.delete_catalog_item(category, item_id)
    return result
