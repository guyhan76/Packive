const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

// Step 1: Add new states after showColorPanel (if not already)
let hasShapePanel=lines.join("\n").includes("showShapePanel");
if(!hasShapePanel){
  for(let i=0;i<lines.length;i++){
    if(lines[i].includes("showColorPanel")&&lines[i].includes("useState")){
      lines.splice(i+1,0,
        '  const [showShapePanel, setShowShapePanel] = useState(false);',
        '  const [showTextPanel, setShowTextPanel] = useState(false);'
      );
      console.log("Step 1: States added after line "+(i+1));
      break;
    }
  }
} else { console.log("Step 1: States already exist"); }

// Step 2: Find and replace the toolbar button array
let toolStart=-1, toolEnd=-1;
for(let i=1590;i<1650;i++){
  if(lines[i]&&lines[i].includes("icon: '\\u2196'")||lines[i]&&lines[i].includes("icon: '\u2196'")||lines[i]&&lines[i].includes("Select (V)")){
    // go back to find the opening {[
    for(let k=i;k>i-5;k--){
      if(lines[k]&&(lines[k].includes("{[")||lines[k].trim().startsWith("{["))){
        toolStart=k;break;
      }
    }
    if(toolStart===-1) toolStart=i-1;
    console.log("Tool start at line "+(toolStart+1));
    break;
  }
}
if(toolStart>-1){
  for(let i=toolStart;i<toolStart+20;i++){
    if(lines[i]&&lines[i].includes(".map((t, i)")){
      for(let j=i;j<i+5;j++){
        if(lines[j]&&lines[j].trim().startsWith(")}")){toolEnd=j;break;}
      }
      break;
    }
  }
  if(toolEnd===-1){
    for(let i=toolStart;i<toolStart+20;i++){
      if(lines[i]&&lines[i].includes("</button>")&&lines[i].includes(")}")){toolEnd=i;break;}
    }
  }
  console.log("Tool end at line "+(toolEnd+1));
}

if(toolStart===-1||toolEnd===-1){console.log("ERROR: toolbar not found");process.exit(1);}

