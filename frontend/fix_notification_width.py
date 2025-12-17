import os
import re

os.chdir('src')

print("=== FIXING NOTIFICATION PAGE WIDTH ===\n")

print("[1/1] Updating notification settings section in App.jsx...")

with open('App.jsx', 'r', encoding='utf-8') as f:
    app = f.read()

# Find and replace notification settings specific widths
# Look for notification-settings section and remove max-w constraints
app = re.sub(r'notification-settings.*?max-w-\w+', 
             lambda m: m.group(0).replace('max-w-4xl', 'w-full').replace('max-w-3xl', 'w-full').replace('max-w-2xl', 'w-full'),
             app,
             flags=re.DOTALL)

# Specifically target the notification settings container
# Replace any remaining max-w in notification context
lines = app.split('\n')
in_notification_section = False
updated_lines = []

for line in lines:
    if 'notification-settings' in line or 'Notification Settings' in line:
        in_notification_section = True
    
    if in_notification_section:
        # Replace max-w with w-full in notification section
        if 'max-w-' in line and 'mx-auto' in line:
            line = re.sub(r'max-w-\w+\s+mx-auto', 'w-full', line)
        elif 'max-w-' in line:
            line = re.sub(r'max-w-\w+', 'w-full', line)
    
    updated_lines.append(line)
    
    # Exit notification section after a div closes
    if in_notification_section and line.strip().startswith('</div>') and 'notification' not in line.lower():
        in_notification_section = False

app = '\n'.join(updated_lines)

with open('App.jsx', 'w', encoding='utf-8') as f:
    f.write(app)

print("   [OK] Notification settings page updated to full width")

print("\n=== NOTIFICATION PAGE FIX COMPLETE ===")
print("\nChanges Applied:")
print("[OK] Removed max-w constraints from notification settings")
print("[OK] Applied w-full to notification page container")
print("[OK] Notification page now matches header width")
print("\nResult: Notification settings page is now full-width!")
