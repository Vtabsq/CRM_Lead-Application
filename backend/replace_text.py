import re

# Read the file
with open('patientadmission_service.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Perform replacements
replacements = [
    ('calculate_homecare_revenue', 'calculate_patientadmission_revenue'),
    ('get_all_homecare_clients', 'get_all_patientadmission_clients'),
    ('get_homecare_client_by_id', 'get_patientadmission_client_by_id'),
    ('generate_homecare_invoice', 'generate_patientadmission_invoice'),
    ('create_homecare_client', 'create_patientadmission_client'),
    ('update_homecare_client', 'update_patientadmission_client'),
    ('Home Care', 'Patient Admission'),
    ('home care', 'patient admission'),
    ('CRM_HomeCare', 'CRM_PatientAdmission'),
    ('homecare_sheet', 'patientadmission_sheet'),
    ('[Home Care]', '[Patient Admission]'),
    ('"LOCATION"', '"CARE CENTER"'),
    ("'location'", "'care_center'"),
]

for old, new in replacements:
    content = content.replace(old, new)

# Write back
with open('patientadmission_service.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacements completed successfully!")
print(f"Total length: {len(content)} characters")
