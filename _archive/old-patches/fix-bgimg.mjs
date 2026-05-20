import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let lines = readFileSync(f, "utf8").split("\n");

// Find BG Color label
let bgIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('text-gray-400">BG Color</span>')) {
    bgIdx = i;
    break;
  }
}

if (bgIdx === -1) { console.log("ERROR: BG Color not found"); process.exit(1); }

// Go back to find the opening div of BG Color section
let divIdx = bgIdx - 1;
while (divIdx > 0 && !lines[divIdx].includes('<div')) divIdx--;

const bgImgBlock = [
  '          <div className="flex flex-col items-center gap-1">',
  '            <span className="text-[9px] text-gray-400">BG Image</span>',
  '            <button onClick={() => {',
  '              const input = document.createElement("input");',
  '              input.type = "file";',
  '              input.accept = "image/*";',
  '              input.onchange = async (ev: any) => {',
  '                const file = ev.target.files?.[0]; if (!file) return;',
  '                const c = fcRef.current; if (!c) return;',
  '                const { FabricImage } = await import("fabric");',
  '                const url = URL.createObjectURL(file);',
  '                try {',
  '                  const img = await FabricImage.fromURL(url);',
  '                  const scX = c.width / (img.width || 1);',
  '                  const scY = c.height / (img.height || 1);',
  '                  img.set({',
  '                    left: 0, top: 0,',
  '                    scaleX: scX, scaleY: scY,',
  '                    selectable: false, evented: false,',
  '                    (img as any)._isBgImage = true,',
  '                  });',
  '                  // Remove existing bg image',
  '                  c.getObjects().forEach((o: any) => { if (o._isBgImage) c.remove(o); });',
  '                  c.insertAt(img, 0);',
  '                  c.renderAll();',
  '                  refreshLayers();',
  '                } catch (err) { console.error("BG image error:", err); }',
  '                URL.revokeObjectURL(url);',
  '              };',
  '              input.click();',
  '            }} className="w-[120px] py-1 text-[10px] bg-gray-100 text-gray-600 border border-gray-200 rounded hover:bg-gray-200 font-medium" title="Set background image">',
  '              Upload BG Image',
  '            </button>',
  '            <button onClick={() => {',
  '              const c = fcRef.current; if (!c) return;',
  '              c.getObjects().forEach((o: any) => { if (o._isBgImage) c.remove(o); });',
  '              c.renderAll();',
  '              refreshLayers();',
  '            }} className="w-[120px] py-1 text-[10px] bg-red-50 text-red-500 border border-red-200 rounded hover:bg-red-100 font-medium" title="Remove background image">',
  '              Remove BG Image',
  '            </button>',
  '          </div>',
  '          <hr className="w-28 border-gray-200" />',
];

lines.splice(divIdx, 0, ...bgImgBlock);
writeFileSync(f, lines.join("\n"), "utf8");
console.log("Done! BG Image section added before BG Color at line " + (divIdx + 1));
