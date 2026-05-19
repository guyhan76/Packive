with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

fixes = 0

# Fix 1: Panel z-index and positioning - raise above ruler
# Panels with "absolute left-1 top-1 z-30" need to be "absolute left-0 top-8 z-50"
panels_fixed = 0

# Shape panel (L2320)
old1 = '<div className="absolute left-1 top-1 z-30 bg-white rounded-xl shadow-2xl border p-3 w-72 max-h-[520px] overflow-y-auto">'
new1 = '<div className="absolute left-0 top-10 z-50 bg-white rounded-xl shadow-2xl border p-3 w-72 max-h-[520px] overflow-y-auto">'
if old1 in content:
    content = content.replace(old1, new1)
    panels_fixed += 1

# Other panels with left-1 top-1 z-30
content = content.replace(
    'className="absolute left-1 top-1 z-30 bg-white rounded-xl shadow-xl border p-3 w-52"',
    'className="absolute left-0 top-10 z-50 bg-white rounded-xl shadow-xl border p-3 w-52"'
)
content = content.replace(
    'className="absolute left-1 top-1 z-30 bg-white rounded-xl shadow-xl border p-3 w-56"',
    'className="absolute left-0 top-10 z-50 bg-white rounded-xl shadow-xl border p-3 w-56"'
)
content = content.replace(
    'className="absolute left-1 top-1 z-30 bg-white rounded-xl shadow-2xl border p-4 w-60"',
    'className="absolute left-0 top-10 z-50 bg-white rounded-xl shadow-2xl border p-4 w-60"'
)

# Symbol panel and Handle panel (left-14 top-16 z-30)
content = content.replace(
    'className="absolute left-14 top-16 z-30 bg-white rounded-xl shadow-xl border p-3 w-72 max-h-[80vh] overflow-y-auto"',
    'className="absolute left-0 top-10 z-50 bg-white rounded-xl shadow-xl border p-3 w-72 max-h-[80vh] overflow-y-auto"'
)
content = content.replace(
    'className="absolute left-14 top-16 z-30 bg-white rounded-xl shadow-xl border p-3 w-80 max-h-[80vh] overflow-y-auto"',
    'className="absolute left-0 top-10 z-50 bg-white rounded-xl shadow-xl border p-3 w-80 max-h-[80vh] overflow-y-auto"'
)
fixes += 1
print(f"Fix 1: Panel z-index 30->50, position adjusted to avoid ruler")

# Fix 2: infoObjs undefined - check and define it
if 'infoObjs' in content:
    # Check if infoObjs is defined before use
    idx = content.find('pendingDielineRef.current = { group, origMmW, origMmH, svgOrigW, svgOrigH, infoObjs }')
    if idx != -1:
        # Check if infoObjs is defined earlier in the same block
        block_start = content.rfind('try {', 0, idx)
        block = content[block_start:idx]
        if 'const infoObjs' not in block and 'let infoObjs' not in block:
            # infoObjs is not defined - replace with empty array
            content = content.replace(
                'pendingDielineRef.current = { group, origMmW, origMmH, svgOrigW, svgOrigH, infoObjs }',
                'const infoObjs: any[] = []; pendingDielineRef.current = { group, origMmW, origMmH, svgOrigW, svgOrigH, infoObjs }'
            )
            fixes += 1
            print("Fix 2: Added infoObjs definition before use")
        else:
            print("Fix 2: infoObjs already defined")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)

print(f"\nTotal fixes: {fixes}")
