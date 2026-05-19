with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

count = 0

# Fix 1: fill - propagate to Group children
old_fill = 'else if (key === "fill") obj.set({ fill: value });'
new_fill = '''else if (key === "fill") {
      obj.set({ fill: value });
      if ((obj as any)._objects) { (obj as any)._objects.forEach((child: any) => { child.set({ fill: value }); if (child._objects) child._objects.forEach((gc: any) => gc.set({ fill: value })); }); }
    }'''
if old_fill in src:
    src = src.replace(old_fill, new_fill)
    count += 1
    print("FIXED: fill propagation to Group children")

# Fix 2: stroke - propagate to Group children
old_stroke = 'else if (key === "stroke") obj.set({ stroke: value });'
new_stroke = '''else if (key === "stroke") {
      obj.set({ stroke: value });
      if ((obj as any)._objects) { (obj as any)._objects.forEach((child: any) => { child.set({ stroke: value }); if (child._objects) child._objects.forEach((gc: any) => gc.set({ stroke: value })); }); }
    }'''
if old_stroke in src:
    src = src.replace(old_stroke, new_stroke)
    count += 1
    print("FIXED: stroke propagation to Group children")

# Fix 3: fillCmyk - propagate to Group children
old_fcmyk = 'else if (key === "fillCmyk") { const cm = value as {c:number;m:number;y:number;k:number}; obj.set({ fill: cmykToHex(cm.c,cm.m,cm.y,cm.k) }); (obj as any)._cmykFill = cm; }'
new_fcmyk = 'else if (key === "fillCmyk") { const cm = value as {c:number;m:number;y:number;k:number}; const hex = cmykToHex(cm.c,cm.m,cm.y,cm.k); obj.set({ fill: hex }); (obj as any)._cmykFill = cm; if ((obj as any)._objects) { (obj as any)._objects.forEach((child: any) => { child.set({ fill: hex }); if (child._objects) child._objects.forEach((gc: any) => gc.set({ fill: hex })); }); } }'
if old_fcmyk in src:
    src = src.replace(old_fcmyk, new_fcmyk)
    count += 1
    print("FIXED: fillCmyk propagation to Group children")

# Fix 4: strokeCmyk - propagate to Group children
old_scmyk = 'else if (key === "strokeCmyk") { const cm = value as {c:number;m:number;y:number;k:number}; obj.set({ stroke: cmykToHex(cm.c,cm.m,cm.y,cm.k) }); (obj as any)._cmykStroke = cm; }'
new_scmyk = 'else if (key === "strokeCmyk") { const cm = value as {c:number;m:number;y:number;k:number}; const hex = cmykToHex(cm.c,cm.m,cm.y,cm.k); obj.set({ stroke: hex }); (obj as any)._cmykStroke = cm; if ((obj as any)._objects) { (obj as any)._objects.forEach((child: any) => { child.set({ stroke: hex }); if (child._objects) child._objects.forEach((gc: any) => gc.set({ stroke: hex })); }); } }'
if old_scmyk in src:
    src = src.replace(old_scmyk, new_scmyk)
    count += 1
    print("FIXED: strokeCmyk propagation to Group children")

# Fix 5: spotFill - propagate to Group children
old_sfill = '''else if (key === "spotFill") { const s = value as {name:string;hex:string;cmyk?:[number,number,number,number]}; obj.set({ fill: s.hex }); (obj as any)._spotFill = true; (obj as any)._spotFillName = s.name; if (s.cmyk) { (obj as any)._cmykFill = {c:s.cmyk[0],m:s.cmyk[1],y:s.cmyk[2],k:s.cmyk[3]}; } }'''
new_sfill = '''else if (key === "spotFill") { const s = value as {name:string;hex:string;cmyk?:[number,number,number,number]}; obj.set({ fill: s.hex }); (obj as any)._spotFill = true; (obj as any)._spotFillName = s.name; if (s.cmyk) { (obj as any)._cmykFill = {c:s.cmyk[0],m:s.cmyk[1],y:s.cmyk[2],k:s.cmyk[3]}; } if ((obj as any)._objects) { (obj as any)._objects.forEach((child: any) => { child.set({ fill: s.hex }); if (child._objects) child._objects.forEach((gc: any) => gc.set({ fill: s.hex })); }); } }'''
if old_sfill in src:
    src = src.replace(old_sfill, new_sfill)
    count += 1
    print("FIXED: spotFill propagation to Group children")

print(f"\nTotal fixes: {count}")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"Total lines: {len(src.splitlines())}")
