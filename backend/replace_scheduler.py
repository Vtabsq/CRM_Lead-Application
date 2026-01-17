import re

# Read the file
with open('patientadmission_scheduler.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Perform replacements
replacements = [
    ('Home Care Scheduler Module', 'Patient Admission Scheduler Module'),
    ('Handles automatic daily billing for home care clients', 'Handles automatic daily billing for patient admission clients'),
    ('HOMECARE_BILLING_TIME', 'PATIENTADMISSION_BILLING_TIME'),
    ('from homecare_service import', 'from patientadmission_service import'),
    ('Home Care', 'Patient Admission'),
    ('home care', 'patient admission'),
    ('[Home Care', '[Patient Admission'),
    ('homecare_billing.log', 'patientadmission_billing.log'),
    ("'homecare_daily_billing'", "'patientadmission_daily_billing'"),
]

for old, new in replacements:
    content = content.replace(old, new)

# Write back
with open('patientadmission_scheduler.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Scheduler file replacements completed successfully!")
print(f"Total length: {len(content)} characters")
