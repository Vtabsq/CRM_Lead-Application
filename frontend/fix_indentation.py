import re

# Read the file
with open('src/AdmissionRegistration.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and fix the closing brace and export statement
# Pattern: look for "        );\n    };\n\n    export default AdmissionRegistration;"
# Replace with: "        );\n};\n\nexport default AdmissionRegistration;"

# Use a more specific pattern to avoid false matches
pattern = r'(            </div>\r?\n        \);\r?\n)    };\r?\n\r?\n    export default AdmissionRegistration;'
replacement = r'\1};\n\nexport default AdmissionRegistration;'

new_content = re.sub(pattern, replacement, content)

if new_content != content:
    with open('src/AdmissionRegistration.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed indentation successfully!")
else:
    print("No changes needed or pattern not found.")
    print("Searching for the pattern...")
    # Debug: show the end of the file
    lines = content.split('\n')
    print(f"Last 15 lines:")
    for i, line in enumerate(lines[-15:], start=len(lines)-14):
        print(f"{i}: {repr(line)}")
