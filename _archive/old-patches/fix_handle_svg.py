with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

changes = 0

# Fix 1: Full Cut Handle SVG - add padding to viewBox
old = 'viewBox="0 0 140 50"><rect x="15" y="5" width="110" height="40" rx="20" ry="20" fill="none" stroke="#FF0000" stroke-width="2"/>'
new = 'viewBox="0 0 140 55"><rect x="15" y="7" width="110" height="40" rx="20" ry="20" fill="none" stroke="#FF0000" stroke-width="2"/>'
src = src.replace(old, new)

# Fix 2: Half Cut Handle - fix viewBox and path
old_half_svg = 'viewBox="0 0 140 50"><line x1="15" y1="5" x2="125" y2="5" stroke="#00AA00" stroke-width="2"/><path d="M15,5 A20,20 0 0,0 15,45 L125,45 A20,20 0 0,0 125,5" fill="none" stroke="#FF0000" stroke-width="2"/>'
new_half_svg = 'viewBox="0 0 140 55"><line x1="15" y1="7" x2="125" y2="7" stroke="#00AA00" stroke-width="2"/><path d="M15,7 A20,20 0 0,0 15,47 L125,47 A20,20 0 0,0 125,7" fill="none" stroke="#FF0000" stroke-width="2"/>'
src = src.replace(old_half_svg, new_half_svg)

# Also fix the preview SVGs (strokeWidth versions for JSX)
old_half_preview = 'viewBox="0 0 140 50"><line x1="15" y1="5" x2="125" y2="5" stroke="#00AA00" strokeWidth="2"/><path d="M15,5 A20,20 0 0,0 15,45 L125,45 A20,20 0 0,0 125,5" fill="none" stroke="#FF0000" strokeWidth="2"/>'
new_half_preview = 'viewBox="0 0 140 55"><line x1="15" y1="7" x2="125" y2="7" stroke="#00AA00" strokeWidth="2"/><path d="M15,7 A20,20 0 0,0 15,47 L125,47 A20,20 0 0,0 125,7" fill="none" stroke="#FF0000" strokeWidth="2"/>'
src = src.replace(old_half_preview, new_half_preview)

old_full_preview = 'viewBox="0 0 140 50"><rect x="15" y="5" width="110" height="40" rx="20" ry="20" fill="none" stroke="#FF0000" strokeWidth="2"/>'
new_full_preview = 'viewBox="0 0 140 55"><rect x="15" y="7" width="110" height="40" rx="20" ry="20" fill="none" stroke="#FF0000" strokeWidth="2"/>'
src = src.replace(old_full_preview, new_full_preview)

# Fix 3: Add width/height to all handle SVGs for proper Fabric.js rendering
# Full Cut
src = src.replace(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 55"><rect x="15" y="7" width="110" height="40" rx="20" ry="20" fill="none" stroke="#FF0000" stroke-width="2"/></svg>`;',
    '<svg xmlns="http://www.w3.org/2000/svg" width="280" height="110" viewBox="0 0 140 55"><rect x="15" y="7" width="110" height="40" rx="20" ry="20" fill="none" stroke="#FF0000" stroke-width="2"/></svg>`;'
)

# Half Cut
src = src.replace(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 55"><line x1="15" y1="7" x2="125" y2="7" stroke="#00AA00" stroke-width="2"/><path d="M15,7 A20,20 0 0,0 15,47 L125,47 A20,20 0 0,0 125,7" fill="none" stroke="#FF0000" stroke-width="2"/></svg>`;',
    '<svg xmlns="http://www.w3.org/2000/svg" width="280" height="110" viewBox="0 0 140 55"><line x1="15" y1="7" x2="125" y2="7" stroke="#00AA00" stroke-width="2"/><path d="M15,7 A20,20 0 0,0 15,47 L125,47 A20,20 0 0,0 125,7" fill="none" stroke="#FF0000" stroke-width="2"/></svg>`;'
)

# Circle
src = src.replace(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><circle cx="30" cy="30" r="22" fill="none" stroke="#FF0000" stroke-width="2"/></svg>`;',
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 60 60"><circle cx="30" cy="30" r="22" fill="none" stroke="#FF0000" stroke-width="2"/></svg>`;'
)

# Semi-circle
src = src.replace(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40"><line x1="5" y1="5" x2="55" y2="5" stroke="#00AA00" stroke-width="2"/><path d="M5,5 A25,30 0 0,0 55,5" fill="none" stroke="#FF0000" stroke-width="2"/></svg>`;',
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 60 40"><line x1="5" y1="5" x2="55" y2="5" stroke="#00AA00" stroke-width="2"/><path d="M5,5 A25,30 0 0,0 55,5" fill="none" stroke="#FF0000" stroke-width="2"/></svg>`;'
)

# Square
src = src.replace(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><rect x="8" y="8" width="44" height="44" fill="none" stroke="#FF0000" stroke-width="2"/></svg>`;',
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 60 60"><rect x="8" y="8" width="44" height="44" fill="none" stroke="#FF0000" stroke-width="2"/></svg>`;'
)

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"Total lines: {len(src.splitlines())}")
