# Testing Guide

## Pre-Testing Checklist

Before testing, ensure:

- [ ] Backend is running (http://localhost:8000)
- [ ] Frontend is running (http://localhost:3000)
- [ ] Excel file is in place
- [ ] Google credentials are configured
- [ ] Google Sheet is shared with service account

## Backend Testing

### 1. Health Check

**Endpoint**: `GET http://localhost:8000/health`

**Expected Response**:
```json
{
  "status": "healthy",
  "excel_file": true,
  "google_credentials": true,
  "fields_loaded": 10
}
```

**Test in Browser**:
- Open: http://localhost:8000/health
- Verify all values are correct

**Test in PowerShell**:
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/health"
```

### 2. Get Fields

**Endpoint**: `GET http://localhost:8000/get_fields`

**Expected Response**:
```json
{
  "fields": [
    {"name": "Full Name", "type": "text"},
    {"name": "Email", "type": "email"},
    ...
  ]
}
```

**Test in Browser**:
- Open: http://localhost:8000/get_fields
- Verify fields match your Excel template

**Test in PowerShell**:
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/get_fields"
```

### 3. Submit Data

**Endpoint**: `POST http://localhost:8000/submit`

**Test in PowerShell**:
```powershell
$body = @{
    data = @{
        "Full Name" = "Test User"
        "Email" = "test@example.com"
        "Phone" = "1234567890"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/submit" -Method Post -Body $body -ContentType "application/json"
```

**Expected Response**:
```json
{
  "status": "success",
  "message": "Data uploaded successfully"
}
```

**Verify**:
- Check your Google Sheet
- New row should appear with the test data

## Frontend Testing

### 1. Initial Load

**Test**:
1. Open http://localhost:3000
2. Wait for form to load

**Expected**:
- Form displays with fields from Excel
- Shows "Page 1 of X"
- Shows progress bar
- No error messages

### 2. Field Display

**Test**:
- Check that fields are displayed correctly
- Verify input types match field names

**Expected Input Types**:
- Email fields → `type="email"`
- Phone fields → `type="tel"`
- Date fields → `type="date"`
- Number fields → `type="number"`
- Description fields → `<textarea>`

### 3. Pagination

**Test**:
1. Fill some fields on page 1
2. Click "Next"
3. Verify page 2 loads
4. Click "Previous"
5. Verify data from page 1 is still there

**Expected**:
- Smooth navigation
- Data persists across pages
- Progress bar updates
- Page counter updates

### 4. Form Submission

**Test**:
1. Fill out all required fields
2. Navigate to last page
3. Click "Save & Upload"
4. Wait for response

**Expected**:
- Loading spinner appears
- Success message shows
- Form resets after 3 seconds
- Returns to page 1

**Verify**:
- Check Google Sheet for new row
- Verify all data is correct
- Check timestamp is added

### 5. Error Handling

**Test Backend Down**:
1. Stop the backend server
2. Try to load the form

**Expected**:
- Error message displays
- "Retry" button appears
- No crash

**Test Submit Error**:
1. Stop backend
2. Try to submit form

**Expected**:
- Error message displays
- Form data is not lost
- Can retry after backend restarts

## Integration Testing

### Test Case 1: Complete Flow

1. **Setup**:
   - Start backend
   - Start frontend
   - Open browser to http://localhost:3000

2. **Execute**:
   - Fill all fields across all pages
   - Submit form

3. **Verify**:
   - Success message appears
   - Data in Google Sheet matches input
   - Timestamp is correct
   - Form resets

### Test Case 2: Multiple Submissions

1. **Execute**:
   - Submit form 5 times with different data

2. **Verify**:
   - All 5 rows appear in Google Sheet
   - No data is lost
   - Timestamps are sequential
   - No duplicates

### Test Case 3: Special Characters

1. **Execute**:
   - Enter special characters: `@#$%^&*()`
   - Enter unicode: `émojis 😀 中文`
   - Submit form

2. **Verify**:
   - All characters preserved
   - No encoding issues
   - Google Sheet displays correctly

### Test Case 4: Long Text

1. **Execute**:
   - Enter very long text in description field (1000+ characters)
   - Submit form

2. **Verify**:
   - Full text is saved
   - No truncation
   - Google Sheet cell expands

### Test Case 5: Empty Fields

1. **Execute**:
   - Leave some fields empty
   - Submit form

2. **Verify**:
   - Submission succeeds
   - Empty cells in Google Sheet
   - No errors

## Performance Testing

### Load Time

**Test**:
- Measure time from page load to form display

**Expected**:
- < 2 seconds on local network

### Submission Time

**Test**:
- Measure time from submit click to success message

**Expected**:
- < 3 seconds on local network

### Large Forms

**Test**:
- Create Excel template with 50+ fields
- Test pagination and submission

**Expected**:
- Smooth pagination (5+ pages)
- No lag in navigation
- Successful submission

## Browser Compatibility Testing

Test in multiple browsers:

- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari (if available)

**For Each Browser**:
1. Load form
2. Fill and navigate
3. Submit data
4. Verify success

## Mobile Responsiveness (Optional)

**Test**:
1. Open browser dev tools
2. Toggle device toolbar
3. Test on various screen sizes

**Expected**:
- Form is readable
- Buttons are clickable
- No horizontal scroll
- Proper spacing

## Automated Testing Script

Create `test-api.ps1` in project root:

```powershell
# Backend Health Check
Write-Host "Testing Backend Health..." -ForegroundColor Cyan
$health = Invoke-RestMethod -Uri "http://localhost:8000/health"
Write-Host "Status: $($health.status)" -ForegroundColor Green
Write-Host "Excel File: $($health.excel_file)" -ForegroundColor Green
Write-Host "Google Credentials: $($health.google_credentials)" -ForegroundColor Green
Write-Host "Fields Loaded: $($health.fields_loaded)" -ForegroundColor Green
Write-Host ""

# Get Fields
Write-Host "Testing Get Fields..." -ForegroundColor Cyan
$fields = Invoke-RestMethod -Uri "http://localhost:8000/get_fields"
Write-Host "Fields Count: $($fields.fields.Count)" -ForegroundColor Green
Write-Host ""

# Submit Test Data
Write-Host "Testing Submit..." -ForegroundColor Cyan
$testData = @{
    data = @{}
}
foreach ($field in $fields.fields) {
    $testData.data[$field.name] = "Test Value"
}
$body = $testData | ConvertTo-Json
$result = Invoke-RestMethod -Uri "http://localhost:8000/submit" -Method Post -Body $body -ContentType "application/json"
Write-Host "Submit Status: $($result.status)" -ForegroundColor Green
Write-Host "Message: $($result.message)" -ForegroundColor Green
```

Run with:
```powershell
.\test-api.ps1
```

## Common Issues and Solutions

### Issue: Fields not loading

**Check**:
1. Backend logs for errors
2. Excel file exists and is readable
3. First row has headers
4. Browser console for errors

### Issue: Submit fails

**Check**:
1. Google credentials are valid
2. Sheet is shared with service account
3. Internet connection is active
4. Backend logs for detailed error

### Issue: Data not appearing in Google Sheet

**Check**:
1. Correct sheet name in config
2. Service account has Editor permission
3. Sheet exists and is accessible
4. Check sheet name spelling (case-sensitive)

## Test Data Examples

### Minimal Test Data
```json
{
  "Full Name": "John Doe",
  "Email": "john@example.com",
  "Phone": "1234567890"
}
```

### Complete Test Data
```json
{
  "Full Name": "Jane Smith",
  "Email": "jane.smith@example.com",
  "Phone": "555-0123",
  "Company": "Acme Corp",
  "Position": "Manager",
  "Date of Contact": "2024-01-15",
  "Lead Source": "Website",
  "Budget": "50000",
  "Description": "Interested in enterprise solution",
  "Status": "New"
}
```

### Edge Case Test Data
```json
{
  "Full Name": "José García-López",
  "Email": "test+tag@example.com",
  "Phone": "+1 (555) 123-4567",
  "Company": "Test & Co.",
  "Description": "Special chars: @#$%^&*() Unicode: 中文 😀"
}
```

## Success Criteria

All tests pass when:

- ✅ Backend health check returns all `true`
- ✅ Fields load correctly from Excel
- ✅ Form displays all fields
- ✅ Pagination works smoothly
- ✅ Data persists across pages
- ✅ Submission succeeds
- ✅ Data appears in Google Sheet
- ✅ Timestamp is added
- ✅ Form resets after submission
- ✅ No console errors
- ✅ No backend errors

## Reporting Issues

When reporting issues, include:

1. **What you were doing**: Step-by-step actions
2. **What happened**: Actual result
3. **What you expected**: Expected result
4. **Error messages**: From console and backend logs
5. **Screenshots**: If applicable
6. **Environment**: Browser, OS, versions
