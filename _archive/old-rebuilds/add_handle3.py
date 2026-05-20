with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

handle_panel = """          {/* Handle Panel */}
          {showHandlePanel && (
            <div className="absolute left-14 top-16 z-30 bg-white rounded-xl shadow-xl border p-3 w-80 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs font-bold text-gray-700">Handle Types (5)</div>
                <button onClick={() => setShowHandlePanel(false)} className="text-gray-400 hover:text-gray-600 text-sm">X</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { const c = fcRef.current; if (!c) return; const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 50"><rect x="15" y="5" width="110" height="40" rx="20" ry="20" fill="none" stroke="#FF0000" stroke-width="2"/></svg>`; const e = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(s))); import("fabric").then(({ FabricImage }) => { FabricImage.fromURL(e).then((img) => { if (!img) return; img.set({ left: c.getWidth()/2, top: c.getHeight()/2, originX: "center", originY: "center" }); img.scaleToWidth(120); c.add(img); c.setActiveObject(img); c.requestRenderAll(); if (typeof refreshLayers === "function") refreshLayers(); }); }); setShowHandlePanel(false); }} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all">
                  <svg viewBox="0 0 140 50" className="w-full h-10"><rect x="15" y="5" width="110" height="40" rx="20" ry="20" fill="none" stroke="#FF0000" strokeWidth="2"/></svg>
                  <div className="text-[9px] text-gray-600 font-medium">Full Cut Handle</div>
                  <div className="text-[7px] text-gray-400">All cut lines (red)</div>
                </button>
                <button onClick={() => { const c = fcRef.current; if (!c) return; const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 50"><line x1="15" y1="5" x2="125" y2="5" stroke="#00AA00" stroke-width="2"/><path d="M15,5 A20,20 0 0,0 15,45 L125,45 A20,20 0 0,0 125,5" fill="none" stroke="#FF0000" stroke-width="2"/></svg>`; const e = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(s))); import("fabric").then(({ FabricImage }) => { FabricImage.fromURL(e).then((img) => { if (!img) return; img.set({ left: c.getWidth()/2, top: c.getHeight()/2, originX: "center", originY: "center" }); img.scaleToWidth(120); c.add(img); c.setActiveObject(img); c.requestRenderAll(); if (typeof refreshLayers === "function") refreshLayers(); }); }); setShowHandlePanel(false); }} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all">
                  <svg viewBox="0 0 140 50" className="w-full h-10"><line x1="15" y1="5" x2="125" y2="5" stroke="#00AA00" strokeWidth="2"/><path d="M15,5 A20,20 0 0,0 15,45 L125,45 A20,20 0 0,0 125,5" fill="none" stroke="#FF0000" strokeWidth="2"/></svg>
                  <div className="text-[9px] text-gray-600 font-medium">Half Cut Handle</div>
                  <div className="text-[7px] text-gray-400">Top: crease (green) Rest: cut (red)</div>
                </button>
                <button onClick={() => { const c = fcRef.current; if (!c) return; const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><circle cx="30" cy="30" r="22" fill="none" stroke="#FF0000" stroke-width="2"/></svg>`; const e = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(s))); import("fabric").then(({ FabricImage }) => { FabricImage.fromURL(e).then((img) => { if (!img) return; img.set({ left: c.getWidth()/2, top: c.getHeight()/2, originX: "center", originY: "center" }); img.scaleToWidth(60); c.add(img); c.setActiveObject(img); c.requestRenderAll(); if (typeof refreshLayers === "function") refreshLayers(); }); }); setShowHandlePanel(false); }} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all">
                  <svg viewBox="0 0 60 60" className="w-12 h-12 mx-auto"><circle cx="30" cy="30" r="22" fill="none" stroke="#FF0000" strokeWidth="2"/></svg>
                  <div className="text-[9px] text-gray-600 font-medium">Finger Hole (Circle)</div>
                  <div className="text-[7px] text-gray-400">Full cut (red)</div>
                </button>
                <button onClick={() => { const c = fcRef.current; if (!c) return; const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40"><line x1="5" y1="5" x2="55" y2="5" stroke="#00AA00" stroke-width="2"/><path d="M5,5 A25,30 0 0,0 55,5" fill="none" stroke="#FF0000" stroke-width="2"/></svg>`; const e = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(s))); import("fabric").then(({ FabricImage }) => { FabricImage.fromURL(e).then((img) => { if (!img) return; img.set({ left: c.getWidth()/2, top: c.getHeight()/2, originX: "center", originY: "center" }); img.scaleToWidth(60); c.add(img); c.setActiveObject(img); c.requestRenderAll(); if (typeof refreshLayers === "function") refreshLayers(); }); }); setShowHandlePanel(false); }} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all">
                  <svg viewBox="0 0 60 40" className="w-12 h-10 mx-auto"><line x1="5" y1="5" x2="55" y2="5" stroke="#00AA00" strokeWidth="2"/><path d="M5,5 A25,30 0 0,0 55,5" fill="none" stroke="#FF0000" strokeWidth="2"/></svg>
                  <div className="text-[9px] text-gray-600 font-medium">Finger Hole (Semi)</div>
                  <div className="text-[7px] text-gray-400">Top: crease (green) Arc: cut (red)</div>
                </button>
                <button onClick={() => { const c = fcRef.current; if (!c) return; const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><rect x="8" y="8" width="44" height="44" fill="none" stroke="#FF0000" stroke-width="2"/></svg>`; const e = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(s))); import("fabric").then(({ FabricImage }) => { FabricImage.fromURL(e).then((img) => { if (!img) return; img.set({ left: c.getWidth()/2, top: c.getHeight()/2, originX: "center", originY: "center" }); img.scaleToWidth(60); c.add(img); c.setActiveObject(img); c.requestRenderAll(); if (typeof refreshLayers === "function") refreshLayers(); }); }); setShowHandlePanel(false); }} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all">
                  <svg viewBox="0 0 60 60" className="w-12 h-12 mx-auto"><rect x="8" y="8" width="44" height="44" fill="none" stroke="#FF0000" strokeWidth="2"/></svg>
                  <div className="text-[9px] text-gray-600 font-medium">Square Hole</div>
                  <div className="text-[7px] text-gray-400">Full cut (red)</div>
                </button>
              </div>
              <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                <div className="text-[8px] text-gray-500 space-y-1">
                  <div className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-red-500 inline-block"></span> Cut line (red)</div>
                  <div className="flex items-center gap-1.5"><span className="w-6 h-0.5 inline-block" style={{backgroundColor:"#00AA00"}}></span> Crease line (green)</div>
                </div>
              </div>
            </div>
          )}
"""

# Insert before line 2472 (Table Popup)
insert_idx = 2471  # 0-indexed for L2472
lines.insert(insert_idx, handle_panel + "\n")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.writelines(lines)
print(f"Inserted Handle panel at L{insert_idx+1}")
print(f"Total lines: {len(lines)}")
