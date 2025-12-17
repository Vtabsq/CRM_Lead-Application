import os
import re

# Change to frontend/src directory
os.chdir('src')

files_to_update = [
    'App.jsx',
    'FileManager.jsx', 
    'AdmissionRegistration.jsx',
    'BedManagement.jsx',
    'ChargeSummary.jsx',
    'Documents.jsx',
    'ErrorBoundary.jsx',
    'Sidebar.jsx'
]

replacements = [
    ('hover:bg-blue-50', 'hover:bg-green-50'),
    ('hover:bg-blue-100', 'hover:bg-green-100'),
    ('hover:bg-blue-600', 'hover:bg-green-600'),
    ('hover:bg-blue-700', 'hover:bg-green-700'),
    ('hover:bg-blue-800', 'hover:bg-green-800'),
    ('border-blue-400', 'border-green-400'),
    ('text-blue-600 hover', 'text-green-600 hover'),
    ('text-blue-700 hover', 'text-green-700 hover'),
    ('text-blue-800 hover', 'text-green-800 hover'),
    ('bg-blue-500 text-white hover:bg-blue-600', 'bg-green-500 text-white hover:bg-green-600'),
    ('bg-blue-600 text-white', 'bg-green-600 text-white'),
    ('bg-blue-50 text-blue-600', 'bg-green-50 text-green-600'),
    ('text-blue-600 border border-blue-200', 'text-green-600 border border-green-200'),
    ('className="p-8', 'className="p-5'),
]

for filename in files_to_update:
    if not os.path.exists(filename):
        print(f"Skipping {filename} - not found")
        continue
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for old, new in replacements:
            content = content.replace(old, new)
        
        if content != original_content:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"[OK] Updated {filename}")
        else:
            print(f"[SKIP] No changes needed in {filename}")
    except Exception as e:
        print(f"[ERROR] Error updating {filename}: {e}")

print("\n[DONE] UI Update Complete!")
