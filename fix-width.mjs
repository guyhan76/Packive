import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

// 왼쪽 aside 폭 72px → 88px
code = code.replace(
  'w-[72px] bg-white border-r flex flex-col items-center py-3 gap-2 overflow-y-auto shrink-0',
  'w-[88px] bg-white border-r flex flex-col items-center py-3 gap-2 overflow-y-auto shrink-0'
);

// Color 팔레트 grid 2열 → 3열
code = code.replace(
  /<div className="grid grid-cols-2 gap-\[3px\]">\s*\{colors\.map/,
  '<div className="grid grid-cols-3 gap-[3px]">\n              {colors.map'
);

// BG 팔레트도 3열로
code = code.replace(
  /<div className="grid grid-cols-2 gap-\[3px\]">\s*\{\[\'#FFFFFF/,
  `<div className="grid grid-cols-3 gap-[3px]">\n              {['#FFFFFF`
);

// ToolButton 폭도 조정
code = code.replace(
  'w-14 h-14 flex flex-col items-center justify-center rounded-lg text-xs',
  'w-16 h-14 flex flex-col items-center justify-center rounded-lg text-xs'
);

// Shape select 폭
code = code.replace(
  'w-16 text-[9px] border rounded px-0.5 py-1 bg-white',
  'w-20 text-[9px] border rounded px-0.5 py-1 bg-white'
);

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Left panel widened.');
