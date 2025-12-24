import re

# Read the file
with open('main.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line with "# Include home care router" and add Patient Admission router after it
new_lines = []
i = 0
while i < len(lines):
    new_lines.append(lines[i])
    
    # After the Home Care router block, add Patient Admission router
    if 'print("[Home Care Module] Not loaded - module unavailable")' in lines[i]:
        # Add Patient Admission router block
        new_lines.append('\n')
        new_lines.append('# Include patient admission router\n')
        new_lines.append('if PATIENTADMISSION_MODULE_AVAILABLE:\n')
        new_lines.append('    app.include_router(patientadmission_router, prefix="/api", tags=["patientadmission"])\n')
        new_lines.append('    print("[Patient Admission Module] Loaded successfully")\n')
        new_lines.append('else:\n')
        new_lines.append('    print("[Patient Admission Module] Not loaded - module unavailable")\n')
    
    i += 1

# Write back
with open('main.py', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Added Patient Admission router to main.py successfully!")
