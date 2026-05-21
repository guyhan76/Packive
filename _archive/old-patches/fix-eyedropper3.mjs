import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
let changes = 0;

const oldBtn = `<button onClick={async () => {
              if ('EyeDropper' in window) {
                try {
                  const ed = new (window as any).EyeDropper();
                  const result = await ed.open();
                  if (result?.sRGBHex) { applyColor(result.sRGBHex); setColor(result.sRGBHex); }
                } catch {}
              } else { alert('EyeDropper API not supported'); }
            }} className="w-10 py-0.5 text-[8px] bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 mt-0.5" title="Pick color from screen">
              💧 Pick
            </button>`;

const newBtn = `<button onClick={async () => {
              const c = fcRef.current; if (!c) return;
              if ('EyeDropper' in window) {
                try {
                  const ed = new (window as any).EyeDropper();
                  const result = await ed.open();
                  if (result?.sRGBHex) { applyColor(result.sRGBHex); setColor(result.sRGBHex); }
                } catch {}
              } else {
                c.defaultCursor = 'crosshair';
                c.selection = false;
                const handler = (opt: any) => {
                  const ctx = (c as any).getContext('2d');
                  const pointer = c.getScenePoint(opt.e);
                  const pixel = ctx.getImageData(Math.round(pointer.x), Math.round(pointer.y), 1, 1).data;
                  const hex = '#' + [pixel[0],pixel[1],pixel[2]].map((v:number) => v.toString(16).padStart(2,'0')).join('');
                  applyColor(hex); setColor(hex);
                  c.defaultCursor = 'default';
                  c.selection = true;
                  c.off('mouse:down', handler);
                };
                c.on('mouse:down', handler);
              }
            }} className="w-full py-0.5 text-[8px] bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 mt-0.5 flex items-center justify-center gap-0.5" title="Eyedropper - sample a color point">
              🩸 Eyedropper
            </button>`;

if (code.includes(oldBtn)) {
  code = code.replace(oldBtn, newBtn);
  changes++;
  console.log("1. Replaced Pick with Eyedropper");
} else {
  console.log("ERROR: Pattern not found");
}

if (changes > 0) {
  writeFileSync(file, code, "utf8");
  console.log(`\nDone! ${changes} changes applied.`);
} else {
  console.log("No changes made.");
}
