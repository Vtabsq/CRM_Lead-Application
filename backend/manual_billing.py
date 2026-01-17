"""
Manual Billing Trigger Script
Run this to manually generate invoices for clients whose billing is due today
"""
from datetime import datetime
from homecare_service import process_daily_billing

print("="*60)
print("MANUAL BILLING TRIGGER")
print("="*60)
print(f"Current Date: {datetime.now().date()}")
print(f"Current Time: {datetime.now().strftime('%H:%M:%S')}")
print("\nThis will generate invoices for all clients whose billing is due TODAY.")
print("="*60)

# Ask for confirmation
response = input("\nDo you want to proceed? (yes/no): ").strip().lower()

if response == 'yes' or response == 'y':
    print("\n" + "="*60)
    print("RUNNING BILLING PROCESS...")
    print("="*60 + "\n")
    
    # Run billing
    summary = process_daily_billing()
    
    # Display results
    print("\n" + "="*60)
    print("BILLING COMPLETE!")
    print("="*60)
    print(f"Total Active Clients: {summary.get('total_active_clients', 0)}")
    print(f"Invoices Generated: {summary.get('billed_count', 0)}")
    print(f"Clients Skipped: {summary.get('skipped_count', 0)}")
    print(f"Errors: {summary.get('error_count', 0)}")
    
    if summary.get('billed_clients'):
        print("\n✅ INVOICES GENERATED:")
        for client in summary['billed_clients']:
            print(f"  • {client['patient_name']}")
            print(f"    Invoice: {client['invoice_ref']}")
            print(f"    Amount: ₹{client['amount']:,.2f}")
            print()
    
    if summary.get('errors'):
        print("\n❌ ERRORS:")
        for error in summary['errors']:
            print(f"  • {error}")
    
    print("="*60)
    print("\n✅ All invoices have been saved to the 'Accounts Receivable' sheet in Google Sheets!")
    print("You can view them in your Google Sheet or in the Billing History page.\n")
else:
    print("\n❌ Billing cancelled. No invoices were generated.")
    print("The automatic scheduler will run tomorrow at 09:00 AM.\n")
