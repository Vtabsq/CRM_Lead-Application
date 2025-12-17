import os
import re

os.chdir('src')

print("=== FINAL UI POLISH ===\n")

# ============================================
# 1. APP.JSX - Further header reduction, logout sizing, input fields
# ============================================
print("[1/8] Optimizing App.jsx...")
with open('App.jsx', 'r', encoding='utf-8') as f:
    app = f.read()

# Header - even smaller
app = app.replace('px-4 py-3', 'px-3 py-2', 1)  # Header container (first occurrence)
app = app.replace('w-14 h-14', 'w-12 h-12')  # Logo even smaller
app = app.replace('text-2xl font-bold', 'text-xl font-semibold')  # Title smaller
app = app.replace('gap-5', 'gap-3', 1)  # Logo-title gap

# Logout button - match System Ready size
app = app.replace('px-4 py-2', 'px-3 py-1.5')  # Logout/Login buttons
app = app.replace('text-sm text-white', 'text-xs text-white')  # System Ready text
app = app.replace('ml-1 text-sm', 'ml-1 text-xs')  # Username text smaller

# User info badges
app = app.replace('text-xs rounded-full', 'text-[10px]')  # Online badge smaller

# Main container - maximize space
app = app.replace('px-2 py-4', 'px-1 py-2')  # Even tighter
app = app.replace('gap-3', 'gap-2')  # Sidebar-content gap

# Input fields - reduce height and spacing
app = re.sub(r'py-3', 'py-1.5', app)  # Input padding
app = re.sub(r'space-y-4', 'space-y-2', app)  # Form spacing
app = re.sub(r'space-y-6', 'space-y-3', app)  # Section spacing
app = re.sub(r'mb-6', 'mb-3', app)  # Bottom margins
app = re.sub(r'mb-4', 'mb-2', app)  # Bottom margins
app = re.sub(r'gap-4', 'gap-2', app)  # General gaps

# Button heights
app = app.replace('px-6 py-3', 'px-4 py-2')  # Large buttons
app = app.replace('px-8 py-3', 'px-6 py-2')  # Extra large buttons

with open('App.jsx', 'w', encoding='utf-8') as f:
    f.write(app)
print("   [OK] Header reduced, logout sized, inputs optimized")

# ============================================
# 2. SIDEBAR - Flush left, narrower
# ============================================
print("[2/8] Optimizing Sidebar...")
with open('Sidebar.jsx', 'r', encoding='utf-8') as f:
    sidebar = f.read()

# Make even narrower
sidebar = sidebar.replace('w-64', 'w-56')  # Expanded
sidebar = sidebar.replace('w-20', 'w-16')  # Collapsed

# Reduce padding more
sidebar = sidebar.replace('p-2', 'p-1.5')
sidebar = sidebar.replace('px-3 py-2', 'px-2 py-1.5')
sidebar = sidebar.replace('gap-2', 'gap-1.5')

# Smaller text
sidebar = sidebar.replace('text-xs', 'text-[11px]')

# Top position for flush alignment
sidebar = sidebar.replace('top-24', 'top-16')  # Closer to top

with open('Sidebar.jsx', 'w', encoding='utf-8') as f:
    f.write(sidebar)
print("   [OK] Sidebar narrower, flush left, optimized")

# ============================================
# 3. FILE MANAGER - Smaller heights, better alignment
# ============================================
print("[3/8] Optimizing FileManager...")
with open('FileManager.jsx', 'r', encoding='utf-8') as f:
    fm = f.read()

fm = re.sub(r'py-3', 'py-2', fm)
fm = re.sub(r'py-4', 'py-2', fm)
fm = re.sub(r'space-y-4', 'space-y-2', fm)
fm = re.sub(r'gap-4', 'gap-2', fm)
fm = re.sub(r'mb-6', 'mb-3', fm)
fm = fm.replace('p-6 bg-gradient', 'p-4 bg-gradient')

with open('FileManager.jsx', 'w', encoding='utf-8') as f:
    f.write(fm)
print("   [OK] FileManager compressed")

# ============================================
# 4. ADMISSION REGISTRATION - Compress inputs
# ============================================
print("[4/8] Optimizing AdmissionRegistration...")
with open('AdmissionRegistration.jsx', 'r', encoding='utf-8') as f:
    adm = f.read()

adm = re.sub(r'py-3', 'py-1.5', adm)
adm = re.sub(r'py-4', 'py-2', adm)
adm = re.sub(r'space-y-6', 'space-y-2', adm)
adm = re.sub(r'space-y-4', 'space-y-2', adm)
adm = re.sub(r'gap-6', 'gap-3', adm)
adm = re.sub(r'gap-4', 'gap-2', adm)
adm = re.sub(r'mb-6', 'mb-2', adm)
adm = re.sub(r'mb-8', 'mb-3', adm)

with open('AdmissionRegistration.jsx', 'w', encoding='utf-8') as f:
    f.write(adm)
print("   [OK] Admission forms compressed")

# ============================================
# 5. BED MANAGEMENT - Standardize sizing
# ============================================
print("[5/8] Optimizing BedManagement...")
with open('BedManagement.jsx', 'r', encoding='utf-8') as f:
    bed = f.read()

bed = re.sub(r'py-3', 'py-2', bed)
bed = re.sub(r'space-y-4', 'space-y-2', bed)
bed = re.sub(r'gap-4', 'gap-2', bed)

with open('BedManagement.jsx', 'w', encoding='utf-8') as f:
    f.write(bed)
print("   [OK] Bed Management standardized")

# ============================================
# 6. CHARGE SUMMARY - Compact layout
# ============================================
print("[6/8] Optimizing ChargeSummary...")
with open('ChargeSummary.jsx', 'r', encoding='utf-8') as f:
    charge = f.read()

charge = re.sub(r'py-3', 'py-2', charge)
charge = re.sub(r'space-y-6', 'space-y-3', charge)
charge = re.sub(r'gap-6', 'gap-3', charge)

with open('ChargeSummary.jsx', 'w', encoding='utf-8') as f:
    f.write(charge)
print("   [OK] Charge Summary compressed")

# ============================================
# 7. DOCUMENTS - Match layout
# ============================================
print("[7/8] Optimizing Documents...")
with open('Documents.jsx', 'r', encoding='utf-8') as f:
    docs = f.read()

docs = re.sub(r'py-3', 'py-2', docs)
docs = re.sub(r'space-y-6', 'space-y-3', docs)

with open('Documents.jsx', 'w', encoding='utf-8') as f:
    f.write(docs)
print("   [OK] Documents optimized")

# ============================================
# 8. ERROR BOUNDARY - Compact
# ============================================
print("[8/8] Optimizing ErrorBoundary...")
with open('ErrorBoundary.jsx', 'r', encoding='utf-8') as f:
    err = f.read()

err = err.replace('p-5', 'p-4')
err = re.sub(r'py-3', 'py-2', err)

with open('ErrorBoundary.jsx', 'w', encoding='utf-8') as f:
    f.write(err)
print("   [OK] ErrorBoundary compressed")

print("\n=== FINAL POLISH COMPLETE ===")
print("\nChanges Applied:")
print("[OK] Header: Further reduced, logout matches system ready size")
print("[OK] Sidebar: Narrower (56), positioned flush left")
print("[OK] Input fields: Reduced height (py-1.5), minimal gaps")
print("[OK] All pages: Compressed spacing for single-page view")
print("[OK] Consistent sizing: All components standardized")
print("[OK] Professional layout: Client-ready appearance")
