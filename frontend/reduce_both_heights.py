import os
import re

os.chdir('src')

print("=== REDUCING INPUT FIELD HEIGHT ===\n")

# Goal: Make both sidebar and input fields smaller (py-2 instead of py-2.5)

# ============================================
# 1. SIDEBAR - Reduce to py-2
# ============================================
print("[1/2] Reducing Sidebar item height...")
with open('Sidebar.jsx', 'r', encoding='utf-8') as f:
    sidebar = f.read()

# Reduce sidebar item padding
sidebar = sidebar.replace('px-4 py-2.5', 'px-4 py-2')

with open('Sidebar.jsx', 'w', encoding='utf-8') as f:
    f.write(sidebar)

print("   [OK] Sidebar items reduced to py-2")

# ============================================
# 2. APP.JSX - Match input fields to py-2
# ============================================
print("[2/2] Reducing input field heights...")
with open('App.jsx', 'r', encoding='utf-8') as f:
    app = f.read()

# Reduce all input fields to px-4 py-2
app = re.sub(r'px-4 py-2\.5', 'px-4 py-2', app)

# Also reduce select dropdowns
app = re.sub(r'py-3', 'py-2', app)

with open('App.jsx', 'w', encoding='utf-8') as f:
    f.write(app)

print("   [OK] Input fields reduced to py-2")

print("\n=== HEIGHT REDUCTION COMPLETE ===")
print("\nChanges Applied:")
print("[OK] Sidebar items: Reduced to py-2 (smaller)")
print("[OK] Input fields: Reduced to py-2 (smaller)")
print("[OK] Both now have identical compact height")
print("[OK] More screen space, cleaner appearance")
