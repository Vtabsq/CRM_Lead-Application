# Get all dropdown options
@app.get("/api/dropdown-options")
async def api_get_all_dropdown_options():
    """Get all dropdown fields and their options from DropdownOption sheet."""
    try:
        options = get_all_dropdown_options()
        return {"status": "success", "dropdown_options": options}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dropdown options: {str(e)}")


# Get dropdown options for a specific field
@app.get("/api/dropdown-options/{field_name}")
async def api_get_dropdown_options(field_name: str):
    """Get options for a specific dropdown field."""
    try:
        options = get_dropdown_options_for_field(field_name)
        return {"status": "success", "field_name": field_name, "options": options}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching options for {field_name}: {str(e)}")


# Add new option to dropdown field
@app.post("/api/dropdown-options/{field_name}")
async def api_add_dropdown_option(field_name: str, option: str = Body(..., embed=True)):
    """Add a new option to a dropdown field."""
    try:
        if not option or not option.strip():
            raise HTTPException(status_code=400, detail="Option cannot be empty")
        
        result = add_dropdown_option(field_name, option.strip())
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding option: {str(e)}")


# Delete option from dropdown field
@app.delete("/api/dropdown-options/{field_name}/{option}")
async def api_delete_dropdown_option(field_name: str, option: str):
    """Remove an option from a dropdown field."""
    try:
        result = delete_dropdown_option(field_name, option)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting option: {str(e)}")


# Sync schema and DropdownOption sheet bidirectionally
@app.post("/api/sync-schema-sheet")
async def api_sync_schema_sheet():
    """Sync schema fields with DropdownOption sheet columns bidirectionally."""
    try:
        # Sync schema to sheet (add new columns for new schema fields)
        sync_schema_to_dropdown_sheet()
        
        # Sync sheet to schema (update schema with sheet options)
        sync_dropdown_options_to_schema()
        
        return {
            "status": "success",
            "message": "Schema and DropdownOption sheet synced successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error syncing: {str(e)}")
