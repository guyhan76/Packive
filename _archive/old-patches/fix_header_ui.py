with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Replace L2056-2064 (index 2055-2063) with improved UI
new_toolbar = '''        {/* ── Dieline Tools ── */}
        <button onClick={() => { if (!window.confirm("Start a completely new blank canvas?\\nAll current work will be removed.")) return; const c = fcRef.current; if(!c) return; c.getObjects().slice().forEach((o:any) => c.remove(o)); c.requestRenderAll(); setDielineFileName(""); setDielineUngrouped(false); setDielineSizes(null); setDielineModelInfo(""); pushHistory(); refreshLayers(); }} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors" title="New Canvas">New</button>

        <button onClick={() => dielineFileRef.current?.click()} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors" title="Upload Dieline (.eps, .svg, .pdf)">Upload</button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Dieline On/Off toggle */}
        <button onClick={() => { const c = fcRef.current; if (!c) return; const nv = !dielineVisible; setDielineVisible(nv); c.getObjects().forEach((o: any) => { if (o._isGuideLayer || o._isDieLine || o._isFoldLine) { o.visible = nv; } }); c.requestRenderAll(); }}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${dielineVisible ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-gray-50 text-gray-400 border border-gray-200"}`}
          title="Toggle Dieline Visibility">
          Dieline {dielineVisible ? "On" : "Off"}
        </button>

        {/* Info On/Off toggle */}
        <button onClick={() => { const c = fcRef.current; if (!c) return; const hasDieline = c.getObjects().some((o: any) => o._isGuideLayer || o._isDieLine); if (!hasDieline) return; const nv = !dielineInfoVisible; setDielineInfoVisible(nv); let count = 0; c.getObjects().forEach((o: any) => { if (o._isDielineInfo || o._isPanelLabel || o._isPanelOverlay) { o.visible = nv; o.dirty = true; o.setCoords?.(); count++; } if (o._isGuideLayer && o.type === "group" && typeof o.getObjects === "function") { o.getObjects().forEach((child: any) => { if (child._isDielineInfo || child._isPanelLabel) { child.visible = nv; count++; } }); o.dirty = true; o.setCoords?.(); } }); console.log("[Info toggle]", nv ? "ON" : "OFF", count, "objects"); c.requestRenderAll(); }}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${dielineInfoVisible ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-gray-50 text-gray-400 border border-gray-200"}`}
          title="Toggle Dieline Info, Dimensions & Arrows">
          Info {dielineInfoVisible ? "On" : "Off"}
        </button>

        {/* Lock toggle */}
        <button onClick={() => { const c = fcRef.current; if (!c) return; const nl = !dielineLocked; setDielineLocked(nl); c.getObjects().forEach((o: any) => { if (o._isGuideLayer || o._isDieLine || o._isFoldLine) { o.selectable = !nl; o.evented = !nl; } }); c.requestRenderAll(); }}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${dielineLocked ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-gray-50 text-gray-400 border border-gray-200"}`}
          title="Lock/Unlock Dieline">
          {dielineLocked ? "🔒 Locked" : "🔓 Unlocked"}
        </button>

        {/* Ungroup/Regroup toggle */}
        <button onClick={() => { const c = fcRef.current; if (!c) return; if (!dielineUngrouped) { const objs = c.getObjects().slice(); let ungroupCount = 0; objs.forEach((o: any) => { if ((o._isGuideLayer || o._isDieLine) && o.type === "group") { const children = o.getObjects ? o.getObjects() : (o._objects || []); const clones: any[] = []; children.forEach((child: any) => { const cl = fabric.util.object.clone(child); const m = child.calcTransformMatrix?.() || [1,0,0,1,0,0]; cl.set({ left: m[4], top: m[5], _isDieLine: true, _isGuideLayer: true, selectable: !dielineLocked, evented: !dielineLocked }); cl.setCoords?.(); clones.push(cl); }); c.remove(o); clones.forEach((cl: any) => c.add(cl)); ungroupCount++; } }); if (ungroupCount > 0) { setDielineUngrouped(true); c.requestRenderAll(); pushHistory(); console.log("[Ungroup]", ungroupCount, "groups ungrouped"); } } else { const dieObjs = c.getObjects().filter((o: any) => o._isDieLine || o._isGuideLayer); if (dieObjs.length < 2) return; const F = (window as any).fabric || (typeof fabric !== "undefined" ? fabric : null); if (!F) return; dieObjs.forEach((o: any) => c.remove(o)); const grp = new F.Group(dieObjs, { _isDieLine: true, _isGuideLayer: true, selectable: !dielineLocked, evented: !dielineLocked, name: "__dieline_upload__" }); c.add(grp); setDielineUngrouped(false); c.requestRenderAll(); pushHistory(); console.log("[Regroup] objects regrouped"); } }}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${dielineUngrouped ? "bg-orange-50 text-orange-700 border border-orange-200" : "bg-gray-50 text-gray-400 border border-gray-200"}`}
          title={dielineUngrouped ? "Regroup dieline objects" : "Ungroup dieline into individual objects"}>
          {dielineUngrouped ? "Regroup" : "Ungroup"}
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />
'''

# Replace lines 2055-2063 (L2056-L2064)
lines[2055:2064] = [new_toolbar]

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.writelines(lines)

print(f"FIXED: Header UI improved")
print(f"- Dieline On/Off toggle with blue highlight")
print(f"- Info On/Off toggle (no dieline = no action)")
print(f"- Lock/Unlock with amber highlight")
print(f"- Ungroup/Regroup combined into one button")
print(f"Total lines: {len(lines)}")
