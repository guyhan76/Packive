with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Fix the Half Cut PREVIEW SVG (JSX version with strokeWidth)
old_preview = 'viewBox="0 0 140 50" className="w-full h-10"><line x1="15" y1="5" x2="125" y2="5" stroke="#00AA00" strokeWidth="2"/><path d="M15,5 A20,20 0 0,0 15,45 L125,45 A20,20 0 0,0 125,5" fill="none" stroke="#FF0000" strokeWidth="2"/>'
new_preview = 'viewBox="0 0 160 55" className="w-full h-10"><line x1="25" y1="7" x2="135" y2="7" stroke="#00AA00" strokeWidth="2"/><path d="M25,7 A20,20 0 0,0 25,47 L135,47 A20,20 0 0,0 135,7" fill="none" stroke="#FF0000" strokeWidth="2"/>'

if old_preview in src:
    src = src.replace(old_preview, new_preview)
    print("Fixed Half Cut preview SVG")
else:
    print("Half Cut preview pattern not found")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"Total lines: {len(src.splitlines())}")
