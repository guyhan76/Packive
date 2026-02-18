import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
let changes = 0;

// Fix: The broken div tag. Replace from the broken onPaste through the eraser cursor div
// and the dangling paste code, with a properly structured div tag.

const brokenStart = `<div ref={wrapperRef} tabIndex={0} onPaste={async (e: React.ClipboardEvent) =
            onMouseMove={(ev) => {`;

const brokenCursorAndPaste = `{/* Eraser cursor */}
              {eraserMode && drawMode && (
                <div ref={eraserCursorRef} className="pointer-events-none absolute rounded-full border-2 border-red-400 bg-red-100/30 z-50" style={{display:'none'}} />
              )} {
              const items = e.clipboardData?.items;`;

// Strategy: replace the entire broken <div ...> opening tag with a correct one.
// Find from "<div ref={wrapperRef}" to the className="flex-1 flex items-center..."
// and rebuild it properly.

const oldBlock = `<div ref={wrapperRef} tabIndex={0} onPaste={async (e: React.ClipboardEvent) =
            onMouseMove={(ev) => {
              if (!eraserMode || !drawMode) return;
              const rect = (ev.currentTarget as HTMLDivElement).getBoundingClientRect();
              const x = ev.clientX - rect.left;
              const y = ev.clientY - rect.top;
              // Continuous erase while mouse button held
              if (ev.buttons === 1) {
                const c = fcRef.current;
                if (c) {
                  const pointer = c.getScenePoint(ev.nativeEvent);
                  const half = eraserSize / 2;
                  const paths = c.getObjects().filter((o: any) =>
                    o.type === 'path' && !o._isBgImage && !o._isSafeZone && !o._isGuideLine && !o._isCropRect
                  );
                  const toRemove: any[] = [];
                  for (const p of paths) {
                    const bound = p.getBoundingRect();
                    const cx = bound.left + bound.width / 2;
                    const cy = bound.top + bound.height / 2;
                    if (Math.abs(pointer.x - cx) < half + bound.width/2 && Math.abs(pointer.y - cy) < half + bound.height/2) {
                      toRemove.push(p);
                    }
                  }
                  if (toRemove.length > 0) {
                    toRemove.forEach(o => c.remove(o));
                    c.requestRenderAll();
                    refreshLayers();
                  }
                }
              }
              if (eraserCursorRef.current) {
                eraserCursorRef.current.style.display = 'block';
                eraserCursorRef.current.style.left = (x - eraserSize/2) + 'px';
                eraserCursorRef.current.style.top = (y - eraserSize/2) + 'px';
                eraserCursorRef.current.style.width = eraserSize + 'px';
                eraserCursorRef.current.style.height = eraserSize + 'px';
              }
            }}
            onMouseDown={(ev) => {
              if (!eraserMode || !drawMode) return;
              const c = fcRef.current; if (!c) return;
              const rect = (ev.currentTarget as HTMLDivElement).getBoundingClientRect();
              const x = ev.clientX - rect.left;
              const y = ev.clientY - rect.top;
              const pointer = c.getScenePoint(ev.nativeEvent);
              const half = eraserSize / 2;
              const paths = c.getObjects().filter((o: any) =>
                o.type === 'path' && !o._isBgImage && !o._isSafeZone && !o._isGuideLine && !o._isCropRect
              );
              const toRemove: any[] = [];
              for (const p of paths) {
                const bound = p.getBoundingRect();
                const cx = bound.left + bound.width / 2;
                const cy = bound.top + bound.height / 2;
                if (Math.abs(pointer.x - cx) < half + bound.width/2 && Math.abs(pointer.y - cy) < half + bound.height/2) {
                  toRemove.push(p);
                }
              }
              if (toRemove.length > 0) {
                toRemove.forEach(o => c.remove(o));
                c.requestRenderAll();
                refreshLayers();
              }
            }}
            onMouseLeave={() => {
              if (eraserCursorRef.current) eraserCursorRef.current.style.display = 'none';
            }}>
              {/* Eraser cursor */}
              {eraserMode && drawMode && (
                <div ref={eraserCursorRef} className="pointer-events-none absolute rounded-full border-2 border-red-400 bg-red-100/30 z-50" style={{display:'none'}} />
              )} {
              const items = e.clipboardData?.items;
              if (!items) return;
              for (let i = 0; i < items.length; i++) {
                if (items[i].type.startsWith('image/')) {
                  e.preventDefault();
                  const blob = items[i].getAsFile();
                  if (!blob) continue;
                  const cv = fcRef.current;
                  if (!cv) return;
                  const url = URL.createObjectURL(blob);
                  try {
                    const { FabricImage } = await import('fabric');
                    const htmlImg = new Image();
                    htmlImg.src = url;
                    await new Promise<void>((res, rej) => { htmlImg.onload = () => res(); htmlImg.onerror = rej; });
                    const canvasW = cv.getWidth();
                    const canvasH = cv.getHeight();
                    const maxW = canvasW * 0.6;
                    const maxH = canvasH * 0.6;
                    const natW = htmlImg.naturalWidth || 1;
                    const natH = htmlImg.naturalHeight || 1;
                    const ratio = Math.min(maxW / natW, maxH / natH, 1);
                    const offscreen = document.createElement('canvas');
                    offscreen.width = Math.round(natW * ratio);
                    offscreen.height = Math.round(natH * ratio);
                    offscreen.getContext('2d')!.drawImage(htmlImg, 0, 0, offscreen.width, offscreen.height);
                    const dataUrl = offscreen.toDataURL('image/png');
                    const img = await FabricImage.fromURL(dataUrl);
                    img.set({ left: canvasW/2, top: canvasH/2, originX: 'center', originY: 'center' });
                    img.setCoords();
                    cv.add(img); cv.setActiveObject(img); cv.requestRenderAll();
                    refreshLayers();
                    console.log('Pasted image:', offscreen.width, 'x', offscreen.height);
                  } catch (err) { console.error('Paste error:', err); }
                  URL.revokeObjectURL(url);
                  break;
                }
              }
            }}`;

