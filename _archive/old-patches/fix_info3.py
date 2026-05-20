with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

# Replace the Info toggle handler with a recursive version
old_info = '''if (!hasDieline) return; const nv = !dielineInfoVisible; setDielineInfoVisible(nv); let count = 0; c.getObjects().forEach((o: any) => { if (o._isDielineInfo || o._isPanelLabel || o._isPanelOverlay || o._isDimLine || o._isDimArrow || (o.name && (o.name.includes("dim") || o.name.includes("arrow") || o.name.includes("panel")))) { o.visible = nv; o.dirty = true; o.setCoords?.(); count++; } if (o._isGuideLayer && o.type === "group" && typeof o.getObjects === "function") { o.getObjects().forEach((child: any) => { if (child._isDielineInfo || child._isPanelLabel) { child.visible = nv; count++; } }); o.dirty = true; o.setCoords?.(); } }); console.log("[Info toggle]", nv ? "ON" : "OFF", count, "objects"); c.requestRenderAll();'''

new_info = '''if (!hasDieline) return; const nv = !dielineInfoVisible; setDielineInfoVisible(nv); let count = 0; const toggleDeep = (obj: any) => { if (obj._isDielineInfo || obj._isPanelLabel || obj._isPanelOverlay || obj._isDimLine || obj._isDimArrow) { obj.visible = nv; obj.dirty = true; obj.setCoords?.(); count++; } if (obj.type === "group" && typeof obj.getObjects === "function") { obj.getObjects().forEach((child: any) => toggleDeep(child)); obj.dirty = true; obj.setCoords?.(); } }; c.getObjects().forEach((o: any) => toggleDeep(o)); console.log("[Info toggle]", nv ? "ON" : "OFF", count, "objects"); c.requestRenderAll();'''

if old_info in content:
    content = content.replace(old_info, new_info)
    print("FIXED: Info toggle - recursive deep search for _isDielineInfo")
else:
    print("NOT FOUND - trying partial match")
    # Try finding just the key part
    if 'o._isDimLine || o._isDimArrow' in content:
        print("Found partial - the fix was already partially applied")
    else:
        print("Could not find info toggle code")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)
