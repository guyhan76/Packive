with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

fixes = 0

# Fix 1: Panels - top-0 -> top-8 to clear ruler (ruler is about 26px/top-7)
content = content.replace(
    'className="absolute left-14 top-0 z-50 bg-white rounded-xl shadow-2xl border p-3 w-72 max-h-[520px] overflow-y-auto">',
    'className="absolute left-14 top-8 z-50 bg-white rounded-xl shadow-2xl border p-3 w-72 max-h-[520px] overflow-y-auto">'
)
content = content.replace(
    'className="absolute left-14 top-0 z-50 bg-white rounded-xl shadow-xl border p-3 w-52">',
    'className="absolute left-14 top-8 z-50 bg-white rounded-xl shadow-xl border p-3 w-52">'
)
content = content.replace(
    'className="absolute left-14 top-0 z-50 bg-white rounded-xl shadow-xl border p-3 w-56">',
    'className="absolute left-14 top-8 z-50 bg-white rounded-xl shadow-xl border p-3 w-56">'
)
content = content.replace(
    'className="absolute left-14 top-0 z-50 bg-white rounded-xl shadow-2xl border p-4 w-60">',
    'className="absolute left-14 top-8 z-50 bg-white rounded-xl shadow-2xl border p-4 w-60">'
)
content = content.replace(
    'className="absolute left-14 top-0 z-50 bg-white rounded-xl shadow-xl border p-3 w-72 max-h-[80vh] overflow-y-auto">',
    'className="absolute left-14 top-8 z-50 bg-white rounded-xl shadow-xl border p-3 w-72 max-h-[80vh] overflow-y-auto">'
)
content = content.replace(
    'className="absolute left-14 top-0 z-50 bg-white rounded-xl shadow-xl border p-3 w-80 max-h-[80vh] overflow-y-auto">',
    'className="absolute left-14 top-8 z-50 bg-white rounded-xl shadow-xl border p-3 w-80 max-h-[80vh] overflow-y-auto">'
)
fixes += 1
print("Fix 1: Panels top-0 -> top-8 (below ruler)")

# Fix 2: Right-align header icons to match right panel edge
# Current right section has gap-1, add mr-0 to align with panel
# The right panel is about 280px wide
# Change the right section to have no right margin and align to panel edge
old_right = '''        {/* RIGHT: Undo/Redo + Zoom + Save/Export */}
        <div className="flex items-center gap-1">'''
new_right = '''        {/* RIGHT: Undo/Redo + Zoom + Save/Export */}
        <div className="flex items-center gap-0.5">'''

if old_right in content:
    content = content.replace(old_right, new_right)
    fixes += 1
    print("Fix 2: Right icons gap tightened")

# Also adjust header padding to align with right panel
old_header = 'className="h-11 bg-white border-b border-gray-200 flex items-center px-3 shrink-0 z-20"'
new_header = 'className="h-11 bg-white border-b border-gray-200 flex items-center pl-3 pr-2 shrink-0 z-20"'
if old_header in content:
    content = content.replace(old_header, new_header)
    fixes += 1
    print("Fix 3: Header right padding reduced for panel alignment")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)

print(f"\nTotal fixes: {fixes}")
