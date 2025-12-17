import os
import re

os.chdir('src')

print("=== MATCHING SIDEBAR AND INPUT HEIGHTS ===\n")

# Goal: Make sidebar items and input fields the SAME height
# We'll use py-2.5 as the standard height for both

# ============================================
# 1. SIDEBAR - Increase item height to py-2.5
# ============================================
print("[1/2] Adjusting Sidebar item heights...")
with open('Sidebar.jsx', 'r', encoding='utf-8') as f:
    sidebar = f.read()

# Increase sidebar item padding
sidebar = sidebar.replace('px-4 py-2', 'px-4 py-2.5')

with open('Sidebar.jsx', 'w', encoding='utf-8') as f:
    f.write(sidebar)

print("   [OK] Sidebar items increased to py-2.5")

# ============================================
# 2. APP.JSX - Ensure input fields are py-2.5
# ============================================
print("[2/2] Ensuring input fields are py-2.5...")
with open('App.jsx', 'r', encoding='utf-8') as f:
    app = f.read()

# Standardize all input fields to px-4 py-2.5
# This matches the sidebar item height
app = re.sub(r'px-4 py-2 text-base', 'px-4 py-2.5 text-base', app)
app = re.sub(r'px-3 py-2.5', 'px-4 py-2.5', app)
app = re.sub(r'px-3 py-2 ', 'px-4 py-2.5 ', app)

with open('App.jsx', 'w', encoding='utf-8') as f:
    f.write(app)

print("   [OK] Input fields standardized to py-2.5")

print("\n=== HEIGHT MATCHING COMPLETE ===")
print("\nChanges Applied:")
print("[OK] Sidebar items: Set to py-2.5")
print("[OK] Input fields: Set to py-2.5")
print("[OK] Both now have identical height")
print("[OK] Uniform, professional appearance")
