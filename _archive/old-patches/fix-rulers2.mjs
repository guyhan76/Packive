import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');
let done = 0;

// Find Center Canvas section and replace
let startIdx = -1, endIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{/* Center Canvas */}')) { startIdx = i; }
  if (startIdx > -1 && lines[i].includes('{/* Right Panel */}')) { endIdx = i; break; }
}

if (startIdx > -1 && endIdx > -1) {
  const newBlock = [
    '        {/* Center Canvas */}',
    '        <div ref={wrapperRef} className="flex-1 flex items-center justify-center bg-gray-100 min-h-0 min-w-0 overflow-auto p-5 relative">',
    '          <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center", transition: "transform 0.2s" }}>',
    '            {/* Ruler + Canvas wrapper */}',
    '            <div className="flex flex-col">',
    '              {/* Top Ruler */}',
    '              <div className="flex">',
    '                <div className="w-5 h-5 bg-gray-300 shrink-0" /> {/* corner */}',
    '                <div className="h-5 bg-gray-200 border-b border-gray-300 relative overflow-hidden" style={{ width: canvasElRef.current?.width || 400 }}>',
    '                  {Array.from({ length: Math.ceil(widthMM / 10) + 1 }, (_, i) => {',
    '                    const px = i * 10 * scaleRef.current;',
    '                    return (',
    '                      <div key={i} className="absolute top-0" style={{ left: px }}>',
    '                        <div className="w-px h-3 bg-gray-500" />',
    '                        <span className="absolute top-0.5 left-0.5 text-[7px] text-gray-500 leading-none">{i * 10}</span>',
    '                      </div>',
    '                    );',
    '                  })}',
    '                </div>',
    '              </div>',
    '              {/* Left Ruler + Canvas */}',
    '              <div className="flex">',
    '                <div className="w-5 bg-gray-200 border-r border-gray-300 relative overflow-hidden shrink-0" style={{ height: canvasElRef.current?.height || 300 }}>',
    '                  {Array.from({ length: Math.ceil(heightMM / 10) + 1 }, (_, i) => {',
    '                    const px = i * 10 * scaleRef.current;',
    '                    return (',
    '                      <div key={i} className="absolute left-0" style={{ top: px }}>',
    '                        <div className="h-px w-3 bg-gray-500" />',
    '                        <span className="absolute left-0.5 top-0.5 text-[7px] text-gray-500 leading-none whitespace-nowrap">{i * 10}</span>',
    '                      </div>',
    '                    );',
    '                  })}',
    '                </div>',
    '                <div className="shadow-lg border border-gray-300" style={{ lineHeight: 0, display: "inline-block" }}>',
    '                  <canvas ref={canvasElRef} />',
    '                </div>',
    '              </div>',
    '            </div>',
    '          </div>',
    '          {/* Grid Overlay */}',
    '          {showGrid && (',
    '            <div className="absolute pointer-events-none" style={{',
    '              left: "50%", top: "50%",',
    '              width: (canvasElRef.current?.width || 400) * (zoom / 100),',
    '              height: (canvasElRef.current?.height || 300) * (zoom / 100),',
    '              transform: "translate(-50%, -50%)",',
    '            }}>',
    '              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">',
    '                <defs>',
    '                  <pattern id="grid10" width={10 * scaleRef.current * (zoom / 100)} height={10 * scaleRef.current * (zoom / 100)} patternUnits="userSpaceOnUse">',
    '                    <path d={`M ${10 * scaleRef.current * (zoom / 100)} 0 L 0 0 0 ${10 * scaleRef.current * (zoom / 100)}`} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />',
    '                  </pattern>',
    '                </defs>',
    '                <rect width="100%" height="100%" fill="url(#grid10)" />',
    '              </svg>',
    '            </div>',
    '          )}',
    '          {/* Zoom + Grid Controls */}',
    '          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur rounded-lg shadow px-2 py-1 z-10">',
    '            <button onClick={() => setShowGrid(!showGrid)} className={`px-1.5 h-7 text-xs rounded ${showGrid ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`} title="Toggle Grid">⊞</button>',
    '            <div className="w-px h-5 bg-gray-200 mx-1" />',
    '            <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="w-7 h-7 flex items-center justify-center text-sm text-gray-600 hover:bg-gray-100 rounded">−</button>',
    '            <button onClick={() => setZoom(100)} className="px-2 h-7 flex items-center justify-center text-xs font-medium text-gray-700 hover:bg-gray-100 rounded min-w-[40px]">{zoom}%</button>',
    '            <button onClick={() => setZoom(z => Math.min(400, z + 25))} className="w-7 h-7 flex items-center justify-center text-sm text-gray-600 hover:bg-gray-100 rounded">+</button>',
    '          </div>',
    '        </div>',
    '',
  ];

  lines.splice(startIdx, endIdx - startIdx, ...newBlock);
  done++;
  console.log('Replaced canvas section (' + (endIdx - startIdx) + ' lines -> ' + newBlock.length + ' lines)');
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Changes: ' + done);
