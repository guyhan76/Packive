import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");
let changes = 0;

// 1. Remove the old window paste listener
const old1 = "window.addEventListener('paste', pasteHandlerRef.current as EventListener);";
if (code.includes(old1)) {
  code = code.replace(old1, "// paste handler moved to wrapper onPaste");
  changes++;
  console.log("1. Removed window paste listener");
}

// 2. Remove cleanup
const old2 = "if (pasteHandlerRef.current) window.removeEventListener('paste', pasteHandlerRef.current as EventListener);";
if (code.includes(old2)) {
  code = code.replace(old2, "// paste cleanup not needed (onPaste prop)");
  changes++;
  console.log("2. Removed paste cleanup");
}

// 3. Add onPaste and tabIndex to the canvas wrapper div
// Find the wrapper ref div
const wrapperAnchor = 'ref={wrapperRef}';
if (code.includes(wrapperAnchor) && !code.includes('onPaste={')) {
  // Find the first occurrence that's the canvas wrapper
  const idx = code.indexOf(wrapperAnchor);
  if (idx >= 0) {
    const replacement = `ref={wrapperRef} tabIndex={0} onPaste={async (e: React.ClipboardEvent) => {
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
    code = code.substring(0, idx) + replacement + code.substring(idx + wrapperAnchor.length);
    changes++;
    console.log("3. Added onPaste and tabIndex to wrapper");
  }
}

if (changes > 0) {
  writeFileSync(f, code, "utf8");
  console.log("Done! Applied " + changes + " changes");
} else {
  console.log("No changes");
}
