import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

// 1. bgColor state 추가 (color state 근처)
code = code.replace(
  "const [color, setColor] = useState('#000000');",
  `const [color, setColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');`
);

// 2. Background color 변경 함수 추가 (applyColor 또는 color input 근처)
// Color input 다음, hr 앞에 BG 색상 선택기 추가
code = code.replace(
  `<input type="color" value={color} onChange={e => applyColor(e.target.value)} className="w-10 h-5 mt-1 cursor-pointer border-0" />
          </div>
          <hr className="w-10 border-gray-200" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] text-gray-400">Size</span>`,
  `<input type="color" value={color} onChange={e => applyColor(e.target.value)} className="w-10 h-5 mt-1 cursor-pointer border-0" />
          </div>
          <hr className="w-10 border-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-gray-400">BG</span>
            <div className="grid grid-cols-2 gap-[3px]">
              {['#FFFFFF','#000000','#F3F4F6','#FEF3C7','#DBEAFE','#D1FAE5','#FCE7F3','#EDE9FE','#FEE2E2','#FFEDD5'].map(c => (
                <button key={c} onClick={() => { setBgColor(c); const cv = fcRef.current; if(cv){ cv.backgroundColor = c; cv.renderAll(); }}}
                  className={\`w-5 h-5 rounded-sm border \${bgColor === c ? 'ring-2 ring-blue-400' : 'border-gray-300'}\`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
            <input type="color" value={bgColor} onChange={e => { setBgColor(e.target.value); const cv = fcRef.current; if(cv){ cv.backgroundColor = e.target.value; cv.renderAll(); }}} className="w-10 h-5 mt-1 cursor-pointer border-0" />
          </div>
          <hr className="w-10 border-gray-200" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] text-gray-400">Size</span>`
);

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Background color picker added.');
