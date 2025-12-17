# Sample Excel Template Structure

## Example 1: Basic Lead Form (10 fields)

Create an Excel file with these headers in the **first row**:

| Full Name | Email | Phone | Company | Position | Lead Source | Interest Level | Budget Range | Notes | Status |
|-----------|-------|-------|---------|----------|-------------|----------------|--------------|-------|--------|

**Field Types Detected**:
- Full Name → text
- Email → email
- Phone → tel
- Company → text
- Position → text
- Lead Source → text
- Interest Level → text
- Budget Range → text
- Notes → textarea
- Status → text

---

## Example 2: Extended Lead Form (20 fields)

| First Name | Last Name | Email | Phone | Mobile | Company | Website | Industry | Position | Department | Lead Source | Campaign | Date of Contact | Interest Level | Budget Range | Timeline | Project Description | Notes | Assigned To | Status |
|------------|-----------|-------|-------|--------|---------|---------|----------|----------|------------|-------------|----------|-----------------|----------------|--------------|----------|---------------------|-------|-------------|--------|

**Field Types Detected**:
- First Name → text
- Last Name → text
- Email → email
- Phone → tel
- Mobile → tel
- Company → text
- Website → text
- Industry → text
- Position → text
- Department → text
- Lead Source → text
- Campaign → text
- Date of Contact → date
- Interest Level → text
- Budget Range → text
- Timeline → text
- Project Description → textarea
- Notes → textarea
- Assigned To → text
- Status → text

---

## Example 3: Sales Pipeline Form (15 fields)

| Contact Name | Email Address | Phone Number | Company Name | Deal Value | Probability | Stage | Expected Close Date | Lead Source | Product Interest | Decision Maker | Next Action | Last Contact Date | Comments | Status |
|--------------|---------------|--------------|--------------|------------|-------------|-------|---------------------|-------------|------------------|----------------|-------------|-------------------|----------|--------|

**Field Types Detected**:
- Contact Name → text
- Email Address → email
- Phone Number → tel
- Company Name → text
- Deal Value → number
- Probability → number
- Stage → text
- Expected Close Date → date
- Lead Source → text
- Product Interest → text
- Decision Maker → text
- Next Action → text
- Last Contact Date → date
- Comments → textarea
- Status → text

---

## Example 4: Event Registration Form (12 fields)

| Full Name | Email | Phone | Company | Job Title | Event Date | Number of Attendees | Dietary Requirements | Special Requests | How did you hear about us | Registration Date | Confirmed |
|-----------|-------|-------|---------|-----------|------------|---------------------|----------------------|------------------|---------------------------|-------------------|-----------|

**Field Types Detected**:
- Full Name → text
- Email → email
- Phone → tel
- Company → text
- Job Title → text
- Event Date → date
- Number of Attendees → number
- Dietary Requirements → textarea
- Special Requests → textarea
- How did you hear about us → text
- Registration Date → date
- Confirmed → text

---

## How to Create Your Template

### Step 1: Open Excel
- Create a new workbook
- Or open an existing template

### Step 2: Add Headers
- In **Row 1**, add your field names
- Use clear, descriptive names
- Avoid special characters: `< > / \ | * ?`

### Step 3: Save as .xlsm
- File → Save As
- Choose: "Excel Macro-Enabled Workbook (*.xlsm)"
- Name it: `CRM_Lead_Template (1).xlsm`

### Step 4: Place in Backend Folder
- Copy the file to: `backend/CRM_Lead_Template (1).xlsm`

---

## Field Type Detection Rules

The application automatically detects field types based on keywords:

| Keyword in Field Name | Detected Type | Example Fields |
|-----------------------|---------------|----------------|
| date, dob, birth | date | "Date of Birth", "Contact Date" |
| email, mail | email | "Email Address", "Work Email" |
| phone, mobile, contact | tel | "Phone Number", "Mobile" |
| age, number, count, quantity | number | "Age", "Quantity" |
| description, comment, notes, address | textarea | "Description", "Address" |
| *anything else* | text | "Full Name", "Company" |

---

## Tips for Best Results

1. **Keep it Simple**: Start with 10-20 fields
2. **Logical Order**: Arrange fields in a sensible order
3. **Clear Names**: Use descriptive field names
4. **No Blanks**: Don't leave empty cells in the header row
5. **Test First**: Test with a small template before creating a large one

---

## Testing Your Template

After creating your template:

1. Place it in `backend/` folder
2. Start the backend server
3. Visit: http://localhost:8000/get_fields
4. Verify all fields appear correctly
5. Check field types are appropriate

---

## Customizing Field Types

If the auto-detection doesn't work for a field, you can:

1. Rename the field to include a keyword
   - "Contact Number" → Phone type
   - "Birth Date" → Date type
   
2. Or modify the `infer_field_type()` function in `backend/main.py`

---

## Example Template Download

You can create a template with these exact headers for testing:

```
Full Name | Email | Phone | Company | Position | Date of Contact | Lead Source | Budget | Description | Status
```

This will give you a working 10-field form to test the application.
