with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    src = f.read()

old = 'else if (key === "fontFamily") obj.set({ fontFamily: value });'
new = '''else if (key === "fontFamily") {
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
    }'''

if old in src:
    src = src.replace(old, new)
    print('Fixed fontFamily bounding box recalculation')
else:
    print('ERROR: pattern not found')

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
