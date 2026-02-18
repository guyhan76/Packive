const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

// === STEP 1: Add states after existing useState declarations ===
for(let i=1010;i<1030;i++){
  if(lines[i] && lines[i].includes("brushSize")){
    lines.splice(i+1, 0,
      "  const [measureMode, setMeasureMode] = useState(false);",
      "  const [measureStart, setMeasureStart] = useState<{x:number,y:number}|null>(null);",
      "  const [measureEnd, setMeasureEnd] = useState<{x:number,y:number}|null>(null);",
      "  const [eyedropperActive, setEyedropperActive] = useState(false);",
      "  const [pickedColor, setPickedColor] = useState('#000000');",
      "  const [showRuler, setShowRuler] = useState(true);",
      "  const rulerCanvasTopRef = useRef<HTMLCanvasElement>(null);",
      "  const rulerCanvasLeftRef = useRef<HTMLCanvasElement>(null);"
    );
    console.log("STEP 1: States added after line", i+1);
    break;
  }
}

// === STEP 2: Add ruler drawing effect after canvas init ===
// Find the return statement
for(let i=0;i<lines.length;i++){
  if(lines[i] && lines[i].trim()==="return (" || (lines[i] && lines[i].includes("return (") && lines[i].includes("<div ref={wrapperRef"))){
    // Insert ruler effect before return
    const rulerEffect = [
      "",
      "  // Ruler drawing effect",
      "  useEffect(() => {",
      "    if (!showRuler) return;",
      "    const drawRuler = () => {",
      "      const cEl = canvasElRef.current;",
      "      if (!cEl) return;",
      "      const cw = cEl.width; const ch = cEl.height;",
      "      const pxPerMmW = cw / widthMM; const pxPerMmH = ch / heightMM;",
      "      // Top ruler",
      "      const tC = rulerCanvasTopRef.current;",
      "      if (tC) {",
      "        tC.width = cw; tC.height = 24;",
      "        const ctx = tC.getContext('2d')!;",
      "        ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0,0,cw,24);",
      "        ctx.strokeStyle = '#666'; ctx.fillStyle = '#999'; ctx.font = '9px Arial';",
      "        ctx.textAlign = 'center';",
      "        for (let mm=0; mm<=widthMM; mm++) {",
      "          const x = mm * pxPerMmW;",
      "          const isCm = mm % 10 === 0; const is5 = mm % 5 === 0;",
      "          ctx.beginPath(); ctx.moveTo(x, 24);",
      "          ctx.lineTo(x, isCm ? 6 : is5 ? 12 : 17);",
      "          ctx.stroke();",
      "          if (isCm && mm > 0) ctx.fillText((mm/10)+'', x, 10);",
      "        }",
      "      }",
      "      // Left ruler",
      "      const lC = rulerCanvasLeftRef.current;",
      "      if (lC) {",
      "        lC.width = 24; lC.height = ch;",
      "        const ctx = lC.getContext('2d')!;",
      "        ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0,0,24,ch);",
      "        ctx.strokeStyle = '#666'; ctx.fillStyle = '#999'; ctx.font = '9px Arial';",
      "        ctx.textAlign = 'right';",
      "        for (let mm=0; mm<=heightMM; mm++) {",
      "          const y = mm * pxPerMmH;",
      "          const isCm = mm % 10 === 0; const is5 = mm % 5 === 0;",
      "          ctx.beginPath(); ctx.moveTo(24, y);",
      "          ctx.lineTo(isCm ? 6 : is5 ? 12 : 17, y);",
      "          ctx.stroke();",
      "          if (isCm && mm > 0) { ctx.save(); ctx.translate(10, y+2); ctx.fillText((mm/10)+'', 0, 0); ctx.restore(); }",
      "        }",
      "      }",
      "    };",
      "    drawRuler();",
      "  }, [showRuler, widthMM, heightMM]);",
      ""
    ];
    lines.splice(i, 0, ...rulerEffect);
    console.log("STEP 2: Ruler effect added before return at line", i+1);
    break;
  }
}

