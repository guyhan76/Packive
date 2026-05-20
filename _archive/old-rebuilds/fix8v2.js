const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

console.log('Original lines:', lines.length);

// === FIX 1: applyZoom (line 857, 0-indexed 856) ===
// Find the line with "const applyZoom"
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const applyZoom = useCallback')) {
    // Replace from this line until the closing }, []);
    let end = i;
    for (let j = i; j < i + 10; j++) {
      if (lines[j].includes('], [')) { end = j; break; }
    }
    const indent = '    ';
    const newFn = [
      indent + 'const applyZoom = useCallback((newZoom: number) => {',
      indent + '  const z = Math.max(25, Math.min(400, newZoom));',
      indent + '  const c = fcRef.current; if (!c) return;',
      indent + '  const prevZ = zoomRef.current / 100;',
      indent + '  const nextZ = z / 100;',
      indent + '  c.setZoom(nextZ);',
      indent + '  const origW = c.getWidth() / prevZ;',
      indent + '  const origH = c.getHeight() / prevZ;',
      indent + '  c.setWidth(origW * nextZ);',
      indent + '  c.setHeight(origH * nextZ);',
      indent + '  c.renderAll();',
      indent + '  setZoom(z);',
      indent + '  zoomRef.current = z;',
      indent + '  if (z >= 150) setShowMinimap(true);',
      indent + '}, []);',
    ];
    lines.splice(i, end - i + 1, ...newFn);
    console.log('FIX1: applyZoom replaced at line', i + 1);
    break;
  }
}

// === FIX 2: toggleDraw (line ~1266) ===
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const toggleDraw = useCallback')) {
    const indent = '    ';
    const newFn = [
      indent + 'const toggleDraw = useCallback(() => {',
      indent + '  const c = fcRef.current; if (!c) return;',
      indent + '  const fab = fabricModRef.current;',
      indent + '  if (drawMode) {',
      indent + '    c.isDrawingMode = false;',
      indent + '    setDrawMode(false);',
      indent + '  } else {',
      indent + '    c.isDrawingMode = true;',
      indent + '    if (fab && fab.PencilBrush) {',
      indent + '      const brush = new fab.PencilBrush(c);',
      indent + '      brush.color = color;',
      indent + '      brush.width = brushSize;',
      indent + '      c.freeDrawingBrush = brush;',
      indent + '    } else if (c.freeDrawingBrush) {',
      indent + '      c.freeDrawingBrush.color = color;',
      indent + '      c.freeDrawingBrush.width = brushSize;',
      indent + '    }',
      indent + '    setDrawMode(true);',
      indent + '    setEraserMode(false);',
      indent + '  }',
      indent + '}, [drawMode, color, brushSize]);',
    ];
    lines.splice(i, 1, ...newFn);
    console.log('FIX2: toggleDraw replaced at line', i + 1);
    break;
  }
}

// === FIX 3: toggleEraser ===
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const toggleEraser = useCallback')) {
    const indent = '    ';
    const newFn = [
      indent + 'const toggleEraser = useCallback(() => {',
      indent + '  const c = fcRef.current; if (!c) return;',
      indent + '  const fab = fabricModRef.current;',
      indent + '  if (eraserMode) {',
      indent + '    c.isDrawingMode = false;',
      indent + '    setEraserMode(false);',
      indent + '  } else {',
      indent + '    c.isDrawingMode = true;',
      indent + '    if (fab && fab.PencilBrush) {',
      indent + '      const brush = new fab.PencilBrush(c);',
      indent + '      brush.color = "#FFFFFF";',
      indent + '      brush.width = eraserSize;',
      indent + '      (brush as any)._isEraser = true;',
      indent + '      c.freeDrawingBrush = brush;',
      indent + '    } else if (c.freeDrawingBrush) {',
      indent + '      c.freeDrawingBrush.color = "#FFFFFF";',
      indent + '      c.freeDrawingBrush.width = eraserSize;',
      indent + '      (c.freeDrawingBrush as any)._isEraser = true;',
      indent + '    }',
      indent + '    setEraserMode(true);',
      indent + '    setDrawMode(false);',
      indent + '  }',
      indent + '}, [eraserMode, eraserSize]);',
    ];
    lines.splice(i, 1, ...newFn);
    console.log('FIX3: toggleEraser replaced at line', i + 1);
    break;
  }
}

