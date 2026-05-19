with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

# Add a debug log to the Ungroup button before the actual ungroup logic
old_ungroup_start = """if (!dielineUngrouped) {
            /* === UNGROUP === */
            const objs = c.getObjects().slice();"""

new_ungroup_start = """if (!dielineUngrouped) {
            /* === UNGROUP === */
            const objs = c.getObjects().slice();
            /* DEBUG: log group properties */
            objs.forEach((o: any) => {
              if ((o._isGuideLayer || o._isDieLine) && o.type === "group") {
                console.log("[Ungroup Debug] Group props:", {
                  left: o.left, top: o.top,
                  scaleX: o.scaleX, scaleY: o.scaleY,
                  width: o.width, height: o.height,
                  angle: o.angle,
                  childCount: o.getObjects?.()?.length || o._objects?.length || 0,
                });
                const items = typeof o.getObjects === "function" ? o.getObjects() : (o._objects || []);
                if (items.length > 0) {
                  const first = items[0];
                  const m = first.calcTransformMatrix?.();
                  console.log("[Ungroup Debug] First child:", {
                    type: first.type, left: first.left, top: first.top,
                    scaleX: first.scaleX, scaleY: first.scaleY,
                    matrix: m ? [m[0],m[1],m[2],m[3],m[4],m[5]] : null,
                  });
                }
                /* Also check if group has ungroupOnCanvas */
                console.log("[Ungroup Debug] Has ungroupOnCanvas:", typeof o.ungroupOnCanvas);
                console.log("[Ungroup Debug] Has toActiveSelection:", typeof o.toActiveSelection);
                console.log("[Ungroup Debug] Has removeAll:", typeof o.removeAll);
              }
            });"""

if old_ungroup_start in content:
    content = content.replace(old_ungroup_start, new_ungroup_start)
    print("ADDED: Debug logging to Ungroup")
else:
    print("NOT FOUND")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)
