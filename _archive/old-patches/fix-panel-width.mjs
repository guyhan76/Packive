import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

let count = 0;

// 1. 패널 너비 110px -> 140px
if (code.includes('w-[110px] bg-white border-r flex flex-col')) {
  code = code.replace('w-[110px] bg-white border-r flex flex-col', 'w-[140px] bg-white border-r flex flex-col');
  count++;
  console.log('1. Panel width: 110px -> 140px');
}

// 2. hr 구분선 w-20 -> w-28
const hrCount = (code.match(/className="w-20 border-gray-200"/g) || []).length;
code = code.replaceAll('className="w-20 border-gray-200"', 'className="w-28 border-gray-200"');
count += hrCount;
console.log('2. HR dividers: w-20 -> w-28 (' + hrCount + ' replaced)');

// 3. select/input w-24 -> w-[120px] (내부 컨트롤)
// Only inside the left panel area (before the canvas wrapper)
const lines = code.split('\n');
let inLeftPanel = false;
let ctrlCount = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('w-[140px] bg-white border-r')) inLeftPanel = true;
  if (inLeftPanel && lines[i].includes('ref={wrapperRef}')) inLeftPanel = false;
  if (inLeftPanel) {
    if (lines[i].includes('className="w-24 text-[9px]')) {
      lines[i] = lines[i].replace('w-24 text-[9px]', 'w-[120px] text-[10px]');
      ctrlCount++;
    }
    if (lines[i].includes('className="w-24 h-1')) {
      lines[i] = lines[i].replace('w-24 h-1', 'w-[120px] h-1');
      ctrlCount++;
    }
    if (lines[i].includes('className="w-14 text-xs')) {
      lines[i] = lines[i].replace('w-14 text-xs', 'w-[120px] text-xs');
      ctrlCount++;
    }
  }
}
code = lines.join('\n');
console.log('3. Controls widened: ' + ctrlCount + ' replaced');

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Total changes: ' + (count + ctrlCount));
