import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');
let done = 0;

// 1. Find the canvas wrapper section and replace it entirely
let startIdx = -1, endIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{/* Center Canvas */}')) { startIdx = i; }
  if (startIdx > -1 && lines[i].includes('{/* Right Panel */}')) { endIdx = i; break; }
}

if (startIdx > -1 && endIdx > -1) {
  const newBlock = [
    '        {/* Center Canvas */}',
    '        <div ref={wrapperRef} className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden relative">',
    '          {/* Top Ruler */}',
    '          <div className="h-5 bg-gray-200 border-b border-gray-300 flex shrink-0" style={{ marginLeft: 20 }}>',
    '            <div className="relative w-full h-full overflow-hidden">',
    '              {Array.from({ length: Math.ceil(widthMM / 10) + 1 }, (_, i) => {',
    '                const px = i * 10 * scaleRef.current * (zoom / 100);',
    '                return (',
    '                  <div key={i} className="absolute top-0" style={{ left: px }}>',
    '                    <div className="w-px h-3 bg-gray-500" />',
    '                    {i % 1 === 0 && <span className="absolute top-1 left-1 text-[8px] text-gray-500">{i * 10}</span>}',
    '                  </div>',
    '                );',
    '              })}',
    '            </div>',
    '          </div>',
    '          <div className="flex flex-1 min-h-0">',
    '            {/* Left Ruler */}',
    '            <div className="w-5 bg-gray-200 border-r border-gray-300 shrink-0 relative overflow-hidden">',
    '              {Array.from({ length: Math.ceil(heightMM / 10) + 1 }, (_, i) => {',
    '                const px = i * 10 * scaleRef.current * (zoom / 100);',
    '                return (',
    '                  <div key={i} className="absolute left-0" style={{ top: px }}>',
    '                    <div className="h-px w-3 bg-gray-500" />',
    '                    {i % 1 === 0 && <span className="absolute left-1 top-1 text-[8px] text-gray-500 whitespace-nowrap" style={{ transform: "rotate(-90deg)", transformOrigin: "0 0" }}>{i * 10}</span>}',
    '                  </div>',
    '                );',
    '              })}',
    '            </div>',
    '            {/* Canvas Area */}',
    '            <div className="flex-1 flex items-center justify-center bg-gray-100 overflow-auto p-5 relative">',
    '              <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center", transition: "transform 0.2s" }}>',
    '                <div className="shadow-lg border border-gray-300" style={{ lineHeight: 0, display: "inline-block" }}>',
    '                  <canvas ref={canvasElRef} />',
    '                </div>',
    '              </div>',
    '              {/* Grid Overlay */}',
    '              {showGrid && (',
    '                <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">',
    '                  <defs>',
    '                    <pattern id="grid10" width={10 * scaleRef.current * (zoom / 100)} height={10 * scaleRef.current * (zoom / 100)} patternUnits="userSpaceOnUse">',
    '                      <path d={`M ${10 * scaleRef.current * (zoom / 100)} 0 L 0 0 0 ${10 * scaleRef.current * (zoom / 100)}`} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />',
    '                    </pattern>',
    '                  </defs>',
    '                  <rect width="100%" height="100%" fill="url(#grid10)" />',
    '                </svg>',
    '              )}',
    '              {/* Zoom + Grid Controls */}',
    '              <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur rounded-lg shadow px-2 py-1 z-10">',
    '                <button onClick={() => setShowGrid(!showGrid)} className={`px-1.5 h-7 text-xs rounded ${showGrid ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`} title="Toggle Grid">⊞</button>',
    '                <div className="w-px h-5 bg-gray-200 mx-1" />',
    '                <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="w-7 h-7 flex items-center justify-center text-sm text-gray-600 hover:bg-gray-100 rounded">−</button>',
    '                <button onClick={() => setZoom(100)} className="px-2 h-7 flex items-center justify-center text-xs font-medium text-gray-700 hover:bg-gray-100 rounded min-w-[40px]">{zoom}%</button>',
    '                <button onClick={() => setZoom(z => Math.min(400, z + 25))} className="w-7 h-7 flex items-center justify-center text-sm text-gray-600 hover:bg-gray-100 rounded">+</button>',
    '              </div>',
    '            </div>',
    '          </div>',
    '        </div>',
    '',
  ];

  lines.splice(startIdx, endIdx - startIdx, ...newBlock);
  done++;
  console.log('1. Replaced canvas section with rulers + grid + zoom (lines ' + (startIdx+1) + '-' + (endIdx+1) + ')');
}

// 2. Add snap guide logic in canvas boot if not present
// Check if snap code exists
const hasSnap = lines.some(l => l.includes('SNAP_MM') || l.includes('object:moving'));
if (!hasSnap) {
  // Find canvas.on('object:modified'
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("canvas.on('object:modified'")) {
      const snapCode = [
        '',
        '      // Snap guides',
        '      const SNAP_MM = 5;',
        '      let vLine: any = null, hLine: any = null;',
        "      canvas.on('object:moving', (e: any) => {",
        '        const obj = e.target; if (!obj) return;',
        '        const cw = canvas.getWidth(); const ch = canvas.getHeight();',
        '        const bound = obj.getBoundingRect();',
        '        const cx = bound.left + bound.width / 2;',
        '        const cy = bound.top + bound.height / 2;',
        '        const snapPx = SNAP_MM * scaleRef.current;',
        '        // Remove old lines',
        '        if (vLine) { canvas.remove(vLine); vLine = null; }',
        '        if (hLine) { canvas.remove(hLine); hLine = null; }',
        '        let snappedV = false, snappedH = false;',
        '        if (Math.abs(cx - cw / 2) < snapPx) {',
        '          obj.set("left", cw / 2 - bound.width / 2 + (obj.left - bound.left));',
        '          snappedV = true;',
        '        }',
        '        if (Math.abs(cy - ch / 2) < snapPx) {',
        '          obj.set("top", ch / 2 - bound.height / 2 + (obj.top - bound.top));',
        '          snappedH = true;',
        '        }',
        '        const lineColor = (snappedV && snappedH) ? "#4CAF50" : "#ff0000";',
        '        if (snappedV) {',
        '          const { Line } = require("fabric");',
        '          vLine = new Line([cw/2, 0, cw/2, ch], { stroke: lineColor, strokeWidth: 1, strokeDashArray: [5,3], selectable: false, evented: false });',
        '          (vLine as any)._isGuideLine = true;',
        '          canvas.add(vLine);',
        '        }',
        '        if (snappedH) {',
        '          const { Line } = require("fabric");',
        '          hLine = new Line([0, ch/2, cw, ch/2], { stroke: lineColor, strokeWidth: 1, strokeDashArray: [5,3], selectable: false, evented: false });',
        '          (hLine as any)._isGuideLine = true;',
        '          canvas.add(hLine);',
        '        }',
        '        canvas.renderAll();',
        '      });',
        "      canvas.on('object:modified', () => {",
        '        if (vLine) { canvas.remove(vLine); vLine = null; }',
        '        if (hLine) { canvas.remove(hLine); hLine = null; }',
        '        canvas.renderAll();',
        '      });',
      ];
      // Insert before the existing object:modified line
      lines.splice(i, 0, ...snapCode);
      done++;
      console.log('2. Added snap guide code');
      break;
    }
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Changes: ' + done);
