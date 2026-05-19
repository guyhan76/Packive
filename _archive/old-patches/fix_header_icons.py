with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Replace L2040-2103 (header area, keep hidden inputs from L2104 onward)
new_header = '''      {/* TOP BAR */}
      <div className="h-11 bg-white border-b border-gray-200 flex items-center px-3 shrink-0 z-20">

        {/* LEFT: Logo + File info */}
        <a href="/" className="flex items-center shrink-0 mr-3" title="Home">
          <img src="/packive-logo.png" alt="Packive" className="h-8 object-contain" />
        </a>
        {boxType && <span className="text-xs font-semibold text-gray-700 mr-1">{boxType}</span>}
        {dielineFileName && <span className="text-[11px] text-blue-600 truncate max-w-[140px] font-medium" title={dielineFileName}>{dielineFileName}</span>}
        {!dielineFileName && boxType && <span className="text-[11px] text-gray-400">{L}x{W}x{D}</span>}

        <div className="w-px h-6 bg-gray-200 mx-2" />

        {/* CENTER: Dieline tools (icon buttons) */}
        <div className="flex items-center gap-1">
          {/* New */}
          <button onClick={() => { if (!window.confirm("Start a completely new blank canvas?\\nAll current work will be removed.")) return; const c = fcRef.current; if(!c) return; c.getObjects().slice().forEach((o:any) => c.remove(o)); c.requestRenderAll(); setDielineFileName(""); setDielineSizes(null); setDielineModelInfo(""); pushHistory(); refreshLayers(); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="New Canvas">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          </button>

          {/* Upload */}
          <button onClick={() => dielineFileRef.current?.click()}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Upload Dieline (.eps, .svg, .pdf)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </button>

          <div className="w-px h-5 bg-gray-200 mx-0.5" />

          {/* Dieline On/Off */}
          <button onClick={() => { const c = fcRef.current; if (!c) return; const nv = !dielineVisible; setDielineVisible(nv); c.getObjects().forEach((o: any) => { if (o._isGuideLayer || o._isDieLine || o._isFoldLine) { o.visible = nv; } }); c.requestRenderAll(); }}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${dielineVisible ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-100"}`}
            title={dielineVisible ? "Hide Dieline" : "Show Dieline"}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{dielineVisible ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></> : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>}</svg>
          </button>

          {/* Info On/Off */}
          <button onClick={() => { const c = fcRef.current; if (!c) return; const hasDieline = dielineVisible && c.getObjects().some((o: any) => o._isGuideLayer || o._isDieLine); if (!hasDieline) return; const nv = !dielineInfoVisible; setDielineInfoVisible(nv); let count = 0; const toggleDeep = (obj: any) => { if (obj._isDielineInfo || obj._isPanelLabel || obj._isPanelOverlay || obj._isDimLine || obj._isDimArrow) { obj.visible = nv; obj.dirty = true; obj.setCoords?.(); count++; } if (obj.type === "group" && typeof obj.getObjects === "function") { obj.getObjects().forEach((child: any) => toggleDeep(child)); obj.dirty = true; obj.setCoords?.(); } }; c.getObjects().forEach((o: any) => toggleDeep(o)); console.log("[Info toggle]", nv ? "ON" : "OFF", count, "objects"); c.requestRenderAll(); }}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${dielineInfoVisible ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-100"}`}
            title={dielineInfoVisible ? "Hide Info & Dimensions" : "Show Info & Dimensions"}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </button>

          {/* Lock */}
          <button onClick={() => { const c = fcRef.current; if (!c) return; const nl = !dielineLocked; setDielineLocked(nl); c.getObjects().forEach((o: any) => { if (o._isGuideLayer || o._isDieLine || o._isFoldLine) { o.selectable = !nl; o.evented = !nl; } }); c.requestRenderAll(); }}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${dielineLocked ? "bg-amber-50 text-amber-600" : "text-gray-400 hover:bg-gray-100"}`}
            title={dielineLocked ? "Unlock Dieline" : "Lock Dieline"}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{dielineLocked ? <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></> : <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></>}</svg>
          </button>
        </div>

        <div className="flex-1" />

        {/* RIGHT: Undo/Redo + Zoom + Save/Export */}
        <div className="flex items-center gap-1">
          {/* Undo */}
          <button onClick={undo} title="Undo (Ctrl+Z)" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          </button>
          {/* Redo */}
          <button onClick={redo} title="Redo (Ctrl+Y)" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/></svg>
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Zoom */}
          <button onClick={() => applyZoom(zoom - 25)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 text-xs font-medium">−</button>
          <span className="text-[11px] text-gray-500 w-10 text-center font-medium select-none">{zoom}%</span>
          <button onClick={() => applyZoom(zoom + 25)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 text-xs font-medium">+</button>
          <button onClick={() => { const c = fcRef.current; if (!c) return; const objs = c.getObjects(); if (objs.length === 0) { applyZoom(100); return; } let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity; objs.forEach((o:any) => { const b=o.getBoundingRect(); minX=Math.min(minX,b.left); minY=Math.min(minY,b.top); maxX=Math.max(maxX,b.left+b.width); maxY=Math.max(maxY,b.top+b.height); }); const cw=c.getWidth(), ch=c.getHeight(), ow=maxX-minX, oh=maxY-minY; const z=Math.floor(Math.min(cw/ow, ch/oh)*90); applyZoom(Math.min(Math.max(z,25),400)); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Fit to View">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Load */}
          <button onClick={() => fileLoadRef.current?.click()} title="Load Project"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </button>
          {/* Save */}
          <button onClick={fileSave} title="Save (Ctrl+S)"
            className="px-3 py-1.5 text-[11px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Save
          </button>
          {/* Export */}
          <button onClick={() => setShowExport(true)}
            className="px-4 py-1.5 text-[11px] font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
            Export
          </button>
        </div>
      </div>
'''

# Replace lines 2039-2102 (L2040-L2103)
lines[2039:2103] = [new_header]

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.writelines(lines)

print(f"FIXED: Header redesigned with icons")
print(f"- Back button removed, logo links to home")
print(f"- All tools use SVG icons with tooltips")
print(f"- 3-zone layout: Left(logo+file) | Center(tools) | Right(undo/zoom/save)")
print(f"- Consistent icon size (16px) and button size (32px)")
print(f"- Unified color: blue=active, amber=locked, gray=inactive")
print(f"Total lines: {len(lines)}")
