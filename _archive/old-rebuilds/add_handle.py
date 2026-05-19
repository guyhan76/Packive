with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

changes = 0

# ============================================
# Step 1: Add showHandlePanel state
# ============================================
anchor = 'const [showSymbolPanel, setShowSymbolPanel] = useState(false);'
if 'showHandlePanel' not in src:
    new_state = anchor + '\n  const [showHandlePanel, setShowHandlePanel] = useState(false);'
    src = src.replace(anchor, new_state)
    changes += 1
    print("Added showHandlePanel state")

# ============================================
# Step 2: Add Handle button to left panel (after Symbols)
# ============================================
sym_btn = '{ icon: "\u26A0", label: "Symbols", action: () => setShowSymbolPanel(p => !p) }'
if sym_btn in src and 'Handle' not in src.split(sym_btn)[1][:200]:
    handle_btn = sym_btn + ',\n            { icon: "\u270B", label: "Handle", action: () => setShowHandlePanel(p => !p) }'
    src = src.replace(sym_btn, handle_btn)
    changes += 1
    print("Added Handle button to toolbar")

# ============================================
# Step 3: Add Handle panel after Symbol panel
# ============================================
# Find where symbol panel ends
sym_panel_end = '           {/* Table Popup */}'
if sym_panel_end in src and '{/* Handle Panel */' not in src:
    handle_panel = '''
          {/* Handle Panel */}
          {showHandlePanel && (
            <div className="absolute left-14 top-16 z-30 bg-white rounded-xl shadow-xl border p-3 w-72 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs font-bold text-gray-700">Handle Types (4)</div>
                <button onClick={() => setShowHandlePanel(false)} className="text-gray-400 hover:text-gray-600 text-sm">X</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Full Cut Handle */}
                <button onClick={() => {
                  const c = fcRef.current; if (!c) return;
                  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 50"><rect x="15" y="5" width="110" height="40" rx="20" ry="20" fill="none" stroke="#FF0000" stroke-width="2"/></svg>`;
                  const encoded = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgStr)));
                  import("fabric").then(({ FabricImage }) => {
                    FabricImage.fromURL(encoded).then((img) => {
                      if (!img) return;
                      const cw = c.getWidth(); const ch = c.getHeight();
                      img.set({ left: cw/2, top: ch/2, originX: 'center', originY: 'center' });
                      img.scaleToWidth(120);
                      c.add(img); c.setActiveObject(img); c.requestRenderAll();
                      if (typeof refreshLayers === "function") refreshLayers();
                    });
                  });
                  setShowHandlePanel(false);
                }} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all">
                  <svg viewBox="0 0 140 50" className="w-full h-10">
                    <rect x="15" y="5" width="110" height="40" rx="20" ry="20" fill="none" stroke="#FF0000" strokeWidth="2"/>
                  </svg>
                  <div className="text-[9px] text-gray-600 font-medium text-center">Full Cut Handle</div>
                  <div className="text-[7px] text-gray-400 text-center">All cut lines (red)</div>
                </button>

                {/* Half Cut Handle */}
                <button onClick={() => {
                  const c = fcRef.current; if (!c) return;
                  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 50"><line x1="15" y1="5" x2="125" y2="5" stroke="#00AA00" stroke-width="2"/><path d="M15,5 A20,20 0 0,0 15,45 L125,45 A20,20 0 0,0 125,5" fill="none" stroke="#FF0000" stroke-width="2"/></svg>`;
                  const encoded = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgStr)));
                  import("fabric").then(({ FabricImage }) => {
                    FabricImage.fromURL(encoded).then((img) => {
                      if (!img) return;
                      const cw = c.getWidth(); const ch = c.getHeight();
                      img.set({ left: cw/2, top: ch/2, originX: 'center', originY: 'center' });
                      img.scaleToWidth(120);
                      c.add(img); c.setActiveObject(img); c.requestRenderAll();
                      if (typeof refreshLayers === "function") refreshLayers();
                    });
                  });
                  setShowHandlePanel(false);
                }} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all">
                  <svg viewBox="0 0 140 50" className="w-full h-10">
                    <line x1="15" y1="5" x2="125" y2="5" stroke="#00AA00" strokeWidth="2"/>
                    <path d="M15,5 A20,20 0 0,0 15,45 L125,45 A20,20 0 0,0 125,5" fill="none" stroke="#FF0000" strokeWidth="2"/>
                  </svg>
                  <div className="text-[9px] text-gray-600 font-medium text-center">Half Cut Handle</div>
                  <div className="text-[7px] text-gray-400 text-center">Top: crease (green)<br/>Rest: cut (red)</div>
                </button>

                {/* Finger Hole Circle */}
                <button onClick={() => {
                  const c = fcRef.current; if (!c) return;
                  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><circle cx="30" cy="30" r="22" fill="none" stroke="#FF0000" stroke-width="2"/></svg>`;
                  const encoded = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgStr)));
                  import("fabric").then(({ FabricImage }) => {
                    FabricImage.fromURL(encoded).then((img) => {
                      if (!img) return;
                      const cw = c.getWidth(); const ch = c.getHeight();
                      img.set({ left: cw/2, top: ch/2, originX: 'center', originY: 'center' });
                      img.scaleToWidth(60);
                      c.add(img); c.setActiveObject(img); c.requestRenderAll();
                      if (typeof refreshLayers === "function") refreshLayers();
                    });
                  });
                  setShowHandlePanel(false);
                }} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all">
                  <svg viewBox="0 0 60 60" className="w-12 h-12 mx-auto">
                    <circle cx="30" cy="30" r="22" fill="none" stroke="#FF0000" strokeWidth="2"/>
                  </svg>
                  <div className="text-[9px] text-gray-600 font-medium text-center">Finger Hole (Circle)</div>
                  <div className="text-[7px] text-gray-400 text-center">Full cut (red)</div>
                </button>

                {/* Finger Hole Semi-circle */}
                <button onClick={() => {
                  const c = fcRef.current; if (!c) return;
                  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40"><path d="M5,5 L55,5" stroke="#00AA00" stroke-width="2"/><path d="M5,5 A25,30 0 0,0 55,5" fill="none" stroke="#FF0000" stroke-width="2"/></svg>`;
                  const encoded = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgStr)));
                  import("fabric").then(({ FabricImage }) => {
                    FabricImage.fromURL(encoded).then((img) => {
                      if (!img) return;
                      const cw = c.getWidth(); const ch = c.getHeight();
                      img.set({ left: cw/2, top: ch/2, originX: 'center', originY: 'center' });
                      img.scaleToWidth(60);
                      c.add(img); c.setActiveObject(img); c.requestRenderAll();
                      if (typeof refreshLayers === "function") refreshLayers();
                    });
                  });
                  setShowHandlePanel(false);
                }} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all">
                  <svg viewBox="0 0 60 40" className="w-12 h-10 mx-auto">
                    <line x1="5" y1="5" x2="55" y2="5" stroke="#00AA00" strokeWidth="2"/>
                    <path d="M5,5 A25,30 0 0,0 55,5" fill="none" stroke="#FF0000" strokeWidth="2"/>
                  </svg>
                  <div className="text-[9px] text-gray-600 font-medium text-center">Finger Hole (Semi)</div>
                  <div className="text-[7px] text-gray-400 text-center">Top: crease (green)<br/>Arc: cut (red)</div>
                </button>
              </div>
              <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                <div className="text-[8px] text-gray-500 space-y-1">
                  <div className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-red-500 inline-block"></span> Cut line</div>
                  <div className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-green-600 inline-block"></span> Crease line</div>
                </div>
              </div>
            </div>
          )}

'''
    src = src.replace(sym_panel_end, handle_panel + '          ' + sym_panel_end)
    changes += 1
    print("Added Handle panel")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"Changes: {changes}")
print(f"Total lines: {len(src.splitlines())}")