// === FIX 4: handleExport - add showSaveFilePicker ===
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const handleExport = useCallback')) {
    let end = i;
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].match(/^\s*\}, \[panelId/)) { end = j; break; }
    }
    const indent = '    ';
    const newFn = [
      indent + 'const handleExport = useCallback(async (format: \'png\'|\'svg\'|\'pdf\') => {',
      indent + '  const c = fcRef.current; if (!c) return;',
      indent + '  const usePicker = typeof (window as any).showSaveFilePicker === "function";',
      indent + '  const guides:any[] = []; c.getObjects().forEach((o:any)=>{if(o._isSafeZone||o._isGuideLine||o._isGuideText||o._isSizeLabel||o._isBgPattern) guides.push(o);}); guides.forEach(g=>c.remove(g)); c.renderAll();',
      indent + '  if (format==="png") {',
      indent + '    const d=c.toDataURL({format:"png",multiplier:exportScale});',
      indent + '    if (usePicker) {',
      indent + '      try { const h=await (window as any).showSaveFilePicker({suggestedName:panelId+"_"+exportScale+"x.png",types:[{description:"PNG",accept:{"image/png":[".png"]}}]}); const w=await h.createWritable(); const r=await fetch(d); await w.write(await r.blob()); await w.close(); } catch(e:any){ if(e.name!=="AbortError") console.error(e); }',
      indent + '    } else { const a=document.createElement("a"); a.download=panelId+"_"+exportScale+"x.png"; a.href=d; a.click(); }',
      indent + '  } else if (format==="svg") {',
      indent + '    const s=c.toSVG(); const b=new Blob([s],{type:"image/svg+xml"});',
      indent + '    if (usePicker) {',
      indent + '      try { const h=await (window as any).showSaveFilePicker({suggestedName:panelId+".svg",types:[{description:"SVG",accept:{"image/svg+xml":[".svg"]}}]}); const w=await h.createWritable(); await w.write(b); await w.close(); } catch(e:any){ if(e.name!=="AbortError") console.error(e); }',
      indent + '    } else { const u=URL.createObjectURL(b); const a=document.createElement("a"); a.download=panelId+".svg"; a.href=u; a.click(); URL.revokeObjectURL(u); }',
      indent + '  } else if (format==="pdf") {',
      indent + '    const d=c.toDataURL({format:"png",multiplier:exportScale}); const pw=c.getWidth()*exportScale; const ph=c.getHeight()*exportScale;',
      indent + '    try { const {jsPDF}=await import("jspdf"); const pdf=new jsPDF({orientation:pw>ph?"landscape":"portrait",unit:"px",format:[pw,ph]}); pdf.addImage(d,"PNG",0,0,pw,ph);',
      indent + '      const pdfBlob=pdf.output("blob");',
      indent + '      if (usePicker) {',
      indent + '        try { const h=await (window as any).showSaveFilePicker({suggestedName:panelId+".pdf",types:[{description:"PDF",accept:{"application/pdf":[".pdf"]}}]}); const w=await h.createWritable(); await w.write(pdfBlob); await w.close(); } catch(e2:any){ if(e2.name!=="AbortError") console.error(e2); }',
      indent + '      } else { const u=URL.createObjectURL(pdfBlob); const a=document.createElement("a"); a.href=u; a.download=panelId+".pdf"; a.click(); URL.revokeObjectURL(u); }',
      indent + '    } catch{ alert("PDF requires jspdf"); }',
      indent + '  }',
      indent + '  guides.forEach(g=>c.add(g)); c.renderAll();',
      indent + '}, [panelId, exportScale]);',
    ];
    lines.splice(i, end - i + 1, ...newFn);
    console.log('FIX4: handleExport replaced at line', i + 1);
    break;
  }
}

// === FIX 5: handleSaveDesign - add showSaveFilePicker ===
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const handleSaveDesign = useCallback')) {
    let end = i;
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].match(/^\s*\}, \[panelId\]\);/)) { end = j; break; }
    }
    const indent = '    ';
    const newFn = [
      indent + 'const handleSaveDesign = useCallback(async () => {',
      indent + '  const c=fcRef.current; if(!c) return;',
      indent + '  const json=c.toJSON(["_isBgImage","_isSafeZone","_isGuideLine","_isGuideText","_isSizeLabel","_isBgPattern","selectable","evented","name"]);',
      indent + '  const b=new Blob([JSON.stringify(json,null,2)],{type:"application/json"});',
      indent + '  if (typeof (window as any).showSaveFilePicker === "function") {',
      indent + '    try { const h=await (window as any).showSaveFilePicker({suggestedName:panelId+"_design.json",types:[{description:"Design JSON",accept:{"application/json":[".json"]}}]}); const w=await h.createWritable(); await w.write(b); await w.close(); } catch(e:any){ if(e.name!=="AbortError") console.error(e); }',
      indent + '  } else { const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download=panelId+"_design.json"; a.click(); URL.revokeObjectURL(u); }',
      indent + '}, [panelId]);',
    ];
    lines.splice(i, end - i + 1, ...newFn);
    console.log('FIX5: handleSaveDesign replaced at line', i + 1);
    break;
  }
}

