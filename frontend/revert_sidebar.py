import os
import re

os.chdir('src')

print("=== REVERTING SIDEBAR TO STICKY + ADDING GAP ===\n")

# ============================================
# 1. SIDEBAR - Revert to sticky positioning
# ============================================
print("[1/2] Reverting Sidebar to sticky position...")

with open('Sidebar.jsx', 'r', encoding='utf-8') as f:
    sidebar = f.read()

# Revert fixed back to sticky
sidebar = sidebar.replace(
    '''    return (
        <aside
            className={`
        fixed left-0 top-[3.5rem] h-[calc(100vh-3.5rem)] 
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        hidden md:block z-30
      `}
        >''',
    '''    return (
        <aside
            className={`
        sticky top-12 h-[calc(100vh-5rem)] 
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        hidden md:block
      `}
        >'''
)

with open('Sidebar.jsx', 'w', encoding='utf-8') as f:
    f.write(sidebar)

print("   [OK] Sidebar reverted to sticky position")

# ============================================
# 2. APP.JSX - Add gap between sidebar and content
# ============================================
print("[2/2] Adding gap between sidebar and main content...")

with open('App.jsx', 'r', encoding='utf-8') as f:
    app = f.read()

# Revert the main container flex
app = app.replace(
    '<div className="flex w-full">',
    '<div className="w-full px-4 py-2 flex gap-4">'
)

# Remove the ml-64 margin we added
app = re.sub(
    r'className="ml-64 flex-1 h-screen overflow-y-auto px-4 py-2',
    'className="flex-1 overflow-y-auto',
    app
)

with open('App.jsx', 'w', encoding='utf-8') as f:
    f.write(app)

print("   [OK] Gap added between sidebar and content")

print("\n=== SIDEBAR LAYOUT RESTORED ===")
print("\nChanges Applied:")
print("[OK] Sidebar: Reverted to sticky positioning")
print("[OK] Layout: Restored flex with gap-4")
print("[OK] Gap: Small space between sidebar and content")
print("[OK] Scrolling: Both scroll naturally")
print("\nResult: Sidebar back to original behavior with gap!")
