import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');
let done = 0;

// 1. Find BG Color section and add custom color picker after palette
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('BG Color') && lines[i].includes('text-gray-400')) {
    // Find the closing </div> of the BG Color section (after grid)
    let closeCount = 0;
    for (let j = i; j < i + 20; j++) {
      if (lines[j].includes('</div>')) {
        closeCount++;
        if (closeCount === 2) {
          // Insert custom color picker before this closing div
          lines.splice(j, 0,
            '            <input type="color" defaultValue="#FFFFFF" onChange={e => { const cv = fcRef.current; if (cv) { cv.set("backgroundColor", e.target.value); cv.renderAll(); } }} className="w-10 h-5 mt-1 cursor-pointer border-0" />'
          );
          done++;
          console.log('1. Added BG Color custom picker at line ' + (j+1));
          break;
        }
      }
    }
    break;
  }
}

// 2. Remove OPACITY debug log
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('console.log("OPACITY"')) {
    lines[i] = lines[i].replace('console.log("OPACITY", +e.target.value); ', '');
    done++;
    console.log('2. Removed Opacity debug log');
    break;
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Changes: ' + done);