// === FIX 6: Add "Clear Canvas" button in Templates tab ===
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('filteredTemplates.map')) {
    const indent = '              ';
    const clearBtn = [
      indent + '<button onClick={() => { const c=fcRef.current; if(!c) return; c.getObjects().slice().forEach(o=>c.remove(o)); c.backgroundColor="#FFFFFF"; c.renderAll(); addSafeZone(); pushHistory(); }} className="col-span-2 py-2 mb-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1">',
      indent + '  <span>🗑️</span> Clear Canvas',
      indent + '</button>',
    ];
    lines.splice(i, 0, ...clearBtn);
    console.log('FIX6: Clear Canvas button added before line', i + 1);
    break;
  }
}

// === FIX 7: Add brush size slider + color after Draw button ===
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('title="Eraser">') && lines[i].includes('🧹')) {
    const indent = '            ';
    const drawControls = [
      indent + '{drawMode && (',
      indent + '  <div className="px-1 py-1 space-y-1 border-t border-gray-700">',
      indent + '    <div className="text-[9px] text-gray-400 text-center">Brush: {brushSize}px</div>',
      indent + '    <input type="range" min="1" max="30" value={brushSize} onChange={e => { const s=Number(e.target.value); setBrushSize(s); const c=fcRef.current; if(c?.freeDrawingBrush) c.freeDrawingBrush.width=s; }} className="w-full h-1 accent-blue-500" />',
      indent + '    <input type="color" value={color} onChange={e => { const cl=e.target.value; setColor(cl); const c=fcRef.current; if(c?.freeDrawingBrush) c.freeDrawingBrush.color=cl; }} className="w-8 h-5 cursor-pointer mx-auto block rounded border-0" />',
      indent + '  </div>',
      indent + ')}',
    ];
    // Insert AFTER the eraser button line
    lines.splice(i + 1, 0, ...drawControls);
    console.log('FIX7: Draw controls added after line', i + 1);
    break;
  }
}

// === FIX 8: Add eraser size slider after eraser controls ===
// Find existing eraserMode controls or add after draw controls
let eraserFound = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{eraserMode && (')) {
    eraserFound = true;
    console.log('FIX8: eraserMode controls already exist at line', i + 1);
    // Check if it has a slider
    if (!lines[i+1]?.includes('range') && !lines[i+2]?.includes('range')) {
      // Find the closing of this block and replace
      let end = i;
      let depth = 0;
      for (let j = i; j < i + 15; j++) {
        if (lines[j].includes('{eraserMode')) depth++;
        if (lines[j].includes(')}') && lines[j].trim() === ')}') { 
          if (depth <= 1) { end = j; break; }
          depth--;
        }
      }
      const indent = '            ';
      const eraserControls = [
        indent + '{eraserMode && (',
        indent + '  <div className="px-1 py-1 space-y-1 border-t border-gray-700">',
        indent + '    <div className="text-[9px] text-gray-400 text-center">Eraser: {eraserSize}px</div>',
        indent + '    <input type="range" min="5" max="60" value={eraserSize} onChange={e => { const s=Number(e.target.value); setEraserSize(s); const c=fcRef.current; if(c?.freeDrawingBrush) c.freeDrawingBrush.width=s; }} className="w-full h-1 accent-red-500" />',
        indent + '  </div>',
        indent + ')}',
      ];
      lines.splice(i, end - i + 1, ...eraserControls);
      console.log('FIX8: eraserMode controls replaced at line', i + 1);
    }
    break;
  }
}

if (!eraserFound) {
  // Add after drawMode controls
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes('drawMode') && lines[i].includes(')}') && lines[i].trim() === ')}') {
      const indent = '            ';
      const eraserControls = [
        indent + '{eraserMode && (',
        indent + '  <div className="px-1 py-1 space-y-1 border-t border-gray-700">',
        indent + '    <div className="text-[9px] text-gray-400 text-center">Eraser: {eraserSize}px</div>',
        indent + '    <input type="range" min="5" max="60" value={eraserSize} onChange={e => { const s=Number(e.target.value); setEraserSize(s); const c=fcRef.current; if(c?.freeDrawingBrush) c.freeDrawingBrush.width=s; }} className="w-full h-1 accent-red-500" />',
        indent + '  </div>',
        indent + ')}',
      ];
      lines.splice(i + 1, 0, ...eraserControls);
      console.log('FIX8: eraserMode controls added after line', i + 1);
      break;
    }
  }
}

// === WRITE ===
const result = lines.join('\n');
fs.writeFileSync(file, result, 'utf8');
const ob = (result.match(/\{/g)||[]).length;
const cb = (result.match(/\}/g)||[]).length;
console.log('Final lines:', lines.length, '| { :', ob, '| } :', cb, '| diff:', ob - cb);
