import os
import re

os.chdir('src')

print("=== REMOVING STEPPER TAB BACKGROUNDS ===\n")

print("[1/1] Updating App.jsx stepper tabs...")

with open('App.jsx', 'r', encoding='utf-8') as f:
    app = f.read()

# Find the stepper tab div and replace bg-gray-50 with bg-transparent
# Line 1545: className=\"flex flex-col items-center bg-gray-50 px-2...
app = app.replace(
    'className=\"flex flex-col items-center bg-gray-50 px-2 cursor-pointer\"',
    'className=\"flex flex-col items-center bg-transparent px-0 cursor-pointer\"'
)

# Also handle any variations
app = re.sub(
    r'className=\"flex flex-col items-center bg-\w+-\d+ px-\d+ cursor-pointer\"',
    'className=\"flex flex-col items-center bg-transparent px-0 cursor-pointer\"',
    app
)

with open('App.jsx', 'w', encoding='utf-8') as f:
    f.write(app)

print("   [OK] Stepper tab backgrounds removed")

print("\n=== STEPPER CLEANUP COMPLETE ===")
print("\nChanges Applied:")
print("[OK] Removed bg-gray-50 from stepper tabs")
print("[OK] Set to bg-transparent")
print("[OK] Removed padding (px-0)")
print("[OK] Kept icon circles and text only")
print("\nResult: Clean stepper with just icons and labels!")
