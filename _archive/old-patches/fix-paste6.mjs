import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

// Find Crop button and add Paste button after Image button
// Look for the QR Code button
const anchor = `<ToolButton label="QR Code"`;

const pasteBtn = `<ToolButton label="Paste" icon="\u{1F4CB}" onClick={async () => {
            const cv = fcRef.current; if (!cv) return;
            try {
              const items = await navigator.clipboard.read();
              for (const item of items) {
                const imageType = item.types.find((t: string) => t.startsWith('image/'));
                if (imageType) {
                  const blob = await item.getType(imageType);
                  const url = URL.createObjectURL(blob);
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
                  URL.revokeObjectURL(url);
                  break;
                }
              }
            } catch (err) {
              console.error('Paste error:', err);
              alert('No image in clipboard. Copy an image first (right-click image > Copy Image, or Win+Shift+S)');
            }
          }} />
          <ToolButton label="QR Code"`;

if (code.includes(anchor) && !code.includes('label="Paste"')) {
  code = code.replace(anchor, pasteBtn);
  writeFileSync(f, code, "utf8");
  console.log("Done! Added Paste button before QR Code");
} else {
  console.log("Pattern not found or already exists");
}
