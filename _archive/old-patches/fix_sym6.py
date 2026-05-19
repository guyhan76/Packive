with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Step 1: Add Symbols button in the left toolbar
# Find the Box button to add after it
box_btn = '{ icon: "\U0001F4E6", label: "Box", action: () => setShowDielinePanel(p => !p) },'
if box_btn in src:
    new_btns = box_btn + '\n            { icon: "\u26A0", label: "Symbols", action: () => setShowSymbolPanel(p => !p) },'
    src = src.replace(box_btn, new_btns)
    print('Added Symbols button to toolbar')
else:
    print('Box button not found, trying alternate')
    # Try to find it differently
    for pattern in ['Box", action: () => setShowDielinePanel']:
        if pattern in src:
            print(f'Found partial: {pattern}')

# Step 2: Add Symbols popup panel after Barcode popup
barcode_close = '''          )}

'''
# Find after barcode panel closing
import re
barcode_panel_end = src.find('{showBarcodePanel && (')
if barcode_panel_end >= 0:
    # Find the closing of barcode panel
    close_pos = src.find(')}', barcode_panel_end + 200)
    # Find next newline after )}
    nl_pos = src.find('\n', close_pos)
    
    symbol_panel = '''
          {/* Packaging Symbols Popup */}
          {showSymbolPanel && (
            <div className="absolute left-14 top-1 z-30 bg-white rounded-xl shadow-xl border p-3 w-72 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs font-bold text-gray-700">Packaging Symbols ({PACKAGING_SYMBOLS.length})</div>
                <button onClick={() => setShowSymbolPanel(false)} className="text-gray-400 hover:text-gray-600 text-sm">x</button>
              </div>
              <input value={symbolSearch} onChange={e => setSymbolSearch(e.target.value)}
                placeholder="Search symbols..."
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-[10px] mb-2 focus:border-blue-400 outline-none" />
              <div className="flex gap-1 flex-wrap mb-2">
                {SYMBOL_CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setSymbolCategory(cat.id)}
                    className={"px-2 py-0.5 rounded-full text-[9px] font-medium transition-all " + (symbolCategory === cat.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                    {cat.nameKo}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {PACKAGING_SYMBOLS
                  .filter(s => symbolCategory === "all" || s.category === symbolCategory)
                  .filter(s => !symbolSearch || s.name.toLowerCase().includes(symbolSearch.toLowerCase()) || s.nameKo.includes(symbolSearch))
                  .map(sym => (
                  <button key={sym.id} onClick={() => {
                    const c = fcRef.current; if (!c) return;
                    fabric.loadSVGFromString(sym.svg.replace(/currentColor/g, "#000000"), (objects: any[], options: any) => {
                      const group = fabric.util.groupSVGElements(objects, options);
                      group.set({ left: 100, top: 100, scaleX: 1, scaleY: 1 });
                      group.scaleToWidth(60);
                      c.add(group);
                      c.setActiveObject(group);
                      c.requestRenderAll();
                      refreshLayers();
                    });
                    setShowSymbolPanel(false);
                  }}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    title={sym.name + " / " + sym.nameKo}>
                    <div className="w-10 h-10 flex items-center justify-center" dangerouslySetInnerHTML={{__html: sym.svg.replace(/currentColor/g, "#333")}} />
                    <span className="text-[8px] text-gray-400 group-hover:text-blue-600 truncate w-full text-center">{sym.nameKo}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
'''
    
    src = src[:nl_pos+1] + symbol_panel + src[nl_pos+1:]
    print('Added symbol panel after barcode panel')
else:
    print('ERROR: Barcode panel not found')

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
