with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

fixes = 0

# Fix 1: Ungroup - replace fabric.util.object.clone with window.fabric
old_ungroup = 'const cl = fabric.util.object.clone(child)'
new_ungroup = 'const F2 = (window as any).fabric; const cl = F2 ? F2.util.object.clone(child) : Object.assign({}, child)'
if old_ungroup in content:
    content = content.replace(old_ungroup, new_ungroup)
    fixes += 1
    print("Fix 1: fabric -> window.fabric for ungroup")

# Fix 2: Info toggle - add dim/arrow name matching
old_info = 'if (o._isDielineInfo || o._isPanelLabel || o._isPanelOverlay || o._isDimLine || o._isDimArrow || (o.name && (o.name.includes("dim") || o.name.includes("arrow") || o.name.includes("panel"))))'
if old_info not in content:
    old_info2 = 'if (o._isDielineInfo || o._isPanelLabel || o._isPanelOverlay) { o.visible = nv; o.dirty = true; o.setCoords?.(); count++; }'
    if old_info2 in content:
        new_info2 = 'if (o._isDielineInfo || o._isPanelLabel || o._isPanelOverlay || o._isDimLine || o._isDimArrow || (o.name && (o.name.includes("dim") || o.name.includes("arrow") || o.name.includes("panel")))) { o.visible = nv; o.dirty = true; o.setCoords?.(); count++; }'
        content = content.replace(old_info2, new_info2)
        fixes += 1
        print("Fix 2: Info toggle - added dim/arrow/panel matching")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)

print(f"Total fixes: {fixes}")
