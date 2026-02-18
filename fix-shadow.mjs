import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
let changes = 0;

// Insert Text Shadow UI between Rotation and Font sections
const oldCode = `              <span className="text-[8px] text-gray-300">°</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-gray-400">Font</span>
            <select
              value={selectedFont}`;

const newCode = `              <span className="text-[8px] text-gray-300">°</span>
            </div>
          </div>
          <hr className="w-10 border-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-gray-400">Shadow</span>
            <button onClick={() => {
              const c = fcRef.current; if (!c) return;
              const obj = c.getActiveObject() as any;
              if (!obj) return;
              const newOn = !textShadowOn;
              setTextShadowOn(newOn);
              if (newOn) {
                import('fabric').then(F => {
                  obj.set('shadow', new F.Shadow({ color: shadowColor, blur: shadowBlur, offsetX: shadowOffX, offsetY: shadowOffY }));
                  c.renderAll();
                });
              } else {
                obj.set('shadow', null);
                c.renderAll();
              }
            }} className={\`w-full px-2 py-0.5 text-[8px] rounded \${textShadowOn ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}\`}>
              {textShadowOn ? 'Shadow ON' : 'Shadow OFF'}
            </button>
            {textShadowOn && (
              <div className="flex flex-col items-center gap-0.5 bg-blue-50 p-1 rounded w-full">
                <div className="flex items-center gap-1">
                  <span className="text-[7px] text-gray-400">Color</span>
                  <input type="color" value={shadowColor} onChange={e => {
                    const v = e.target.value; setShadowColor(v);
                    const c = fcRef.current; if (!c) return;
                    const obj = c.getActiveObject() as any;
                    if (obj?.shadow) { obj.shadow.color = v; c.renderAll(); }
                  }} className="w-5 h-3 cursor-pointer border-0" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[7px] text-gray-400">Blur</span>
                  <input type="range" min={0} max={30} value={shadowBlur} onChange={e => {
                    const v = +e.target.value; setShadowBlur(v);
                    const c = fcRef.current; if (!c) return;
                    const obj = c.getActiveObject() as any;
                    if (obj?.shadow) { obj.shadow.blur = v; c.renderAll(); }
                  }} className="w-[50px] h-1 accent-blue-400" />
                  <span className="text-[7px] text-gray-300">{shadowBlur}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[7px] text-gray-400">X</span>
                  <input type="range" min={-20} max={20} value={shadowOffX} onChange={e => {
                    const v = +e.target.value; setShadowOffX(v);
                    const c = fcRef.current; if (!c) return;
                    const obj = c.getActiveObject() as any;
                    if (obj?.shadow) { obj.shadow.offsetX = v; c.renderAll(); }
                  }} className="w-[40px] h-1 accent-blue-400" />
                  <span className="text-[7px] text-gray-400">Y</span>
                  <input type="range" min={-20} max={20} value={shadowOffY} onChange={e => {
                    const v = +e.target.value; setShadowOffY(v);
                    const c = fcRef.current; if (!c) return;
                    const obj = c.getActiveObject() as any;
                    if (obj?.shadow) { obj.shadow.offsetY = v; c.renderAll(); }
                  }} className="w-[40px] h-1 accent-blue-400" />
                </div>
              </div>
            )}
          </div>
          <hr className="w-10 border-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-gray-400">Font</span>
            <select
              value={selectedFont}`;

if (code.includes(oldCode)) {
  code = code.replace(oldCode, newCode);
  changes++;
  console.log("1. Added Text Shadow UI between Rotation and Font");
} else {
  console.log("ERROR: Pattern not found");
  // Debug: show what's around line 2800
  const lines = code.split('\n');
  for (let i = 2798; i < 2810; i++) {
    console.log(`${i}: ${lines[i]}`);
  }
}

if (changes > 0) {
  writeFileSync(file, code, "utf8");
  console.log(`\nDone! ${changes} changes applied.`);
} else {
  console.log("No changes made.");
}
