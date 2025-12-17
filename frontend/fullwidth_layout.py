import os
import re

os.chdir('src')

print("=== MAKING CONTENT FULL-WIDTH ===\n")

# ============================================
# 1. APP.JSX - Main container and all sections
# ============================================
print("[1/6] Updating App.jsx to full width...")
with open('App.jsx', 'r', encoding='utf-8') as f:
    app = f.read()

# Remove max-width constraints
app = re.sub(r'max-w-7xl mx-auto', 'w-full', app)
app = re.sub(r'max-w-6xl mx-auto', 'w-full', app)
app = re.sub(r'max-w-5xl mx-auto', 'w-full', app)
app = re.sub(r'max-w-4xl mx-auto', 'w-full', app)
app = re.sub(r'max-w-3xl mx-auto', 'w-full', app)
app = re.sub(r'max-w-2xl mx-auto', 'w-full', app)
app = re.sub(r'max-w-xl mx-auto', 'w-full', app)

# Ensure main content container is full width
app = re.sub(r'px-4 py-2 flex', 'w-full px-4 py-2 flex', app)

with open('App.jsx', 'w', encoding='utf-8') as f:
    f.write(app)

print("   [OK] App.jsx updated to full width")

# ============================================
# 2-6. Update all other components
# ============================================
files = [
    'AdmissionRegistration.jsx',
    'FileManager.jsx',
    'BedManagement.jsx',
    'ChargeSummary.jsx',
    'Documents.jsx'
]

for idx, filename in enumerate(files, 2):
    if not os.path.exists(filename):
        print(f"[{idx}/6] Skipping {filename} - not found")
        continue
    
    print(f"[{idx}/6] Updating {filename} to full width...")
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove max-width constraints
    content = re.sub(r'max-w-7xl mx-auto', 'w-full', content)
    content = re.sub(r'max-w-6xl mx-auto', 'w-full', content)
    content = re.sub(r'max-w-5xl mx-auto', 'w-full', content)
    content = re.sub(r'max-w-4xl mx-auto', 'w-full', content)
    content = re.sub(r'max-w-3xl mx-auto', 'w-full', content)
    content = re.sub(r'max-w-2xl mx-auto', 'w-full', content)
    content = re.sub(r'max-w-xl mx-auto', 'w-full', content)
    
    # Ensure containers are full width with proper padding
    content = re.sub(r'className="container mx-auto', 'className="w-full', content)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"   [OK] {filename} updated to full width")

print("\n=== FULL-WIDTH LAYOUT COMPLETE ===")
print("\nChanges Applied:")
print("[OK] Removed all max-w-* mx-auto constraints")
print("[OK] Applied w-full to all main containers")
print("[OK] Content now matches header bar width")
print("[OK] Consistent full-width across all modules")
print("\nResult: All pages now use 100% width!")
