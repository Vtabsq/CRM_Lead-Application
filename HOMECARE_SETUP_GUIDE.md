# Home Care Auto Monthly Billing - Setup Guide

## Prerequisites

Before using the Home Care Auto Billing feature, ensure you have:

1. **Google Sheet Setup**: Create a Google Sheet named "CRM_HomeCare" with the following columns:
   - SI NO
   - Date
   - PATIENT NAME
   - GENDER
   - PAIN POINT
   - LOCATION
   - AGE
   - SERVICE STARTED ON (format: DD/MM/YYYY)
   - ACTIVE / INACTIVE
   - SERVICE STOPPED ON
   - SERVICE TYPE
   - Home Care Revenue
   - Additional Nursing Charges
   - Discount
   - REVENUE
   - SHIFT
   - Type of complaint
   - Date_1
   - Resolved

2. **Google Credentials**: Ensure `google_credentials.json` has access to both CRM_HomeCare and CRM_Admission sheets

## Installation Steps

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This will install:
- APScheduler==3.10.4 (for daily billing scheduler)
- python-dateutil==2.8.2 (for date calculations)

### 2. Configure Environment Variables

Edit your `.env` file in the `backend` directory:

```env
# Add these lines to your .env file
HOMECARE_SHEET_ID=your_homecare_google_sheet_id_here
HOMECARE_BILLING_TIME=09:00
```

**How to get your Google Sheet ID:**
1. Open your CRM_HomeCare Google Sheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
3. Copy the SHEET_ID_HERE part
4. Paste it as the value for `HOMECARE_SHEET_ID`

### 3. Start the Backend

```bash
cd backend
python run.py
```

You should see:
```
[Home Care Module] Loaded successfully
[Home Care Scheduler] Started successfully
  - Billing Time: 09:00 (daily)
  - Next Run: 2025-12-23 09:00:00
```

### 4. Access the Frontend

1. Navigate to your frontend URL (e.g., `http://localhost:5173`)
2. Login with your credentials
3. Look for the "Home Care" section in the sidebar
4. Click on "Clients" to view home care clients

## Features

### 1. Client Management

**View Clients:**
- Navigate to Home Care → Clients
- See all active/inactive home care clients
- View next billing date for each client
- Filter by ACTIVE/INACTIVE status
- Search by patient name, location, or pain point

**Manual Billing:**
- Click "Bill Now" button next to any active client
- System generates invoice immediately
- Invoice appears in Finance → Invoice list

### 2. Billing History

**View History:**
- Click "History" button next to any client
- See all past invoices for that client
- View total billed, average monthly, and invoice count
- Timeline visualization of billing history

### 3. Billing Preview

**Forecast Revenue:**
- Navigate to Home Care → Billing Preview
- View upcoming bills for next 7/30/90 days
- See total revenue forecast
- Export to CSV for reporting
- Calendar view of upcoming billing dates

### 4. Automatic Billing

**Daily Scheduler:**
- Runs automatically every day at configured time (default: 9:00 AM)
- Checks all active home care clients
- Generates invoices for clients whose billing is due
- Logs all operations to `homecare_billing.log`

**Billing Logic:**
- First billing: 1 month after SERVICE STARTED ON
- Subsequent billing: Same day each month
- Handles month-end edge cases:
  - Service started on 31st → Bills on last day of month (28/29/30/31)
  - Service started on 30th → Bills on 30th (or last day if Feb)
  - Service started on 29th → Bills on 29th (or 28th in non-leap Feb)

**Stop Conditions:**
- Billing stops when:
  - ACTIVE / INACTIVE = INACTIVE
  - SERVICE STOPPED ON is filled

## API Endpoints

### List Clients
```
GET /api/homecare/clients?status=ACTIVE
```

### Get Client Details
```
GET /api/homecare/clients/{patient_name}
```

### Get Billing History
```
GET /api/homecare/billing-history/{patient_name}
```

### Manual Billing Trigger
```
POST /api/homecare/trigger-billing/{patient_name}
```

### Billing Preview
```
GET /api/homecare/billing-preview?days=30
```

### Run Daily Billing (Manual)
```
POST /api/homecare/run-daily-billing
```

## Troubleshooting

### Issue: Scheduler not starting

**Solution:**
1. Check backend logs for errors
2. Verify `HOMECARE_BILLING_TIME` format is HH:MM (e.g., 09:00)
3. Ensure APScheduler is installed: `pip install APScheduler==3.10.4`

### Issue: No clients showing

**Solution:**
1. Verify `HOMECARE_SHEET_ID` in `.env` is correct
2. Check Google Sheet has data in correct format
3. Ensure SERVICE STARTED ON column uses DD/MM/YYYY format
4. Verify ACTIVE / INACTIVE column has "ACTIVE" value (case-sensitive)

### Issue: Invoices not generating

**Solution:**
1. Check `homecare_billing.log` for errors
2. Verify CRM_Admission sheet ID is configured
3. Ensure Accounts Receivable sheet exists in CRM_Admission
4. Check Google credentials have write access

### Issue: Wrong billing dates

**Solution:**
1. Verify SERVICE STARTED ON date format is DD/MM/YYYY
2. Check system date/time is correct
3. Review `homecare_billing.log` for date calculation details

## Logs

All billing operations are logged to:
```
backend/homecare_billing.log
```

Log format:
```
============================================================
Billing Job - 2025-12-23 09:00:00
============================================================
Total Active Clients: 5
Billed: 3
Skipped: 2
Errors: 0

Billed Clients:
  - Ramesh: INV000123 (₹22000)
  - Suresh: INV000124 (₹25000)
  - Mahesh: INV000125 (₹20000)
```

## Testing

### Test Manual Billing

1. Add a test client to CRM_HomeCare sheet:
   - PATIENT NAME: Test Patient
   - SERVICE STARTED ON: 22/12/2025
   - Home Care Revenue: 20000
   - Additional Nursing Charges: 5000
   - Discount: 3000
   - ACTIVE / INACTIVE: ACTIVE

2. Navigate to Home Care → Clients
3. Click "Bill Now" for Test Patient
4. Verify invoice created with amount: ₹22,000 (20000 + 5000 - 3000)
5. Check Finance → Invoice for new invoice

### Test Month-End Edge Cases

1. Create client with SERVICE STARTED ON: 31/01/2026
2. Check Next Billing Date shows: 28/02/2026 (or 29 if leap year)
3. Create client with SERVICE STARTED ON: 30/01/2026
4. Check Next Billing Date shows: 28/02/2026 (or 29 if leap year)

### Test Inactive Client

1. Edit a client and set ACTIVE / INACTIVE: INACTIVE
2. Set SERVICE STOPPED ON: 22/12/2025
3. Try clicking "Bill Now" - should show error
4. Verify no new invoice created

## Support

For issues or questions:
1. Check `homecare_billing.log` for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure Google Sheet structure matches requirements
4. Check backend console for real-time error messages
