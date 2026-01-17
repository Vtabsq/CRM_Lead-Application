import os
import re

# List of files to update
files_to_update = [
    'src/AdmissionRegistration.jsx',
    'src/AIChat.jsx',
    'src/BedManagement.jsx',
    'src/BillingSummary.jsx',
    'src/ChargeSummary.jsx',
    'src/DropdownManager.jsx',
    'src/EnquiryPage.jsx',
    'src/FileManager.jsx',
    'src/NotificationSettings.jsx',
    'src/SchemaEditor.jsx',
    'src/SearchData.jsx',
]

# Pattern to find and replace
old_pattern = "const API_BASE_URL = 'http://localhost:8000';"
new_code = "import API_BASE_URL from './config';"

updated_files = []
errors = []

for file_path in files_to_update:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if old_pattern in content:
            # Replace the pattern
            new_content = content.replace(old_pattern, new_code)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            updated_files.append(file_path)
            print(f"[OK] Updated: {file_path}")
        else:
            print(f"[SKIP] Pattern not found: {file_path}")
    
    except Exception as e:
        errors.append((file_path, str(e)))
        print(f"[ERROR] {file_path}: {e}")

print(f"\n=== Summary ===")
print(f"Updated: {len(updated_files)} files")
print(f"Errors: {len(errors)} files")

if errors:
    print("\nErrors:")
    for file, error in errors:
        print(f"  - {file}: {error}")
