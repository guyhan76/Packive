import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
let changes = 0;

// ===== 1. Add customFonts state after bgPattern state =====
const bgPatternState = `const [bgPattern, setBgPattern] = useState<'none'|'dots'|'lines'|'grid'>('none');`;
if (code.includes(bgPatternState) && !code.includes('customFonts')) {
  code = code.replace(bgPatternState, bgPatternState + `
  const [customFonts, setCustomFonts] = useState<{name:string;family:string}[]>([]);
  const fontUploadRef = useRef<HTMLInputElement>(null);
  const [eyedropperActive, setEyedropperActive] = useState(false);`);
  changes++;
  console.log("1. Added customFonts, fontUploadRef, eyedropper state");
}

// ===== 2. Add font upload button after the Font select dropdown =====
const fontSelectEnd = `{FONT_LIST.map(f => (
                <option key={f.name} value={f.family} style={{ fontFamily: f.family }}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>`;

const fontSelectEndWithUpload = `{FONT_LIST.map(f => (
                <option key={f.name} value={f.family} style={{ fontFamily: f.family }}>
                  {f.name}
                </option>
              ))}
              {customFonts.map(f => (
                <option key={f.name} value={f.family} style={{ fontFamily: f.family }}>
                  ★ {f.name}
                </option>
              ))}
            </select>
            <input ref={fontUploadRef} type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden" onChange={async e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const name = file.name.replace(/\.(ttf|otf|woff2?)/i, '');
              const family = 'custom_' + name.replace(/[^a-zA-Z0-9]/g, '_');
              try {
                const ab = await file.arrayBuffer();
                const font = new FontFace(family, ab);
                await font.load();
                (document as any).fonts.add(font);
                setCustomFonts(prev => [...prev, { name, family }]);
                setSelectedFont(family);
                const c = fcRef.current;
                if (c) {
                  const obj = c.getActiveObject();
                  if (obj && 'fontFamily' in obj) {
                    (obj as any).set('fontFamily', family);
                    c.renderAll();
                  }
                }
              } catch (err) { console.error('Font load error:', err); alert('Failed to load font'); }
              e.target.value = '';
            }} />
            <button onClick={() => fontUploadRef.current?.click()} className="w-full py-0.5 text-[8px] bg-purple-50 text-purple-600 rounded hover:bg-purple-100 mt-0.5" title="Upload .ttf/.otf/.woff font">
              📁 Upload Font
            </button>
          </div>`;

if (code.includes(fontSelectEnd) && !code.includes('Upload Font')) {
  code = code.replace(fontSelectEnd, fontSelectEndWithUpload);
  changes++;
  console.log("2. Added font upload button and custom fonts in dropdown");
}

// ===== 3. Add Eyedropper button after the Color section =====
// Find the color picker input
const colorPickerEnd = `<input type="color" value={color} onChange={e => applyColor(e.target.value)} className="w-10 h-5 mt-1 cursor-pointer border-0" />`;

if (code.includes(colorPickerEnd) && !code.includes('Eyedropper')) {
  const eyedropperUI = colorPickerEnd + `
            <button onClick={async () => {
              if ('EyeDropper' in window) {
                try {
                  const ed = new (window as any).EyeDropper();
                  const result = await ed.open();
                  if (result?.sRGBHex) {
                    applyColor(result.sRGBHex);
                    setColor(result.sRGBHex);
                  }
                } catch {}
              } else {
                setEyedropperActive(!eyedropperActive);
                const c = fcRef.current; if (!c) return;
                if (!eyedropperActive) {
                  c.defaultCursor = 'crosshair';
                  c.on('mouse:down', function eyedropHandler(opt: any) {
                    const pointer = c.getScenePoint(opt.e);
                    const ctx = c.getContext();
                    const pixel = ctx.getImageData(Math.round(pointer.x), Math.round(pointer.y), 1, 1).data;
                    const hex = '#' + [pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2, '0')).join('');
                    applyColor(hex);
                    setColor(hex);
                    c.defaultCursor = 'default';
                    c.off('mouse:down', eyedropHandler as any);
                    setEyedropperActive(false);
                  });
                }
              }
            }} className={\`w-full py-0.5 text-[8px] rounded mt-0.5 \${eyedropperActive ? 'bg-yellow-300 text-yellow-800' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}\`} title="Pick color from screen">
              💧 Eyedropper
            </button>`;
  code = code.replace(colorPickerEnd, eyedropperUI);
  changes++;
  console.log("3. Added Eyedropper button");
}

// ===== 4. Add Image Masking button - after Crop button =====
// Find the Crop ToolButton
const cropBtnPattern = `<ToolButton label={cropMode ? "Cropping" : "Crop"} icon="✂"`;
if (code.includes(cropBtnPattern) && !code.includes('Mask')) {
  // Find the end of crop button's onClick handler
  const cropIdx = code.indexOf(cropBtnPattern);
  const cropEnd = code.indexOf('}} />', cropIdx);
  if (cropEnd > -1) {
    const maskBtn = `
          <ToolButton label="Mask" icon="🎭" onClick={async () => {
            const c = fcRef.current; if (!c) return;
            const obj = c.getActiveObject() as any;
            if (!obj || obj.type !== 'image') { alert('Select an image first'); return; }
            const shape = prompt('Mask shape: circle, star, heart, diamond', 'circle');
            if (!shape) return;
            const { Circle, Path, Polygon } = await import('fabric');
            let clipPath: any;
            const w = (obj.width || 100) * (obj.scaleX || 1);
            const h = (obj.height || 100) * (obj.scaleY || 1);
            const r = Math.min(w, h) / 2;
            if (shape === 'circle') {
              clipPath = new Circle({ radius: r, originX: 'center', originY: 'center' });
            } else if (shape === 'star') {
              const pts: {x:number;y:number}[] = [];
              for (let i = 0; i < 10; i++) {
                const ang = (i * 36 - 90) * Math.PI / 180;
                const rad = i % 2 === 0 ? r : r * 0.4;
                pts.push({ x: rad * Math.cos(ang), y: rad * Math.sin(ang) });
              }
              clipPath = new Polygon(pts, { originX: 'center', originY: 'center' });
            } else if (shape === 'heart') {
              clipPath = new Path(
                'M 0 -30 C -5 -50, -40 -50, -40 -20 C -40 5, -10 25, 0 40 C 10 25, 40 5, 40 -20 C 40 -50, 5 -50, 0 -30 Z',
                { originX: 'center', originY: 'center', scaleX: r/40, scaleY: r/40 }
              );
            } else if (shape === 'diamond') {
              clipPath = new Polygon([
                { x: 0, y: -r }, { x: r * 0.7, y: 0 }, { x: 0, y: r }, { x: -r * 0.7, y: 0 }
              ], { originX: 'center', originY: 'center' });
            }
            if (clipPath) {
              obj.set('clipPath', clipPath);
              obj.dirty = true;
              c.requestRenderAll();
            }
          }} />`;
    code = code.slice(0, cropEnd + 5) + maskBtn + code.slice(cropEnd + 5);
    changes++;
    console.log("4. Added Image Mask button");
  }
}

if (changes > 0) {
  writeFileSync(file, code, "utf8");
  console.log(`\nDone! ${changes} changes applied.`);
} else {
  console.log("No changes made.");
}
