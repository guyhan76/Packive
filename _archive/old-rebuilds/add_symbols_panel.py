with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

# 1. Add import for packaging symbols
import_line = 'import { PACKAGING_SYMBOLS, SYMBOL_CATEGORIES, PackagingSymbol } from "@/lib/packaging-symbols";'
if 'packaging-symbols' not in src:
    # Add after last import
    last_import = src.rfind('import ')
    end_of_line = src.find('\n', last_import)
    # Find a good place - after all imports
    lines = src.split('\n')
    insert_idx = 0
    for i, line in enumerate(lines):
        if line.strip().startswith('import ') or line.strip().startswith('// text-to-outlines'):
            insert_idx = i + 1
    lines.insert(insert_idx, import_line)
    src = '\n'.join(lines)
    print('Fix1: Added import')

# 2. Add symbolCategory state near other states
old_state = 'const [fontCategory, setFontCategory]'
idx = src.find(old_state)
line_end = src.find('\n', idx)
insert_pos = line_end + 1
symbol_state = '  const [symbolCategory, setSymbolCategory] = useState("all");\n  const [symbolSearch, setSymbolSearch] = useState("");\n'
if 'symbolCategory' not in src:
    src = src[:insert_pos] + symbol_state + src[insert_pos:]
    print('Fix2: Added symbol state')

# 3. Find the left panel "Box" button area and add "Symbols" button after it
# Look for the Barcode or Box button in left panel
old_box = '''"Box", icon: "🎁"'''
if old_box not in src:
    old_box = '''"Box"'''

# Find left panel tool buttons - look for PACKAGE section
pkg_idx = src.find('PACKAGE')
if pkg_idx > 0:
    print(f'Found PACKAGE section at char {pkg_idx}')

# 4. Add Symbols panel in left sidebar - find after "Box" tool
# Instead of modifying left panel buttons, add a new section in the left panel
# Find the Box onClick handler area
box_idx = src.find('"Box"')
if box_idx > 0:
    # Find the next tool section after Box
    tools_idx = src.find('TOOLS', box_idx)
    if tools_idx > 0:
        # Insert Symbols button before TOOLS
        insert = src.rfind('\n', 0, tools_idx)
        sym_button = '''
            <button onClick={() => setLeftTab(leftTab === "symbols" ? null : "symbols")} className={"flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg text-[9px] transition-colors " + (leftTab === "symbols" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50")} title="Symbols">
              <span className="text-sm">⚠</span>
              <span>Symbols</span>
            </button>
'''
        src = src[:insert] + sym_button + src[insert:]
        print('Fix3: Added Symbols button in left panel')

# 5. Add the Symbols panel content - find after Box panel content
# Look for where leftTab === "box" panel ends
box_panel_end = src.find('leftTab === "box"')
if box_panel_end < 0:
    # Try finding the shapes panel or another nearby panel
    box_panel_end = src.find('leftTab === "barcode"')

if box_panel_end > 0:
    # Find the closing of this panel block
    # Add symbols panel after the barcode/box panel
    # Find a good insertion point - look for "TOOLS" related panel or after box panel
    pass

# Better approach: add symbols panel content where other leftTab panels are
# Find pattern like: leftTab === "shapes" or leftTab === "barcode"
barcode_panel = src.find('{leftTab === "barcode"')
if barcode_panel < 0:
    barcode_panel = src.find('{leftTab === "box"')

if barcode_panel > 0:
    # Find the end of this panel (matching closing })
    # Instead, find the pattern after all left panels and add our panel
    # Look for the canvas area which comes after left panels
    canvas_area = src.find('{/* ═══ CANVAS', barcode_panel)
    if canvas_area < 0:
        canvas_area = src.find('CANVAS', barcode_panel)
    
    if canvas_area > 0:
        insert_before = src.rfind('\n', 0, canvas_area)
        symbols_panel = '''
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
        src = src[:insert_before] + symbols_panel + src[insert_before:]
        print('Fix4: Added Symbols panel content')

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
