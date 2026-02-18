const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let code=fs.readFileSync(file,"utf8");
const lines=code.split("\n");
console.log("Start:",lines.length);

// Find the line with <div className="flex-1" /> after draw controls (around 1632)
let insertIdx=-1;
for(let i=1625;i<1640;i++){
  if(lines[i].includes('className="flex-1"')){
    insertIdx=i;
    console.log("Found flex-1 spacer at line "+(i+1));
    break;
  }
}
if(insertIdx===-1){console.log("ERROR: flex-1 spacer not found");process.exit(1);}

// Also need state for showColorPanel - find existing state declarations
// We'll use a simple toggle approach
// Add state: const [showColorPanel, setShowColorPanel] = useState(false);
// Find a good place near other useState declarations
let stateIdx=-1;
for(let i=700;i<850;i++){
  if(lines[i]&&lines[i].includes("useState")&&lines[i].includes("drawMode")){
    stateIdx=i+1;
    console.log("State insert after line "+(i+1)+": "+lines[i].substring(0,80));
    break;
  }
}
if(stateIdx===-1){
  // fallback: find brushSize state
  for(let i=700;i<850;i++){
    if(lines[i]&&lines[i].includes("useState")&&lines[i].includes("brushSize")){
      stateIdx=i+1;
      console.log("State insert after brushSize at line "+(i+1));
      break;
    }
  }
}

// Insert state
if(stateIdx>-1){
  lines.splice(stateIdx,0,
    '  const [showColorPanel, setShowColorPanel] = useState(false);',
    '  const [bgColor, setBgColor] = useState("#FFFFFF");'
  );
  console.log("FIX A: Color panel states added at line "+(stateIdx+1));
  insertIdx+=2; // shift for inserted lines
}

// Color palette - professional packaging colors
const colorPalette = `
        <div className="w-6 h-px bg-white/10 my-1" />
        <button onClick={()=>setShowColorPanel(p=>!p)} title="Colors" className={\`w-9 h-9 flex items-center justify-center rounded-lg text-[15px] transition-all \${showColorPanel ? 'text-yellow-400 bg-yellow-500/20' : 'text-gray-400 hover:text-white hover:bg-white/10'}\`}>🎨</button>
        {showColorPanel && (
          <div className="absolute left-[52px] bottom-16 w-[200px] bg-[#252538] border border-white/10 rounded-xl shadow-2xl z-50 p-3 space-y-3">
            {/* Background Color */}
            <div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Background</div>
              <div className="grid grid-cols-7 gap-1">
                {['#FFFFFF','#F8F9FA','#F1F3F5','#E9ECEF','#DEE2E6','#CED4DA','#ADB5BD',
                  '#FFF5F5','#FFE3E3','#FFC9C9','#FFA8A8','#FF8787','#FF6B6B','#FA5252',
                  '#FFF0F6','#FFDEEB','#FCC2D7','#FAA2C1','#F783AC','#E64980','#C2255C',
                  '#F8F0FC','#F3D9FA','#EEBEFA','#DA77F2','#CC5DE8','#BE4BDB','#9C36B5',
                  '#EDF2FF','#DBE4FF','#BAC8FF','#91A7FF','#748FFC','#5C7CFA','#4C6EF5',
                  '#E7F5FF','#D0EBFF','#A5D8FF','#74C0FC','#4DABF7','#339AF0','#228BE6',
                  '#E3FAFC','#C5F6FA','#99E9F2','#66D9E8','#3BC9DB','#22B8CF','#15AABF',
                  '#EBFBEE','#D3F9D8','#B2F2BB','#8CE99A','#69DB7C','#51CF66','#40C057',
                  '#FFF9DB','#FFF3BF','#FFEC99','#FFE066','#FFD43B','#FCC419','#FAB005',
                  '#FFF4E6','#FFE8CC','#FFD8A8','#FFC078','#FFA94D','#FF922B','#FD7E14',
                  '#212529','#343A40','#495057','#868E96','#000000','#1A1A2E','#16213E'
                ].map(c=>(
                  <button key={'bg-'+c} onClick={()=>{setBgColor(c);const cv=fcRef.current;if(cv){cv.backgroundColor=c;cv.renderAll();}}}
                    className={\`w-5 h-5 rounded-sm border transition-all hover:scale-125 \${bgColor===c?'border-blue-400 ring-1 ring-blue-400 scale-110':'border-white/20'}\`}
                    style={{background:c}} title={c} />
                ))}
              </div>
            </div>
            {/* Object Fill Color */}
            <div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Object / Text</div>
              <div className="grid grid-cols-7 gap-1">
                {['#000000','#212529','#343A40','#495057','#868E96','#ADB5BD','#FFFFFF',
                  '#FF6B6B','#F06595','#CC5DE8','#845EF7','#5C7CFA','#339AF0','#22B8CF',
                  '#20C997','#51CF66','#94D82D','#FCC419','#FF922B','#FD7E14','#FA5252',
                  '#E64980','#BE4BDB','#7950F2','#4C6EF5','#228BE6','#15AABF','#12B886',
                  '#40C057','#82C91E','#FAB005','#F76707','#C92A2A','#A61E4D','#862E9C',
                  '#5F3DC4','#364FC7','#1864AB','#0B7285','#087F5B','#2B8A3E','#5C940D',
                  '#E67700','#D9480F','transparent'
                ].map(c=>(
                  <button key={'obj-'+c} onClick={()=>{setColor(c);const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj){if(c==='transparent'){obj.set('fill','');obj.set('stroke','#000');obj.set('strokeWidth',2);}else{obj.set('fill',c);}cv?.renderAll();}}}
                    className={\`w-5 h-5 rounded-sm border transition-all hover:scale-125 \${color===c?'border-blue-400 ring-1 ring-blue-400 scale-110':'border-white/20'}\`}
                    style={{background:c==='transparent'?'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 8px 8px':c}} title={c==='transparent'?'No fill':c} />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input type="color" value={color===' transparent'?'#000000':color} onChange={e=>{setColor(e.target.value);const cv=fcRef.current;const obj=cv?.getActiveObject();if(obj){obj.set('fill',e.target.value);cv?.renderAll();}}} className="w-6 h-6 cursor-pointer rounded border border-white/20" title="Custom color"/>
                <span className="text-[9px] text-gray-500">Custom</span>
              </div>
            </div>
          </div>
        )}`;

// Insert before the flex-1 spacer
lines.splice(insertIdx,0,...colorPalette.split("\n").filter(l=>l!==""));
console.log("FIX B: Color palette inserted before line "+(insertIdx+1));

code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const fl=code.split("\n");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",fl.length,"| { :",ob,"| } :",cb,"| diff:",ob-cb);
