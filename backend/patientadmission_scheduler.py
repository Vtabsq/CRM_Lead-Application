"""
Patient Admission Scheduler Module
Handles automatic daily billing for patient admission clients
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
BILLING_TIME = os.getenv("PATIENTADMISSION_BILLING_TIME", "09:00")  # Default: 9:00 AM

# Global scheduler instance
scheduler = None


def billing_job():
    """
    Job function that runs daily to process patient admission billing.
    This is called by the scheduler.
    """
    try:
        print(f"\n{'='*60}")
        print(f"[Patient Admission Scheduler] Billing job triggered at {datetime.now()}")
        print(f"{'='*60}\n")
        
        # Import here to avoid circular imports
        from patientadmission_service import process_daily_billing
        
        # Run the billing process
        summary = process_daily_billing()
        
        # Log summary
        print(f"\n{'='*60}")
        print(f"[Patient Admission Scheduler] Billing job completed")
        print(f"  - Timestamp: {summary.get('timestamp', 'N/A')}")
        print(f"  - Total Active Clients: {summary.get('total_active_clients', 0)}")
        print(f"  - Billed: {summary.get('billed_count', 0)}")
        print(f"  - Skipped: {summary.get('skipped_count', 0)}")
        print(f"  - Errors: {summary.get('error_count', 0)}")
        
        if summary.get('billed_clients'):
            print(f"\n  Billed Clients:")
            for client in summary['billed_clients']:
                print(f"    - {client['patient_name']}: {client['invoice_ref']} (₹{client['amount']})")
        
        if summary.get('errors'):
            print(f"\n  Errors:")
            for error in summary['errors']:
                print(f"    - {error}")
        
        print(f"{'='*60}\n")
        
        # Write to log file
        log_file = "patientadmission_billing.log"
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"\n{'='*60}\n")
            f.write(f"Billing Job - {datetime.now()}\n")
            f.write(f"{'='*60}\n")
            f.write(f"Total Active Clients: {summary.get('total_active_clients', 0)}\n")
            f.write(f"Billed: {summary.get('billed_count', 0)}\n")
            f.write(f"Skipped: {summary.get('skipped_count', 0)}\n")
            f.write(f"Errors: {summary.get('error_count', 0)}\n")
            
            if summary.get('billed_clients'):
                f.write(f"\nBilled Clients:\n")
                for client in summary['billed_clients']:
                    f.write(f"  - {client['patient_name']}: {client['invoice_ref']} (₹{client['amount']})\n")
            
            if summary.get('errors'):
                f.write(f"\nErrors:\n")
                for error in summary['errors']:
                    f.write(f"  - {error}\n")
            
            f.write(f"\n")
        
    except Exception as e:
        error_msg = f"[Patient Admission Scheduler] Critical error in billing job: {e}"
        print(error_msg)
        
        # Log error
        log_file = "patientadmission_billing.log"
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"\n{'='*60}\n")
            f.write(f"CRITICAL ERROR - {datetime.now()}\n")
            f.write(f"{'='*60}\n")
            f.write(f"{error_msg}\n")
            f.write(f"\n")


def start_billing_scheduler():
    """
    Start the background scheduler for patient admission billing.
    Runs daily at the configured time.
    """
    global scheduler
    
    if scheduler is not None:
        print("[Patient Admission Scheduler] Scheduler already running")
        return
    
    try:
        # Parse billing time (format: HH:MM)
        hour, minute = BILLING_TIME.split(":")
        hour = int(hour)
        minute = int(minute)
        
        # Create scheduler
        scheduler = BackgroundScheduler()
        
        # Add daily job
        trigger = CronTrigger(hour=hour, minute=minute)
        scheduler.add_job(
            billing_job,
            trigger=trigger,
            id='patientadmission_daily_billing',
            name='Patient Admission Daily Billing',
            replace_existing=True
        )
        
        # Start scheduler
        scheduler.start()
        
        print(f"\n{'='*60}")
        print(f"[Patient Admission Scheduler] Started successfully")
        print(f"  - Billing Time: {BILLING_TIME} (daily)")
        print(f"  - Next Run: {scheduler.get_job('patientadmission_daily_billing').next_run_time}")
        print(f"{'='*60}\n")
        
        # Write to log
        log_file = "patientadmission_billing.log"
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"\n{'='*60}\n")
            f.write(f"Scheduler Started - {datetime.now()}\n")
            f.write(f"{'='*60}\n")
            f.write(f"Billing Time: {BILLING_TIME} (daily)\n")
            f.write(f"Next Run: {scheduler.get_job('patientadmission_daily_billing').next_run_time}\n")
            f.write(f"\n")
        
    except Exception as e:
        print(f"[Patient Admission Scheduler] Failed to start: {e}")
        scheduler = None


def stop_billing_scheduler():
    """
    Stop the background scheduler gracefully.
    """
    global scheduler
    
    if scheduler is None:
        print("[Patient Admission Scheduler] No scheduler to stop")
        return
    
    try:
        scheduler.shutdown(wait=True)
        scheduler = None
        
        print(f"\n{'='*60}")
        print(f"[Patient Admission Scheduler] Stopped successfully")
        print(f"{'='*60}\n")
        
        # Write to log
        log_file = "patientadmission_billing.log"
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"\n{'='*60}\n")
            f.write(f"Scheduler Stopped - {datetime.now()}\n")
            f.write(f"{'='*60}\n\n")
        
    except Exception as e:
        print(f"[Patient Admission Scheduler] Error stopping scheduler: {e}")


def get_scheduler_status():
    """
    Get current scheduler status.
    
    Returns:
        Dictionary with scheduler status information
    """
    global scheduler
    
    if scheduler is None:
        return {
            "running": False,
            "message": "Scheduler not started"
        }
    
    try:
        job = scheduler.get_job('patientadmission_daily_billing')
        
        if job is None:
            return {
                "running": False,
                "message": "Billing job not found"
            }
        
        return {
            "running": True,
            "billing_time": BILLING_TIME,
            "next_run": str(job.next_run_time),
            "message": "Scheduler running normally"
        }
        
    except Exception as e:
        return {
            "running": False,
            "error": str(e),
            "message": "Error checking scheduler status"
        }