const newBlock = `<div ref={wrapperRef} tabIndex={0}
            onPaste={async (e: React.ClipboardEvent) => {
              const items = e.clipboardData?.items;
              if (!items) return;
              for (let i = 0; i < items.length; i++) {
                if (items[i].type.startsWith('image/')) {
                  e.preventDefault();
                  const blob = items[i].getAsFile();
                  if (!blob) continue;
                  const cv = fcRef.current;
                  if (!cv) return;
                  const url = URL.createObjectURL(blob);
                  try {
                    const { FabricImage } = await import('fabric');
                    const htmlImg = new Image();
                    htmlImg.src = url;
                    await new Promise<void>((res, rej) => { htmlImg.onload = () => res(); htmlImg.onerror = rej; });
                    const canvasW = cv.getWidth();
                    const canvasH = cv.getHeight();
                    const maxW = canvasW * 0.6;
                    const maxH = canvasH * 0.6;
                    const natW = htmlImg.naturalWidth || 1;
                    const natH = htmlImg.naturalHeight || 1;
                    const ratio = Math.min(maxW / natW, maxH / natH, 1);
                    const offscreen = document.createElement('canvas');
                    offscreen.width = Math.round(natW * ratio);
                    offscreen.height = Math.round(natH * ratio);
                    offscreen.getContext('2d')!.drawImage(htmlImg, 0, 0, offscreen.width, offscreen.height);
                    const dataUrl = offscreen.toDataURL('image/png');
                    const img = await FabricImage.fromURL(dataUrl);
                    img.set({ left: canvasW/2, top: canvasH/2, originX: 'center', originY: 'center' });
                    img.setCoords();
                    cv.add(img); cv.setActiveObject(img); cv.requestRenderAll();
                    refreshLayers();
                    console.log('Pasted image:', offscreen.width, 'x', offscreen.height);
                  } catch (err) { console.error('Paste error:', err); }
                  URL.revokeObjectURL(url);
                  break;
                }
              }
            }}
            onMouseMove={(ev) => {
              if (!eraserMode || !drawMode) return;
              const rect = (ev.currentTarget as HTMLDivElement).getBoundingClientRect();
              const x = ev.clientX - rect.left;
              const y = ev.clientY - rect.top;
              if (ev.buttons === 1) {
                const c = fcRef.current;
                if (c) {
                  const pointer = c.getScenePoint(ev.nativeEvent);
                  const half = eraserSize / 2;
                  const paths = c.getObjects().filter((o: any) =>
                    o.type === 'path' && !o._isBgImage && !o._isSafeZone && !o._isGuideLine && !o._isCropRect
                  );
                  const toRemove: any[] = [];
                  for (const p of paths) {
                    const bound = p.getBoundingRect();
                    const cx = bound.left + bound.width / 2;
                    const cy = bound.top + bound.height / 2;
                    if (Math.abs(pointer.x - cx) < half + bound.width/2 && Math.abs(pointer.y - cy) < half + bound.height/2) {
                      toRemove.push(p);
                    }
                  }
                  if (toRemove.length > 0) {
                    toRemove.forEach(o => c.remove(o));
                    c.requestRenderAll();
                    refreshLayers();
                  }
                }
              }
              if (eraserCursorRef.current) {
                eraserCursorRef.current.style.display = 'block';
                eraserCursorRef.current.style.left = (x - eraserSize/2) + 'px';
                eraserCursorRef.current.style.top = (y - eraserSize/2) + 'px';
                eraserCursorRef.current.style.width = eraserSize + 'px';
                eraserCursorRef.current.style.height = eraserSize + 'px';
              }
            }}
            onMouseDown={(ev) => {
              if (!eraserMode || !drawMode) return;
              const c = fcRef.current; if (!c) return;
              const pointer = c.getScenePoint(ev.nativeEvent);
              const half = eraserSize / 2;
              const paths = c.getObjects().filter((o: any) =>
                o.type === 'path' && !o._isBgImage && !o._isSafeZone && !o._isGuideLine && !o._isCropRect
              );
              const toRemove: any[] = [];
              for (const p of paths) {
                const bound = p.getBoundingRect();
                const cx = bound.left + bound.width / 2;
                const cy = bound.top + bound.height / 2;
                if (Math.abs(pointer.x - cx) < half + bound.width/2 && Math.abs(pointer.y - cy) < half + bound.height/2) {
                  toRemove.push(p);
                }
              }
              if (toRemove.length > 0) {
                toRemove.forEach(o => c.remove(o));
                c.requestRenderAll();
                refreshLayers();
              }
            }}
            onMouseLeave={() => {
              if (eraserCursorRef.current) eraserCursorRef.current.style.display = 'none';
            }}`;

