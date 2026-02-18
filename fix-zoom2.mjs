import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');
let lines = code.split('\n');

// 1. 1869번 줄(인덱스 1868) - div에 relative 추가
lines[1868] = '        <div ref={wrapperRef} className="flex-1 flex items-center justify-center bg-gray-100 min-h-0 min-w-0 overflow-hidden p-5 relative">';

// 2. 1872번 줄(인덱스 1871) </div> 뒤에 줌 컨트롤 삽입
const zoomUI = [
  '          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur rounded-lg shadow border px-2 py-1">',
  '            <button onClick={() => handleZoom(-10)} className="w-7 h-7 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-100 rounded">-</button>',
  '            <button onClick={resetZoom} className="px-2 h-7 flex items-center justify-center text-xs font-medium text-gray-700 hover:bg-gray-100 rounded min-w-[40px]">{zoom}%</button>',
  '            <button onClick={() => handleZoom(10)} className="w-7 h-7 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-100 rounded">+</button>',
  '          </div>',
];

lines.splice(1872, 0, ...zoomUI);

// 3. AI Image 깨진 글씨 수정 (줄이 5줄 늘어났으므로 1945+5=1950)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('?쨼 AI Image (Reference)')) {
    lines[i] = lines[i].replace('?쨼 AI Image (Reference)', '🎨 AI Image (Reference)');
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Zoom controls + AI Image label fixed.');
