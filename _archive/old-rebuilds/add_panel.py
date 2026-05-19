with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Insert symbols panel before L2929 (index 2928)
panel = '''
            {leftTab === "symbols" && (
              <div className="absolute left-full top-0 ml-1 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 max-h-[80vh] overflow-y-auto z-50">
                <div className="text-xs font-bold text-gray-700 mb-2">Packaging Symbols ({PACKAGING_SYMBOLS.length})</div>
                <input value={symbolSearch} onChange={e => setSymbolSearch(e.target.value)}
                  placeholder="Search symbols..."
                  className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-[10px] mb-2 focus:border-blue-400 outline-none" />
                <div className="flex gap-1 flex-wrap mb-2">
                  {SYMBOL_CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setSymbolCategory(cat.id)}
                      className={px-2 py-0.5 rounded-full text-[9px] font-medium transition-all }>
                      {cat.label}
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
                      const F = (window as any).__fabric || require("fabric");
                      const svgStr = sym.svg.replace(/currentColor/g, "#000000");
                      F.loadSVGFromString(svgStr, (objects: any[], options: any) => {
                        const group = F.util.groupSVGElements(objects, options);
                        group.set({ left: 100, top: 100, scaleX: 1, scaleY: 1 });
                        group.scaleToWidth(60);
                        c.add(group);
                        c.setActiveObject(group);
                        c.requestRenderAll();
                        refreshLayers();
                      });
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

lines.insert(2928, panel + '\n')
print(f'Inserted symbols panel before CANVAS AREA')

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.writelines(lines)
print(f'Total lines: {len(lines)}')