const newToolbar = [
'        {/* Select */}',
'        <button onClick={() => { const c=fcRef.current; if(c){c.isDrawingMode=false;setDrawMode(false);} setShowShapePanel(false);setShowTextPanel(false); }} title="Select (V)"',
'          className="w-9 h-9 flex items-center justify-center rounded-lg text-[15px] text-gray-400 hover:text-white hover:bg-white/10 transition-all">\u2196</button>',
'',
'        {/* Text with font size/weight popup */}',
'        <div className="relative">',
'          <button onClick={()=>{addText();setShowTextPanel(p=>!p);setShowShapePanel(false);}} title="Text (T)"',
'            className={`w-9 h-9 flex items-center justify-center rounded-lg text-[15px] transition-all ${showTextPanel?"text-blue-400 bg-blue-500/20":"text-gray-400 hover:text-white hover:bg-white/10"}`}>T</button>',
'          {showTextPanel && (',
'            <div className="absolute left-[48px] top-0 w-[200px] bg-[#252538] border border-white/10 rounded-xl shadow-2xl z-50 p-3 space-y-2.5">',
'              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Font Size</div>',
'              <div className="flex items-center gap-2">',
'                <input type="range" min="8" max="120" value={fSize} onChange={e=>{const s=Number(e.target.value);setFSize(s);const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj&&obj.type==="i-text"){(obj as any).set("fontSize",s);cv?.renderAll();}}} className="flex-1" />',
'                <input type="number" min="8" max="200" value={fSize} onChange={e=>{const s=Number(e.target.value);if(s>=8&&s<=200){setFSize(s);const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj&&obj.type==="i-text"){(obj as any).set("fontSize",s);cv?.renderAll();}}}} className="w-12 text-[11px] text-center bg-white/5 border border-white/10 rounded px-1 py-0.5 text-gray-300 outline-none" />',
'              </div>',
'              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Quick Sizes</div>',
'              <div className="grid grid-cols-5 gap-1">',
'                {[8,10,12,14,16,18,20,24,28,32,36,48,56,64,72,96].map(s=>(',
'                  <button key={s} onClick={()=>{setFSize(s);const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj&&obj.type==="i-text"){(obj as any).set("fontSize",s);cv?.renderAll();}}}',
'                    className={`py-1 text-[10px] rounded transition-all ${fSize===s?"bg-blue-500/30 text-blue-300":"text-gray-400 hover:bg-white/10 hover:text-white"}`}>{s}</button>',
'                ))}',
'              </div>',
'              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">Font Weight</div>',
'              <div className="grid grid-cols-4 gap-1">',
'                {([["Thin","100"],["Light","300"],["Normal","400"],["Medium","500"],["SemiBold","600"],["Bold","700"],["ExBold","800"],["Black","900"]] as [string,string][]).map(([label,w])=>(',
'                  <button key={w} onClick={()=>{const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj&&obj.type==="i-text"){(obj as any).set("fontWeight",w);cv?.renderAll();}}}',
'                    className="py-1 text-[9px] rounded text-gray-400 hover:bg-white/10 hover:text-white transition-all" style={{fontWeight:Number(w)}}>{label}</button>',
'                ))}',
'              </div>',
'              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">Style</div>',
'              <div className="flex gap-1">',
'                <button onClick={()=>{const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj&&obj.type==="i-text"){const cur=(obj as any).fontStyle;(obj as any).set("fontStyle",cur==="italic"?"normal":"italic");cv?.renderAll();}}} className="flex-1 py-1.5 text-[11px] rounded text-gray-400 hover:bg-white/10 hover:text-white transition-all italic">I</button>',
'                <button onClick={()=>{const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj&&obj.type==="i-text"){const cur=(obj as any).underline;(obj as any).set("underline",!cur);cv?.renderAll();}}} className="flex-1 py-1.5 text-[11px] rounded text-gray-400 hover:bg-white/10 hover:text-white transition-all underline">U</button>',
'                <button onClick={()=>{const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj&&obj.type==="i-text"){const cur=(obj as any).linethrough;(obj as any).set("linethrough",!cur);cv?.renderAll();}}} className="flex-1 py-1.5 text-[11px] rounded text-gray-400 hover:bg-white/10 hover:text-white transition-all line-through">S</button>',
'              </div>',
'              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">Font Family</div>',
'              <select value={selectedFont} onChange={e=>{setSelectedFont(e.target.value);const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj&&obj.type==="i-text"){(obj as any).set("fontFamily",e.target.value);cv?.renderAll();}}}',
'                className="w-full text-[10px] bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-gray-300 outline-none">',
'                {["Arial, sans-serif","Helvetica, sans-serif","Georgia, serif","Times New Roman, serif","Courier New, monospace","Verdana, sans-serif","Impact, sans-serif","Trebuchet MS, sans-serif","Palatino, serif","Garamond, serif"].map(f=>(',
'                  <option key={f} value={f} style={{fontFamily:f}}>{f.split(",")[0]}</option>',
'                ))}',
'              </select>',
'            </div>',
'          )}',
'        </div>',
'',
'        {/* Shapes popup */}',
'        <div className="relative">',
'          <button onClick={()=>{setShowShapePanel(p=>!p);setShowTextPanel(false);}} title="Shapes"',
'            className={`w-9 h-9 flex items-center justify-center rounded-lg text-[15px] transition-all ${showShapePanel?"text-purple-400 bg-purple-500/20":"text-gray-400 hover:text-white hover:bg-white/10"}`}>\u2B1C</button>',
'          {showShapePanel && (',
'            <div className="absolute left-[48px] top-0 w-[230px] bg-[#252538] border border-white/10 rounded-xl shadow-2xl z-50 p-3 space-y-2.5 max-h-[70vh] overflow-y-auto">',
'              <div>',
'                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Rectangles</div>',
'                <div className="grid grid-cols-4 gap-1.5">',
'                  {[{id:"rect",icon:"\u25A1",tip:"Rectangle"},{id:"roundrect",icon:"\u25A2",tip:"Rounded"},{id:"diamond",icon:"\u25C7",tip:"Diamond"}].map(s=>(',
'                    <button key={s.id} onClick={()=>{addShape(s.id);setShowShapePanel(false);}} title={s.tip}',
'                      className="w-12 h-12 flex flex-col items-center justify-center rounded-lg text-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all">',
'                      <span>{s.icon}</span><span className="text-[7px] text-gray-500 mt-0.5">{s.tip}</span></button>',
'                  ))}',
'                </div>',
'              </div>',
'              <div>',
'                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Circles & Ovals</div>',
'                <div className="grid grid-cols-4 gap-1.5">',
'                  {[{id:"circle",icon:"\u25CB",tip:"Circle"},{id:"ellipse",icon:"\u2B2D",tip:"Ellipse"}].map(s=>(',
'                    <button key={s.id} onClick={()=>{addShape(s.id);setShowShapePanel(false);}} title={s.tip}',
'                      className="w-12 h-12 flex flex-col items-center justify-center rounded-lg text-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all">',
'                      <span>{s.icon}</span><span className="text-[7px] text-gray-500 mt-0.5">{s.tip}</span></button>',
'                  ))}',
'                </div>',
'              </div>',
'              <div>',
'                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Polygons</div>',
'                <div className="grid grid-cols-4 gap-1.5">',
'                  {[{id:"triangle",icon:"\u25B3",tip:"Triangle"},{id:"pentagon",icon:"\u2B20",tip:"Pentagon"},{id:"hexagon",icon:"\u2B21",tip:"Hexagon"},{id:"cross",icon:"\u271A",tip:"Cross"}].map(s=>(',
'                    <button key={s.id} onClick={()=>{addShape(s.id);setShowShapePanel(false);}} title={s.tip}',
'                      className="w-12 h-12 flex flex-col items-center justify-center rounded-lg text-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all">',
'                      <span>{s.icon}</span><span className="text-[7px] text-gray-500 mt-0.5">{s.tip}</span></button>',
'                  ))}',
'                </div>',
'              </div>',
'              <div>',
'                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Stars & Badges</div>',
'                <div className="grid grid-cols-4 gap-1.5">',
'                  {[{id:"star",icon:"\u2606",tip:"5-Star"},{id:"star6",icon:"\u2721",tip:"6-Star"},{id:"burst",icon:"\uD83D\uDCA5",tip:"Burst"},{id:"badge",icon:"\uD83C\uDFF7",tip:"Badge"}].map(s=>(',
'                    <button key={s.id} onClick={()=>{addShape(s.id);setShowShapePanel(false);}} title={s.tip}',
'                      className="w-12 h-12 flex flex-col items-center justify-center rounded-lg text-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all">',
'                      <span>{s.icon}</span><span className="text-[7px] text-gray-500 mt-0.5">{s.tip}</span></button>',
'                  ))}',
'                </div>',
'              </div>',
'              <div>',
'                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Lines & Arrows</div>',
'                <div className="grid grid-cols-4 gap-1.5">',
'                  {[{id:"line",icon:"\u2500",tip:"Line"},{id:"dashed",icon:"\u2504",tip:"Dashed"},{id:"dotted",icon:"\u2508",tip:"Dotted"},{id:"arrow",icon:"\u2192",tip:"Arrow"}].map(s=>(',
'                    <button key={s.id} onClick={()=>{addShape(s.id);setShowShapePanel(false);}} title={s.tip}',
'                      className="w-12 h-12 flex flex-col items-center justify-center rounded-lg text-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all">',
'                      <span>{s.icon}</span><span className="text-[7px] text-gray-500 mt-0.5">{s.tip}</span></button>',
'                  ))}',
'                </div>',
'              </div>',
'            </div>',
'          )}',
'        </div>'
];

