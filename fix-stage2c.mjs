import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
let changes = 0;

// 1. Add Eyedropper after color picker (line 2431)
const colorPicker = `<input type="color" value={color} onChange={e => applyColor(e.target.value)} className="w-10 h-5 mt-1 cursor-pointer border-0" />`;
if (code.includes(colorPicker) && !code.includes('Eyedropper')) {
  code = code.replace(colorPicker, colorPicker + `
            <button onClick={async () => {
              if ('EyeDropper' in window) {
                try {
                  const ed = new (window as any).EyeDropper();
                  const result = await ed.open();
                  if (result?.sRGBHex) { applyColor(result.sRGBHex); setColor(result.sRGBHex); }
                } catch {}
              } else { alert('EyeDropper API not supported'); }
            }} className="w-10 py-0.5 text-[8px] bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 mt-0.5" title="Pick color from screen">
              💧 Pick
            </button>`);
  changes++;
  console.log("1. Added Eyedropper button");
}

// 2. Add Mask button after Crop button (line 2298)
const cropBtn = `<ToolButton label={cropMode ? "Cropping..." : "Crop"} icon="✂" onClick={() => {`;
if (code.includes(cropBtn) && !code.includes('label="Mask"')) {
  // Find the full crop button ending
  const cropIdx = code.indexOf(cropBtn);
  // Find the matching }} />
  let depth = 0;
  let endIdx = -1;
  for (let i = cropIdx; i < code.length; i++) {
    if (code[i] === '{') depth++;
    if (code[i] === '}') depth--;
    if (depth === 0 && code.substring(i, i + 4) === '}} /') {
      endIdx = i + 5; // }} />
      break;
    }
  }
  if (endIdx > -1) {
    const maskBtn = `
          <ToolButton label="Mask" icon="🎭" onClick={async () => {
            const c = fcRef.current; if (!c) return;
            const obj = c.getActiveObject() as any;
            if (!obj || obj.type !== 'image') { alert('Select an image first'); return; }
            const shape = prompt('Mask shape: circle, star, heart, diamond', 'circle');
            if (!shape) return;
            const { Circle, Path, Polygon } = await import('fabric');
            const w = (obj.width || 100) * (obj.scaleX || 1);
            const h = (obj.height || 100) * (obj.scaleY || 1);
            const r = Math.min(w, h) / 2;
            let clipPath: any;
            if (shape === 'circle') {
              clipPath = new Circle({ radius: r, originX: 'center', originY: 'center' });
            } else if (shape === 'star') {
              const pts: {x:number;y:number}[] = [];
              for (let si = 0; si < 10; si++) {
                const ang = (si * 36 - 90) * Math.PI / 180;
                const rad = si % 2 === 0 ? r : r * 0.4;
                pts.push({ x: rad * Math.cos(ang), y: rad * Math.sin(ang) });
              }
              clipPath = new Polygon(pts, { originX: 'center', originY: 'center' });
            } else if (shape === 'heart') {
              clipPath = new Path('M 0 -30 C -5 -50, -40 -50, -40 -20 C -40 5, -10 25, 0 40 C 10 25, 40 5, 40 -20 C 40 -50, 5 -50, 0 -30 Z',
                { originX: 'center', originY: 'center', scaleX: r/40, scaleY: r/40 });
            } else if (shape === 'diamond') {
              clipPath = new Polygon([{x:0,y:-r},{x:r*0.7,y:0},{x:0,y:r},{x:-r*0.7,y:0}], { originX: 'center', originY: 'center' });
            }
            if (clipPath) { obj.set('clipPath', clipPath); obj.dirty = true; c.requestRenderAll(); }
          }} />`;
    code = code.slice(0, endIdx) + maskBtn + code.slice(endIdx);
    changes++;
    console.log("2. Added Mask button after Crop (at position " + endIdx + ")");
  }
}

if (changes > 0) {
  writeFileSync(file, code, "utf8");
  console.log(`\nDone! ${changes} changes applied.`);
} else {
  console.log("No changes made.");
}
