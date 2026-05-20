with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

# Add more detailed logging after ungroup
old_log = 'console.log("[Ungroup] Group matrix:", groupMatrix, "children:", items.length);'
new_log = '''console.log("[Ungroup] Group:", { left: o.left, top: o.top, scaleX: o.scaleX, scaleY: o.scaleY, width: o.width, height: o.height, angle: o.angle });
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

if old_log in content:
    content = content.replace(old_log, new_log)
    print("ADDED: Detailed ungroup debug logging")
else:
    print("NOT FOUND")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)
