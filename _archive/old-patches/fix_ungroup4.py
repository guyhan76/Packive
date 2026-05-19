with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

# Find and replace the entire Ungroup/Regroup button block
start_marker = '{/* Ungroup/Regroup toggle */}'
start_idx = content.find(start_marker)
if start_idx == -1:
    print("NOT FOUND")
    exit()

# Find the end: look for the closing </button> and next line
search_from = start_idx
# Find "Regroup" : "Ungroup"} then </button>
end_marker = '{dielineUngrouped ? "Regroup" : "Ungroup"}\n        </button>'
end_idx = content.find(end_marker, start_idx)
if end_idx == -1:
    # Try alternate
    end_marker2 = '{dielineUngrouped ? "Regroup" : "Ungroup"}'
    end_idx = content.find(end_marker2, start_idx)
    end_idx = content.find('</button>', end_idx) + len('</button>')
else:
    end_idx = end_idx + len(end_marker)

# Also grab trailing newline
if content[end_idx:end_idx+1] == '\n':
    end_idx += 1

old_block = content[start_idx:end_idx]
print(f"Removing block: {len(old_block)} chars")

new_block = """{/* Ungroup/Regroup toggle */}
        <button onClick={async () => { const c = fcRef.current; if (!c) return;
          const F = fabricModRef.current || await import("fabric");
          if (!dielineUngrouped) {
            /* === UNGROUP === */
            const objs = c.getObjects().slice();
            let ungroupCount = 0;
            objs.forEach((o: any) => {
              if ((o._isGuideLayer || o._isDieLine) && o.type === "group") {
                const items = typeof o.getObjects === "function" ? o.getObjects() : (o._objects || []);
                const groupMatrix = o.calcTransformMatrix ? o.calcTransformMatrix() : [1,0,0,1, o.left||0, o.top||0];
                console.log("[Ungroup] Group matrix:", groupMatrix, "children:", items.length);
                /* Remove group from canvas first */
                c.remove(o);
                /* Add each child with absolute coordinates */
                items.forEach((child: any) => {
                  /* Use fabric.util.multiplyTransformMatrices to get absolute transform */
                  const childMatrix = child.calcTransformMatrix ? child.calcTransformMatrix() : [1,0,0,1, child.left||0, child.top||0];
                  const absMatrix = F.util?.multiplyTransformMatrices
                    ? F.util.multiplyTransformMatrices(groupMatrix, childMatrix)
                    : childMatrix;
                  /* Decompose matrix to get position, scale, angle */
                  let absLeft = absMatrix[4];
                  let absTop = absMatrix[5];
                  let absScaleX = Math.sqrt(absMatrix[0]*absMatrix[0] + absMatrix[1]*absMatrix[1]);
                  let absScaleY = Math.sqrt(absMatrix[2]*absMatrix[2] + absMatrix[3]*absMatrix[3]);
                  let absAngle = Math.atan2(absMatrix[1], absMatrix[0]) * (180 / Math.PI);
                  child.set({
                    left: absLeft,
                    top: absTop,
                    scaleX: absScaleX,
                    scaleY: absScaleY,
                    angle: absAngle,
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
              console.log("[Ungroup]", ungroupCount, "groups ungrouped");
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

print("FIXED: Ungroup/Regroup using fabricModRef.current")
print("- Ungroup: multiplyTransformMatrices for correct absolute coords")
print("- Regroup: uses F.Group from imported fabric module")
