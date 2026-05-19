with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

fixes = 0

# FIX 1: New button - add dielineSizes/dielineModelInfo reset
old_new = 'setDielineFileName(""); setDielineUngrouped(false); pushHistory();'
new_new = 'setDielineFileName(""); setDielineUngrouped(false); setDielineSizes(null); setDielineModelInfo(""); pushHistory();'
if old_new in content:
    content = content.replace(old_new, new_new)
    fixes += 1
    print("FIXED: New button - resets dielineSizes and dielineModelInfo")
else:
    print("SKIP: New button reset not found")

# FIX 2: Info toggle - also toggle _isPanelLabel and _isPanelOverlay objects
old_info = 'const nv = !dielineInfoVisible; setDielineInfoVisible(nv); let count = 0; c.getObjects().forEach((o: any) => { if (o._isDielineInfo) { o.visible = nv; count++; } if (o._objects) o._objects.forEach((ch: any) => { if (ch._isDielineInfo) { ch.visible = nv; count++; } }); }); console.log("[Info] toggled", count, "info objects to", nv); c.requestRenderAll();'
new_info = 'const nv = !dielineInfoVisible; setDielineInfoVisible(nv); let count = 0; c.getObjects().forEach((o: any) => { if (o._isDielineInfo || o._isPanelLabel || o._isPanelOverlay) { o.visible = nv; count++; } if (o._objects) o._objects.forEach((ch: any) => { if (ch._isDielineInfo || ch._isPanelLabel || ch._isPanelOverlay) { ch.visible = nv; count++; } }); }); console.log("[Info] toggled", count, "info objects to", nv); c.requestRenderAll();'
if old_info in content:
    content = content.replace(old_info, new_info)
    fixes += 1
    print("FIXED: Info toggle - now includes _isPanelLabel and _isPanelOverlay")
else:
    print("SKIP: Info toggle not found")

# FIX 3: Improve Ungroup - use getObjects() on group, handle Fabric v7
old_ungroup = """const objs = c.getObjects(); let ungroupCount = 0; objs.forEach((o: any) => { if (o._isGuideLayer && o._objects) { const children = [...o._objects]; c.remove(o); children.forEach((ch: any) => { ch._isDieLine = true; ch._isGuideLayer = true; ch.selectable = !dielineLocked; ch.evented = !dielineLocked; c.add(ch); ungroupCount++; }); } }); if (ungroupCount > 0) { setDielineUngrouped(true); c.requestRenderAll(); pushHistory(); refreshLayers(); console.log("[Ungroup]", ungroupCount, "children extracted"); }"""
new_ungroup = """const objs = c.getObjects().slice(); let ungroupCount = 0; objs.forEach((o: any) => { if ((o._isGuideLayer || o._isDieLine) && o.type === 'group') { const children = o.getObjects ? o.getObjects() : (o._objects || []); const cloned = [...children]; const groupLeft = o.left || 0; const groupTop = o.top || 0; c.remove(o); cloned.forEach((ch: any) => { ch._isDieLine = true; ch._isGuideLayer = true; ch.selectable = !dielineLocked; ch.evented = !dielineLocked; if (o.group) { const pt = o.translateToOriginPoint(ch.getCenterPoint(), 'center', 'center'); ch.set({ left: pt.x, top: pt.y }); } c.add(ch); ungroupCount++; }); } }); if (ungroupCount > 0) { setDielineUngrouped(true); c.requestRenderAll(); pushHistory(); refreshLayers(); console.log("[Ungroup]", ungroupCount, "children extracted"); } else { console.log("[Ungroup] No groups found to ungroup"); }"""
if old_ungroup in content:
    content = content.replace(old_ungroup, new_ungroup)
    fixes += 1
    print("FIXED: Ungroup - improved for Fabric v7")
else:
    print("SKIP: Ungroup not found - trying partial match")
    # Try simpler match
    if 'o._isGuideLayer && o._objects' in content:
        content = content.replace('o._isGuideLayer && o._objects', '(o._isGuideLayer || o._isDieLine) && o.type === "group"')
        fixes += 1
        print("FIXED: Ungroup condition updated")

# FIX 4: Add Regroup button after Ungroup
old_after_ungroup = """title="Ungroup Dieline">Ungroup</button>\n        <div className="w-px h-6 bg-gray-200" />"""
new_after_ungroup = """title="Ungroup Dieline">Ungroup</button>
        <button onClick={() => { const c = fcRef.current; if (!c) return; const dieObjs = c.getObjects().filter((o: any) => o._isDieLine || o._isGuideLayer); if (dieObjs.length < 2) { console.log("[Regroup] Not enough objects"); return; } const F = fabricModRef.current; if (!F) return; dieObjs.forEach((o: any) => c.remove(o)); const group = new F.Group(dieObjs); group.set({ _isDieLine: true, _isGuideLayer: true, selectable: !dielineLocked, evented: !dielineLocked, name: "__dieline_upload__" }); c.add(group); setDielineUngrouped(false); c.requestRenderAll(); pushHistory(); refreshLayers(); console.log("[Regroup]", dieObjs.length, "objects regrouped"); }} className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded" title="Regroup Dieline">Regroup</button>
        <div className="w-px h-6 bg-gray-200" />"""
if old_after_ungroup in content:
    content = content.replace(old_after_ungroup, new_after_ungroup)
    fixes += 1
    print("FIXED: Added Regroup button")
else:
    print("SKIP: Regroup insertion point not found")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)

total = len(content.split('\n'))
print(f"\nTotal fixes: {fixes}")
print(f"Total lines: {total}")
