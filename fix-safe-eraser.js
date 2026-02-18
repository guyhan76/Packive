const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
console.log('Start:', lines.length);

// === FIX 1: scaleRef를 addSafeZone 호출 전에 설정 ===
// 현재 1182줄(index 1181): scaleRef.current = canvasW / widthMM;
// 이것을 캔버스 생성 직후(canvas 생성 뒤)로 이동
// 먼저 1182줄의 scaleRef 라인을 찾아서 제거
let scaleLineIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('scaleRef.current = canvasW / widthMM')) {
    scaleLineIdx = i;
    break;
  }
}
if (scaleLineIdx >= 0) {
  lines.splice(scaleLineIdx, 1);
  console.log('Removed scaleRef line from index', scaleLineIdx + 1);
}

// 이제 fcRef.current = canvas; 바로 뒤에 scaleRef 설정 추가
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('fcRef.current = canvas;')) {
    lines.splice(i + 1, 0, '      scaleRef.current = canvasW / widthMM;');
    console.log('Added scaleRef after fcRef.current = canvas at line', i + 2);
    break;
  }
}

// === FIX 2: addSafeZone에서 _mg 최소값 보장 + stroke 더 진하게 ===
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const _mg = Math.round(5 * _sc)')) {
    lines[i] = lines[i].replace(
      'const _mg = Math.round(5 * _sc)',
      'const _mg = Math.max(8, Math.round(5 * _sc))'
    );
    console.log('FIX2: _mg minimum 8px at line', i + 1);
    break;
  }
}

// stroke 색상을 더 진하게, 두께도 약간 증가
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('stroke: "#4A90D9"') && lines[i].includes('strokeWidth: 1.5')) {
    lines[i] = lines[i].replace('stroke: "#4A90D9", strokeWidth: 1.5', 'stroke: "#3B82F6", strokeWidth: 2');
    console.log('FIX2b: stroke color/width updated at line', i + 1);
    break;
  }
}

// === FIX 3: Eraser - 오브젝트의 path만 제거하는 방식으로 변경 ===
// 현재 eraser는 흰색으로 그리는데 이것이 배경까지 덮음
// 대신: eraser 모드에서 클릭한 오브젝트를 삭제하는 방식
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const toggleEraser = useCallback')) {
    let end = i;
    for (let j = i + 1; j < i + 30; j++) {
      if (lines[j].match(/^\s*\}, \[eraserMode/)) { end = j; break; }
    }
    const indent = '    ';
    const newFn = [
      indent + 'const toggleEraser = useCallback(() => {',
      indent + '  const c = fcRef.current; if (!c) return;',
      indent + '  if (eraserMode) {',
      indent + '    // Turn off eraser',
      indent + '    c.isDrawingMode = false;',
      indent + '    c.defaultCursor = "default";',
      indent + '    c.hoverCursor = "move";',
      indent + '    c.off("mouse:down", (c as any)._eraserHandler);',
      indent + '    setEraserMode(false);',
      indent + '  } else {',
      indent + '    // Turn on eraser - click to delete objects',
      indent + '    c.isDrawingMode = false;',
      indent + '    setDrawMode(false);',
      indent + '    c.defaultCursor = "crosshair";',
      indent + '    c.hoverCursor = "crosshair";',
      indent + '    const handler = (opt: any) => {',
      indent + '      const target = opt.target;',
      indent + '      if (!target) return;',
      indent + '      // Don\'t erase safe zone, guide text, bg images',
      indent + '      if (target._isSafeZone || target._isGuideText || target._isSizeLabel || target._isBgImage || target.selectable === false) return;',
      indent + '      c.remove(target);',
      indent + '      c.renderAll();',
      indent + '      refreshLayers();',
      indent + '    };',
      indent + '    (c as any)._eraserHandler = handler;',
      indent + '    c.on("mouse:down", handler);',
      indent + '    setEraserMode(true);',
      indent + '  }',
      indent + '}, [eraserMode, eraserSize, refreshLayers]);',
    ];
    lines.splice(i, end - i + 1, ...newFn);
    console.log('FIX3: toggleEraser rewritten at line', i + 1);
    break;
  }
}

// === WRITE ===
const result = lines.join('\n');
fs.writeFileSync(file, result, 'utf8');
const ob = (result.match(/\{/g)||[]).length;
const cb = (result.match(/\}/g)||[]).length;
console.log('Done! Lines:', lines.length, '| { :', ob, '| } :', cb, '| diff:', ob - cb);
