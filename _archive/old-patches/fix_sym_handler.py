with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

old_handler = """import("fabric").then(({ loadSVGFromString, util }) => {
                      loadSVGFromString(sym.svg).then((result: any) => {
                        const objects = result.objects.filter((o: any) => o != null);
                        if (!objects || objects.length === 0) { console.error("No SVG objects loaded"); return; }
                        const group = util.groupSVGElements(objects, result.options);
                        const cw = c.getWidth(); const ch = c.getHeight();
                        group.set({ left: cw / 2, top: ch / 2, originX: "center", originY: "center" });
                        group.scaleToWidth(80);
                        c.add(group);
                        c.setActiveObject(group);
                        c.requestRenderAll();
                        if (typeof refreshLayers === "function") refreshLayers();
                        console.log("Symbol added to canvas:", sym.name);
                      });
                    });"""

new_handler = """(async () => {
                      try {
                        const F = fabricModRef.current;
                        if (!F) { console.error("No Fabric module"); return; }
                        const result = await F.loadSVGFromString(sym.svg);
                        const objects = (result.objects || []).filter((o: any) => o != null);
                        if (objects.length === 0) { console.error("No SVG objects loaded for", sym.name); return; }
                        const group = F.util.groupSVGElements(objects, result.options);
                        const cw = c.getWidth(); const ch = c.getHeight();
                        group.set({ left: cw / 2, top: ch / 2, originX: "center", originY: "center" });
                        group.scaleToWidth(80);
                        c.add(group);
                        c.setActiveObject(group);
                        c.requestRenderAll();
                        if (typeof refreshLayers === "function") refreshLayers();
                        console.log("Symbol added to canvas:", sym.name);
                      } catch (e) { console.error("Symbol load error:", sym.name, e); }
                    })();"""

if old_handler in src:
    src = src.replace(old_handler, new_handler)
    print("FIXED: Replaced dynamic import with fabricModRef.current")
else:
    # Try a more flexible match
    import re
    pattern = r'import\("fabric"\)\.then\(\(\{ loadSVGFromString, util \}\) => \{[^}]+loadSVGFromString\(sym\.svg\)[^}]+\}\);[\s]*\}\);'
    matches = list(re.finditer(pattern, src, re.DOTALL))
    if matches:
        # Replace the first match
        m = matches[0]
        src = src[:m.start()] + new_handler + src[m.end():]
        print("FIXED (regex): Replaced dynamic import with fabricModRef.current")
    else:
        print("NOT FOUND - printing context around sym.svg:")
        idx = src.find('sym.svg')
        if idx > -1:
            start = max(0, idx - 300)
            end = min(len(src), idx + 500)
            print(src[start:end])

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"Total lines: {len(src.splitlines())}")
