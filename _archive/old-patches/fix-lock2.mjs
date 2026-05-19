import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let lines = readFileSync(f, "utf8").split("\n");
let changes = 0;

// 1. Update refreshLayers to include locked status
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("'Image' : o.type || 'Shape')") && !lines[i+1]?.includes("locked:")) {
    // Find the closing of this object in the next few lines
    for (let j = i; j < Math.min(i + 3, lines.length); j++) {
      if (lines[j].includes("'Image' : o.type || 'Shape'),")) {
        lines.splice(j + 1, 0, "      locked: !!o.lockMovementX,");
        changes++;
        console.log("1. Added locked to refreshLayers at line " + (j+1));
        break;
      }
    }
    break;
  }
}

// 2. Update layersList type to include locked
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("{id:string;type:string;name:string;visible:boolean}[]")) {
    lines[i] = lines[i].replace(
      "{id:string;type:string;name:string;visible:boolean}[]",
      "{id:string;type:string;name:string;visible:boolean;locked:boolean}[]"
    );
    changes++;
    console.log("2. Updated layersList type at line " + i);
    break;
  }
}

// 3. Add lock button after visibility button </button> </div>
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("{layer.visible ? '👁' : '🚫'}")) {
    // Find the </button> after this line
    for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
      if (lines[j].trim() === "</button>") {
        const lockBtn = [
          '                    <button onClick={(e) => {',
          '                      e.stopPropagation();',
          '                      const c = fcRef.current; if (!c) return;',
          '                      const objs = c.getObjects().filter((o:any) => o.selectable !== false && !o._isBgRect && !o._isSafeZone && !o._isGuideLine);',
          '                      const realIdx = objs.length - 1 - idx;',
          '                      if (objs[realIdx]) {',
          '                        const obj = objs[realIdx] as any;',
          '                        const isLocked = !!obj.lockMovementX;',
          '                        obj.set({',
          '                          lockMovementX: !isLocked,',
          '                          lockMovementY: !isLocked,',
          '                          lockScalingX: !isLocked,',
          '                          lockScalingY: !isLocked,',
          '                          lockRotation: !isLocked,',
          '                          hasControls: isLocked,',
          '                        });',
          '                        c.renderAll();',
          '                        refreshLayers();',
          '                      }',
          '                    }} className="text-[10px] text-gray-400 hover:text-gray-700" title="Toggle lock">',
          "                      {layer.locked ? '🔒' : '🔓'}",
          '                    </button>',
        ];
        lines.splice(j + 1, 0, ...lockBtn);
        changes++;
        console.log("3. Added lock button at line " + (j+1));
        break;
      }
    }
    break;
  }
}

writeFileSync(f, lines.join("\n"), "utf8");
console.log("Done! " + changes + " changes applied");