if (code.includes(oldBlock)) {
  code = code.replace(oldBlock, newBlock);
  changes++;
  console.log("1. Fixed broken div tag - merged onPaste + eraser events properly");
} else {
  console.log("ERROR: Could not find the broken block. Trying line-based approach...");
  
  // Line-based approach: find line with broken onPaste and replace range
  const lines = code.split('\n');
  let startIdx = -1;
  let endIdx = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('ref={wrapperRef}') && lines[i].includes('onPaste={async')) {
      startIdx = i;
    }
    if (startIdx > 0 && lines[i].includes(`}} onDragOver=`)) {
      endIdx = i;
      break;
    }
  }
  
  if (startIdx > 0 && endIdx > 0) {
    const newLines = newBlock.split('\n');
    // Keep the onDragOver part from the endIdx line
    const dragOverPart = lines[endIdx].substring(lines[endIdx].indexOf('onDragOver='));
    newLines[newLines.length - 1] += ' ' + dragOverPart;
    
    lines.splice(startIdx, endIdx - startIdx + 1, ...newLines);
    code = lines.join('\n');
    changes++;
    console.log("1. Fixed broken div tag (line-based approach)");
  }
}

// 2. Add eraser cursor div after the opening wrapper tag (inside the div)
// Find where children of the wrapper start
if (!code.includes('{/* Eraser cursor */}')) {
  const insertAfter = `onMouseLeave={() => {
              if (eraserCursorRef.current) eraserCursorRef.current.style.display = 'none';
            }}>`;
  // But we need to be careful - this is inside onDragOver line now
  // Actually let's find the closing > of the wrapper div followed by content
  // Look for the pattern after our new block
  const cursorDiv = `
              {/* Eraser cursor */}
              {eraserMode && drawMode && (
                <div ref={eraserCursorRef} className="pointer-events-none absolute rounded-full border-2 border-red-400 bg-red-100/30 z-50" style={{display:'none'}} />
              )}`;
  
  // Find the wrapper div's closing > that leads to children
  const wrapperClose = `className="flex-1 flex items-center justify-center bg-gray-100 min-h-0 min-w-0 overflow-auto p-5 relative">`;
  if (code.includes(wrapperClose)) {
    code = code.replace(wrapperClose, wrapperClose + cursorDiv);
    changes++;
    console.log("2. Added eraser cursor div inside wrapper");
  }
} else {
  console.log("2. Eraser cursor div already exists, skipping");
}

if (changes > 0) {
  writeFileSync(file, code, "utf8");
  console.log(`\nDone! ${changes} changes applied.`);
} else {
  console.log("No changes made.");
}
