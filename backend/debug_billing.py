"""
Debug script to investigate why billing preview shows 0 upcoming bills
"""
from datetime import datetime, timedelta
from homecare_service import (
    get_all_homecare_clients,
    parse_date,
    calculate_next_billing_date,
    format_date,
    get_accounts_receivable_sheet
)

print("="*60)
print("BILLING PREVIEW DEBUG")
print("="*60)

# Get all clients
clients = get_all_homecare_clients()
print(f"\nTotal clients in sheet: {len(clients)}")

# Filter active clients
active_clients = [c for c in clients if c.get("ACTIVE / INACTIVE", "").strip().upper() == "ACTIVE"]
print(f"Active clients: {len(active_clients)}")

# Get billing history
try:
    ar_sheet = get_accounts_receivable_sheet()
    all_invoices = ar_sheet.get_all_values()
    print(f"Total invoice records: {len(all_invoices) - 1}")  # -1 for header
except Exception as e:
    print(f"Error getting invoices: {e}")
    all_invoices = []

# Build billing history map
billing_history_map = {}
if len(all_invoices) > 1:
    headers = all_invoices[0]
    header_map = {h.strip().lower(): i for i, h in enumerate(headers)}
    
    patient_col = header_map.get('patient name')
    invoice_date_col = header_map.get('invoice date')
    
    if patient_col is not None and invoice_date_col is not None:
        for row in all_invoices[1:]:
            if len(row) > max(patient_col, invoice_date_col):
                patient = row[patient_col].strip()
                invoice_date = row[invoice_date_col].strip()
                
                if patient and invoice_date:
                    if patient not in billing_history_map:
                        billing_history_map[patient] = []
                    billing_history_map[patient].append({
                        "invoice_date": invoice_date
                    })

print(f"Clients with billing history: {len(billing_history_map)}")

# Analyze first 5 active clients
print("\n" + "="*60)
print("SAMPLE CLIENT ANALYSIS (First 5 Active Clients)")
print("="*60)

today = datetime.now().date()
upcoming_count = 0

for i, client in enumerate(active_clients[:5]):
    patient_name = client.get("PATIENT NAME", "")
    service_start_str = client.get("SERVICE STARTED ON", "")
    
    print(f"\n{i+1}. {patient_name}")
    print(f"   Service Started: {service_start_str}")
    
    service_start_date = parse_date(service_start_str)
    if not service_start_date:
        print(f"   ❌ Could not parse service start date!")
        continue
    
    print(f"   Parsed Date: {service_start_date}")
    
    # Get billing history
    billing_history = billing_history_map.get(patient_name, [])
    print(f"   Billing History: {len(billing_history)} invoices")
    
    # Calculate next billing
    if billing_history:
        last_invoice_date_str = billing_history[0].get("invoice_date", "")
        last_billed_date = parse_date(last_invoice_date_str)
        print(f"   Last Billed: {last_invoice_date_str}")
        if last_billed_date:
            next_billing_dt = calculate_next_billing_date(service_start_date, last_billed_date)
        else:
            next_billing_dt = calculate_next_billing_date(service_start_date, service_start_date)
    else:
        print(f"   Last Billed: Never (first billing)")
        next_billing_dt = calculate_next_billing_date(service_start_date, service_start_date)
    
    next_billing_str = format_date(next_billing_dt)
    days_until = (next_billing_dt.date() - today).days
    
    print(f"   Next Billing: {next_billing_str}")
    print(f"   Days Until: {days_until}")
    
    if 0 <= days_until <= 90:
        print(f"   ✅ Within 90 days!")
        upcoming_count += 1
    else:
        print(f"   ❌ Outside 90 day window")

print("\n" + "="*60)
print(f"SUMMARY: {upcoming_count} out of 5 sample clients have bills in next 90 days")
print("="*60)
