import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');
let done = 0;

// 1. Fix panel width 72px -> 140px
if (code.includes('w-[72px] bg-white border-r flex flex-col')) {
  code = code.replace('w-[72px] bg-white border-r flex flex-col', 'w-[140px] bg-white border-r flex flex-col');
  done++;
  console.log('1. Panel width: 72px -> 140px');
}

// 2. Find Color section closing and add BG Color + Opacity after it
// Look for the color input (custom color picker) followed by </div> and <hr>
let lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('type="color"') && lines[i].includes('applyColor') && lines[i].includes('cursor-pointer')) {
    // Find the closing </div> and <hr> after this
    let closeIdx = -1;
    for (let j = i + 1; j < i + 5; j++) {
      if (lines[j].trim() === '</div>') { closeIdx = j; break; }
    }
    if (closeIdx > -1) {
      // Find the <hr> after </div>
      let hrIdx = -1;
      for (let j = closeIdx + 1; j < closeIdx + 3; j++) {
        if (lines[j].includes('<hr')) { hrIdx = j; break; }
      }
      if (hrIdx > -1) {
        const bgBlock = [
          '          <hr className="w-28 border-gray-200" />',
          '          <div className="flex flex-col items-center gap-1">',
          '            <span className="text-[9px] text-gray-400">BG Color</span>',
          '            <div className="grid grid-cols-3 gap-[3px]">',
          "              {['#FFFFFF','#F3F4F6','#FEE2E2','#FEF3C7','#D1FAE5','#DBEAFE','#EDE9FE','#FCE7F3','#E0E7FF','#CCFBF1','#FFF7ED','#F5F5F4'].map(c => (",
          '                <button key={c} onClick={() => {',
          '                  const cv = fcRef.current; if (!cv) return;',
          '                  const bg = cv.getObjects().find((o:any) => (o as any)._isBgRect);',
          '                  if (bg) { bg.set("fill", c); cv.renderAll(); }',
          '                }}',
          '                  className={`w-5 h-5 rounded-sm border border-gray-300`}',
          '                  style={{ backgroundColor: c }} />',
          '              ))}',
          '            </div>',
          '          </div>',
          '          <hr className="w-28 border-gray-200" />',
          '          <div className="flex flex-col items-center gap-1">',
          '            <span className="text-[9px] text-gray-400">Opacity</span>',
          '            <input type="range" min={0} max={100} defaultValue={100}',
          '              onChange={e => {',
          '                const c = fcRef.current; if (!c) return;',
          '                const obj = c.getActiveObject();',
          '                if (obj) { obj.set("opacity", +e.target.value / 100); c.renderAll(); }',
          '              }}',
          '              className="w-[120px] h-1 accent-blue-500"',
          '            />',
          '          </div>',
        ];
        // Replace the hr line with BG Color + Opacity block
        lines.splice(hrIdx, 1, ...bgBlock);
        done++;
        console.log('2. Added BG Color + Opacity after Color section');
      }
    }
    break;
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Changes: ' + done);
