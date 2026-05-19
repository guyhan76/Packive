import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');
let done = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('BG Color') && lines[i].includes('text-gray-400')) {
    let divDepth = 0;
    let sectionEnd = -1;
    for (let j = i - 1; j < i + 25; j++) {
      if (lines[j].includes('<div')) divDepth++;
      if (lines[j].includes('</div>')) divDepth--;
      if (divDepth === 0 && j > i) { sectionEnd = j; break; }
    }
    if (sectionEnd > -1) {
      const bgOpacity = [
        '          <div className="flex flex-col items-center gap-1">',
        '            <span className="text-[9px] text-gray-400">BG Opacity</span>',
        '            <input type="range" min={0} max={100} defaultValue={100}',
        '              onChange={e => {',
        '                const cv = fcRef.current; if (!cv) return;',
        '                const val = +e.target.value / 100;',
        '                const bg = String(cv.backgroundColor || "#FFFFFF");',
        '                let r=255,g=255,b=255;',
        '                if (bg.startsWith("#")) { r=parseInt(bg.slice(1,3),16); g=parseInt(bg.slice(3,5),16); b=parseInt(bg.slice(5,7),16); }',
        '                else if (bg.startsWith("rgba") || bg.startsWith("rgb")) {',
        '                  const m = bg.match(/[\\d.]+/g);',
        '                  if (m) { r=+m[0]; g=+m[1]; b=+m[2]; }',
        '                }',
        "                cv.set('backgroundColor', 'rgba(' + r + ',' + g + ',' + b + ',' + val + ')');",
        '                cv.renderAll();',
        '              }}',
        '              className="w-[120px] h-1 accent-blue-500"',
        '            />',
        '          </div>',
      ];
      lines.splice(sectionEnd + 1, 0, ...bgOpacity);
      done++;
      console.log('Added BG Opacity slider after line ' + (sectionEnd + 1));
    }
    break;
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Changes: ' + done);