lines.splice(toolStart, toolEnd-toolStart+1, ...newToolbar);
console.log("Step 2: Toolbar replaced (lines "+(toolStart+1)+"-"+(toolEnd+1)+")");

// Step 3: Add new shape types to addShape if not present
const codeCheck=lines.join("\n");
if(!codeCheck.includes("star6")){
  for(let i=0;i<lines.length;i++){
    if(lines[i]&&lines[i].includes("type==='arrow'")){
      lines.splice(i+1,0,
        "    else if (type==='star6') { const pts:{x:number;y:number}[]=[]; for(let ii=0;ii<12;ii++){const r=ii%2===0?30:15; const a=(Math.PI/2*3)+(ii*Math.PI/6); pts.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});} s=new Polygon(pts,{fill:color}); }",
        "    else if (type==='burst') { const pts:{x:number;y:number}[]=[]; for(let ii=0;ii<16;ii++){const r=ii%2===0?35:18; const a=ii*Math.PI/8; pts.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});} s=new Polygon(pts,{fill:color}); }",
        "    else if (type==='badge') { const pts:{x:number;y:number}[]=[]; for(let ii=0;ii<20;ii++){const r=ii%2===0?30:25; const a=ii*Math.PI/10; pts.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});} s=new Polygon(pts,{fill:color}); }"
      );
      console.log("Step 3: New shapes added after line "+(i+1));
      break;
    }
  }
} else { console.log("Step 3: Shapes already exist"); }

const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const fl=code.split("\n");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",fl.length,"| { :",ob,"| } :",cb,"| diff:",ob-cb);
