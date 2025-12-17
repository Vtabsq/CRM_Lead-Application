# Excel Template Guide

## File Requirements

**File Name**: `CRM_Lead_Template (1).xlsm`  
**Location**: `backend/` folder  
**Format**: Excel Macro-Enabled Workbook (.xlsm)

## Structure

The application reads the **first row** of the Excel file to determine form fields.

### Example Template Structure

| Full Name | Email | Phone | Company | Position | Date of Contact | Lead Source | Budget | Description | Status |
|-----------|-------|-------|---------|----------|-----------------|-------------|--------|-------------|--------|
|           |       |       |         |          |                 |             |        |             |        |

### Field Name Guidelines

1. **First Row = Headers**: The first row must contain your field names
2. **Clear Names**: Use descriptive names (e.g., "Full Name" instead of "Name1")
3. **No Empty Headers**: Every column you want in the form must have a header
4. **Consistent Naming**: Use consistent naming conventions

### Auto-Detected Field Types

The application automatically detects appropriate input types based on field names:

| Field Name Contains | Input Type | Example Fields |
|---------------------|------------|----------------|
| date, dob, birth | Date picker | "Date of Birth", "Contact Date" |
| email, mail | Email input | "Email Address", "Work Email" |
| phone, mobile, contact | Phone input | "Phone Number", "Mobile" |
| age, number, count, quantity | Number input | "Age", "Employee Count" |
| description, comment, notes, address | Text area | "Description", "Comments" |
| *anything else* | Text input | "Full Name", "Company" |

### Example Field Names

**Good Examples**:
- ✅ Full Name
- ✅ Email Address
- ✅ Phone Number
- ✅ Company Name
- ✅ Job Title
- ✅ Date of Contact
- ✅ Lead Source
- ✅ Estimated Budget
- ✅ Project Description
- ✅ Lead Status

**Avoid**:
- ❌ Empty headers
- ❌ Special characters that might cause issues: `< > / \ | * ?`
- ❌ Very long names (keep under 50 characters)

## Creating Your Template

### Option 1: Manual Creation

1. Open Excel
2. Create a new workbook
3. In the first row, add your field names
4. Save as: `CRM_Lead_Template (1).xlsm`
5. Choose file type: "Excel Macro-Enabled Workbook (*.xlsm)"
6. Place in the `backend/` folder

### Option 2: Modify Existing

If you already have a template:
1. Ensure the first row contains field names
2. Remove any merged cells in the header row
3. Save as `.xlsm` format
4. Rename to: `CRM_Lead_Template (1).xlsm`
5. Place in the `backend/` folder

## Sample Templates

### Basic Lead Form (10 fields)
```
Full Name | Email | Phone | Company | Position | Lead Source | Interest Level | Budget Range | Notes | Status
```

### Extended Lead Form (20 fields)
```
First Name | Last Name | Email | Phone | Mobile | Company | Website | Industry | Position | 
Department | Lead Source | Campaign | Date of Contact | Interest Level | Budget Range | 
Timeline | Project Description | Notes | Assigned To | Status
```

### Sales Pipeline Form (15 fields)
```
Contact Name | Email | Phone | Company | Deal Value | Probability | Stage | 
Expected Close Date | Lead Source | Product Interest | Decision Maker | 
Next Action | Last Contact Date | Notes | Status
```

## Testing Your Template

1. Place your `.xlsm` file in the `backend/` folder
2. Start the backend server
3. Check the health endpoint: http://localhost:8000/health
4. Check loaded fields: http://localhost:8000/get_fields
5. Verify all your fields appear in the response

## Troubleshooting

### "Excel file not found"
- Check the file name is exactly: `CRM_Lead_Template (1).xlsm`
- Ensure it's in the `backend/` folder
- Verify the file extension is `.xlsm`

### "No fields loaded"
- Ensure the first row has field names
- Check that cells are not empty
- Verify the file is not corrupted

### "Wrong number of fields"
- Count the non-empty cells in the first row
- Remove any trailing empty columns
- Ensure no merged cells in the header

## Tips

1. **Keep it Simple**: Start with 10-20 fields for best UX
2. **Logical Order**: Arrange fields in a logical order (the form will display them in the same order)
3. **Required Fields First**: Place important fields at the beginning
4. **Test First**: Test with a small template before creating a large one
5. **Backup**: Keep a backup of your template file

## Integration with Google Sheets

When data is submitted:
- A new row is added to your Google Sheet
- Columns match your Excel template headers
- An additional "Timestamp" column is added automatically
- Data is appended in the same order as your Excel template
