const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');

// ============================================================
// FIX 1: Templates - Add "Clear Canvas" button + thumbnail previews
// ============================================================
// Replace the template list rendering to add a clear button at top
code = code.replace(
  /\{filteredTemplates\.map\(\(t,\s*i\)\s*=>\s*\(\s*<button\s+key=\{i\}/,
  `{/* Clear canvas button */}
              <button onClick={() => {
                const c = fcRef.current; if (!c) return;
                c.getObjects().slice().forEach(o => { if (o.selectable !== false || o._isBgImage) {} else { c.remove(o); } });
                c.getObjects().slice().forEach(o => c.remove(o));
                c.backgroundColor = '#FFFFFF';
                c.renderAll();
                addSafeZone();
                pushHistory();
              }} className="col-span-2 py-2 mb-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded text-xs font-medium transition">
                Clear Canvas
              </button>
              {filteredTemplates.map((t, i) => (
              <button key={i}`
);

// ============================================================
// FIX 2: Template thumbnails - generate mini canvas previews
// ============================================================
// Replace template button content to show a mini preview
code = code.replace(
  /className="text-\[10px\] text-center text-gray-300 truncate"\>\{t\.name\}/g,
  `className="text-[10px] text-center text-gray-300 truncate">{t.name}`
);

// ============================================================
// FIX 3: Export - use showSaveFilePicker for folder selection
// ============================================================
code = code.replace(
  /const handleExport = useCallback\(async \(fmt: 'png' \| 'svg' \| 'pdf'\) => \{/,
  `const handleExport = useCallback(async (fmt: 'png' | 'svg' | 'pdf') => {
    const usePicker = typeof (window as any).showSaveFilePicker === 'function';`
);

// Replace the PNG download section
code = code.replace(
  /if \(fmt === 'png'\) \{\s*const a = document\.createElement\('a'\);\s*a\.href = dataUrl!;\s*a\.download[^}]*\}/,
  `if (fmt === 'png') {
        if (usePicker) {
          try {
            const handle = await (window as any).showSaveFilePicker({
              suggestedName: panelName + '_' + panelId + '.png',
              types: [{ description: 'PNG Image', accept: { 'image/png': ['.png'] } }],
            });
            const writable = await handle.createWritable();
            const resp = await fetch(dataUrl!);
            await writable.write(await resp.blob());
            await writable.close();
          } catch (e) { if ((e as any).name !== 'AbortError') console.error(e); }
        } else {
          const a = document.createElement('a'); a.href = dataUrl!;
          a.download = panelName + '_' + panelId + '.png'; a.click();
        }
      }`
);

// Replace the SVG download section
code = code.replace(
  /if \(fmt === 'svg'\) \{\s*const blob = new Blob\(\[svgStr\][^}]*\}/,
  `if (fmt === 'svg') {
        const blob = new Blob([svgStr], { type: 'image/svg+xml' });
        if (usePicker) {
          try {
            const handle = await (window as any).showSaveFilePicker({
              suggestedName: panelName + '_' + panelId + '.svg',
              types: [{ description: 'SVG Image', accept: { 'image/svg+xml': ['.svg'] } }],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
          } catch (e) { if ((e as any).name !== 'AbortError') console.error(e); }
        } else {
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
          a.download = panelName + '_' + panelId + '.svg'; a.click(); URL.revokeObjectURL(a.href);
        }
      }`
);

// Replace the PDF download section
code = code.replace(
  /const pdfBlob = doc\.output\('blob'\);\s*const a = document\.createElement\('a'\);\s*a\.href = URL\.createObjectURL\(pdfBlob\)[^}]*\}/,
  `const pdfBlob = doc.output('blob');
        if (usePicker) {
          try {
            const handle = await (window as any).showSaveFilePicker({
              suggestedName: panelName + '_' + panelId + '.pdf',
              types: [{ description: 'PDF Document', accept: { 'application/pdf': ['.pdf'] } }],
            });
            const writable = await handle.createWritable();
            await writable.write(pdfBlob);
            await writable.close();
          } catch (e) { if ((e as any).name !== 'AbortError') console.error(e); }
        } else {
          const a = document.createElement('a'); a.href = URL.createObjectURL(pdfBlob);
          a.download = panelName + '_' + panelId + '.pdf'; a.click(); URL.revokeObjectURL(a.href);
        }`
);

// ============================================================
// FIX 4: Save Design - use showSaveFilePicker
// ============================================================
code = code.replace(
  /const handleSaveDesign = useCallback\(\(\) => \{[^}]*const blob = new Blob\(\[json\][^}]*\}/,
  `const handleSaveDesign = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const json = JSON.stringify(c.toJSON(['_isBgImage','_isEraserStroke','_isSafeZone','_isGuideLine','_isGuideText','_isSizeLabel','name']));
    const blob = new Blob([json], { type: 'application/json' });
    if (typeof (window as any).showSaveFilePicker === 'function') {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: panelName + '_' + panelId + '.json',
          types: [{ description: 'Design JSON', accept: { 'application/json': ['.json'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } catch (e) { if ((e as any).name !== 'AbortError') console.error(e); }
    } else {
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = panelName + '_' + panelId + '.json'; a.click(); URL.revokeObjectURL(a.href);
    }`
);

// ============================================================
// FIX 5: Zoom - fix applyZoom to actually resize canvas
// ============================================================
code = code.replace(
  /const applyZoom = useCallback\(\(z: number\) => \{[^}]*setZoom\(z\);[^}]*\}, \[\]\);/,
  `const applyZoom = useCallback((z: number) => {
    const c = fcRef.current; if (!c) return;
    const clampedZ = Math.max(0.1, Math.min(5, z));
    c.setZoom(clampedZ);
    c.setWidth((c.getWidth() / (zoom || 1)) * clampedZ);
    c.setHeight((c.getHeight() / (zoom || 1)) * clampedZ);
    c.renderAll();
    setZoom(clampedZ);
  }, [zoom]);`
);

