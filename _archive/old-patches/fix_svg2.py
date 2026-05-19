with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Replace the loadSVGFromString approach with fabric.Image.fromURL using the path
old_click = """((window as any).__fabric || fabricModRef.current).loadSVGFromString(sym.svg.replace(/currentColor/g, "#000000"), (objects: any[], options: any) => {
                      const group = ((window as any).__fabric || fabricModRef.current).util.groupSVGElements(objects, options);
                      group.set({ left: 100, top: 100, scaleX: 1, scaleY: 1 });
                      group.scaleToWidth(60);
                      c.add(group);
                      c.setActiveObject(group);
                      c.requestRenderAll();
                      refreshLayers();
                    });"""

new_click = """const F = (window as any).__fabric || fabricModRef.current;
                    F.loadSVGFromURL(sym.path, (objects: any[], options: any) => {
                      if (!objects || objects.length === 0) return;
                      const group = objects.length === 1 ? objects[0] : F.util.groupSVGElements(objects, options);
                      group.set({ left: 100, top: 100 });
                      group.scaleToWidth(80);
                      c.add(group);
                      c.setActiveObject(group);
                      c.requestRenderAll();
                      refreshLayers();
                    });"""

if old_click in src:
    src = src.replace(old_click, new_click)
    print('Updated SVG loading to use loadSVGFromURL')
else:
    print('Old click pattern not found, trying partial match')
    if 'loadSVGFromString(sym.svg' in src:
        # Find and replace the block
        idx = src.find('loadSVGFromString(sym.svg')
        block_start = src.rfind('{', 0, idx)
        # Find matching closing
        depth = 0
        pos = block_start
        while pos < len(src):
            if src[pos] == '{': depth += 1
            elif src[pos] == '}': depth -= 1
            if depth == 0: break
            pos += 1
        old_block = src[block_start:pos+1]
        new_block = """{
                    const F = (window as any).__fabric || fabricModRef.current;
                    F.loadSVGFromURL(sym.path, (objects: any[], options: any) => {
                      if (!objects || objects.length === 0) return;
                      const group = objects.length === 1 ? objects[0] : F.util.groupSVGElements(objects, options);
                      group.set({ left: 100, top: 100 });
                      group.scaleToWidth(80);
                      c.add(group);
                      c.setActiveObject(group);
                      c.requestRenderAll();
                      refreshLayers();
                    });
                    setShowSymbolPanel(false);
                  }"""
        src = src.replace(old_block, new_block)
        print('Updated SVG loading (partial match)')

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
