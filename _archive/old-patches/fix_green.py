with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Fix canvas SVG - green line only on straight part (35 to 105)
old_c = '<rect x="15" y="7" width="110" height="40" rx="20" ry="20" fill="none" stroke="#FF0000" stroke-width="1"/><line x1="15" y1="7" x2="125" y2="7" stroke="#00AA00" stroke-width="2"/></svg>'
new_c = '<rect x="15" y="7" width="110" height="40" rx="20" ry="20" fill="none" stroke="#FF0000" stroke-width="1"/><line x1="35" y1="7" x2="105" y2="7" stroke="#00AA00" stroke-width="1"/></svg>'

if old_c in src:
    src = src.replace(old_c, new_c)
    print("Fixed canvas green line")
else:
    print("Canvas not found")

# Fix preview SVG
old_p = '<rect x="15" y="7" width="110" height="40" rx="20" ry="20" fill="none" stroke="#FF0000" strokeWidth="2"/><line x1="15" y1="7" x2="125" y2="7" stroke="#00AA00" strokeWidth="3"/>'
new_p = '<rect x="15" y="7" width="110" height="40" rx="20" ry="20" fill="none" stroke="#FF0000" strokeWidth="2"/><line x1="35" y1="7" x2="105" y2="7" stroke="#00AA00" strokeWidth="3"/>'

if old_p in src:
    src = src.replace(old_p, new_p)
    print("Fixed preview green line")
else:
    print("Preview not found")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"Total lines: {len(src.splitlines())}")
