import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

// Remove the old Ctrl+V handler from keyHandler
const oldPaste = `        // Ctrl+V: Paste image from clipboard
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
          navigator.clipboard.read().then(async (items) => {
            for (const item of items) {
              const imageType = item.types.find((t: string) => t.startsWith('image/'));
              if (imageType) {
                e.preventDefault();
                const blob = await item.getType(imageType);
                const url = URL.createObjectURL(blob);
                try {
                  const { FabricImage } = await import('fabric');
                  const img = await FabricImage.fromURL(url);
                  const canvasW = canvas.getWidth();
                  const canvasH = canvas.getHeight();
                  const maxW = canvasW * 0.6;
                  const maxH = canvasH * 0.6;
                  const natW = (img as any)._element?.naturalWidth || img.width || 1;
                  const natH = (img as any)._element?.naturalHeight || img.height || 1;
                  const ratio = Math.min(maxW / natW, maxH / natH, 1);
                  img.set({
                    left: canvasW / 2,
                    top: canvasH / 2,
                    originX: 'center',
                    originY: 'center',
                    scaleX: ratio,
                    scaleY: ratio,
                  });
                  img.setCoords();
                  canvas.add(img);
                  canvas.setActiveObject(img);
                  canvas.requestRenderAll();
                  refreshLayers();
                  console.log('Pasted image from clipboard');
                } catch (err) { console.error('Paste image error:', err); }
                URL.revokeObjectURL(url);
                break;
              }
            }
          }).catch(() => {});
        }`;

if (code.includes(oldPaste)) {
  code = code.replace(oldPaste, '');
  console.log("1. Removed old Ctrl+V handler");
}

// Add paste event listener after keydown addEventListener
const addAnchor = `window.addEventListener('keydown', keyHandler as EventListener);`;

const addReplace = `window.addEventListener('keydown', keyHandler as EventListener);

      // Paste image from clipboard (Ctrl+V)
      const pasteHandler = async (e: ClipboardEvent) => {
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
              // Resize via offscreen canvas
              const offscreen = document.createElement('canvas');
              offscreen.width = Math.round(natW * ratio);
              offscreen.height = Math.round(natH * ratio);
              offscreen.getContext('2d')!.drawImage(htmlImg, 0, 0, offscreen.width, offscreen.height);
              const dataUrl = offscreen.toDataURL('image/png');
              const img = await FabricImage.fromURL(dataUrl);
              img.set({
                left: canvasW / 2,
                top: canvasH / 2,
                originX: 'center',
                originY: 'center',
              });
              img.setCoords();
              cv.add(img);
              cv.setActiveObject(img);
              cv.requestRenderAll();
              refreshLayers();
              console.log('Pasted image from clipboard:', offscreen.width, 'x', offscreen.height);
            } catch (err) { console.error('Paste error:', err); }
            URL.revokeObjectURL(url);
            break;
          }
        }
      };
      document.addEventListener('paste', pasteHandler as EventListener);`;

if (code.includes(addAnchor) && !code.includes('pasteHandler')) {
  code = code.replace(addAnchor, addReplace);
  console.log("2. Added paste event listener");
}

// Add cleanup for paste handler
const cleanupAnchor = `if (keyHandler) window.removeEventListener('keydown', keyHandler as EventListener);`;
const cleanupReplace = `if (keyHandler) window.removeEventListener('keydown', keyHandler as EventListener);
        document.removeEventListener('paste', pasteHandler as EventListener);`;

if (code.includes(cleanupAnchor) && !code.includes("removeEventListener('paste'")) {
  code = code.replace(cleanupAnchor, cleanupReplace);
  console.log("3. Added paste cleanup");
}

writeFileSync(f, code, "utf8");
console.log("Done!");
