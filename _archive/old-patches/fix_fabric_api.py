with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

old_block = """const F = (window as any).__fabric || fabricModRef.current;
                    if (!F) { console.error("No Fabric instance"); return; }
                    F.Image.fromURL(encoded, (img: any) => {
                      if (!img) { console.error("Fabric Image.fromURL returned null"); return; }
                      img.set({ left: 100, top: 100 });
                      img.scaleToWidth(80);
                      c.add(img);
                      c.setActiveObject(img);
                      c.requestRenderAll();
                      if (typeof refreshLayers === "function") refreshLayers();
                      console.log("Symbol added to canvas:", sym.name);
                    }, { crossOrigin: "anonymous" });
                    setShowSymbolPanel(false);"""

new_block = """import("fabric").then(({ FabricImage }) => {
                      FabricImage.fromURL(encoded).then((img) => {
                        if (!img) { console.error("FabricImage.fromURL returned null"); return; }
                        img.set({ left: 100, top: 100 });
                        img.scaleToWidth(80);
                        c.add(img);
                        c.setActiveObject(img);
                        c.requestRenderAll();
                        if (typeof refreshLayers === "function") refreshLayers();
                        console.log("Symbol added to canvas:", sym.name);
                      });
                    });
                    setShowSymbolPanel(false);"""

if old_block in src:
    src = src.replace(old_block, new_block)
    print("Replaced callback-style with Promise-style FabricImage.fromURL")
else:
    print("Exact match not found, trying partial...")
    if "F.Image.fromURL(encoded," in src:
        # Replace the F.Image.fromURL block
        idx = src.index("F.Image.fromURL(encoded,")
        # Go back to find "const F ="
        search_back = src[max(0,idx-200):idx]
        f_start = search_back.rfind("const F =")
        if f_start >= 0:
            f_start = idx - 200 + f_start + (200 - (idx - max(0,idx-200)))
            f_start = max(0, idx - 200) + search_back.rfind("const F =")
        
        # Find end: after setShowSymbolPanel(false);
        end_marker = "setShowSymbolPanel(false);"
        end_idx = src.index(end_marker, idx) + len(end_marker)
        
        old = src[f_start:end_idx]
        src = src[:f_start] + new_block + src[end_idx:]
        print(f"Partial replace done ({len(old)} chars)")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f"Total lines: {len(src.splitlines())}")
