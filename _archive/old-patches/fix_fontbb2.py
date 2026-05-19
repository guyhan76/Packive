with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

# Replace the fontFamily handler we added before
old = """else if (key === "fontFamily") {
      obj.set({ fontFamily: value });
      if (obj.type === "textbox" || obj.type === "i-text" || obj.type === "text") {
        (obj as any).initDimensions?.();
        (obj as any)._clearCache?.();
        (obj as any).setCoords?.();
        // Delay re-calc for font loading
        setTimeout(() => {
          (obj as any).initDimensions?.();
          (obj as any)._clearCache?.();
          (obj as any).setCoords?.();
          c.requestRenderAll();
        }, 300);
        setTimeout(() => {
          (obj as any).initDimensions?.();
          (obj as any)._clearCache?.();
          (obj as any).setCoords?.();
          c.requestRenderAll();
        }, 800);
      }
    }"""

new = """else if (key === "fontFamily") {
      obj.set({ fontFamily: value });
      if (obj.type === "textbox" || obj.type === "i-text" || obj.type === "text") {
        const tObj = obj as any;
        const recalc = () => {
          tObj._clearCache?.();
          tObj.dirty = true;
          tObj.initDimensions?.();
          // Force width recalculation: temporarily switch to auto-width
          const oldW = tObj.width;
          const text = tObj.text || "";
          // Measure actual text width with new font
          const ctx = c.getContext();
          if (ctx) {
            ctx.font = (tObj.fontStyle||"normal") + " " + (tObj.fontWeight||"normal") + " " + (tObj.fontSize||40) + "px " + value;
            const measured = ctx.measureText(text);
            const newW = measured.width + 20;
            if (newW > oldW) {
              tObj.set({ width: newW });
            }
          }
          tObj.initDimensions?.();
          tObj.setCoords?.();
          c.requestRenderAll();
        };
        recalc();
        setTimeout(recalc, 400);
        setTimeout(recalc, 1000);
      }
    }"""

if old in src:
    src = src.replace(old, new)
    print('Updated fontFamily handler with width recalculation')
else:
    print('ERROR: old pattern not found')

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
