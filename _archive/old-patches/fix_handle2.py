with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Fix 1: Half Cut Handle - viewBox too tight, arcs getting clipped
# Increase viewBox width and move elements inward
old_half = 'viewBox="0 0 140 55"><line x1="15" y1="7" x2="125" y2="7" stroke="#00AA00" stroke-width="2"/><path d="M15,7 A20,20 0 0,0 15,47 L125,47 A20,20 0 0,0 125,7" fill="none" stroke="#FF0000" stroke-width="2"/>'
new_half = 'viewBox="0 0 160 55"><line x1="25" y1="7" x2="135" y2="7" stroke="#00AA00" stroke-width="2"/><path d="M25,7 A20,20 0 0,0 25,47 L135,47 A20,20 0 0,0 135,7" fill="none" stroke="#FF0000" stroke-width="2"/>'
src = src.replace(old_half, new_half)

old_half_p = 'viewBox="0 0 140 55"><line x1="15" y1="7" x2="125" y2="7" stroke="#00AA00" strokeWidth="2"/><path d="M15,7 A20,20 0 0,0 15,47 L125,47 A20,20 0 0,0 125,7" fill="none" stroke="#FF0000" strokeWidth="2"/>'
new_half_p = 'viewBox="0 0 160 55"><line x1="25" y1="7" x2="135" y2="7" stroke="#00AA00" strokeWidth="2"/><path d="M25,7 A20,20 0 0,0 25,47 L135,47 A20,20 0 0,0 135,7" fill="none" stroke="#FF0000" strokeWidth="2"/>'
src = src.replace(old_half_p, new_half_p)

# Also fix width in the canvas version
src = src.replace('width="280" height="110" viewBox="0 0 140 55"><line', 'width="320" height="110" viewBox="0 0 160 55"><line')

# Fix 2: Finger Hole Semi - change to full cut (all red, no green crease line)
# Canvas SVG
old_semi_canvas = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 60 40"><line x1="5" y1="5" x2="55" y2="5" stroke="#00AA00" stroke-width="2"/><path d="M5,5 A25,30 0 0,0 55,5" fill="none" stroke="#FF0000" stroke-width="2"/></svg>'
new_semi_canvas = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 60 40"><line x1="5" y1="5" x2="55" y2="5" stroke="#FF0000" stroke-width="2"/><path d="M5,5 A25,30 0 0,0 55,5" fill="none" stroke="#FF0000" stroke-width="2"/></svg>'
src = src.replace(old_semi_canvas, new_semi_canvas)

# Preview SVG
old_semi_preview = '<line x1="5" y1="5" x2="55" y2="5" stroke="#00AA00" strokeWidth="2"/><path d="M5,5 A25,30 0 0,0 55,5" fill="none" stroke="#FF0000" strokeWidth="2"/>'
new_semi_preview = '<line x1="5" y1="5" x2="55" y2="5" stroke="#FF0000" strokeWidth="2"/><path d="M5,5 A25,30 0 0,0 55,5" fill="none" stroke="#FF0000" strokeWidth="2"/>'
src = src.replace(old_semi_preview, new_semi_preview)

# Fix description
src = src.replace('Top: crease (green) Arc: cut (red)', 'All cut lines (red)')
# Fix label if needed
old_label = '>Finger Hole (Semi)<'
# Keep label same

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"Total lines: {len(src.splitlines())}")
