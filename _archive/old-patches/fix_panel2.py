with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

old = """          <span className="text-[7px] font-bold text-gray-400 tracking-widest mb-0.5">DESIGN</span>
          {[
            { icon: "↖", label: "Select", action: () => { const c = fcRef.current; if(c){ c.isDrawingMode = false; setDrawMode(false); setMeasureMode(false); setEyedropperMode(false); c.defaultCursor = "default"; c.hoverCursor = "move"; } } },
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
            { icon: "📦", label: "Box", action: () => setShowDielinePanel(p => !p) },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} title={btn.label}
              className="w-11 h-11 flex flex-col items-center justify-center rounded-lg text-xs transition-all hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-800">
              <span className="text-sm leading-none">{btn.icon}</span>
              <span className="text-[8px] mt-0.5 font-medium">{btn.label}</span>
            </button>
          ))}"""

new = """          <button onClick={() => setShowDielinePanel(p => !p)} title="Box"
            className="w-11 h-12 flex flex-col items-center justify-center rounded-lg text-xs transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-md mb-1">
            <span className="text-sm leading-none">📦</span>
            <span className="text-[8px] mt-0.5 font-bold">Box</span>
          </button>
          <div className="w-8 h-px bg-gray-200 my-1" />
          <span className="text-[7px] font-bold text-gray-400 tracking-widest mb-0.5">DESIGN</span>
          {[
            { icon: "↖", label: "Select", action: () => { const c = fcRef.current; if(c){ c.isDrawingMode = false; setDrawMode(false); setMeasureMode(false); setEyedropperMode(false); c.defaultCursor = "default"; c.hoverCursor = "move"; } } },
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
            { icon: "▮▯", label: "Barcode", action: () => setShowBarcodePanel(p => !p) },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} title={btn.label}
              className="w-11 h-11 flex flex-col items-center justify-center rounded-lg text-xs transition-all hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-800">
              <span className="text-sm leading-none">{btn.icon}</span>
              <span className="text-[8px] mt-0.5 font-medium">{btn.label}</span>
            </button>
          ))}"""

if old in src:
    src = src.replace(old, new)
    print("FIXED: Left panel reorganized")
    print("  1. Box (blue highlight, top)")
    print("  2. DESIGN: Select, Text, Image, Shapes")
    print("  3. PACKAGE: Symbols, Handle, Table, Barcode")
else:
    print("NOT FOUND")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"Total lines: {len(src.splitlines())}")
