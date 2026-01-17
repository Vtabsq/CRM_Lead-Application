import os
import re

# Files that still need updating
files = {
    'src/FileManager.jsx': [
        ("'http://localhost:8000/get_sheet_headers'", "`${API_BASE_URL}/get_sheet_headers`"),
        ("'http://localhost:8000/confirm_upload'", "`${API_BASE_URL}/confirm_upload`"),
        ("'http://localhost:8000/upload_file'", "`${API_BASE_URL}/upload_file`"),
        ("'http://localhost:8000/delete/preview'", "`${API_BASE_URL}/delete/preview`"),
        ("'http://localhost:8000/delete/confirm'", "`${API_BASE_URL}/delete/confirm`"),
        ('"http://localhost:8000/download_template?format=csv"', '`${API_BASE_URL}/download_template?format=csv`'),
        ('"http://localhost:8000/download_template"', '`${API_BASE_URL}/download_template`'),
    ],
    'src/DropdownManager.jsx': [
        ("'http://localhost:8000/api/dropdown-options'", "`${API_BASE_URL}/api/dropdown-options`"),
        ("`http://localhost:8000/api/dropdown-options/${encodeURIComponent(fieldName)}`", "`${API_BASE_URL}/api/dropdown-options/${encodeURIComponent(fieldName)}`"),
        ("`http://localhost:8000/api/dropdown-options/${encodeURIComponent(fieldName)}/${encodeURIComponent(option)}`", "`${API_BASE_URL}/api/dropdown-options/${encodeURIComponent(fieldName)}/${encodeURIComponent(option)}`"),
        ("'http://localhost:8000/api/sync-schema-sheet'", "`${API_BASE_URL}/api/sync-schema-sheet`"),
    ],
    'src/ChargeSummary.jsx': [
        ("'http://localhost:8000/api/settings/charges'", "`${API_BASE_URL}/api/settings/charges`"),
    ],
    'src/AdmissionRegistration.jsx': [
        ("'http://localhost:8000/api/settings/charges'", "`${API_BASE_URL}/api/settings/charges`"),
        ("'http://localhost:8000/get_fields?type=admission'", "`${API_BASE_URL}/get_fields?type=admission`"),
        ("'http://localhost:8000/patient-admission/view'", "`${API_BASE_URL}/patient-admission/view`"),
        ("'http://localhost:8000/api/beds'", "`${API_BASE_URL}/api/beds`"),
        ("'http://localhost:8000/search_data?limit=1000'", "`${API_BASE_URL}/search_data?limit=1000`"),
        ("'http://localhost:8000/patient-admission/save'", "`${API_BASE_URL}/patient-admission/save`"),
    ],
}

# Add import statement at the top of each file
import_statement = "import API_BASE_URL from './config';\n"

updated_count = 0
for file_path, replacements in files.items():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add import if not already present
        if "import API_BASE_URL from './config'" not in content:
            # Find the last import statement
            import_lines = []
            for i, line in enumerate(content.split('\n')):
                if line.strip().startswith('import '):
                    import_lines.append(i)
            
            if import_lines:
                lines = content.split('\n')
                last_import_idx = max(import_lines)
                lines.insert(last_import_idx + 1, "import API_BASE_URL from './config';")
                content = '\n'.join(lines)
        
        # Apply all replacements
        for old, new in replacements:
            content = content.replace(old, new)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        updated_count += 1
        print(f"[OK] Updated: {file_path}")
    
    except Exception as e:
        print(f"[ERROR] {file_path}: {e}")

print(f"\n=== Summary ===")
print(f"Updated: {updated_count} files")
