import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');
let done = 0;

// 1. Color grid-cols-2 -> grid-cols-3
code = code.replace('grid grid-cols-2 gap-[3px]">\n              {colors.map', 'grid grid-cols-3 gap-[3px]">\n              {colors.map');
if (code.includes('grid-cols-3 gap-[3px]')) { done++; console.log('1. Color grid fixed'); }

// 2. BG Color: use canvas.backgroundColor
const oldBg = 'const bg = cv.getObjects().find((o:any) => (o as any)._isBgRect);';
if (code.includes(oldBg)) {
  code = code.replace(oldBg + '\n                  if (bg) { bg.set("fill", c); cv.renderAll(); }', 'cv.set("backgroundColor", c); cv.renderAll();');
  done++;
  console.log('2. BG Color fixed');
}

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Changes: ' + done);
