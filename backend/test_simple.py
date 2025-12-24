"""
Simplified test to debug billing preview logic
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

# Test data
patient_name = "Aaruchamy"
admission_date_str = "13/09/2025"
discharge_date_str = "26/12/2025"

print("BILLING PREVIEW DEBUG TEST")
print("="*60)

# Parse dates
admission_date = parse_date(admission_date_str)
discharge_date = parse_date(discharge_date_str)
today = datetime.now().date()

print(f"Patient: {patient_name}")
print(f"Admission: {admission_date}")
print(f"Discharge: {discharge_date}")
print(f"Today: {today}")
print()

# Check discharge
if discharge_date:
    discharge_date_only = discharge_date.date()
    print(f"Discharge check: {discharge_date_only} <= {today} = {discharge_date_only <= today}")
    
    if discharge_date_only <= today:
        print("SKIPPED - Patient is discharged")
        exit()
    else:
        print("ACTIVE - Patient not yet discharged")

# Calculate next billing
print()
print("Billing calculation:")
next_billing_dt = calculate_next_billing_date(admission_date, admission_date)
print(f"Initial next billing: {next_billing_dt.date()}")

# Make sure it's in the future
loop_count = 0
while next_billing_dt.date() < today and loop_count < 12:
    print(f"Loop {loop_count + 1}: {next_billing_dt.date()} < {today}")
    next_billing_dt = calculate_next_billing_date(admission_date, next_billing_dt)
    loop_count += 1

next_billing_date = next_billing_dt.date()
days_until = (next_billing_date - today).days

print(f"Final next billing: {next_billing_date}")
print(f"Days until: {days_until}")

# Check if within preview period
preview_days = 30
end_date = today + timedelta(days=preview_days)

print()
print(f"Preview period: {today} to {end_date} ({preview_days} days)")
print(f"Within period: {today <= next_billing_date <= end_date}")

if today <= next_billing_date <= end_date:
    print("INCLUDED in billing preview")
else:
    print("EXCLUDED from billing preview")
