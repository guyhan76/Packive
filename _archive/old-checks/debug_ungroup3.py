with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

old_debug = '''console.log("[Ungroup] Group:", { left: o.left, top: o.top, scaleX: o.scaleX, scaleY: o.scaleY, width: o.width, height: o.height, angle: o.angle });
                console.log("[Ungroup] Group matrix:", groupMatrix);
                console.log("[Ungroup] Children count:", items.length);
                if (items.length > 0) {
                  const c0 = items[0];
                  const cm = c0.calcTransformMatrix ? c0.calcTransformMatrix() : null;
                  console.log("[Ungroup] Child[0]:", { type: c0.type, left: c0.left, top: c0.top, scaleX: c0.scaleX, scaleY: c0.scaleY, width: c0.width, height: c0.height });
                  console.log("[Ungroup] Child[0] matrix:", cm);
                  const abs = F.util?.multiplyTransformMatrices ? F.util.multiplyTransformMatrices(groupMatrix, cm) : cm;
                  console.log("[Ungroup] Child[0] absolute:", abs);
                  console.log("[Ungroup] Child[0] abs pos:", { left: abs?.[4], top: abs?.[5] });
                }'''

new_debug = '''console.log("[Ungroup] Group: left=" + o.left + " top=" + o.top + " scaleX=" + o.scaleX + " scaleY=" + o.scaleY + " width=" + o.width + " height=" + o.height + " angle=" + o.angle);
                console.log("[Ungroup] Group matrix: [" + groupMatrix.join(", ") + "]");
                console.log("[Ungroup] Children: " + items.length);
                if (items.length > 0) {
                  const c0 = items[0];
                  const cm = c0.calcTransformMatrix ? c0.calcTransformMatrix() : null;
                  console.log("[Ungroup] Child0: type=" + c0.type + " left=" + c0.left + " top=" + c0.top + " scaleX=" + c0.scaleX + " scaleY=" + c0.scaleY + " w=" + c0.width + " h=" + c0.height);
                  if (cm) console.log("[Ungroup] Child0 matrix: [" + cm.join(", ") + "]");
                  const abs = F.util?.multiplyTransformMatrices ? F.util.multiplyTransformMatrices(groupMatrix, cm) : cm;
                  if (abs) console.log("[Ungroup] Child0 absolute: [" + abs.join(", ") + "] => left=" + abs[4] + " top=" + abs[5]);
                }'''

if old_debug in content:
    content = content.replace(old_debug, new_debug)
    print("FIXED: Debug uses string concatenation")
else:
    print("NOT FOUND")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)
