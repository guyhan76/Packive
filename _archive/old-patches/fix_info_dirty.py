with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

# Fix Info toggle - add group.dirty = true after modifying children
old_info = 'const nv = !dielineInfoVisible; setDielineInfoVisible(nv); let count = 0; c.getObjects().forEach((o: any) => { if (o._isDielineInfo || o._isPanelLabel || o._isPanelOverlay) { o.visible = nv; count++; } if (o._objects) o._objects.forEach((ch: any) => { if (ch._isDielineInfo || ch._isPanelLabel || ch._isPanelOverlay) { ch.visible = nv; count++; } }); }); console.log("[Info] toggled", count, "info objects to", nv); c.requestRenderAll();'

new_info = 'const nv = !dielineInfoVisible; setDielineInfoVisible(nv); let count = 0; c.getObjects().forEach((o: any) => { if (o._isDielineInfo || o._isPanelLabel || o._isPanelOverlay) { o.visible = nv; count++; } let childChanged = false; if (o._objects) { o._objects.forEach((ch: any) => { if (ch._isDielineInfo || ch._isPanelLabel || ch._isPanelOverlay) { ch.visible = nv; count++; childChanged = true; } }); } if (o.getObjects) { try { o.getObjects().forEach((ch: any) => { if (ch._isDielineInfo || ch._isPanelLabel || ch._isPanelOverlay) { ch.visible = nv; count++; childChanged = true; } }); } catch(e) {} } if (childChanged) { o.dirty = true; o.setCoords?.(); } }); console.log("[Info] toggled", count, "info objects to", nv); c.requestRenderAll();'

if old_info in content:
    content = content.replace(old_info, new_info)
    print("FIXED: Info toggle - added dirty flag and getObjects() for Fabric v7")
else:
    print("NOT FOUND")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)

print(f"Total lines: {len(content.split(chr(10)))}")
