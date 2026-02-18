import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");
const lines = code.split('\n');

// Find line 1927 (0-indexed 1926) which is the }} /> after Crop
// Insert QR and Barcode buttons after line 1926, before line 1927 (<hr>)
const insertIdx = 1927; // the <hr> line

const qrBarcodeBlock = [
'          <ToolButton label="QR Code" icon="\u25FB" onClick={async () => {',
'            const text = prompt(\'Enter text or URL for QR code:\');',
'            if (!text) return;',
'            const c = fcRef.current; if (!c) return;',
'            try {',
'              const QRCode = (await import(\'qrcode\')).default;',
'              const dataUrl = await QRCode.toDataURL(text, { width: 200, margin: 1, color: { dark: \'#000000\', light: \'#ffffff\' } });',
'              const { FabricImage } = await import(\'fabric\');',
'              const img = await FabricImage.fromURL(dataUrl);',
'              img.set({ left: c.getWidth()/2 - 100, top: c.getHeight()/2 - 100, originX: \'left\', originY: \'top\' });',
'              img.setCoords();',
'              c.add(img); c.setActiveObject(img); c.requestRenderAll();',
'              if (typeof refreshLayers === \'function\') refreshLayers();',
'            } catch (err) { console.error(\'QR error:\', err); alert(\'QR code generation failed\'); }',
'          }} />',
'          <ToolButton label="Barcode" icon="|||" onClick={async () => {',
'            const text = prompt(\'Enter text for barcode:\');',
'            if (!text) return;',
'            const c = fcRef.current; if (!c) return;',
'            try {',
'              const barcodeCanvas = document.createElement(\'canvas\');',
'              const ctx2 = barcodeCanvas.getContext(\'2d\')!;',
'              const barW = 2; const h = 80; const pad = 10;',
'              const totalW = text.length * barW * 11 + pad * 2;',
'              barcodeCanvas.width = totalW; barcodeCanvas.height = h + 20;',
'              ctx2.fillStyle = \'#ffffff\'; ctx2.fillRect(0, 0, totalW, h + 20);',
'              ctx2.fillStyle = \'#000000\';',
'              let x = pad;',
'              for (let i = 0; i < text.length; i++) {',
'                const bin = text.charCodeAt(i).toString(2).padStart(8, \'0\');',
'                for (let b = 0; b < bin.length; b++) { if (bin[b]===\'1\') ctx2.fillRect(x, 0, barW, h); x += barW; }',
'                x += barW * 3;',
'              }',
'              ctx2.font = \'10px monospace\'; ctx2.textAlign = \'center\';',
'              ctx2.fillText(text, totalW/2, h + 14);',
'              const dataUrl = barcodeCanvas.toDataURL(\'image/png\');',
'              const { FabricImage } = await import(\'fabric\');',
'              const img = await FabricImage.fromURL(dataUrl);',
'              img.set({ left: c.getWidth()/2 - totalW/2, top: c.getHeight()/2 - 50, originX: \'left\', originY: \'top\' });',
'              img.setCoords();',
'              c.add(img); c.setActiveObject(img); c.requestRenderAll();',
'              if (typeof refreshLayers === \'function\') refreshLayers();',
'            } catch (err) { console.error(\'Barcode error:\', err); alert(\'Barcode generation failed\'); }',
'          }} />',
];

if (!code.includes('QR Code')) {
  lines.splice(insertIdx, 0, ...qrBarcodeBlock);
  writeFileSync(f, lines.join('\n'), "utf8");
  console.log("Done! Inserted QR Code and Barcode buttons at line " + insertIdx);
} else {
  console.log("QR Code already exists");
}
