import os
import re

os.chdir('src')

print("=== BALANCING UI ELEMENTS ===\n")

# ============================================
# 1. SIDEBAR - Increase size slightly
# ============================================
print("[1/3] Increasing Sidebar size...")
with open('Sidebar.jsx', 'r', encoding='utf-8') as f:
    sidebar = f.read()

# Increase sidebar width
sidebar = sidebar.replace('w-56', 'w-64')  # Wider when expanded
sidebar = sidebar.replace('w-16', 'w-20')  # Wider when collapsed

# Increase item padding to match what we'll do with inputs
sidebar = sidebar.replace('px-3 py-2', 'px-4 py-2.5')

# Keep text readable
sidebar = sidebar.replace('text-sm', 'text-base')

# Keep icons visible
# Already w-5 h-5 from last change

with open('Sidebar.jsx', 'w', encoding='utf-8') as f:
    f.write(sidebar)

print("   [OK] Sidebar enlarged and more readable")

# ============================================
# 2. APP.JSX - Match input fields to sidebar AND increase fonts
# ============================================
print("[2/3] Matching input fields and increasing fonts...")
with open('App.jsx', 'r', encoding='utf-8') as f:
    app = f.read()

# Input fields - match sidebar item size (px-4 py-2.5)
# Replace all input field padding to match sidebar
app = re.sub(r'px-3 py-2 text-sm', 'px-4 py-2.5 text-base', app)
app = re.sub(r'px-4 py-3 text-base', 'px-4 py-2.5 text-base', app)

# Increase font sizes across the board
# Page titles
app = re.sub(r'text-xl font-semibold', 'text-2xl font-semibold', app)
app = re.sub(r'text-2xl font-semibold', 'text-3xl font-semibold', app, count=1)  # Main title

# Labels
app = re.sub(r'text-sm font-medium', 'text-base font-medium', app)
app = re.sub(r'text-sm font-normal', 'text-base font-normal', app)
app = re.sub(r'font-medium text-gray-700 text-sm', 'font-medium text-gray-700 text-base', app)

# Subtitles
app = re.sub(r'text-sm text-gray-600', 'text-base text-gray-600', app)

# Button text
app = re.sub(r'text-sm font-medium', 'text-base font-medium', app)

# Tab navigation
app = re.sub(r'text-sm', 'text-base', app)  # General replacement for tabs

with open('App.jsx', 'w', encoding='utf-8') as f:
    f.write(app)

print("   [OK] Input fields matched to sidebar size")
print("   [OK] All fonts increased for readability")

# ============================================
# 3. OTHER COMPONENTS - Increase fonts
# ============================================
print("[3/3] Updating other components...")

files = ['FileManager.jsx', 'AdmissionRegistration.jsx', 'BedManagement.jsx', 
         'ChargeSummary.jsx', 'Documents.jsx']

for filename in files:
    if not os.path.exists(filename):
        continue
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Increase input field sizing
    content = re.sub(r'px-3 py-2 text-sm', 'px-4 py-2.5 text-base', content)
    content = re.sub(r'px-4 py-3', 'px-4 py-2.5', content)
    
    # Increase fonts
    content = re.sub(r'text-sm', 'text-base', content)
    content = re.sub(r'text-xs', 'text-sm', content)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"   [OK] Updated {filename}")

print("\n=== BALANCING COMPLETE ===")
print("\nChanges Applied:")
print("[OK] Sidebar: Increased to w-64, padding px-4 py-2.5")
print("[OK] Input fields: Matched sidebar (px-4 py-2.5)")
print("[OK] All fonts: Increased to text-base")
print("[OK] Labels: Larger and more readable")
print("[OK] Overall: Balanced, uniform sizing")
