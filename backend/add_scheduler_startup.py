import re

# Read the file
with open('main.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the startup_event function and add scheduler startup
new_lines = []
i = 0
added_scheduler = False

while i < len(lines):
    new_lines.append(lines[i])
    
    # After the startup event function definition, add scheduler startup
    if 'async def startup_event():' in lines[i] and not added_scheduler:
        # Skip to the end of the try block
        while i < len(lines) and 'except Exception as e:' not in lines[i]:
            i += 1
            new_lines.append(lines[i])
        
        # Add scheduler startup before the except block
        new_lines.insert(len(new_lines) - 1, '        \n')
        new_lines.insert(len(new_lines) - 1, '        # Start Home Care billing scheduler\n')
        new_lines.insert(len(new_lines) - 1, '        if HOMECARE_SCHEDULER_AVAILABLE:\n')
        new_lines.insert(len(new_lines) - 1, '            try:\n')
        new_lines.insert(len(new_lines) - 1, '                start_billing_scheduler()\n')
        new_lines.insert(len(new_lines) - 1, '                print("[Home Care Scheduler] Started successfully")\n')
        new_lines.insert(len(new_lines) - 1, '            except Exception as e:\n')
        new_lines.insert(len(new_lines) - 1, '                print(f"[Home Care Scheduler] Failed to start: {e}")\n')
        new_lines.insert(len(new_lines) - 1, '        \n')
        new_lines.insert(len(new_lines) - 1, '        # Start Patient Admission billing scheduler\n')
        new_lines.insert(len(new_lines) - 1, '        if PATIENTADMISSION_SCHEDULER_AVAILABLE:\n')
        new_lines.insert(len(new_lines) - 1, '            try:\n')
        new_lines.insert(len(new_lines) - 1, '                start_pa_billing_scheduler()\n')
        new_lines.insert(len(new_lines) - 1, '                print("[Patient Admission Scheduler] Started successfully")\n')
        new_lines.insert(len(new_lines) - 1, '            except Exception as e:\n')
        new_lines.insert(len(new_lines) - 1, '                print(f"[Patient Admission Scheduler] Failed to start: {e}")\n')
        new_lines.insert(len(new_lines) - 1, '        \n')
        
        added_scheduler = True
    
    i += 1

# Write back
with open('main.py', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Added scheduler startup to main.py successfully!")