// === STEP 3: Replace canvas area with rulers ===
// Find the canvas wrapper line
for(let i=0;i<lines.length;i++){
  if(lines[i] && lines[i].includes('{/* ── Canvas ── */}')){
    const oldEnd = i+6; // lines 1767-1773
    const newCanvas = [
      "        {/* ── Canvas with Rulers ── */}",
      "        <div className=\"flex-1 overflow-auto bg-[#2a2a3d] relative flex items-center justify-center p-8\">",
      "          <div className=\"relative\">",
      "            {/* Corner square */}",
      "            {showRuler && <div className=\"absolute -top-[24px] -left-[24px] w-[24px] h-[24px] bg-[#1a1a2e] border-r border-b border-[#444] z-10 flex items-center justify-center text-[8px] text-gray-500\">cm</div>}",
      "            {/* Top ruler */}",
      "            {showRuler && <canvas ref={rulerCanvasTopRef} className=\"absolute -top-[24px] left-0 h-[24px] border-b border-[#444]\" />}",
      "            {/* Left ruler */}",
      "            {showRuler && <canvas ref={rulerCanvasLeftRef} className=\"absolute top-0 -left-[24px] w-[24px] border-r border-[#444]\" />}",
      "            {/* Canvas */}",
      "            <div className=\"rounded-sm shadow-2xl ring-1 ring-black/20\">",
      "              <canvas ref={canvasElRef} style={{boxShadow:'0 2px 16px rgba(0,0,0,0.25)', border:'1px solid #e0e0e0'}} />",
      "              {showGrid && <div className=\"absolute inset-0 pointer-events-none opacity-60\" style={{backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(200,200,220,0.4) 19px,rgba(200,200,220,0.4) 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(200,200,220,0.4) 19px,rgba(200,200,220,0.4) 20px)',backgroundSize:'20px 20px'}} />}",
      "            </div>",
      "          </div>",
      "          {showMinimap && <div className=\"absolute bottom-4 right-[290px] border border-white/10 rounded-lg overflow-hidden bg-black/40 shadow-xl backdrop-blur-sm\"><canvas ref={minimapRef} width={160} height={100} /></div>}",
      "        </div>"
    ];
    lines.splice(i, oldEnd - i + 1, ...newCanvas);
    console.log("STEP 3: Canvas area replaced with rulers at line", i+1);
    break;
  }
}

// === STEP 4: Add Measure + Eyedropper buttons to left panel ===
// Find the Image button
for(let i=0;i<lines.length;i++){
  if(lines[i] && lines[i].includes("onClick={addImage}") && lines[i].includes("Image")){
    const newTools = [
      "        <button onClick={()=>{setShowRuler(r=>!r)}} title=\"Ruler\" className={`w-9 h-9 flex items-center justify-center rounded-lg text-[15px] transition-all ${showRuler ? 'text-yellow-400 bg-yellow-500/20' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>📏</button>",
      "        <button onClick={()=>{if(typeof EyeDropper!=='undefined'){const ed=new (EyeDropper as any)();ed.open().then((r:any)=>{setPickedColor(r.sRGBHex);setColor(r.sRGBHex);}).catch(()=>{});}else{alert('EyeDropper not supported');}}} title=\"Pick Color\" className={`w-9 h-9 flex items-center justify-center rounded-lg text-[15px] transition-all text-gray-400 hover:text-white hover:bg-white/10`}>💉</button>",
      "        {pickedColor && <div className=\"w-7 h-4 rounded border border-white/20 mx-auto\" style={{background:pickedColor}} title={pickedColor} />}"
    ];
    lines.splice(i+1, 0, ...newTools);
    console.log("STEP 4: Ruler/Eyedropper buttons added after line", i+1);
    break;
  }
}

// Check for duplicate state declarations and remove
const stateNames = ['measureMode','measureStart','measureEnd','eyedropperActive','pickedColor','showRuler'];
let seen = {};
for(let i=0;i<lines.length;i++){
  for(const s of stateNames){
    if(lines[i] && lines[i].includes(`const [${s},`) && lines[i].includes('useState')){
      if(seen[s]){
        lines.splice(i,1); i--; 
        console.log("Removed duplicate state:", s, "at line", i+2);
      } else {
        seen[s] = true;
      }
    }
  }
}

const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
