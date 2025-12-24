"""
Quick diagnostic to check billing dates for home care clients
"""
import sys
sys.path.append('.')

from homecare_service import (
    get_all_homecare_clients,
    parse_date,
    is_billing_due_today,
    get_billing_history,
    format_date
)
from datetime import datetime

print("="*70)
print("BILLING DATE DIAGNOSTIC")
print(f"Today's Date: {datetime.now().strftime('%d/%m/%Y')}")
print("="*70)

try:
    clients = get_all_homecare_clients()
    active_clients = [c for c in clients if c.get("ACTIVE / INACTIVE", "").strip().upper() == "ACTIVE"]
    
    print(f"\nTotal Active Clients: {len(active_clients)}\n")
    
    for client in active_clients:
        name = client.get("PATIENT NAME", "Unknown")
        service_start_str = client.get("SERVICE STARTED ON", "")
        
        print(f"\n{name}:")
        print(f"  Service Started: {service_start_str}")
        
        if service_start_str:
            service_start_date = parse_date(service_start_str)
            if service_start_date:
                # Get billing history
                history = get_billing_history(name)
                last_billed_date = None
                
                if history:
                    last_invoice_date_str = history[0].get("invoice_date", "")
                    last_billed_date = parse_date(last_invoice_date_str)
                    print(f"  Last Billed: {last_invoice_date_str}")
                    print(f"  Billing Count: {len(history)}")
                else:
                    print(f"  Last Billed: Never")
                    print(f"  Billing Count: 0")
                
                # Check if billing is due today
                due_today = is_billing_due_today(service_start_date, last_billed_date)
                
                if due_today:
                    print(f"  >>> BILLING DUE TODAY <<<")
                else:
                    print(f"  Billing Due: Not today")
            else:
                print(f"  ERROR: Could not parse service start date")
        else:
            print(f"  ERROR: No service start date")
    
    print("\n" + "="*70)
    
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
