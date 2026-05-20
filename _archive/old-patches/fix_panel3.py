with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Line-based replacement (L2216-L2244)
# Verify key markers
assert 'DESIGN' in lines[2215], f"L2216 mismatch: {lines[2215].strip()}"
assert 'Select' in lines[2217], f"L2218 mismatch: {lines[2217].strip()}"
assert 'Box' in lines[2236], f"L2237 mismatch: {lines[2236].strip()}"

# Replace L2216-L2244 (index 2215-2243)
new_lines = [
    '          <button onClick={() => setShowDielinePanel(p => !p)} title="Box"\n',
    '            className="w-11 h-12 flex flex-col items-center justify-center rounded-lg text-xs transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-md mb-1">\n',
    '            <span className="text-sm leading-none">📦</span>\n',
    '            <span className="text-[8px] mt-0.5 font-bold">Box</span>\n',
    '          </button>\n',
    '          <div className="w-8 h-px bg-gray-200 my-1" />\n',
    '          <span className="text-[7px] font-bold text-gray-400 tracking-widest mb-0.5">DESIGN</span>\n',
    '          {[\n',
    '            { icon: "↖", label: "Select", action: () => { const c = fcRef.current; if(c){ c.isDrawingMode = false; setDrawMode(false); setMeasureMode(false); setEyedropperMode(false); c.defaultCursor = "default"; c.hoverCursor = "move"; } } },\n',
    '            { icon: "T", label: "Text", action: addText },\n',
    '            { icon: "🖼", label: "Image", action: addImage },\n',
    '            { icon: "◆", label: "Shapes", action: () => setShowShapePanel(p => !p) },\n',
    '          ].map(btn => (\n',
    '            <button key={btn.label} onClick={btn.action} title={btn.label}\n',
    '              className="w-11 h-11 flex flex-col items-center justify-center rounded-lg text-xs transition-all hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-800">\n',
    '              <span className="text-sm leading-none">{btn.icon}</span>\n',
    '              <span className="text-[8px] mt-0.5 font-medium">{btn.label}</span>\n',
    '            </button>\n',
    '          ))}\n',
    '          <div className="w-8 h-px bg-gray-200 my-1" />\n',
    '          <span className="text-[7px] font-bold text-gray-400 tracking-widest mb-0.5">PACKAGE</span>\n',
    '          {[\n',
    '            { icon: "⚠", label: "Symbols", action: () => setShowSymbolPanel(p => !p) },\n',
    '            { icon: "▭", label: "Handle", action: () => setShowHandlePanel(p => !p) },\n',
    '            { icon: "⊞", label: "Table", action: () => setShowTablePanel(p => !p) },\n',
    '            { icon: "▮▯", label: "Barcode", action: () => setShowBarcodePanel(p => !p) },\n',
    '          ].map(btn => (\n',
    '            <button key={btn.label} onClick={btn.action} title={btn.label}\n',
    '              className="w-11 h-11 flex flex-col items-center justify-center rounded-lg text-xs transition-all hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-800">\n',
    '              <span className="text-sm leading-none">{btn.icon}</span>\n',
    '              <span className="text-[8px] mt-0.5 font-medium">{btn.label}</span>\n',
    '            </button>\n',
    '          ))}\n',
]

result = lines[:2215] + new_lines + lines[2244:]

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.writelines(result)

print("FIXED: Left panel reorganized (line-based)")
print("  1. Box (blue highlight, top)")
print("  2. DESIGN: Select, Text, Image, Shapes")  
print("  3. PACKAGE: Symbols, Handle, Table, Barcode")
print(f"Total lines: {len(result)}")
