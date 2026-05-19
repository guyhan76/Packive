import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');
let done = 0;

// 1. Add zoom and grid states after exportScale
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const [exportScale, setExportScale]')) {
    lines.splice(i + 1, 0,
      '  const [zoom, setZoom] = useState(100);',
      '  const [showGrid, setShowGrid] = useState(false);',
      '  const scaleRef = useRef(1);',
    );
    done++;
    console.log('1. Added zoom, showGrid, scaleRef states');
    break;
  }
}

// 2. Save scale into scaleRef after "const scale = canvasW / widthMM;"
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const scale = canvasW / widthMM;')) {
    lines.splice(i + 1, 0, '      scaleRef.current = scale;');
    done++;
    console.log('2. Saved scale to scaleRef');
    break;
  }
}

// 3. Add zoom/grid functions after refreshLayers closing
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('setLayersList(list);') && lines[i+1] && lines[i+1].includes('}, []);')) {
    const fns = [
      '',
      '  const applyZoom = useCallback((newZoom: number) => {',
      '    const c = fcRef.current; if (!c) return;',
      '    const z = Math.max(25, Math.min(400, newZoom));',
      '    setZoom(z);',
      '    const scale = z / 100;',
      '    c.setZoom(scale);',
      '    c.setWidth(c.getWidth() / (c.getZoom() || 1) * scale);',
      '    c.setHeight(c.getHeight() / (c.getZoom() || 1) * scale);',
      '    c.renderAll();',
      '  }, []);',
    ];
    lines.splice(i + 2, 0, ...fns);
    done++;
    console.log('3. Added applyZoom function');
    break;
  }
}

// 4. Replace canvas </div></div> before Right Panel with zoom controls + grid toggle
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<canvas ref={canvasElRef}')) {
    // Find the closing </div></div> after canvas
    let canvasClose = -1;
    for (let j = i; j < i + 10; j++) {
      if (lines[j].trim() === '</div>' && lines[j+1] && lines[j+1].trim() === '</div>') {
        canvasClose = j;
        break;
      }
    }
    if (canvasClose > -1) {
      // Replace the two </div> lines with controls + closing divs
      lines.splice(canvasClose, 2,
        '          </div>',
        '          {/* Grid Overlay */}',
        '          {showGrid && (',
        '            <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">',
        '              <defs>',
        '                <pattern id="grid10" width={10 * scaleRef.current * (zoom / 100)} height={10 * scaleRef.current * (zoom / 100)} patternUnits="userSpaceOnUse">',
        '                  <path d={`M ${10 * scaleRef.current * (zoom / 100)} 0 L 0 0 0 ${10 * scaleRef.current * (zoom / 100)}`} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />',
        '                </pattern>',
        '              </defs>',
        '              <rect width="100%" height="100%" fill="url(#grid10)" />',
        '            </svg>',
        '          )}',
        '          {/* Zoom Controls */}',
        '          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur rounded-lg shadow px-2 py-1">',
        '            <button onClick={() => setShowGrid(!showGrid)} className={`px-1.5 h-7 text-xs rounded ${showGrid ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`} title="Toggle Grid">⊞</button>',
        '            <div className="w-px h-5 bg-gray-200 mx-1" />',
        '            <button onClick={() => { const z = Math.max(25, zoom - 25); setZoom(z); }} className="w-7 h-7 flex items-center justify-center text-sm text-gray-600 hover:bg-gray-100 rounded">−</button>',
        '            <button onClick={() => setZoom(100)} className="px-2 h-7 flex items-center justify-center text-xs font-medium text-gray-700 hover:bg-gray-100 rounded min-w-[40px]">{zoom}%</button>',
        '            <button onClick={() => { const z = Math.min(400, zoom + 25); setZoom(z); }} className="w-7 h-7 flex items-center justify-center text-sm text-gray-600 hover:bg-gray-100 rounded">+</button>',
        '          </div>',
        '        </div>',
      );
      done++;
      console.log('4. Added grid overlay + zoom controls');
    }
    break;
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Changes: ' + done);
