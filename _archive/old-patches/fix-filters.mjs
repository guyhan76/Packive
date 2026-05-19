import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

const anchor = `<span className="text-[8px] text-gray-300">0 — 10</span>
          </div>
          <hr className="w-10 border-gray-200" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] text-gray-400">Rotation</span>`;

const replacement = `<span className="text-[8px] text-gray-300">0 — 10</span>
          </div>
          <hr className="w-10 border-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-gray-400">Image Filters</span>
            <div className="flex flex-col gap-1 w-[120px]">
              <div className="flex items-center gap-1">
                <span className="text-[8px] text-gray-400 w-[42px]">Bright</span>
                <input type="range" min={-100} max={100} defaultValue={0} onChange={async e => {
                  const c = fcRef.current; if (!c) return;
                  const obj = c.getActiveObject() as any;
                  if (!obj || obj.type !== 'image') return;
                  const F = await import('fabric');
                  const filters = obj.filters || [];
                  const idx = filters.findIndex((f:any) => f instanceof F.filters.Brightness);
                  if (idx >= 0) filters.splice(idx, 1);
                  filters.push(new F.filters.Brightness({ brightness: +e.target.value / 100 }));
                  obj.filters = filters;
                  obj.applyFilters();
                  c.requestRenderAll();
                }} className="flex-1 h-1 accent-blue-500" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[8px] text-gray-400 w-[42px]">Contrast</span>
                <input type="range" min={-100} max={100} defaultValue={0} onChange={async e => {
                  const c = fcRef.current; if (!c) return;
                  const obj = c.getActiveObject() as any;
                  if (!obj || obj.type !== 'image') return;
                  const F = await import('fabric');
                  const filters = obj.filters || [];
                  const idx = filters.findIndex((f:any) => f instanceof F.filters.Contrast);
                  if (idx >= 0) filters.splice(idx, 1);
                  filters.push(new F.filters.Contrast({ contrast: +e.target.value / 100 }));
                  obj.filters = filters;
                  obj.applyFilters();
                  c.requestRenderAll();
                }} className="flex-1 h-1 accent-blue-500" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[8px] text-gray-400 w-[42px]">Saturate</span>
                <input type="range" min={-100} max={100} defaultValue={0} onChange={async e => {
                  const c = fcRef.current; if (!c) return;
                  const obj = c.getActiveObject() as any;
                  if (!obj || obj.type !== 'image') return;
                  const F = await import('fabric');
                  const filters = obj.filters || [];
                  const idx = filters.findIndex((f:any) => f instanceof F.filters.Saturation);
                  if (idx >= 0) filters.splice(idx, 1);
                  filters.push(new F.filters.Saturation({ saturation: +e.target.value / 100 }));
                  obj.filters = filters;
                  obj.applyFilters();
                  c.requestRenderAll();
                }} className="flex-1 h-1 accent-blue-500" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[8px] text-gray-400 w-[42px]">Blur</span>
                <input type="range" min={0} max={100} defaultValue={0} onChange={async e => {
                  const c = fcRef.current; if (!c) return;
                  const obj = c.getActiveObject() as any;
                  if (!obj || obj.type !== 'image') return;
                  const F = await import('fabric');
                  const filters = obj.filters || [];
                  const idx = filters.findIndex((f:any) => f instanceof F.filters.Blur);
                  if (idx >= 0) filters.splice(idx, 1);
                  filters.push(new F.filters.Blur({ blur: +e.target.value / 100 }));
                  obj.filters = filters;
                  obj.applyFilters();
                  c.requestRenderAll();
                }} className="flex-1 h-1 accent-blue-500" />
              </div>
              <div className="flex gap-1 mt-1">
                <button onClick={async () => {
                  const c = fcRef.current; if (!c) return;
                  const obj = c.getActiveObject() as any;
                  if (!obj || obj.type !== 'image') return;
                  const F = await import('fabric');
                  const filters = obj.filters || [];
                  const idx = filters.findIndex((f:any) => f instanceof F.filters.Grayscale);
                  if (idx >= 0) { filters.splice(idx, 1); } else { filters.push(new F.filters.Grayscale()); }
                  obj.filters = filters;
                  obj.applyFilters();
                  c.requestRenderAll();
                }} className="flex-1 py-0.5 text-[8px] bg-gray-100 rounded hover:bg-gray-200">B&W</button>
                <button onClick={async () => {
                  const c = fcRef.current; if (!c) return;
                  const obj = c.getActiveObject() as any;
                  if (!obj || obj.type !== 'image') return;
                  const F = await import('fabric');
                  const filters = obj.filters || [];
                  const idx = filters.findIndex((f:any) => f instanceof F.filters.Sepia);
                  if (idx >= 0) { filters.splice(idx, 1); } else { filters.push(new F.filters.Sepia()); }
                  obj.filters = filters;
                  obj.applyFilters();
                  c.requestRenderAll();
                }} className="flex-1 py-0.5 text-[8px] bg-gray-100 rounded hover:bg-gray-200">Sepia</button>
                <button onClick={async () => {
                  const c = fcRef.current; if (!c) return;
                  const obj = c.getActiveObject() as any;
                  if (!obj || obj.type !== 'image') return;
                  obj.filters = [];
                  obj.applyFilters();
                  c.requestRenderAll();
                }} className="flex-1 py-0.5 text-[8px] bg-red-50 text-red-500 rounded hover:bg-red-100">Reset</button>
              </div>
            </div>
          </div>
          <hr className="w-10 border-gray-200" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] text-gray-400">Rotation</span>`;

