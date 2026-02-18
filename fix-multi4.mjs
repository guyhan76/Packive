import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');
let done = 0;

// 1. Fix Color grid at line 1722 (index 1721)
if (lines[1721].includes('grid-cols-2')) {
  lines[1721] = lines[1721].replace('grid-cols-2', 'grid-cols-3');
  done++;
  console.log('1. Color grid-cols-2 -> grid-cols-3 at line 1722');
}

// 2. Fix Opacity - add console.log for debug and ensure it works
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('(obj as any).set("opacity"')) {
    lines[i] = '                if (obj) { console.log("OPACITY", +e.target.value); (obj as any).set("opacity", +e.target.value / 100); c.requestRenderAll(); }';
    done++;
    console.log('2. Opacity debug + requestRenderAll at line ' + (i+1));
    break;
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Changes: ' + done);
