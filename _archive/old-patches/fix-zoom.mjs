import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

// 1. zoom state 추가 (bgColor 근처)
code = code.replace(
  "const [bgColor, setBgColor] = useState('#FFFFFF');",
  `const [bgColor, setBgColor] = useState('#FFFFFF');
  const [zoom, setZoom] = useState(100);`
);

// 2. zoom 함수 추가 (redo 함수 근처 - undo/redo 뒤에)
code = code.replace(
  'const redo = useCallback(async () => {',
  `const handleZoom = useCallback((delta: number) => {
    const c = fcRef.current; if (!c) return;
    let newZoom = zoom + delta;
    if (newZoom < 25) newZoom = 25;
    if (newZoom > 300) newZoom = 300;
    setZoom(newZoom);
    const scale = newZoom / 100;
    c.setZoom(scale);
    c.setWidth(c.getWidth() / c.getZoom() * scale);
    c.setHeight(c.getHeight() / c.getZoom() * scale);
    c.renderAll();
  }, [zoom]);

  const resetZoom = useCallback(() => {
    const c = fcRef.current; if (!c) return;
    setZoom(100);
    c.setZoom(1);
    c.renderAll();
  }, []);

  const redo = useCallback(async () => {`
);

// 3. 캔버스 wrapper에 줌 컨트롤 오버레이 추가
code = code.replace(
  `{/* Center Canvas */}
        <div ref={wrapperRef} className="flex-1 flex items-center justify-center bg-gray-100 min-h-0 min-w-0 overflow-hidden p-5">
          <div className="shadow-lg border border-gray-300" style={{ lineHeight: 0, display: 'inline-block' }}>
            <canvas ref={canvasElRef} />
          </div>
        </div>`,
  `{/* Center Canvas */}
        <div ref={wrapperRef} className="flex-1 flex items-center justify-center bg-gray-100 min-h-0 min-w-0 overflow-hidden p-5 relative">
          <div className="shadow-lg border border-gray-300" style={{ lineHeight: 0, display: 'inline-block' }}>
            <canvas ref={canvasElRef} />
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur rounded-lg shadow border px-2 py-1">
            <button onClick={() => handleZoom(-10)} className="w-7 h-7 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-100 rounded">-</button>
            <button onClick={resetZoom} className="px-2 h-7 flex items-center justify-center text-xs font-medium text-gray-700 hover:bg-gray-100 rounded min-w-[40px]">{zoom}%</button>
            <button onClick={() => handleZoom(10)} className="w-7 h-7 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-100 rounded">+</button>
          </div>
        </div>`
);

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Zoom controls added.');
