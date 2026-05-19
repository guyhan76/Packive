with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Replace the entire left panel button section
old_section = """            { icon: "↖", label: "Select", action: () => { const c = fcRef.current; if(c){ c.isDrawingMode = false; setDrawMode(false); setMeasureMode(false); setEraserMode(false); setMeasureStart(null); setMeasureEnd(null); } } },
            { icon: "T", label: "Text", action: addText },
            { icon: "🖼", label: "Image", action: addImage },
            { icon: "◆", label: "Shapes", action: () => setShowShapePanel(p => !p) },
            { icon: "⚠", label: "Symbols", action: () => setShowSymbolPanel(p => !p) },
            { icon: "▭", label: "Handle", action: () => setShowHandlePanel(p => !p) },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} title={btn.label}
              className="w-11 h-11 flex flex-col items-center justify-center rounded-lg text-xs transition-all hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-800">
              <span className="text-sm leading-none">{btn.icon}</span>
              <span className="text-[8px] mt-0.5 font-medium">{btn.label}</span>
            </button>
          ))}
          <div className="w-8 h-px bg-gray-200 my-1" />
          <span className="text-[7px] font-bold text-gray-400 tracking-widest mb-0.5">PACKAGE</span>
          {[
            { icon: "⊞", label: "Table", action: () => setShowTablePanel(p => !p) },
            { icon: "▮▯", label: "Barcode", action: () => setShowBarcodePanel(p => !p) },
            // Marks button removed — use Image upload instead
            { icon: "📦", label: "Box", action: () => setShowDielinePanel(p => !p) },"""

new_section = """            { icon: "📦", label: "Box", action: () => setShowDielinePanel(p => !p), highlight: true },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} title={btn.label}
              className={"w-11 h-11 flex flex-col items-center justify-center rounded-lg text-xs transition-all " + ((btn as any).highlight ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" : "hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-800")}>
              <span className="text-sm leading-none">{btn.icon}</span>
              <span className="text-[8px] mt-0.5 font-medium">{btn.label}</span>
            </button>
          ))}
          <div className="w-8 h-px bg-gray-200 my-1" />
          <span className="text-[7px] font-bold text-gray-400 tracking-widest mb-0.5">DESIGN</span>
          {[
            { icon: "↖", label: "Select", action: () => { const c = fcRef.current; if(c){ c.isDrawingMode = false; setDrawMode(false); setMeasureMode(false); setEraserMode(false); setMeasureStart(null); setMeasureEnd(null); } } },
            { icon: "T", label: "Text", action: addText },
            { icon: "🖼", label: "Image", action: addImage },
            { icon: "◆", label: "Shapes", action: () => setShowShapePanel(p => !p) },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} title={btn.label}
              className="w-11 h-11 flex flex-col items-center justify-center rounded-lg text-xs transition-all hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-800">
              <span className="text-sm leading-none">{btn.icon}</span>
              <span className="text-[8px] mt-0.5 font-medium">{btn.label}</span>
            </button>
          ))}
          <div className="w-8 h-px bg-gray-200 my-1" />
          <span className="text-[7px] font-bold text-gray-400 tracking-widest mb-0.5">PACKAGE</span>
          {[
            { icon: "⚠", label: "Symbols", action: () => setShowSymbolPanel(p => !p) },
            { icon: "▭", label: "Handle", action: () => setShowHandlePanel(p => !p) },
            { icon: "⊞", label: "Table", action: () => setShowTablePanel(p => !p) },
            { icon: "▮▯", label: "Barcode", action: () => setShowBarcodePanel(p => !p) },"""

if old_section in src:
    src = src.replace(old_section, new_section)
    print("FIXED: Reorganized left panel")
    print("  - Box button at top with blue highlight")
    print("  - DESIGN section: Select, Text, Image, Shapes")
    print("  - PACKAGE section: Symbols, Handle, Table, Barcode")
else:
    print("NOT FOUND - checking partial match...")
    # Check if Select line exists
    if '{ icon: "↖", label: "Select"' in src:
        print("Select button found but full section didn't match")
        # Print 5 chars around each newline to debug
        idx = src.find('{ icon: "↖", label: "Select"')
        print(repr(src[idx-20:idx+200]))

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"Total lines: {len(src.splitlines())}")
