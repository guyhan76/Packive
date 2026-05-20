with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

old_start = '{/* Ungroup/Regroup toggle */}'
start_idx = content.find(old_start)

end_marker = '{dielineUngrouped ? "Regroup" : "Ungroup"}'
end_idx = content.find(end_marker, start_idx)
end_idx = content.find('</button>', end_idx) + len('</button>')
if content[end_idx:end_idx+1] == '\n':
    end_idx += 1

print(f"Replacing block: {end_idx - start_idx} chars")

# Use Fabric v7 Group.removeAll() which returns children with correct absolute transforms
new_block = """{/* Ungroup/Regroup toggle */}
        <button onClick={async () => { const c = fcRef.current; if (!c) return;
          const F = fabricModRef.current || await import("fabric");
          if (!dielineUngrouped) {
            /* === UNGROUP using Fabric v7 removeAll() === */
            const objs = c.getObjects().slice();
            let ungroupCount = 0;
            objs.forEach((o: any) => {
              if ((o._isGuideLayer || o._isDieLine) && o.type === "group") {
                console.log("[Ungroup] Group: left=" + o.left + " top=" + o.top + " scale=" + o.scaleX + " children=" + (o.getObjects?.()?.length || 0));
                /* removeAll() detaches children and applies group transform to each child */
                const children = typeof o.removeAll === "function" ? o.removeAll() : null;
                if (children && children.length > 0) {
                  c.remove(o);
                  children.forEach((child: any) => {
                    child.set({
                      _isDieLine: true,
                      _isGuideLayer: true,
                      selectable: !dielineLocked,
                      evented: !dielineLocked,
                    });
                    child.setCoords?.();
                    c.add(child);
                  });
                  console.log("[Ungroup] Placed " + children.length + " children. First: left=" + (children[0].left?.toFixed(1)) + " top=" + (children[0].top?.toFixed(1)) + " scaleX=" + (children[0].scaleX?.toFixed(4)));
                  ungroupCount++;
                } else {
                  console.log("[Ungroup] removeAll failed, trying manual fallback");
                  /* Fallback: get items, remove group, manually set coords */
                  const items = o.getObjects ? [...o.getObjects()] : [...(o._objects || [])];
                  const gLeft = o.left || 0, gTop = o.top || 0;
                  const gScaleX = o.scaleX || 1, gScaleY = o.scaleY || 1;
                  c.remove(o);
                  items.forEach((child: any) => {
                    child.set({
                      left: gLeft + (child.left || 0) * gScaleX,
                      top: gTop + (child.top || 0) * gScaleY,
                      scaleX: (child.scaleX || 1) * gScaleX,
                      scaleY: (child.scaleY || 1) * gScaleY,
                      _isDieLine: true, _isGuideLayer: true,
                      selectable: !dielineLocked, evented: !dielineLocked,
                    });
                    child.setCoords?.();
                    c.add(child);
                  });
                  ungroupCount++;
                }
              }
            });
            if (ungroupCount > 0) {
              setDielineUngrouped(true);
              c.requestRenderAll();
              pushHistory();
            }
          } else {
            /* === REGROUP: collect all die objects, store their absolute transforms, create new group === */
            const dieObjs = c.getObjects().filter((o: any) => o._isDieLine || o._isGuideLayer);
            if (dieObjs.length < 2) { console.log("[Regroup] Not enough objects"); return; }
            const GroupClass = F.Group;
            if (!GroupClass) { console.log("[Regroup] Group class not found"); return; }
            /* Store absolute positions */
            const absData = dieObjs.map((o: any) => ({
              left: o.left, top: o.top, scaleX: o.scaleX, scaleY: o.scaleY, angle: o.angle
            }));
            dieObjs.forEach((o: any) => c.remove(o));
            /* Create group - Fabric v7 Group constructor adjusts children coords automatically */
            const grp = new GroupClass(dieObjs, {
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
            console.log("[Regroup] " + dieObjs.length + " objects regrouped. Group: left=" + grp.left?.toFixed(1) + " top=" + grp.top?.toFixed(1) + " scale=" + grp.scaleX?.toFixed(4));
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

print("FIXED: Ungroup uses Fabric v7 removeAll()")
