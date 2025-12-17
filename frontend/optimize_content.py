import os
import re

os.chdir('src')

print("=== OPTIMIZING MAIN CONTENT AREA ===\n")

# Based on the screenshot, we need to reduce:
# 1. Page titles ("Enquiries")
# 2. Subtitles ("New Patient Entry Process")
# 3. View Sheet button
# 4. Tab navigation
# 5. Form field labels and inputs

print("[1/1] Optimizing App.jsx main content area...")
with open('App.jsx', 'r', encoding='utf-8') as f:
    app = f.read()

# Page titles - reduce from large to medium
app = re.sub(r'text-3xl font-bold', 'text-lg font-semibold', app)
app = re.sub(r'text-2xl font-semibold', 'text-base font-medium', app)

# Subtitles - make smaller
app = re.sub(r'text-xl text-gray-600', 'text-xs text-gray-600', app)
app = re.sub(r'text-lg text-gray-600', 'text-xs text-gray-600', app)
app = re.sub(r'text-gray-600 text-lg', 'text-gray-600 text-xs', app)

# View Sheet button and action buttons
app = app.replace('px-5 py-2.5', 'px-3 py-1.5')  # Buttons
app = app.replace('text-base font-semibold', 'text-xs font-medium')  # Button text

# Tab navigation - smaller
app = re.sub(r'px-4 py-3 text-sm', 'px-3 py-1.5 text-xs', app)  # Tab items
app = re.sub(r'px-6 py-3 text-base', 'px-4 py-2 text-xs', app)  # Tab buttons

# Form labels - smaller
app = re.sub(r'text-sm font-semibold', 'text-xs font-medium', app)
app = re.sub(r'text-sm font-medium', 'text-xs font-normal', app)
app = re.sub(r'font-semibold text-gray-700', 'font-medium text-gray-700 text-xs', app)

# Input fields - reduce height
app = re.sub(r'px-4 py-3 text-base', 'px-3 py-1.5 text-sm', app)  # Input padding
app = re.sub(r'px-3 py-2 text-base', 'px-2 py-1.5 text-xs', app)  # Input padding variant

# Section headers
app = re.sub(r'text-xl font-bold', 'text-sm font-semibold', app)

# Form grid layout - tighter
app = re.sub(r'grid-cols-2 gap-6', 'grid-cols-2 gap-3', app)
app = re.sub(r'grid-cols-2 gap-4', 'grid-cols-2 gap-2', app)

# Card/section padding
app = re.sub(r'p-6 bg-white', 'p-3 bg-white', app)
app = re.sub(r'p-5 bg-white', 'p-3 bg-white', app)

# Page content container
app = re.sub(r'p-6 space-y', 'p-3 space-y', app)

# Navigation icons - smaller
app = re.sub(r'w-6 h-6', 'w-4 h-4', app)

with open('App.jsx', 'w', encoding='utf-8') as f:
    f.write(app)

print("   [OK] Main content area optimized")
print("\n=== CONTENT OPTIMIZATION COMPLETE ===")
print("\nChanges Applied:")
print("[OK] Page titles: Reduced to text-lg")
print("[OK] Subtitles: Reduced to text-xs")
print("[OK] Buttons: Smaller padding (px-3 py-1.5)")
print("[OK] Tab navigation: Compact text-xs")
print("[OK] Form labels: text-xs")
print("[OK] Input fields: Reduced height")
print("[OK] Grid gaps: Minimized to gap-2/gap-3")
print("[OK] Section padding: Reduced to p-3")
print("[OK] Icons: Smaller (w-4 h-4)")
