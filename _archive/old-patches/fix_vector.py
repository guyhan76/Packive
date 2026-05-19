with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Replace the Image.fromURL approach with loadSVGFromString for color-editable vectors
old_handler = '''const svgStr = sym.svg.replace(/currentColor/g, "#000000");
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(svgStr, "image/svg+xml");
                    const svgEl = doc.querySelector("svg");
                    if (!svgEl) { console.error("No SVG element found"); return; }
                    if (!svgEl.getAttribute("xmlns")) svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                    svgEl.setAttribute("width", "200");
                    svgEl.setAttribute("height", "200");
                    const serialized = new XMLSerializer().serializeToString(svgEl);
                    const encoded = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(serialized)));
                    import("fabric").then(({ FabricImage }) => {
                      FabricImage.fromURL(encoded).then((img) => {
                        if (!img) { console.error("FabricImage.fromURL returned null"); return; }
                        const cw = c.getWidth(); const ch = c.getHeight();
                        img.set({ left: cw / 2, top: ch / 2, originX: 'center', originY: 'center' });
                        img.scaleToWidth(80);
                        c.add(img);
                        c.setActiveObject(img);
                        c.requestRenderAll();
                        if (typeof refreshLayers === "function") refreshLayers();
                        console.log("Symbol added to canvas:", sym.name);
                      });
                    });'''

new_handler = '''import("fabric").then(({ loadSVGFromString, util }) => {
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
                    });'''

if old_handler in src:
    src = src.replace(old_handler, new_handler)
    print("Replaced Image-based loader with SVG vector loader")
else:
    print("Exact handler not found, trying partial match...")
    if "FabricImage.fromURL(encoded)" in src and "Symbol added to canvas" in src:
        # Find the block
        start_marker = "const svgStr = sym.svg.replace"
        end_marker = 'console.log("Symbol added to canvas:", sym.name);\n                      });\n                    });'
        
        idx_start = src.find(start_marker)
        idx_end = src.find(end_marker)
        if idx_start > 0 and idx_end > 0:
            idx_end += len(end_marker)
            old_block = src[idx_start:idx_end]
            src = src[:idx_start] + new_handler + src[idx_end:]
            print(f"Partial replace done ({len(old_block)} chars)")
        else:
            print(f"Could not find markers: start={idx_start}, end={idx_end}")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"Total lines: {len(src.splitlines())}")
