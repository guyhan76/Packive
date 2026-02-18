import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');
let lines = code.split('\n');

// 1. Find line 1919 (index 1918): <div className="shadow-lg border border-gray-300"...>
// Wrap canvas with ruler container
const rulerWrap = [
  '          <div className="relative" style={{ marginLeft: 22, marginTop: 22 }}>',
  '            {/* Top Ruler */}',
  '            <div className="absolute left-0 right-0 h-[20px] bg-gray-200/90 border-b border-gray-300 overflow-hidden select-none" style={{ top: -20, zIndex: 10 }}>',
  '              {Array.from({ length: Math.ceil(widthMM / 10) + 1 }, (_, i) => (',
  '                <div key={i} className="absolute bottom-0" style={{ left: i * 10 * scaleRef.current * (zoom / 100) }}>',
  '                  <span className="text-[7px] text-gray-500 absolute bottom-[6px]" style={{ transform: "translateX(-50%)" }}>{i * 10}</span>',
  '                  <div className="w-px h-[5px] bg-gray-400 absolute bottom-0" />',
  '                </div>',
  '              ))}',
  '            </div>',
  '            {/* Left Ruler */}',
  '            <div className="absolute top-0 bottom-0 w-[20px] bg-gray-200/90 border-r border-gray-300 overflow-hidden select-none" style={{ left: -20, zIndex: 10 }}>',
  '              {Array.from({ length: Math.ceil(heightMM / 10) + 1 }, (_, i) => (',
  '                <div key={i} className="absolute right-0" style={{ top: i * 10 * scaleRef.current * (zoom / 100) }}>',
  '                  <span className="text-[7px] text-gray-500 absolute right-[6px]" style={{ writingMode: "vertical-rl", transform: "rotate(180deg) translateY(50%)" }}>{i * 10}</span>',
  '                  <div className="h-px w-[5px] bg-gray-400 absolute right-0" />',
  '                </div>',
  '              ))}',
  '            </div>',
];

// Find the shadow-lg div line (index 1918)
let canvasIdx = -1;
for (let i = 1915; i < 1925; i++) {
  if (lines[i] && lines[i].includes('shadow-lg border border-gray-300')) {
    canvasIdx = i;
    break;
  }
}

if (canvasIdx === -1) {
  console.log('ERROR: Could not find canvas wrapper line');
  process.exit(1);
}

// Insert ruler lines before the shadow-lg div
lines.splice(canvasIdx, 0, ...rulerWrap);

// Now find the </div> that closes the canvas wrapper (after <canvas ref={canvasElRef} />)
// It was at canvasIdx+rulerWrap.length+1 (the </div> after canvas)
const afterCanvas = canvasIdx + rulerWrap.length + 2; // line after </canvas></div>
// Insert closing </div> for the relative wrapper
lines.splice(afterCanvas, 0, '          </div>');

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Rulers inserted at index ' + canvasIdx);
