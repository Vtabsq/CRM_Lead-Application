import os
import re

os.chdir('src')

print("=== IMPLEMENTING LOGIN/LOGOUT AND FIXED SIDEBAR ===\n")

# ============================================
# 1. APP.JSX - Side-by-side Login/Logout + Fixed layout
# ============================================
print("[1/2] Updating App.jsx...")

with open('App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the header authentication section and replace it with side-by-side buttons
# This is around lines 1347-1381

old_auth_section = '''            {isAuthenticated ? (
              <div className="flex items-center justify-between gap-2 bg-white/20 px-3 py-1.5 backdrop-blur min-w-[420px]">
                <div className="flex items-center gap-2">
                  <div className="text-white font-semibold">
                    <span className="text-base opacity-90">User:</span>
                    <span className="ml-1 text-xs">{loginUser}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-semibold">
                    Online
                  </span>
                </div>
                <div className="text-white text-base opacity-90">Date: <span className="font-semibold ml-1">{todayDisplay}</span></div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5  font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  title="Logout"
                >
                  <XCircle className="w-5 h-5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 backdrop-blur">
                <div className="text-white text-base opacity-90">Date: <span className="font-semibold ml-1">{todayDisplay}</span></div>
                <button
                  onClick={() => {/* Login button - form already visible */ }}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5  font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  title="Login to continue"
                  disabled
                >
                  <User className="w-5 h-5" />
                  Login Below
                </button>
              </div>
            )}'''

new_auth_section = '''            <div className="flex items-center gap-3 bg-white/20 px-4 py-2 backdrop-blur rounded-md">
              <div className="text-white text-sm opacity-90">
                User: <span className="font-semibold">{isAuthenticated ? loginUser : 'Guest'}</span>
              </div>
              <div className="text-white text-sm opacity-90">
                Date: <span className="font-semibold">{todayDisplay}</span>
              </div>
              <div className="flex gap-2">
                <button
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    isAuthenticated 
                      ? 'bg-green-500 text-white shadow-md' 
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                  disabled={!isAuthenticated}
                >
                  <User className="w-4 h-4 inline mr-1" />
                  Login
                </button>
                <button
                  onClick={handleLogout}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    isAuthenticated
                      ? 'bg-gray-400 hover:bg-red-500 text-white shadow-md'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                  disabled={!isAuthenticated}
                >
                  <XCircle className="w-4 h-4 inline mr-1" />
                  Logout
                </button>
              </div>
            </div>'''

content = content.replace(old_auth_section, new_auth_section)

# Update main container to use fixed sidebar layout
# Replace: <div className="w-full px-1 py-2 flex gap-2">
# With: <div className="flex w-full">

content = content.replace(
    '<div className="w-full px-1 py-2 flex gap-2">',
    '<div className="flex w-full">'
)

# Find flex-1 overflow-y-auto class and update it
content = re.sub(
    r'className="flex-1 overflow-y-auto',
    'className="ml-64 flex-1 h-screen overflow-y-auto px-4 py-2',
    content,
    count=1
)

with open('App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("   [OK] App.jsx updated with side-by-side buttons and fixed layout")

# ============================================
# 2. SIDEBAR - Make it fixed
# ============================================
print("[2/2] Updating Sidebar.jsx to fixed position...")

with open('Sidebar.jsx', 'r', encoding='utf-8') as f:
    sidebar = f.read()

# Replace sticky with fixed positioning
sidebar = sidebar.replace(
    '''    return (
        <aside
            className={`
        sticky top-1.54 h-[calc(100vh-5rem)] 
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        hidden md:block
      `}
        >''',
    '''    return (
        <aside
            className={`
        fixed left-0 top-[3.5rem] h-[calc(100vh-3.5rem)] 
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        hidden md:block z-30
      `}
        >'''
)

# Update sidebar scrolling
sidebar = sidebar.replace(
    '<div className="bg-white  shadow-xl p-1.5 border-2 border-blue-200 h-full flex flex-col">',
    '<div className="bg-white shadow-xl p-1.5 border-2 border-blue-200 h-full flex flex-col overflow-y-auto">'
)

with open('Sidebar.jsx', 'w', encoding='utf-8') as f:
    f.write(sidebar)

print("   [OK] Sidebar.jsx updated to fixed position")

print("\n=== IMPLEMENTATION COMPLETE ===")
print("\nChanges Applied:")
print("[1] Login/Logout: Side-by-side buttons")
print("    - LOGIN highlighted green when logged in")
print("    - Logout gray, turns red on hover")
print("    - Same size, medium rounded corners")
print("[2] Fixed Sidebar: Left sidebar now fixed")
print("    - Fixed positioning (left-0)")
print("    - Main content has ml-64 margin")
print("    - Only main content scrolls")
print("\nResult: Professional layout with fixed navigation!")
