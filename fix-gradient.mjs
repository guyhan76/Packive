import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let lines = readFileSync(f, "utf8").split("\n");
let changes = 0;

// Find the BG Color input type="color" defaultValue="#FFFFFF" line
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('type="color" defaultValue="#FFFFFF"') && lines[i].includes("backgroundColor")) {
    // Find the closing </div> of BG Color section
    let closeDivIdx = -1;
    for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
      if (lines[j].trim() === "</div>") { closeDivIdx = j; break; }
    }
    if (closeDivIdx === -1) { console.log("ERROR: closing div not found"); break; }

    const gradientBlock = [
      '          <div className="flex flex-col items-center gap-1">',
      '            <span className="text-[9px] text-gray-400">BG Gradient</span>',
      '            <div className="flex flex-col gap-1 items-center">',
      '              <div className="flex gap-1 items-center">',
      '                <span className="text-[8px] text-gray-400">From</span>',
      '                <input type="color" defaultValue="#667eea" id="gradFrom" className="w-6 h-4 cursor-pointer border-0" />',
      '                <span className="text-[8px] text-gray-400">To</span>',
      '                <input type="color" defaultValue="#764ba2" id="gradTo" className="w-6 h-4 cursor-pointer border-0" />',
      '              </div>',
      '              <select id="gradDir" defaultValue="toBottom" className="w-20 text-[8px] border rounded px-0.5 py-0.5">',
      '                <option value="toBottom">↓ Top→Bottom</option>',
      '                <option value="toRight">→ Left→Right</option>',
      '                <option value="toDiag">↘ Diagonal</option>',
      '                <option value="toRadial">◎ Radial</option>',
      '              </select>',
      '              <button onClick={() => {',
      '                const c = fcRef.current; if (!c) return;',
      '                const from = (document.getElementById("gradFrom") as HTMLInputElement).value;',
      '                const to = (document.getElementById("gradTo") as HTMLInputElement).value;',
      '                const dir = (document.getElementById("gradDir") as HTMLSelectElement).value;',
      '                let grad: any;',
      '                import("fabric").then(({ Gradient }) => {',
      '                  if (dir === "toRadial") {',
      '                    grad = new Gradient({',
      '                      type: "radial",',
      '                      coords: { x1: c.width!/2, y1: c.height!/2, x2: c.width!/2, y2: c.height!/2, r1: 0, r2: Math.max(c.width!, c.height!)/2 },',
      '                      colorStops: [{ offset: 0, color: from }, { offset: 1, color: to }],',
      '                    });',
      '                  } else {',
      '                    const coords = dir === "toBottom" ? { x1: 0, y1: 0, x2: 0, y2: c.height! }',
      '                      : dir === "toRight" ? { x1: 0, y1: 0, x2: c.width!, y2: 0 }',
      '                      : { x1: 0, y1: 0, x2: c.width!, y2: c.height! };',
      '                    grad = new Gradient({',
      '                      type: "linear",',
      '                      coords,',
      '                      colorStops: [{ offset: 0, color: from }, { offset: 1, color: to }],',
      '                    });',
      '                  }',
      '                  c.set("backgroundColor", grad as any);',
      '                  c.requestRenderAll();',
      '                });',
      '              }} className="w-20 py-0.5 text-[9px] bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 font-medium">',
      '                Apply Gradient',
      '              </button>',
      '            </div>',
      '          </div>',
    ];

    lines.splice(closeDivIdx + 1, 0, ...gradientBlock);
    changes++;
    console.log("Added BG Gradient block after BG Color");
    break;
  }
}

writeFileSync(f, lines.join("\n"), "utf8");
console.log("Done! " + changes + " changes applied");
