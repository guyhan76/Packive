with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Revert Half Cut canvas SVG back to capsule shape but keep size matched
old_half = '<svg xmlns="http://www.w3.org/2000/svg" width="280" height="110" viewBox="0 0 140 55"><line x1="35" y1="7" x2="105" y2="7" stroke="#00AA00" stroke-width="1"/><path d="M35,7 A20,20 0 0,1 15,27 A20,20 0 0,0 35,47 L105,47 A20,20 0 0,0 125,27 A20,20 0 0,1 105,7" fill="none" stroke="#FF0000" stroke-width="1"/></svg>'
new_half = '<svg xmlns="http://www.w3.org/2000/svg" width="280" height="110" viewBox="0 0 140 55"><line x1="35" y1="7" x2="105" y2="7" stroke="#00AA00" stroke-width="1"/><path d="M35,7 L15,7 A20,20 0 0,0 15,47 L105,47 L125,47 A20,20 0 0,0 125,7 L105,7" fill="none" stroke="#FF0000" stroke-width="1"/></svg>'

if old_half in src:
    src = src.replace(old_half, new_half)
    print("Fixed Half Cut canvas SVG")
else:
    print("Canvas not found")

# Revert Half Cut preview SVG
old_half_p = 'viewBox="0 0 140 55" className="w-full h-10"><line x1="35" y1="7" x2="105" y2="7" stroke="#00AA00" strokeWidth="2"/><path d="M35,7 A20,20 0 0,1 15,27 A20,20 0 0,0 35,47 L105,47 A20,20 0 0,0 125,27 A20,20 0 0,1 105,7" fill="none" stroke="#FF0000" strokeWidth="2"/>'
new_half_p = 'viewBox="0 0 140 55" className="w-full h-10"><line x1="35" y1="7" x2="105" y2="7" stroke="#00AA00" strokeWidth="2"/><path d="M35,7 L15,7 A20,20 0 0,0 15,47 L105,47 L125,47 A20,20 0 0,0 125,7 L105,7" fill="none" stroke="#FF0000" strokeWidth="2"/>'

if old_half_p in src:
    src = src.replace(old_half_p, new_half_p)
    print("Fixed Half Cut preview SVG")
else:
    print("Preview not found")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"Total lines: {len(src.splitlines())}")
