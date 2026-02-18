import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");
let changes = 0;

// 1. Update refreshLayers to include locked status
const oldRefresh = `name: o.text ? (o.text.substring(0, 20) + (o.text.length > 20 ? '...' : '')) : (o.type === 'image' ? 'Image' : o.type || 'Shape'),`;
const newRefresh = `name: o.text ? (o.text.substring(0, 20) + (o.text.length > 20 ? '...' : '')) : (o.type === 'image' ? 'Image' : o.type || 'Shape'),
      locked: !!o.lockMovementX,`;

if (code.includes(oldRefresh) && !code.includes("locked: !!o.lockMovementX")) {
  code = code.replace(oldRefresh, newRefresh);
  changes++;
  console.log("1. Added locked to refreshLayers");
}

// 2. Update layersList type to include locked
const oldType = `{id:string;type:string;name:string;visible:boolean}[]`;
const newType = `{id:string;type:string;name:string;visible:boolean;locked:boolean}[]`;

if (code.includes(oldType)) {
  code = code.replace(oldType, newType);
  changes++;
  console.log("2. Updated layersList type");
}

// 3. Add lock button after visibility button in layer list
const oldVisBtn = `{layer.visible ? '👁' : '🚫'}
                    </button>
                  </div>`;

const newVisBtn = `{layer.visible ? '👁' : '🚫'}
                    </button>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      const c = fcRef.current; if (!c) return;
                      const objs = c.getObjects().filter((o:any) => o.selectable !== false && !o._isBgRect && !o._isSafeZone && !o._isGuideLine);
                      const realIdx = objs.length - 1 - idx;
                      if (objs[realIdx]) {
                        const obj = objs[realIdx] as any;
                        const isLocked = !!obj.lockMovementX;
                        obj.set({
                          lockMovementX: !isLocked,
                          lockMovementY: !isLocked,
                          lockScalingX: !isLocked,
                          lockScalingY: !isLocked,
                          lockRotation: !isLocked,
                          hasControls: isLocked,
                        });
                        c.renderAll();
                        refreshLayers();
                      }
                    }} className="text-[10px] text-gray-400 hover:text-gray-700" title="Toggle lock">
                      {layer.locked ? '🔒' : '🔓'}
                    </button>
                  </div>`;

if (code.includes(oldVisBtn)) {
  code = code.replace(oldVisBtn, newVisBtn);
  changes++;
  console.log("3. Added lock button to layer list");
}

writeFileSync(f, code, "utf8");
console.log("Done! " + changes + " changes applied");
