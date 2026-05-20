with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

fixes = 0

# Fix 1: Lock icon - amber -> blue highlight
old_lock_class = 'className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${dielineLocked ? "bg-amber-50 text-amber-600" : "text-gray-400 hover:bg-gray-100"}`}'
new_lock_class = 'className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${dielineLocked ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-100"}`}'
if old_lock_class in content:
    content = content.replace(old_lock_class, new_lock_class)
    fixes += 1
    print("Fix 1: Lock highlight amber -> blue")

# Fix 2: Panels - move right to avoid ruler (left-0 -> left-2, add margin)
content = content.replace(
    'className="absolute left-0 top-10 z-50 bg-white rounded-xl shadow-2xl border p-3 w-72 max-h-[520px] overflow-y-auto">',
    'className="absolute left-14 top-0 z-50 bg-white rounded-xl shadow-2xl border p-3 w-72 max-h-[520px] overflow-y-auto">'
)
content = content.replace(
    'className="absolute left-0 top-10 z-50 bg-white rounded-xl shadow-xl border p-3 w-52">',
    'className="absolute left-14 top-0 z-50 bg-white rounded-xl shadow-xl border p-3 w-52">'
)
content = content.replace(
    'className="absolute left-0 top-10 z-50 bg-white rounded-xl shadow-xl border p-3 w-56">',
    'className="absolute left-14 top-0 z-50 bg-white rounded-xl shadow-xl border p-3 w-56">'
)
content = content.replace(
    'className="absolute left-0 top-10 z-50 bg-white rounded-xl shadow-2xl border p-4 w-60">',
    'className="absolute left-14 top-0 z-50 bg-white rounded-xl shadow-2xl border p-4 w-60">'
)
content = content.replace(
    'className="absolute left-0 top-10 z-50 bg-white rounded-xl shadow-xl border p-3 w-72 max-h-[80vh] overflow-y-auto">',
    'className="absolute left-14 top-0 z-50 bg-white rounded-xl shadow-xl border p-3 w-72 max-h-[80vh] overflow-y-auto">'
)
content = content.replace(
    'className="absolute left-0 top-10 z-50 bg-white rounded-xl shadow-xl border p-3 w-80 max-h-[80vh] overflow-y-auto">',
    'className="absolute left-14 top-0 z-50 bg-white rounded-xl shadow-xl border p-3 w-80 max-h-[80vh] overflow-y-auto">'
)
fixes += 1
print("Fix 2: Panels moved right (left-14) to clear ruler")

# Fix 3: Dieline upload - check the upload handler
# The issue might be that infoObjs was inserted incorrectly
# Let's check the exact line
idx = content.find('const infoObjs: any[] = []; pendingDielineRef.current')
if idx != -1:
    # Get context around it
    ctx = content[idx-200:idx+300]
    print(f"\nFix 3: Current upload code context:")
    print(ctx[:500])

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)

print(f"\nTotal fixes: {fixes}")
