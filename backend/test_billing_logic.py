"""
Comprehensive test to debug billing preview logic
"""
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import calendar

def parse_date(date_str):
    """Parse date from DD/MM/YYYY format"""
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str.strip(), "%d/%m/%Y")
    except:
        try:
            return datetime.strptime(date_str.strip(), "%Y-%m-%d")
        except:
            return None

def calculate_next_billing_date(service_start_date, reference_date=None):
    """Calculate next billing date"""
    if reference_date is None:
        reference_date = datetime.now()
    
    billing_day = service_start_date.day
    next_month_date = reference_date + relativedelta(months=1)
    last_day_of_month = calendar.monthrange(next_month_date.year, next_month_date.month)[1]
    actual_billing_day = min(billing_day, last_day_of_month)
    next_billing = datetime(next_month_date.year, next_month_date.month, actual_billing_day)
    
    return next_billing

# Test data from the sheet
patient_name = "Aaruchamy"
admission_date_str = "13/09/2025"
discharge_date_str = "26/12/2025"

print("="*80)
print("BILLING PREVIEW DEBUG TEST")
print("="*80)

# Parse dates
admission_date = parse_date(admission_date_str)
discharge_date = parse_date(discharge_date_str)
today = datetime.now().date()

print(f"\nPatient: {patient_name}")
print(f"Admission Date: {admission_date} ({admission_date_str})")
print(f"Discharge Date: {discharge_date} ({discharge_date_str})")
print(f"Today: {today}")

# Check discharge
if discharge_date:
    discharge_date_only = discharge_date.date() if isinstance(discharge_date, datetime) else discharge_date
    print(f"\nDischarge date check:")
    print(f"  Discharge date (date only): {discharge_date_only}")
    print(f"  Is discharged (discharge <= today)?: {discharge_date_only <= today}")
    
    if discharge_date_only <= today:
        print(f"  ❌ SKIPPED - Patient is discharged")
    else:
        print(f"  ✅ ACTIVE - Patient not yet discharged")

# Calculate next billing
print(f"\nBilling calculation:")
print(f"  No billing history (first time)")
print(f"  Using admission date as reference: {admission_date}")

next_billing_dt = calculate_next_billing_date(admission_date, admission_date)
print(f"  Initial next billing: {next_billing_dt.date()}")

# Make sure it's in the future
loop_count = 0
while next_billing_dt.date() < today and loop_count < 12:
    print(f"  Loop {loop_count + 1}: {next_billing_dt.date()} < {today}, calculating next...")
    next_billing_dt = calculate_next_billing_date(admission_date, next_billing_dt)
    loop_count += 1

next_billing_date = next_billing_dt.date()
days_until = (next_billing_date - today).days

print(f"  Final next billing: {next_billing_date}")
print(f"  Days until billing: {days_until}")

# Check if within preview period
preview_days = 30
end_date = today + timedelta(days=preview_days)

print(f"\nPreview period check:")
print(f"  Preview days: {preview_days}")
print(f"  End date: {end_date}")
print(f"  Is within period ({today} <= {next_billing_date} <= {end_date})?: {today <= next_billing_date <= end_date}")

if today <= next_billing_date <= end_date:
    print(f"  ✅ INCLUDED in billing preview!")
else:
    print(f"  ❌ EXCLUDED from billing preview")

print("="*80)
