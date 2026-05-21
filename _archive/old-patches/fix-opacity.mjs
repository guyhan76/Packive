import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

// 1. Add opacity state near fSize state
code = code.replace(
  'const [fSize, setFSize] = useState(24);',
  `const [fSize, setFSize] = useState(24);
  const [opacity, setOpacity] = useState(100);`
);

// 2. Update opacity when object is selected
code = code.replace(
  "if (obj && 'fontSize' in obj) setFSize((obj as any).fontSize || 24);",
  `if (obj && 'fontSize' in obj) setFSize((obj as any).fontSize || 24);
          setOpacity(Math.round((sel.opacity ?? 1) * 100));`
);

// 3. Insert Opacity control between Size </div> and <hr> before Font
code = code.replace(
  `  className="w-14 text-xs border rounded px-1 py-0.5"
/>

          </div>
          <hr className="w-10 border-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-gray-400">Font</span>`,
  `  className="w-14 text-xs border rounded px-1 py-0.5"
/>

          </div>
          <hr className="w-10 border-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-gray-400">Opacity</span>
            <input
              type="range"
              min={0}
              max={100}
              value={opacity}
              onChange={e => {
                const v = +e.target.value;
                setOpacity(v);
                const c = fcRef.current; if (!c) return;
                const obj = c.getActiveObject();
                if (obj) {
                  obj.set('opacity', v / 100);
                  c.renderAll();
                }
              }}
              className="w-16 h-1 accent-blue-500"
            />
            <span className="text-[8px] text-gray-500">{opacity}%</span>
          </div>
          <hr className="w-10 border-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-gray-400">Font</span>`
);

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Opacity slider added.');
