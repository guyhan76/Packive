import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
const lines = code.split('\n');
let changes = 0;

// 1. Add custom fonts to dropdown + upload button after </select> </div> in Font section
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('FONT_LIST.map(f =>') && i > 2800) {
    // Find the closing ))} after the map
    for (let j = i; j < i + 10; j++) {
      if (lines[j].trim() === '))}') {
        // Insert custom fonts map right after ))}
        const indent = lines[j].match(/^(\s*)/)?.[1] || '';
        lines.splice(j + 1, 0,
          indent + `{customFonts.map(f => (`,
          indent + `  <option key={'custom_'+f.name} value={f.family} style={{ fontFamily: f.family }}>`,
          indent + `    ★ {f.name}`,
          indent + `  </option>`,
          indent + `))}`,
        );
        changes++;
        console.log("1a. Added customFonts to Font dropdown after line " + j);
        break;
      }
    }
    break;
  }
}

// 2. Add upload button after </select> </div> in Font section
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('</select>') && i > 2900 && i < 2920) {
    // Find the </div> after </select>
    for (let j = i; j < i + 5; j++) {
      if (lines[j].trim() === '</div>') {
        const indent = lines[j].match(/^(\s*)/)?.[1] || '          ';
        const uploadLines = [
          indent + `<input ref={fontUploadRef} type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden" onChange={async e => {`,
          indent + `  const file = e.target.files?.[0];`,
          indent + `  if (!file) return;`,
          indent + `  const name = file.name.replace(/\\.(ttf|otf|woff2?)/i, '');`,
          indent + `  const family = 'custom_' + name.replace(/[^a-zA-Z0-9]/g, '_');`,
          indent + `  try {`,
          indent + `    const ab = await file.arrayBuffer();`,
          indent + `    const font = new FontFace(family, ab);`,
          indent + `    await font.load();`,
          indent + `    (document as any).fonts.add(font);`,
          indent + `    setCustomFonts(prev => [...prev, { name, family }]);`,
          indent + `    setSelectedFont(family);`,
          indent + `    const c = fcRef.current;`,
          indent + `    if (c) { const obj = c.getActiveObject(); if (obj && 'fontFamily' in obj) { (obj as any).set('fontFamily', family); c.renderAll(); } }`,
          indent + `  } catch (err) { console.error('Font load error:', err); alert('Failed to load font'); }`,
          indent + `  e.target.value = '';`,
          indent + `}} />`,
          indent + `<button onClick={() => fontUploadRef.current?.click()} className="w-full py-0.5 text-[8px] bg-purple-50 text-purple-600 rounded hover:bg-purple-100 mt-0.5" title="Upload .ttf/.otf/.woff font">`,
          indent + `  📁 Upload Font`,
          indent + `</button>`,
        ];
        lines.splice(j, 0, ...uploadLines);
        changes++;
        console.log("1b. Added Upload Font button before line " + j);
        break;
      }
    }
    break;
  }
}

// Re-join for further edits
code = lines.join('\n');

// 3. Add Eyedropper after color picker
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
              } else { alert('EyeDropper API not supported in this browser'); }
            }} className={\`w-10 py-0.5 text-[8px] rounded mt-0.5 \${eyedropperActive ? 'bg-yellow-300 text-yellow-800' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}\`} title="Pick color from screen">
              💧
            </button>`);
  changes++;
  console.log("3. Added Eyedropper button");
}

// 4. Add Mask button after Crop button
if (!code.includes('label="Mask"')) {
  const cropPattern = /(<ToolButton label=\{cropMode \? "Cropping" : "Crop"\} icon="✂"[^/]*\/>)/;
  const match = code.match(cropPattern);
  if (match) {
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
    code = code.replace(match[0], match[0] + maskBtn);
    changes++;
    console.log("4. Added Mask button after Crop");
  }
}

if (changes > 0) {
  writeFileSync(file, code, "utf8");
  console.log(`\nDone! ${changes} changes applied.`);
} else {
  console.log("No changes made.");
}
