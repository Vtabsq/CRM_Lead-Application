import os
import glob

# Directory containing the Patient Admission components
directory = r'c:\Users\ragul\OneDrive\Dokumen\CRM_Lead-Application\frontend\src\PatientAdmission'

# Get all .jsx files
jsx_files = glob.glob(os.path.join(directory, '*.jsx'))

# Replacements to make
replacements = [
    ('/homecare/', '/patientadmission/'),
    ('/api/homecare/', '/api/patientadmission/'),
    ('Home Care', 'Patient Admission'),
    ('home care', 'patient admission'),
    ('HomeCare', 'PatientAdmission'),
    ('homecare', 'patientadmission'),
    ('Location', 'Care Center'),
    ('location', 'care_center'),
    ('"LOCATION"', '"CARE CENTER"'),
    ("'location'", "'care_center'"),
]

for file_path in jsx_files:
    print(f"Processing: {os.path.basename(file_path)}")
    
    # Read file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Apply replacements
    for old, new in replacements:
        content = content.replace(old, new)
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"  ✓ Updated {os.path.basename(file_path)}")

print(f"\n✅ Successfully updated {len(jsx_files)} files!")
