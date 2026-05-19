with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

# Find the ungroup block and replace the child positioning logic
# The key insight: child.calcTransformMatrix() already includes group transform
# So we should NOT multiply with group matrix again

old_start = '{/* Ungroup/Regroup toggle */}'
start_idx = content.find(old_start)

end_marker = '{dielineUngrouped ? "Regroup" : "Ungroup"}'
end_idx = content.find(end_marker, start_idx)
end_idx = content.find('</button>', end_idx) + len('</button>')
if content[end_idx:end_idx+1] == '\n':
    end_idx += 1

print(f"Replacing block: {end_idx - start_idx} chars")

new_block = """{/* Ungroup/Regroup toggle */}
        <button onClick={async () => { const c = fcRef.current; if (!c) return;
          const F = fabricModRef.current || await import("fabric");
          if (!dielineUngrouped) {
            /* === UNGROUP: use child.calcTransformMatrix which already includes group transform === */
            const objs = c.getObjects().slice();
            let ungroupCount = 0;
            objs.forEach((o: any) => {
              if ((o._isGuideLayer || o._isDieLine) && o.type === "group") {
                const items = typeof o.getObjects === "function" ? o.getObjects() : (o._objects || []);
                console.log("[Ungroup] Group: left=" + o.left + " top=" + o.top + " scale=" + o.scaleX + " children=" + items.length);
                /* Save references before removing group */
                const childData: any[] = [];
                items.forEach((child: any) => {
                  /* calcTransformMatrix() returns absolute transform including parent group */
                  const m = child.calcTransformMatrix ? child.calcTransformMatrix() : null;
                  if (m) {
                    childData.push({
                      child,
                      absLeft: m[4],
                      absTop: m[5],
                      absScaleX: Math.sqrt(m[0]*m[0] + m[1]*m[1]),
                      absScaleY: Math.sqrt(m[2]*m[2] + m[3]*m[3]),
                      absAngle: Math.atan2(m[1], m[0]) * (180 / Math.PI),
                      flipY: (m[0]*m[3] - m[1]*m[2]) < 0,
                    });
                  }
                });
                c.remove(o);
                childData.forEach(({ child, absLeft, absTop, absScaleX, absScaleY, absAngle, flipY }) => {
                  child.set({
                    left: absLeft,
                    top: absTop,
                    scaleX: absScaleX,
                    scaleY: flipY ? -absScaleY : absScaleY,
                    angle: absAngle,
                    _isDieLine: true,
                    _isGuideLayer: true,
                    selectable: !dielineLocked,
                    evented: !dielineLocked,
                  });
                  child.setCoords?.();
                  c.add(child);
                });
                if (childData.length > 0) {
                  console.log("[Ungroup] First child placed at: left=" + childData[0].absLeft.toFixed(1) + " top=" + childData[0].absTop.toFixed(1) + " scale=" + childData[0].absScaleX.toFixed(4));
                }
                ungroupCount++;
              }
            });
            if (ungroupCount > 0) {
              setDielineUngrouped(true);
              c.requestRenderAll();
              pushHistory();
              console.log("[Ungroup] Done:", ungroupCount, "groups ungrouped");
            }
          } else {
            /* === REGROUP === */
            const dieObjs = c.getObjects().filter((o: any) => o._isDieLine || o._isGuideLayer);
            if (dieObjs.length < 2) { console.log("[Regroup] Not enough objects"); return; }
            const GroupClass = F.Group;
            if (!GroupClass) { console.log("[Regroup] Group class not found"); return; }
            dieObjs.forEach((o: any) => c.remove(o));
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

print("FIXED: Ungroup uses calcTransformMatrix directly (no double multiply)")