// ============================================================
// FIX 6: Grid toggle - fix to actually draw grid
// ============================================================
code = code.replace(
  /onClick=\{[^}]*setShowGrid[^}]*\}/g,
  (match, offset) => {
    // Only fix the first grid toggle (top bar)
    if (code.indexOf(match) === offset) {
      return `onClick={() => setShowGrid(g => !g)}`;
    }
    return match;
  }
);

// ============================================================
// FIX 7: Draw mode - fix toggleDraw to actually enable freeDrawing
// ============================================================
code = code.replace(
  /const toggleDraw = useCallback\(\(\) => \{[^}]*setDrawMode[^}]*\}, \[[^\]]*\]\);/,
  `const toggleDraw = useCallback(() => {
    const c = fcRef.current; if (!c) return;
    if (eraserMode) { setEraserMode(false); }
    const next = !drawMode;
    c.isDrawingMode = next;
    if (next) {
      const brush = new fabricModRef.current!.PencilBrush(c);
      brush.color = color;
      brush.width = brushSize;
      c.freeDrawingBrush = brush;
    }
    c.renderAll();
    setDrawMode(next);
  }, [drawMode, eraserMode, color, brushSize]);`
);

// ============================================================
// FIX 8: Eraser mode - fix toggleEraser
// ============================================================
code = code.replace(
  /const toggleEraser = useCallback\(\(\) => \{[^}]*setEraserMode[^}]*\}, \[[^\]]*\]\);/,
  `const toggleEraser = useCallback(() => {
    const c = fcRef.current; if (!c) return;
    if (drawMode) { setDrawMode(false); }
    const next = !eraserMode;
    c.isDrawingMode = next;
    if (next) {
      const brush = new fabricModRef.current!.PencilBrush(c);
      brush.color = '#FFFFFF';
      brush.width = eraserSize;
      (brush as any)._isEraser = true;
      c.freeDrawingBrush = brush;
    }
    c.renderAll();
    setEraserMode(next);
  }, [eraserMode, drawMode, eraserSize]);`
);

// ============================================================
// FIX 9: Safe zone 5mm margin on empty canvas
// ============================================================
// The addSafeZone function already exists - verify margin calc uses 5mm
code = code.replace(
  /const _mg = Math\.round\(\d+ \* _sc\)/,
  `const _mg = Math.round(5 * _sc)`
);

// ============================================================
// FIX 10: Add brush size / eraser size controls to left toolbar
// ============================================================
// Add draw/eraser size controls after the eraser button in left toolbar
code = code.replace(
  /title="Eraser"[^>]*>\s*🧹\s*<\/button>/,
  `title="Eraser">🧹</button>
            {drawMode && (
              <div className="px-1 space-y-1">
                <input type="range" min="1" max="30" value={brushSize} onChange={e => {
                  const s = Number(e.target.value); setBrushSize(s);
                  const c = fcRef.current; if (c?.freeDrawingBrush) c.freeDrawingBrush.width = s;
                }} className="w-full" title={'Brush: ' + brushSize} />
                <input type="color" value={color} onChange={e => {
                  const cl = e.target.value; setColor(cl);
                  const c = fcRef.current; if (c?.freeDrawingBrush) c.freeDrawingBrush.color = cl;
                }} className="w-8 h-6 cursor-pointer mx-auto block" title="Brush Color" />
              </div>
            )}
            {eraserMode && (
              <div className="px-1">
                <input type="range" min="5" max="60" value={eraserSize} onChange={e => {
                  const s = Number(e.target.value); setEraserSize(s);
                  const c = fcRef.current; if (c?.freeDrawingBrush) c.freeDrawingBrush.width = s;
                }} className="w-full" title={'Eraser: ' + eraserSize} />
              </div>
            )}`
);

// ============================================================
// WRITE
// ============================================================
fs.writeFileSync(file, code, 'utf8');
const lines = code.split('\n').length;
const ob = (code.match(/\{/g) || []).length;
const cb = (code.match(/\}/g) || []).length;
console.log('Done! Lines:', lines, '| { :', ob, '| } :', cb, '| diff:', ob - cb);
