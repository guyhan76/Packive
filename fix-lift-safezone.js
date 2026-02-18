const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
console.log('Start:', lines.length);

// Step 1: boot 내부의 addSafeZone 함수를 찾아서 본문 저장 후 제거
let safeStart = -1, safeEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const addSafeZone = () => {') && i > 1000) {
    safeStart = i;
    let depth = 0;
    for (let j = i; j < i + 50; j++) {
      depth += (lines[j].match(/\{/g)||[]).length - (lines[j].match(/\}/g)||[]).length;
      if (depth === 0 && j > i) { safeEnd = j; break; }
    }
    break;
  }
}
console.log('addSafeZone found at lines', safeStart+1, '-', safeEnd+1);

// Remove from boot
if (safeStart >= 0 && safeEnd >= 0) {
  lines.splice(safeStart, safeEnd - safeStart + 1);
  console.log('Removed addSafeZone from boot');
}

// Step 2: Add addSafeZone as useCallback BEFORE the useEffect (line ~960 area)
// Find the main useEffect
let useEffectLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('/* ────── Fabric.js v7 초기화 ──────')) {
    useEffectLine = i;
    break;
  }
}
if (useEffectLine < 0) {
  // fallback: find useEffect with boot
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('useEffect(() => {') && lines[i+2]?.includes('keyHandler')) {
      useEffectLine = i;
      break;
    }
  }
}
console.log('useEffect at line', useEffectLine + 1);

const indent = '    ';
const safeFn = [
  '',
  indent + '// ── Safe Zone (5mm margin) ──',
  indent + 'const addSafeZone = useCallback(() => {',
  indent + '  const canvas = fcRef.current; if (!canvas) return;',
  indent + '  const fab = fabricModRef.current;',
  indent + '  if (!fab?.FabricText || !fab?.Rect) return;',
  indent + '  const { FabricText, Rect } = fab;',
  indent + '  canvas.getObjects().slice().forEach((o: any) => {',
  indent + '    if (o._isSafeZone || o._isGuideText || o._isSizeLabel) canvas.remove(o);',
  indent + '  });',
  indent + '  const _cw = canvas.getWidth();',
  indent + '  const _ch = canvas.getHeight();',
  indent + '  const pxPerMmX = _cw / widthMM;',
  indent + '  const pxPerMmY = _ch / heightMM;',
  indent + '  const mgX = Math.max(6, Math.round(5 * pxPerMmX));',
  indent + '  const mgY = Math.max(6, Math.round(5 * pxPerMmY));',
  indent + '  console.log("[SafeZone] cw:", _cw, "ch:", _ch, "mgX:", mgX, "mgY:", mgY);',
  indent + '  const _sr = new Rect({',
  indent + '    left: mgX, top: mgY, width: _cw - mgX * 2, height: _ch - mgY * 2,',
  indent + '    fill: "transparent", stroke: "#3B82F6", strokeWidth: 1.5,',
  indent + '    strokeDashArray: [8, 5], selectable: false, evented: false,',
  indent + '    originX: "left", originY: "top",',
  indent + '  });',
  indent + '  (_sr as any)._isSafeZone = true;',
  indent + '  canvas.add(_sr);',
  indent + '  const gtSize = Math.max(10, Math.min(13, Math.round(11 * pxPerMmX)));',
  indent + '  const _gt = new FabricText(guideText || "Design Area", {',
  indent + '    left: _cw / 2, top: _ch / 2, originX: "center", originY: "center",',
  indent + '    fontSize: gtSize, fill: "#D0D0D0",',
  indent + '    fontFamily: "Arial, sans-serif", selectable: false, evented: false,',
  indent + '  });',
  indent + '  (_gt as any)._isGuideText = true;',
  indent + '  canvas.add(_gt);',
  indent + '  const _sl = new FabricText(widthMM + " x " + heightMM + " mm", {',
  indent + '    left: _cw - mgX - 4, top: _ch - mgY - 4, originX: "right", originY: "bottom",',
  indent + '    fontSize: 9, fill: "#C0C0C0", fontFamily: "Arial, sans-serif",',
  indent + '    selectable: false, evented: false,',
  indent + '  });',
  indent + '  (_sl as any)._isSizeLabel = true;',
  indent + '  canvas.add(_sl);',
  indent + '  canvas.bringObjectToFront(_sr);',
  indent + '  canvas.bringObjectToFront(_gt);',
  indent + '  canvas.bringObjectToFront(_sl);',
  indent + '  canvas.requestRenderAll();',
  indent + '}, [widthMM, heightMM, guideText]);',
  '',
];

lines.splice(useEffectLine, 0, ...safeFn);
console.log('addSafeZone useCallback inserted before useEffect');

// === WRITE ===
const result = lines.join('\n');
fs.writeFileSync(file, result, 'utf8');
const ob = (result.match(/\{/g)||[]).length;
const cb = (result.match(/\}/g)||[]).length;
console.log('Done! Lines:', lines.length, '| { :', ob, '| } :', cb, '| diff:', ob - cb);
