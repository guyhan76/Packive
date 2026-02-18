import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

// Add Ctrl+V paste handler before the closing of keyHandler
const anchor = `        }
      };
      window.addEventListener('keydown', keyHandler as EventListener);`;

const replacement = `        }
        // Ctrl+V: Paste image from clipboard
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
        }
      };
      window.addEventListener('keydown', keyHandler as EventListener);`;

if (code.includes(anchor) && !code.includes("Paste image from clipboard")) {
  code = code.replace(anchor, replacement);
  writeFileSync(f, code, "utf8");
  console.log("Done! Added Ctrl+V clipboard paste handler");
} else if (code.includes("Paste image from clipboard")) {
  console.log("Already exists");
} else {
  console.log("Pattern not found");
}
