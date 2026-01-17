import re

# Read the file
with open('patientadmission_routes.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Perform replacements
replacements = [
    ('Home Care Routes Module', 'Patient Admission Routes Module'),
    ('FastAPI routes for home care billing management', 'FastAPI routes for patient admission billing management'),
    ('from homecare_service import', 'from patientadmission_service import'),
    ('get_all_homecare_clients', 'get_all_patientadmission_clients'),
    ('get_homecare_client_by_id', 'get_patientadmission_client_by_id'),
    ('get_billing_history', 'get_billing_history'),  # Keep same
    ('generate_homecare_invoice', 'generate_patientadmission_invoice'),
    ('calculate_next_billing_date', 'calculate_next_billing_date'),  # Keep same
    ('parse_date', 'parse_date'),  # Keep same
    ('format_date', 'format_date'),  # Keep same
    ('process_daily_billing', 'process_daily_billing'),  # Keep same
    ('create_homecare_client', 'create_patientadmission_client'),
    ('update_homecare_client', 'update_patientadmission_client'),
    ('HomeCareClientCreate', 'PatientAdmissionClientCreate'),
    ('HomeCareClientUpdate', 'PatientAdmissionClientUpdate'),
    ('@router.get("/homecare/', '@router.get("/patientadmission/'),
    ('@router.post("/homecare/', '@router.post("/patientadmission/'),
    ('@router.put("/homecare/', '@router.put("/patientadmission/'),
    ('Home Care', 'Patient Admission'),
    ('home care', 'patient admission'),
    ('[Home Care]', '[Patient Admission]'),
    ('location: Optional[str]', 'care_center: Optional[str]'),
    ('"location"', '"care_center"'),
    ("'location'", "'care_center'"),
]

for old, new in replacements:
    content = content.replace(old, new)

# Write back
with open('patientadmission_routes.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Routes file replacements completed successfully!")
print(f"Total length: {len(content)} characters")
