import os
import re

os.chdir('src')

print("=== REDUCING HEIGHT ===\n")

print("[1/1] Reducing section heights...")
with open('App.jsx', 'r', encoding='utf-8') as f:
    app = f.read()

# Reduce input field height while keeping readability
app = app.replace('px-4 py-2.5', 'px-4 py-2')

# Reduce page header/title section padding
app = re.sub(r'p-6 bg-white', 'p-4 bg-white', app)
app = re.sub(r'p-5 bg-white', 'p-3 bg-white', app)

# Reduce spacing in sections
app = re.sub(r'space-y-3', 'space-y-2', app)
app = re.sub(r'mb-4', 'mb-2', app)
app = re.sub(r'mb-3', 'mb-2', app)

# Reduce button heights
app = re.sub(r'py-2.5', 'py-2', app)

# Reduce grid row gaps
app = re.sub(r'gap-y-4', 'gap-y-3', app)
app = re.sub(r'gap-y-3', 'gap-y-2', app)

with open('App.jsx', 'w', encoding='utf-8') as f:
    f.write(app)

print("   [OK] Heights reduced across all sections")

# Also update sidebar to match
with open('Sidebar.jsx', 'r', encoding='utf-8') as f:
    sidebar = f.read()

sidebar = sidebar.replace('px-4 py-2.5', 'px-4 py-2')

with open('Sidebar.jsx', 'w', encoding='utf-8') as f:
    f.write(sidebar)

print("   [OK] Sidebar heights matched")

print("\n=== HEIGHT REDUCTION COMPLETE ===")
print("\nChanges Applied:")
print("[OK] Input fields: py-2.5 → py-2")
print("[OK] Page sections: Reduced padding")
print("[OK] Spacing: Minimized gaps")
print("[OK] Sidebar: Matched input heights")