if (code.includes(anchor)) {
  code = code.replace(anchor, replacement);
  writeFileSync(f, code, "utf8");
  console.log("Done! Added Image Filters section between Stroke Width and Rotation");
} else {
  console.log("Pattern not found. Trying normalized...");
  // Try with normalized whitespace
  const lines = code.split('\n');
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('text-gray-300">0 — 10</span>')) { startIdx = i; break; }
  }
  if (startIdx >= 0) {
    // Find the Rotation line after startIdx
    let rotIdx = -1;
    for (let i = startIdx; i < Math.min(startIdx + 10, lines.length); i++) {
      if (lines[i].includes('Rotation')) { rotIdx = i; break; }
    }
    if (rotIdx >= 0) {
      const filterBlock = [
        '          <hr className="w-10 border-gray-200" />',
        '          <div className="flex flex-col items-center gap-1">',
        '            <span className="text-[9px] text-gray-400">Image Filters</span>',
        '            <div className="flex flex-col gap-1 w-[120px]">',
        '              <div className="flex items-center gap-1">',
        '                <span className="text-[8px] text-gray-400 w-[42px]">Bright</span>',
        '                <input type="range" min={-100} max={100} defaultValue={0} onChange={async e => {',
        '                  const c = fcRef.current; if (!c) return;',
        '                  const obj = c.getActiveObject() as any;',
        '                  if (!obj || obj.type !== \'image\') return;',
        '                  const F = await import(\'fabric\');',
        '                  const filters = obj.filters || [];',
        '                  const idx = filters.findIndex((f:any) => f instanceof F.filters.Brightness);',
        '                  if (idx >= 0) filters.splice(idx, 1);',
        '                  filters.push(new F.filters.Brightness({ brightness: +e.target.value / 100 }));',
        '                  obj.filters = filters;',
        '                  obj.applyFilters();',
        '                  c.requestRenderAll();',
        '                }} className="flex-1 h-1 accent-blue-500" />',
        '              </div>',
        '              <div className="flex items-center gap-1">',
        '                <span className="text-[8px] text-gray-400 w-[42px]">Contrast</span>',
        '                <input type="range" min={-100} max={100} defaultValue={0} onChange={async e => {',
        '                  const c = fcRef.current; if (!c) return;',
        '                  const obj = c.getActiveObject() as any;',
        '                  if (!obj || obj.type !== \'image\') return;',
        '                  const F = await import(\'fabric\');',
        '                  const filters = obj.filters || [];',
        '                  const idx = filters.findIndex((f:any) => f instanceof F.filters.Contrast);',
        '                  if (idx >= 0) filters.splice(idx, 1);',
        '                  filters.push(new F.filters.Contrast({ contrast: +e.target.value / 100 }));',
        '                  obj.filters = filters;',
        '                  obj.applyFilters();',
        '                  c.requestRenderAll();',
        '                }} className="flex-1 h-1 accent-blue-500" />',
        '              </div>',
        '              <div className="flex items-center gap-1">',
        '                <span className="text-[8px] text-gray-400 w-[42px]">Saturate</span>',
        '                <input type="range" min={-100} max={100} defaultValue={0} onChange={async e => {',
        '                  const c = fcRef.current; if (!c) return;',
        '                  const obj = c.getActiveObject() as any;',
        '                  if (!obj || obj.type !== \'image\') return;',
        '                  const F = await import(\'fabric\');',
        '                  const filters = obj.filters || [];',
        '                  const idx = filters.findIndex((f:any) => f instanceof F.filters.Saturation);',
        '                  if (idx >= 0) filters.splice(idx, 1);',
        '                  filters.push(new F.filters.Saturation({ saturation: +e.target.value / 100 }));',
        '                  obj.filters = filters;',
        '                  obj.applyFilters();',
        '                  c.requestRenderAll();',
        '                }} className="flex-1 h-1 accent-blue-500" />',
        '              </div>',
        '              <div className="flex items-center gap-1">',
        '                <span className="text-[8px] text-gray-400 w-[42px]">Blur</span>',
        '                <input type="range" min={0} max={100} defaultValue={0} onChange={async e => {',
        '                  const c = fcRef.current; if (!c) return;',
        '                  const obj = c.getActiveObject() as any;',
        '                  if (!obj || obj.type !== \'image\') return;',
        '                  const F = await import(\'fabric\');',
        '                  const filters = obj.filters || [];',
        '                  const idx = filters.findIndex((f:any) => f instanceof F.filters.Blur);',
        '                  if (idx >= 0) filters.splice(idx, 1);',
        '                  filters.push(new F.filters.Blur({ blur: +e.target.value / 100 }));',
        '                  obj.filters = filters;',
        '                  obj.applyFilters();',
        '                  c.requestRenderAll();',
        '                }} className="flex-1 h-1 accent-blue-500" />',
        '              </div>',
        '              <div className="flex gap-1 mt-1">',
        '                <button onClick={async () => {',
        '                  const c = fcRef.current; if (!c) return;',
        '                  const obj = c.getActiveObject() as any;',
        '                  if (!obj || obj.type !== \'image\') return;',
        '                  const F = await import(\'fabric\');',
        '                  const filters = obj.filters || [];',
        '                  const idx = filters.findIndex((f:any) => f instanceof F.filters.Grayscale);',
        '                  if (idx >= 0) { filters.splice(idx, 1); } else { filters.push(new F.filters.Grayscale()); }',
        '                  obj.filters = filters;',
        '                  obj.applyFilters();',
        '                  c.requestRenderAll();',
        '                }} className="flex-1 py-0.5 text-[8px] bg-gray-100 rounded hover:bg-gray-200">B&W</button>',
        '                <button onClick={async () => {',
        '                  const c = fcRef.current; if (!c) return;',
        '                  const obj = c.getActiveObject() as any;',
        '                  if (!obj || obj.type !== \'image\') return;',
        '                  const F = await import(\'fabric\');',
        '                  const filters = obj.filters || [];',
        '                  const idx = filters.findIndex((f:any) => f instanceof F.filters.Sepia);',
        '                  if (idx >= 0) { filters.splice(idx, 1); } else { filters.push(new F.filters.Sepia()); }',
        '                  obj.filters = filters;',
        '                  obj.applyFilters();',
        '                  c.requestRenderAll();',
        '                }} className="flex-1 py-0.5 text-[8px] bg-gray-100 rounded hover:bg-gray-200">Sepia</button>',
        '                <button onClick={async () => {',
        '                  const c = fcRef.current; if (!c) return;',
        '                  const obj = c.getActiveObject() as any;',
        '                  if (!obj || obj.type !== \'image\') return;',
        '                  obj.filters = [];',
        '                  obj.applyFilters();',
        '                  c.requestRenderAll();',
        '                }} className="flex-1 py-0.5 text-[8px] bg-red-50 text-red-500 rounded hover:bg-red-100">Reset</button>',
        '              </div>',
        '            </div>',
        '          </div>',
      ];
      // Find the <hr> line between startIdx and rotIdx
      let hrIdx = -1;
      for (let i = startIdx + 1; i < rotIdx; i++) {
        if (lines[i].includes('<hr')) { hrIdx = i; break; }
      }
      if (hrIdx >= 0) {
        // Insert filter block before the <hr> line
        lines.splice(hrIdx, 0, ...filterBlock);
        writeFileSync(f, lines.join('\n'), "utf8");
        console.log("Done (fallback)! Inserted Image Filters at line " + hrIdx);
      } else {
        console.log("Could not find <hr> between Stroke Width and Rotation");
      }
    } else {
      console.log("Could not find Rotation line");
    }
  } else {
    console.log("Could not find '0 — 10' line");
  }
}
