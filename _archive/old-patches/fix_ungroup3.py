with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

# Replace the entire Ungroup/Regroup button with Fabric v7 compatible version
old_start = '{/* Ungroup/Regroup toggle */}\n        <button onClick={() => { const c = fcRef.current; if (!c) return; if (!dielineUngrouped)'
old_end_marker = '{dielineUngrouped ? "Regroup" : "Ungroup"}\n        </button>'

start_idx = content.find('{/* Ungroup/Regroup toggle */')
if start_idx == -1:
    print("NOT FOUND")
    exit()

# Find the closing </button> after this
end_search = content.find('</button>', start_idx)
end_idx = content.find('\n', end_search) + 1

old_block = content[start_idx:end_idx]
print(f"Found block: {len(old_block)} chars")

new_block = """{/* Ungroup/Regroup toggle */}
        <button onClick={() => { const c = fcRef.current; if (!c) return;
          if (!dielineUngrouped) {
            /* === UNGROUP === */
            const objs = c.getObjects().slice();
            let ungroupCount = 0;
            objs.forEach((o: any) => {
              if ((o._isGuideLayer || o._isDieLine) && o.type === "group") {
                const groupLeft = o.left || 0;
                const groupTop = o.top || 0;
                const groupScaleX = o.scaleX || 1;
                const groupScaleY = o.scaleY || 1;
                const groupAngle = o.angle || 0;
                const items = typeof o.getObjects === "function" ? o.getObjects() : (o._objects || []);
                c.remove(o);
                items.forEach((child: any) => {
                  /* Transform child coords from group-local to canvas-absolute */
                  const m = child.calcTransformMatrix ? child.calcTransformMatrix() : null;
                  if (m) {
                    child.set({
                      left: m[4],
                      top: m[5],
                    });
                  } else {
                    child.set({
                      left: groupLeft + (child.left || 0) * groupScaleX,
                      top: groupTop + (child.top || 0) * groupScaleY,
                    });
                  }
                  child.set({
                    scaleX: (child.scaleX || 1) * groupScaleX,
                    scaleY: (child.scaleY || 1) * groupScaleY,
                    angle: (child.angle || 0) + groupAngle,
                    _isDieLine: true,
                    _isGuideLayer: true,
                    selectable: !dielineLocked,
                    evented: !dielineLocked,
                  });
                  child.setCoords?.();
                  c.add(child);
                });
                ungroupCount++;
              }
            });
            if (ungroupCount > 0) {
              setDielineUngrouped(true);
              c.requestRenderAll();
              pushHistory();
              console.log("[Ungroup]", ungroupCount, "groups split into children");
            }
          } else {
            /* === REGROUP === */
            const dieObjs = c.getObjects().filter((o: any) => o._isDieLine || o._isGuideLayer);
            if (dieObjs.length < 2) { console.log("[Regroup] Not enough objects"); return; }
            const Fab = (window as any).fabric;
            if (!Fab?.Group) { console.log("[Regroup] fabric.Group not found"); return; }
            /* Calculate group center */
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            dieObjs.forEach((o: any) => {
              const bound = o.getBoundingRect?.() || { left: o.left||0, top: o.top||0, width: o.width||0, height: o.height||0 };
              minX = Math.min(minX, bound.left);
              minY = Math.min(minY, bound.top);
              maxX = Math.max(maxX, bound.left + bound.width);
              maxY = Math.max(maxY, bound.top + bound.height);
            });
            dieObjs.forEach((o: any) => c.remove(o));
            const grp = new Fab.Group(dieObjs, {
              left: minX,
              top: minY,
              _isDieLine: true,
              _isGuideLayer: true,
              selectable: !dielineLocked,
              evented: !dielineLocked,
              name: "__dieline_upload__",
            });
            c.add(grp);
            setDielineUngrouped(false);
            c.requestRenderAll();
            pushHistory();
            console.log("[Regroup]", dieObjs.length, "objects regrouped");
          }
        }}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${dielineUngrouped ? "bg-orange-50 text-orange-700 border border-orange-200" : "bg-gray-50 text-gray-400 border border-gray-200"}`}
          title={dielineUngrouped ? "Regroup dieline objects" : "Ungroup dieline into individual objects"}>
          {dielineUngrouped ? "Regroup" : "Ungroup"}
        </button>
"""

content = content[:start_idx] + new_block + content[end_idx:]

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)

print("FIXED: Ungroup/Regroup rewritten for Fabric v7")
print("- Ungroup: uses child.calcTransformMatrix() for correct positioning")
print("- Regroup: calculates bounding box, creates new Group")
