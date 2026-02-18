const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');

// FIX 1: strokeUniform: true 추가
code = code.replace(
  /strokeDashArray: \[8, 5\], selectable: false, evented: false,\s*originX: "left", originY: "top",/,
  'strokeDashArray: [8, 5], selectable: false, evented: false,\n      strokeUniform: true,\n      originX: "left", originY: "top",'
);

// FIX 2: DEBUG 로그 제거 (깔끔하게)
code = code.replace(/\s*\/\/ DEBUG: log actual rendered positions[\s\S]*?sr\.strokeUniform\);/, '');
// 남은 SafeZone 디버그 로그도 제거
code = code.replace(/\s*console\.log\("\[SafeZone\][^"]*"[^;]*;/g, '');
code = code.replace(/\s*console\.log\("\[SafeZone DEBUG\][^"]*"[^;]*;/g, '');

// FIX 3: Eraser 슬라이더로 커서 크기 변경 - eraserSize onChange 수정
code = code.replace(
  /onChange=\{e => \{ const s=Number\(e\.target\.value\); setEraserSize\(s\); const c=fcRef\.current; if\(c\?\.freeDrawingBrush\) c\.freeDrawingBrush\.width=s; \}\}/,
  'onChange={e => { const s=Number(e.target.value); setEraserSize(s); const cur=document.getElementById("eraser-cursor"); if(cur){cur.style.width=s+"px";cur.style.height=s+"px";} }}'
);

fs.writeFileSync(file, code, 'utf8');
const lines = code.split('\n').length;
const ob = (code.match(/\{/g)||[]).length;
const cb = (code.match(/\}/g)||[]).length;
console.log('Done! Lines:', lines, '| { :', ob, '| } :', cb, '| diff:', ob - cb);
