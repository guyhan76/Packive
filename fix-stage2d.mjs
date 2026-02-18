import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
let changes = 0;

// 1. Add Eyedropper - exact match from file
const colorLine = `            <input type="color" value={color} onChange={e => applyColor(e.target.value)} className="w-10 h-5 mt-1 cursor-pointer border-0" />
          </div>
          <hr className="w-28 border-gray-200" />`;

const colorLineNew = `            <input type="color" value={color} onChange={e => applyColor(e.target.value)} className="w-10 h-5 mt-1 cursor-pointer border-0" />
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
            </button>
          </div>
          <hr className="w-28 border-gray-200" />`;

if (code.includes(colorLine)) {
  code = code.replace(colorLine, colorLineNew);
  changes++;
  console.log("1. Added Eyedropper button");
} else {
  console.log("1. FAILED - color line not found");
}

// 2. Add Mask button after Crop - use line-based approach
const lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('label={cropMode ? "Cropping..." : "Crop"}') && lines[i].includes('icon="✂"')) {
    // Find the end of this ToolButton's onClick (}} />)
    let braceDepth = 0;
    let started = false;
    for (let j = i; j < lines.length; j++) {
      for (let k = 0; k < lines[j].length; k++) {
        if (lines[j][k] === '{') { braceDepth++; started = true; }
        if (lines[j][k] === '}') braceDepth--;
      }
      if (started && braceDepth <= 0 && lines[j].includes('/>')) {
        // Insert Mask button after this line
        const indent = lines[i].match(/^(\s*)/)?.[1] || '          ';
        const maskLines = [
          indent + `<ToolButton label="Mask" icon="🎭" onClick={async () => {`,
          indent + `  const c = fcRef.current; if (!c) return;`,
          indent + `  const obj = c.getActiveObject() as any;`,
          indent + `  if (!obj || obj.type !== 'image') { alert('Select an image first'); return; }`,
          indent + `  const shape = prompt('Mask shape: circle, star, heart, diamond', 'circle');`,
          indent + `  if (!shape) return;`,
          indent + `  const { Circle, Path, Polygon } = await import('fabric');`,
          indent + `  const w = (obj.width || 100) * (obj.scaleX || 1);`,
          indent + `  const h = (obj.height || 100) * (obj.scaleY || 1);`,
          indent + `  const r = Math.min(w, h) / 2;`,
          indent + `  let clipPath: any;`,
          indent + `  if (shape === 'circle') {`,
          indent + `    clipPath = new Circle({ radius: r, originX: 'center', originY: 'center' });`,
          indent + `  } else if (shape === 'star') {`,
          indent + `    const pts: {x:number;y:number}[] = [];`,
          indent + `    for (let si = 0; si < 10; si++) {`,
          indent + `      const ang = (si * 36 - 90) * Math.PI / 180;`,
          indent + `      const rad = si % 2 === 0 ? r : r * 0.4;`,
          indent + `      pts.push({ x: rad * Math.cos(ang), y: rad * Math.sin(ang) });`,
          indent + `    }`,
          indent + `    clipPath = new Polygon(pts, { originX: 'center', originY: 'center' });`,
          indent + `  } else if (shape === 'heart') {`,
          indent + `    clipPath = new Path('M 0 -30 C -5 -50, -40 -50, -40 -20 C -40 5, -10 25, 0 40 C 10 25, 40 5, 40 -20 C 40 -50, 5 -50, 0 -30 Z',`,
          indent + `      { originX: 'center', originY: 'center', scaleX: r/40, scaleY: r/40 });`,
          indent + `  } else if (shape === 'diamond') {`,
          indent + `    clipPath = new Polygon([{x:0,y:-r},{x:r*0.7,y:0},{x:0,y:r},{x:-r*0.7,y:0}], { originX: 'center', originY: 'center' });`,
          indent + `  }`,
          indent + `  if (clipPath) { obj.set('clipPath', clipPath); obj.dirty = true; c.requestRenderAll(); }`,
          indent + `}} />`,
        ];
        lines.splice(j + 1, 0, ...maskLines);
        changes++;
        console.log("2. Added Mask button after Crop at line " + (j + 1));
        break;
      }
    }
    break;
  }
}

if (changes > 0) {
  code = lines.join('\n');
  writeFileSync(file, code, "utf8");
  console.log(`\nDone! ${changes} changes applied.`);
} else {
  console.log("No changes made.");
}
