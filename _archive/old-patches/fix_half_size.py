with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Fix 1: Half Cut CANVAS SVG - match Full Cut dimensions (viewBox 0 0 140 55)
old_canvas = 'width="320" height="110" viewBox="0 0 160 55"><line x1="25" y1="7" x2="135" y2="7" stroke="#00AA00" stroke-width="1"/><path d="M25,7 A20,20 0 0,0 25,47 L135,47 A20,20 0 0,0 135,7" fill="none" stroke="#FF0000" stroke-width="1"/>'
new_canvas = 'width="280" height="110" viewBox="0 0 140 55"><line x1="15" y1="7" x2="125" y2="7" stroke="#00AA00" stroke-width="1"/><path d="M15,7 A20,20 0 0,0 15,47 L125,47 A20,20 0 0,0 125,7" fill="none" stroke="#FF0000" stroke-width="1"/>'

if old_canvas in src:
    src = src.replace(old_canvas, new_canvas)
    print("Fixed Half Cut canvas SVG to match Full Cut size")
else:
    print("Canvas pattern not found")

# Fix 2: Half Cut PREVIEW SVG - match Full Cut preview (viewBox 0 0 140 55)
old_preview = 'viewBox="0 0 160 55" className="w-full h-10"><line x1="25" y1="7" x2="135" y2="7" stroke="#00AA00" strokeWidth="2"/><path d="M25,7 A20,20 0 0,0 25,47 L135,47 A20,20 0 0,0 135,7" fill="none" stroke="#FF0000" strokeWidth="2"/>'
new_preview = 'viewBox="0 0 140 55" className="w-full h-10"><line x1="15" y1="7" x2="125" y2="7" stroke="#00AA00" strokeWidth="2"/><path d="M15,7 A20,20 0 0,0 15,47 L125,47 A20,20 0 0,0 125,7" fill="none" stroke="#FF0000" strokeWidth="2"/>'

if old_preview in src:
    src = src.replace(old_preview, new_preview)
    print("Fixed Half Cut preview SVG to match Full Cut size")
else:
    print("Preview pattern not found")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"Total lines: {len(src.splitlines())}")
