import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');
let lines = code.split('\n');

// 1683번 줄(인덱스 1682) </div> 뒤에 BG 섹션 삽입
const bgSection = [
  '          <hr className="w-10 border-gray-200" />',
  '          <div className="flex flex-col items-center gap-1">',
  '            <span className="text-[9px] text-gray-400">BG</span>',
  '            <div className="grid grid-cols-2 gap-[3px]">',
  "              {['#FFFFFF','#000000','#F3F4F6','#FEF3C7','#DBEAFE','#D1FAE5','#FCE7F3','#EDE9FE','#FEE2E2','#FFEDD5'].map(c => (",
  "                <button key={'bg'+c} onClick={() => { setBgColor(c); const cv = fcRef.current; if(cv){ cv.backgroundColor = c; cv.renderAll(); }}}",
  '                  className={`w-5 h-5 rounded-sm border ${bgColor === c ? "ring-2 ring-blue-400" : "border-gray-300"}`}',
  '                  style={{ backgroundColor: c }} />',
  '              ))}',
  '            </div>',
  '            <input type="color" value={bgColor} onChange={e => { setBgColor(e.target.value); const cv = fcRef.current; if(cv){ cv.backgroundColor = e.target.value; cv.renderAll(); }}} className="w-10 h-5 mt-1 cursor-pointer border-0" />',
  '          </div>',
];

// 인덱스 1682 (</div>) 뒤, 1683 (<hr>) 앞에 삽입
lines.splice(1683, 0, ...bgSection);

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! BG section inserted after line 1683.');
