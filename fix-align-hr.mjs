import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');
let fixed = 0;

// Find the broken line: "          </div>\n                    <div" (Font closing then Align opening without hr)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('</select>') && lines[i+1] && lines[i+1].trim() === '</div>' && 
      lines[i+2] && lines[i+2].includes('Align')) {
    // Insert hr between </div> and Align div
    lines.splice(i + 2, 0, '          <hr className="w-28 border-gray-200" />');
    fixed++;
    console.log('1. Inserted <hr> before Align at line ' + (i + 3));
    break;
  }
}

// Fix the indentation of Align div — find "                    <div" (too many spaces) before Align
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<div className="flex flex-col items-center gap-0.5"') && 
      lines[i+1] && lines[i+1].includes('Align')) {
    lines[i] = '          <div className="flex flex-col items-center gap-0.5">';
    fixed++;
    console.log('2. Fixed Align div indentation at line ' + (i + 1));
    break;
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Fixed ' + fixed + ' issues.');
