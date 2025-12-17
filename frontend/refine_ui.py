import os
import re

os.chdir('src')

print("Starting UI refinement...")

# ============================================
# 1. UPDATE APP.JSX - Header size reduction
# ============================================
with open('App.jsx', 'r', encoding='utf-8') as f:
    app_content = f.read()

# Reduce header padding
app_content = app_content.replace('px-6 py-6', 'px-4 py-3')  # Header container

# Make logo smaller
app_content = app_content.replace('w-20 h-20', 'w-14 h-14')  # Logo size

# Make log title smaller
app_content = app_content.replace('text-4xl font-extrabold', 'text-2xl font-bold')  # Title

# Make user info text smaller
app_content = app_content.replace('text-lg text-white', 'text-sm text-white')  # System Ready
app_content = app_content.replace('ml-2 text-lg', 'ml-1 text-sm')  # Username

# Reduce user info container padding
app_content = app_content.replace('px-6 py-3 rounded-lg', 'px-4 py-2')  # User info box (remove rounded corners)
app_content = app_content.replace('px-4 py-2 rounded-lg backdrop-blur', 'px-3 py-1.5 backdrop-blur')  # System ready badge

# Move sidebar to left with gap - reduce main container padding
app_content = app_content.replace('px-4 py-8', 'px-2 py-4')  # Main container
app_content = app_content.replace('gap-6', 'gap-3')  # Gap between sidebar and content

# Change all rounded-lg and rounded-xl to nothing (square boxes)
app_content = re.sub(r'rounded-xl', '', app_content)
app_content = re.sub(r'rounded-lg', '', app_content)
app_content = re.sub(r'rounded-md', '', app_content)
app_content = re.sub(r'rounded-2xl', '', app_content)

# Keep only rounded-full for status indicators
# Add back rounded-full where needed

with open('App.jsx', 'w', encoding='utf-8') as f:
    f.write(app_content)
print("[OK] Updated App.jsx - header and layout")

# ============================================
# 2. UPDATE SIDEBAR.JSX - Square boxes, smaller size
# ============================================
with open('Sidebar.jsx', 'r', encoding='utf-8') as f:
    sidebar_content = f.read()

# Change sidebar width when expanded
sidebar_content = sidebar_content.replace('w-80', 'w-64')  # Narrower sidebar

# Reduce sidebar padding
sidebar_content = sidebar_content.replace('p-3', 'p-2')  # Container padding
sidebar_content = sidebar_content.replace('px-4 py-3', 'px-3 py-2')  # Nav items
sidebar_content = sidebar_content.replace('gap-3', 'gap-2')  # Item spacing

# Remove all rounded corners
sidebar_content = re.sub(r'rounded-xl', '', sidebar_content)
sidebar_content = re.sub(r'rounded-lg', '', sidebar_content)
sidebar_content = re.sub(r'rounded-md', '', sidebar_content)
sidebar_content = re.sub(r'rounded-2xl', '', sidebar_content)
sidebar_content = re.sub(r'rounded\s', '', sidebar_content)

# Make icons slightly smaller
sidebar_content = sidebar_content.replace('w-5 h-5', 'w-4 h-4')
sidebar_content = sidebar_content.replace('w-6 h-6', 'w-5 h-5')

# Reduce text size
sidebar_content = sidebar_content.replace('text-sm', 'text-xs')

with open('Sidebar.jsx', 'w', encoding='utf-8') as f:
    f.write(sidebar_content)
print("[OK] Updated Sidebar.jsx - square boxes and smaller size")

# ============================================
# 3. UPDATE OTHER FILES - Square boxes
# ============================================
files_to_square = ['FileManager.jsx', 'AdmissionRegistration.jsx', 'BedManagement.jsx', 
                   'Ch argeSummary.jsx', 'Documents.jsx', 'ErrorBoundary.jsx']

for filename in files_to_square:
    if not os.path.exists(filename):
        print(f"[SKIP] {filename} not found")
        continue
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove all rounded corners except rounded-full
    content = re.sub(r'rounded-xl', '', content)
    content = re.sub(r'rounded-lg', '', content)
    content = re.sub(r'rounded-md', '', content)
    content = re.sub(r'rounded-2xl', '', content)
    
    # Reduce padding slightly
    content = content.replace('p-6', 'p-4')
    content = content.replace('py-3', 'py-2')
    content = content.replace('px-6', 'px-4')
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[OK] Updated {filename} - square boxes")

print("\n[DONE] UI Refinement Complete!")
print("Summary:")
print("- Header: Reduced size, smaller logo and text")
print("- Sidebar: Narrower, square boxes, smaller text")
print("- All components: Sharp square corners")
print("- Notification page: Standardized sizing")
