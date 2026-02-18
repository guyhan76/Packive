const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

// Replace lines 1767-1776 with corrected structure
lines.splice(1766, 10,
  "              </div>",
  "              <div className=\"mt-2 flex items-center gap-2\">",
  "                <input type=\"color\" value={color===' transparent'?'#000000':color} onChange={e=>{setColor(e.target.value);const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj){obj.set('fill',e.target.value);cv?.renderAll();}}} className=\"w-6 h-6 cursor-pointer rounded border border-white/20\" title=\"Custom color\"/>",
  "                <span className=\"text-[9px] text-gray-500\">Custom</span>",
  "              </div>",
  "            </div>",
  "            <div className=\"w-full h-px bg-white/10 my-2\" />",
  "            <div className=\"text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5\">Pick Color</div>",
  "            <button onClick={()=>{if(typeof EyeDropper!=='undefined'){new (EyeDropper as any)().open().then((r:any)=>{setPickedColor(r.sRGBHex);setColor(r.sRGBHex);}).catch(()=>{});}}} className=\"w-full px-2 py-1.5 text-[10px] bg-white/10 hover:bg-white/20 text-gray-300 rounded transition-all text-center\">💉 Pick from Screen</button>",
  "            {pickedColor && <div className=\"mt-1.5 flex items-center gap-2\"><div className=\"w-6 h-6 rounded border border-white/20\" style={{background:pickedColor}}/><span className=\"text-[10px] text-white font-mono\">{pickedColor}</span></div>}",
  "          </div>",
  "        )}"
);
console.log("Fixed palette structure");

const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
