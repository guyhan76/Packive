import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

// 1. Add snapping state near bgColor state
code = code.replace(
  "const [bgColor, setBgColor] = useState('#FFFFFF');",
  `const [bgColor, setBgColor] = useState('#FFFFFF');
  const [snapEnabled, setSnapEnabled] = useState(true);
  const scaleRef = useRef<number>(1);`
);

// 2. Store scale in ref after calculation
code = code.replace(
  "const scale = canvasW / widthMM;",
  `const scale = canvasW / widthMM;
      scaleRef.current = scale;`
);

// 3. Add snapping logic after canvas creation (after "fcRef.current = canvas;")
code = code.replace(
  "fcRef.current = canvas;",
  `fcRef.current = canvas;

      // Snapping guidelines
      const SNAP_MM = 5;
      let vLine: any = null;
      let hLine: any = null;

      canvas.on('object:moving', (e: any) => {
        if (!snapEnabled) return;
        const obj = e.target;
        if (!obj) return;
        const s = scaleRef.current;
        const snapPx = SNAP_MM * s;
        const cw = canvas.getWidth();
        const ch = canvas.getHeight();
        const left = obj.left;
        const top = obj.top;
        const w = obj.getScaledWidth();
        const h = obj.getScaledHeight();
        const cx = left + w / 2;
        const cy = top + h / 2;

        // Remove old guidelines
        if (vLine) { canvas.remove(vLine); vLine = null; }
        if (hLine) { canvas.remove(hLine); hLine = null; }

        // Snap to center vertical
        if (Math.abs(cx - cw / 2) < snapPx) {
          obj.set('left', cw / 2 - w / 2);
          const { Line } = require('fabric');
          vLine = new Line([cw / 2, 0, cw / 2, ch], { stroke: '#FF6B6B', strokeWidth: 0.8, strokeDashArray: [4, 4], selectable: false, evented: false });
          canvas.add(vLine);
        }
        // Snap to center horizontal
        if (Math.abs(cy - ch / 2) < snapPx) {
          obj.set('top', ch / 2 - h / 2);
          const { Line } = require('fabric');
          hLine = new Line([0, ch / 2, cw, ch / 2], { stroke: '#FF6B6B', strokeWidth: 0.8, strokeDashArray: [4, 4], selectable: false, evented: false });
          canvas.add(hLine);
        }
        canvas.renderAll();
      });

      canvas.on('object:modified', () => {
        if (vLine) { canvas.remove(vLine); vLine = null; }
        if (hLine) { canvas.remove(hLine); hLine = null; }
        canvas.renderAll();
      });`
);

// 4. Replace center canvas wrapper to include rulers
code = code.replace(
  `{/* Center Canvas */}
        <div ref={wrapperRef} className="flex-1 flex items-center justify-center bg-gray-100 min-h-0 min-w-0 overflow-hidden p-5 relative">
          <div className="shadow-lg border border-gray-300" style={{ lineHeight: 0, display: 'inline-block' }}>
            <canvas ref={canvasElRef} />
          </div>`,
  `{/* Center Canvas */}
        <div ref={wrapperRef} className="flex-1 flex items-center justify-center bg-gray-100 min-h-0 min-w-0 overflow-hidden p-5 relative">
          <div className="relative">
            {/* Top Ruler */}
            <div className="absolute -top-5 left-0 right-0 h-5 bg-gray-200/80 border-b border-gray-300 flex items-end overflow-hidden" style={{ fontSize: 0 }}>
              {Array.from({ length: Math.ceil(widthMM / 10) + 1 }, (_, i) => (
                <div key={i} className="absolute bottom-0 flex flex-col items-center" style={{ left: i * 10 * scaleRef.current * (zoom / 100) }}>
                  <span style={{ fontSize: '8px', lineHeight: '10px' }} className="text-gray-500 select-none">{i * 10}</span>
                  <div className="w-px h-2 bg-gray-400" />
                </div>
              ))}
            </div>
            {/* Left Ruler */}
            <div className="absolute -left-5 top-0 bottom-0 w-5 bg-gray-200/80 border-r border-gray-300 flex flex-col items-end overflow-hidden">
              {Array.from({ length: Math.ceil(heightMM / 10) + 1 }, (_, i) => (
                <div key={i} className="absolute right-0 flex items-center" style={{ top: i * 10 * scaleRef.current * (zoom / 100) }}>
                  <span style={{ fontSize: '8px', lineHeight: '10px', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="text-gray-500 select-none">{i * 10}</span>
                  <div className="h-px w-2 bg-gray-400" />
                </div>
              ))}
            </div>
            <div className="shadow-lg border border-gray-300" style={{ lineHeight: 0, display: 'inline-block' }}>
              <canvas ref={canvasElRef} />
            </div>
          </div>`
);

// 5. Add snap toggle button next to zoom controls
code = code.replace(
  '<button onClick={() => handleZoom(-10)}',
  `<button onClick={() => setSnapEnabled(p => !p)} className={"w-7 h-7 flex items-center justify-center text-xs font-bold rounded " + (snapEnabled ? "text-red-500 bg-red-50 hover:bg-red-100" : "text-gray-400 hover:bg-gray-100")} title={snapEnabled ? "Snap ON" : "Snap OFF"}>⊞</button>
            <div className="w-px h-5 bg-gray-200" />
            <button onClick={() => handleZoom(-10)}`
);

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Rulers + snap guides + snap toggle added.');
