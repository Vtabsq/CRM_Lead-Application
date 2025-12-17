import os
import re

os.chdir('src')

print("=== FINAL ADJUSTMENTS ===\n")

# ============================================
# 1. APP.JSX - Reduce header more, restore readable font sizes
# ============================================
print("[1/2] Adjusting App.jsx...")
with open('App.jsx', 'r', encoding='utf-8') as f:
    app = f.read()

# Header - reduce even more
app = app.replace('px-3 py-2', 'px-2 py-1', 1)  # Header container (first occurrence only)

# Restore font sizes from too-small back to readable
# Titles
app = re.sub(r'text-lg font-semibold', 'text-xl font-semibold', app)  # Page titles
app = re.sub(r'text-xl font-semibold', 'text-2xl font-semibold', app, count=1)  # Main title

# Labels and text - restore from xs to sm
app = re.sub(r'text-xs font-medium', 'text-sm font-medium', app)
app = re.sub(r'text-xs font-normal', 'text-sm font-normal', app)
app = re.sub(r'font-medium text-gray-700 text-xs', 'font-medium text-gray-700 text-sm', app)

# Subtitles
app = re.sub(r'text-xs text-gray-600', 'text-sm text-gray-600', app)

# Button text
app = re.sub(r'text-xs font-medium', 'text-sm font-medium', app)

# Tab navigation
app = re.sub(r'px-3 py-1.5 text-xs', 'px-3 py-1.5 text-sm', app)
app = re.sub(r'px-4 py-2 text-xs', 'px-4 py-2 text-sm', app)

# Input fields
app = re.sub(r'px-2 py-1.5 text-xs', 'px-3 py-2 text-sm', app)  # Input sizing
app = re.sub(r'px-3 py-1.5 text-sm', 'px-3 py-2 text-sm', app)  # Standardize

# Standard input field class to match sidebar sizing
app = re.sub(r'px-4 py-3 text-base', 'px-3 py-2 text-sm', app)

with open('App.jsx', 'w', encoding='utf-8') as f:
    f.write(app)

print("   [OK] Header reduced further, fonts restored to readable size")
print("   [OK] Input fields standardized to match sidebar")

# ============================================
# 2. SIDEBAR - Increase height
# ============================================
print("[2/2] Adjusting Sidebar...")
with open('Sidebar.jsx', 'r', encoding='utf-8') as f:
    sidebar = f.read()

# Increase sidebar height
sidebar = sidebar.replace('h-[calc(100vh-8rem)]', 'h-[calc(100vh-5rem)]')  # Taller
sidebar = sidebar.replace('top-16', 'top-12')  # Adjust top position

# Slightly increase item padding for better readability
sidebar = sidebar.replace('px-2 py-1.5', 'px-3 py-2')

# Restore text size
sidebar = sidebar.replace('text-[11px]', 'text-sm')

# Keep icons reasonable size
sidebar = sidebar.replace('w-4 h-4', 'w-5 h-5')

with open('Sidebar.jsx', 'w', encoding='utf-8') as f:
    f.write(sidebar)

print("   [OK] Sidebar height increased")
print("   [OK] Sidebar text restored to readable size")

print("\n=== ADJUSTMENTS COMPLETE ===")
print("\nChanges Applied:")
print("[OK] Header: Even smaller (py-1)")
print("[OK] Fonts: Restored to text-sm (readable)")
print("[OK] Input fields: Standardized (px-3 py-2)")
print("[OK] Sidebar: Increased height")
print("[OK] Overall: Clean, professional, readable")
