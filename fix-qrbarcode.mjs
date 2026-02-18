import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");
let changes = 0;

// Find the exact insertion point: after Crop button closing, before <hr>
const anchor = `          }} />
          <hr className="w-10 border-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-gray-400">Color</span>`;

const replacement = `          }} />
          <ToolButton label="QR Code" icon="◻" onClick={async () => {
            const text = prompt('Enter text or URL for QR code:');
            if (!text) return;
            const c = fcRef.current; if (!c) return;
            try {
              const QRCode = (await import('qrcode')).default;
              const dataUrl = await QRCode.toDataURL(text, { width: 200, margin: 1, color: { dark: '#000000', light: '#ffffff' } });
              const { FabricImage } = await import('fabric');
              const img = await FabricImage.fromURL(dataUrl);
              img.set({ left: c.getWidth()/2 - 100, top: c.getHeight()/2 - 100, originX: 'left', originY: 'top' });
              img.setCoords();
              c.add(img);
              c.setActiveObject(img);
              c.requestRenderAll();
              if (typeof refreshLayers === 'function') refreshLayers();
            } catch (err) { console.error('QR error:', err); alert('QR code generation failed'); }
          }} />
          <ToolButton label="Barcode" icon="|||" onClick={async () => {
            const text = prompt('Enter text for barcode (numbers/letters):');
            if (!text) return;
            const c = fcRef.current; if (!c) return;
            try {
              // Generate barcode using canvas
              const barcodeCanvas = document.createElement('canvas');
              const ctx2 = barcodeCanvas.getContext('2d')!;
              // Simple Code128-like barcode rendering
              const barWidth = 2;
              const height = 80;
              const padding = 10;
              const totalWidth = text.length * barWidth * 11 + padding * 2;
              barcodeCanvas.width = totalWidth;
              barcodeCanvas.height = height + 20;
              ctx2.fillStyle = '#ffffff';
              ctx2.fillRect(0, 0, totalWidth, height + 20);
              ctx2.fillStyle = '#000000';
              // Encode each character as bars
              let x = padding;
              for (let i = 0; i < text.length; i++) {
                const charCode = text.charCodeAt(i);
                const binary = charCode.toString(2).padStart(8, '0');
                for (let b = 0; b < binary.length; b++) {
                  if (binary[b] === '1') {
                    ctx2.fillRect(x, 0, barWidth, height);
                  }
                  x += barWidth;
                }
                // separator
                x += barWidth * 3;
              }
              // Add text below bars
              ctx2.font = '10px monospace';
              ctx2.textAlign = 'center';
              ctx2.fillText(text, totalWidth / 2, height + 14);
              const dataUrl = barcodeCanvas.toDataURL('image/png');
              const { FabricImage } = await import('fabric');
              const img = await FabricImage.fromURL(dataUrl);
              img.set({ left: c.getWidth()/2 - totalWidth/2, top: c.getHeight()/2 - 50, originX: 'left', originY: 'top' });
              img.setCoords();
              c.add(img);
              c.setActiveObject(img);
              c.requestRenderAll();
              if (typeof refreshLayers === 'function') refreshLayers();
            } catch (err) { console.error('Barcode error:', err); alert('Barcode generation failed'); }
          }} />

          <hr className="w-10 border-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-gray-400">Color</span>`;

if (code.includes(anchor) && !code.includes('QR Code')) {
  code = code.replace(anchor, replacement);
  changes++;
  writeFileSync(f, code, "utf8");
  console.log("Done! Added QR Code and Barcode buttons. Changes: " + changes);
} else if (code.includes('QR Code')) {
  console.log("QR Code already exists");
} else {
  console.log("Pattern not found");
  // Debug
  const lines = code.split('\n');
  for (let i = 1926; i < Math.min(1936, lines.length); i++) {
    console.log(i + ":", lines[i]);
  }
}
