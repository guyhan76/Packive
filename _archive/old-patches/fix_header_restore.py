with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Replace L2041-L2211 (indices 2040-2210) with restored header
new_header = '''      <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-2 shrink-0 z-20">
        {/* LEFT: Back + Logo + File info */}
        <button onClick={onBack} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium" title="Back to home">
          <span className="text-base">&#8592;</span> Back
        </button>
        <div className="w-px h-7 bg-gray-200 mx-1" />
        <span className="text-[13px] font-black tracking-tight text-gray-800 select-none">Packive</span>
        <div className="w-px h-7 bg-gray-200 mx-1" />
        {boxType && <span className="text-sm font-semibold text-gray-800">{boxType}</span>}
        {dielineFileName && <span className="text-xs text-blue-600 truncate max-w-[160px] font-medium" title={dielineFileName}>{dielineFileName}</span>}
        {!dielineFileName && boxType && <span className="text-xs text-gray-500">{L}x{W}x{D}</span>}

        <div className="flex-1" />

        {/* Dieline tools */}
        <button onClick={() => { if (!window.confirm("Start a completely new blank canvas?\\nAll current work will be removed.")) return; const c = fcRef.current; if(!c) return; c.getObjects().slice().forEach((o:any) => c.remove(o)); c.requestRenderAll(); setDielineFileName(""); setDielineUngrouped(false); pushHistory(); refreshLayers(); }} className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded" title="New Canvas">New</button>
        <button onClick={() => dielineFileRef.current?.click()} className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded" title="Upload Dieline">Upload</button>
        <div className="w-px h-6 bg-gray-200" />
        <button onClick={() => { const c = fcRef.current; if (!c) return; const nv = !dielineVisible; setDielineVisible(nv); c.getObjects().forEach((o: any) => { if (o._isGuideLayer || o._isDieLine || o._isFoldLine) { o.visible = nv; } }); c.requestRenderAll(); }} className={`px-2 py-1 text-xs rounded ${dielineVisible ? "text-gray-800 bg-gray-100" : "text-gray-400"}`} title="Toggle Dieline">Die</button>
        <button onClick={() => { const c = fcRef.current; if (!c) return; const nv = !dielineInfoVisible; setDielineInfoVisible(nv); let count = 0; c.getObjects().forEach((o: any) => { if (o._isDielineInfo) { o.visible = nv; count++; } if (o._objects) o._objects.forEach((ch: any) => { if (ch._isDielineInfo) { ch.visible = nv; count++; } }); }); console.log("[Info] toggled", count, "info objects to", nv); c.requestRenderAll(); }} className={`px-2 py-1 text-xs rounded ${dielineInfoVisible ? "text-gray-800 bg-gray-100" : "text-gray-400"}`} title="Toggle Info">Info</button>
        <button onClick={() => { const c = fcRef.current; if (!c) return; const nl = !dielineLocked; setDielineLocked(nl); c.getObjects().forEach((o: any) => { if (o._isGuideLayer || o._isDieLine || o._isFoldLine) { o.selectable = !nl; o.evented = !nl; } }); c.requestRenderAll(); }} className={`px-2 py-1 text-xs rounded ${dielineLocked ? "text-amber-600 bg-amber-50" : "text-gray-400"}`} title="Lock/Unlock Dieline">{dielineLocked ? "🔒 Locked" : "🔓 Lock"}</button>
        <button onClick={() => { const c = fcRef.current; if (!c) return; const objs = c.getObjects(); let ungroupCount = 0; objs.forEach((o: any) => { if (o._isGuideLayer && o._objects) { const children = [...o._objects]; c.remove(o); children.forEach((ch: any) => { ch._isDieLine = true; ch._isGuideLayer = true; ch.selectable = !dielineLocked; ch.evented = !dielineLocked; c.add(ch); ungroupCount++; }); } }); if (ungroupCount > 0) { setDielineUngrouped(true); c.requestRenderAll(); pushHistory(); refreshLayers(); console.log("[Ungroup]", ungroupCount, "children extracted"); } }} className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded" title="Ungroup Dieline">Ungroup</button>
        <div className="w-px h-6 bg-gray-200" />

        {/* Undo/Redo */}
        <button onClick={undo} title="Undo (Ctrl+Z)" className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-sm">&#8630;</button>
        <button onClick={redo} title="Redo (Ctrl+Y)" className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-sm">&#8631;</button>
        <div className="w-px h-6 bg-gray-200" />

        {/* Zoom */}
        <button onClick={() => applyZoom(zoom - 25)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-xs">-</button>
        <span className="text-xs text-gray-600 w-10 text-center font-medium">{zoom}%</span>
        <button onClick={() => applyZoom(zoom + 25)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-xs">+</button>
        <button onClick={() => { const c = fcRef.current; if (!c) return; const objs = c.getObjects(); if (objs.length === 0) { applyZoom(100); return; } let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity; objs.forEach((o:any) => { const b = o.getBoundingRect(); if(b.left<minX) minX=b.left; if(b.top<minY) minY=b.top; if(b.left+b.width>maxX) maxX=b.left+b.width; if(b.top+b.height>maxY) maxY=b.top+b.height; }); const cw=c.getWidth(),ch=c.getHeight(); const fitZ = Math.min(cw/(maxX-minX+40), ch/(maxY-minY+40)) * 100; applyZoom(Math.round(Math.min(fitZ,200))); }} className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded" title="Fit to view">Fit</button>
        <div className="w-px h-6 bg-gray-200" />

        {/* Save/Export */}
        <button onClick={() => fileLoadRef.current?.click()} title="Load" className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded">Load</button>
        <button onClick={fileSave} title="Save (Ctrl+S)" className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Save</button>
        <button onClick={() => setShowExport(true)} className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-md shadow-sm">Export</button>

        {/* Hidden file inputs */}
        <input ref={dielineFileRef} type="file" accept=".eps,.ai,.pdf,.svg" className="hidden" onChange={async (e) => {
'''

# Get the hidden input handler content (L2092-L2209) - keep as is
input_handler_lines = lines[2091:2209]  # indices for L2092-L2209
input_handler = ''.join(input_handler_lines)

# Close tag
close_section = '''        <input ref={fileLoadRef} type="file" accept=".json,.pkv.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { if (window.confirm("Loading will replace current canvas. Continue?")) { fileLoad(f); } } e.target.value = ""; }} />
      </div>
'''

# Build full replacement
full_new = new_header + input_handler + close_section

# Replace L2041-L2211 (indices 2040-2210)
new_lines = lines[:2040] + [full_new] + lines[2211:]

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.writelines(new_lines)

total = len(open('src/components/editor/unified-editor.tsx','r',encoding='utf-8').readlines())
print(f"FIXED: Header restored to full toolbar style")
print(f"  - Back button separated from Packive logo")
print(f"  - Dieline tools: New, Upload, Die, Info, Lock, Ungroup")
print(f"  - Undo/Redo + Zoom + Load/Save/Export")
print(f"  - Info button with console logging")
print(f"Total lines: {total}")
