const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

// === FIX 1: Replace addShape with expanded version ===
let shapeStart=-1, shapeEnd=-1;
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("const addShape = useCallback")){
    shapeStart=i;
    for(let j=i;j<i+30;j++){
      if(lines[j]&&lines[j].includes("}, [color, refreshLayers]")){
        shapeEnd=j;
        break;
      }
    }
    break;
  }
}
if(shapeStart===-1||shapeEnd===-1){console.log("ERROR: addShape not found");process.exit(1);}
console.log("addShape: lines "+(shapeStart+1)+"-"+(shapeEnd+1));

const newAddShape = [
'  const addShape = useCallback((type: string) => {',
'    const c = fcRef.current; if (!c) return;',
'    const { Rect, Circle, Triangle, Line:FL, Polygon, Ellipse, Path } = require("fabric");',
'    const cx=c.getWidth()/2, cy=c.getHeight()/2; let s:any;',
'    // Rectangles',
'    if (type==="rect") s=new Rect({left:cx-40,top:cy-30,width:80,height:60,fill:color});',
'    else if (type==="roundrect") s=new Rect({left:cx-40,top:cy-30,width:80,height:60,fill:color,rx:12,ry:12});',
'    else if (type==="diamond") { const r=30; s=new Polygon([{x:cx,y:cy-r},{x:cx+r,y:cy},{x:cx,y:cy+r},{x:cx-r,y:cy}],{fill:color}); }',
'    // Circles',
'    else if (type==="circle") s=new Circle({left:cx-30,top:cy-30,radius:30,fill:color});',
'    else if (type==="ellipse") s=new Ellipse({left:cx-30,top:cy-20,rx:40,ry:25,fill:color});',
'    else if (type==="semicircle") s=new Path("M 0 30 A 30 30 0 0 1 60 30 L 0 30 Z",{left:cx-30,top:cy-15,fill:color});',
'    else if (type==="arc") s=new Path("M 0 30 A 30 30 0 0 1 60 30",{left:cx-30,top:cy-15,fill:"",stroke:color,strokeWidth:3});',
'    // Triangles',
'    else if (type==="triangle") s=new Triangle({left:cx-30,top:cy-30,width:60,height:60,fill:color});',
'    else if (type==="righttri") s=new Polygon([{x:cx-30,y:cy+30},{x:cx-30,y:cy-30},{x:cx+30,y:cy+30}],{fill:color});',
'    else if (type==="trapezoid") s=new Polygon([{x:cx-20,y:cy-25},{x:cx+20,y:cy-25},{x:cx+35,y:cy+25},{x:cx-35,y:cy+25}],{fill:color});',
'    // Polygons',
'    else if (type==="pentagon") { const pts:{x:number;y:number}[]=[]; for(let i=0;i<5;i++){const a=(Math.PI/2*3)+(i*2*Math.PI/5); pts.push({x:cx+Math.cos(a)*30,y:cy+Math.sin(a)*30});} s=new Polygon(pts,{fill:color}); }',
'    else if (type==="hexagon") { const pts:{x:number;y:number}[]=[]; for(let i=0;i<6;i++){const a=i*Math.PI/3; pts.push({x:cx+Math.cos(a)*30,y:cy+Math.sin(a)*30});} s=new Polygon(pts,{fill:color}); }',
'    else if (type==="octagon") { const pts:{x:number;y:number}[]=[]; for(let i=0;i<8;i++){const a=i*Math.PI/4; pts.push({x:cx+Math.cos(a)*30,y:cy+Math.sin(a)*30});} s=new Polygon(pts,{fill:color}); }',
'    else if (type==="cross") { s=new Polygon([{x:cx-10,y:cy-30},{x:cx+10,y:cy-30},{x:cx+10,y:cy-10},{x:cx+30,y:cy-10},{x:cx+30,y:cy+10},{x:cx+10,y:cy+10},{x:cx+10,y:cy+30},{x:cx-10,y:cy+30},{x:cx-10,y:cy+10},{x:cx-30,y:cy+10},{x:cx-30,y:cy-10},{x:cx-10,y:cy-10}],{fill:color}); }',
'    // Stars & Badges',
'    else if (type==="star") { const pts:{x:number;y:number}[]=[]; for(let i=0;i<10;i++){const r=i%2===0?30:15; const a=(Math.PI/2*3)+(i*Math.PI/5); pts.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});} s=new Polygon(pts,{fill:color}); }',
'    else if (type==="star6") { const pts:{x:number;y:number}[]=[]; for(let i=0;i<12;i++){const r=i%2===0?30:15; const a=(Math.PI/2*3)+(i*Math.PI/6); pts.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});} s=new Polygon(pts,{fill:color}); }',
'    else if (type==="burst") { const pts:{x:number;y:number}[]=[]; for(let i=0;i<16;i++){const r=i%2===0?35:18; const a=i*Math.PI/8; pts.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});} s=new Polygon(pts,{fill:color}); }',
'    else if (type==="badge") { const pts:{x:number;y:number}[]=[]; for(let i=0;i<20;i++){const r=i%2===0?30:25; const a=i*Math.PI/10; pts.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});} s=new Polygon(pts,{fill:color}); }',
'    // Lines',
'    else if (type==="line") s=new FL([cx-40,cy,cx+40,cy],{stroke:color,strokeWidth:3,fill:""});',
'    else if (type==="dashed") s=new FL([cx-40,cy,cx+40,cy],{stroke:color,strokeWidth:3,strokeDashArray:[10,5],fill:""});',
'    else if (type==="dotted") s=new FL([cx-40,cy,cx+40,cy],{stroke:color,strokeWidth:3,strokeDashArray:[2,4],fill:""});',
'    // Arrows',
'    else if (type==="arrow") s=new Path("M 0 15 L 50 15 L 50 5 L 70 20 L 50 35 L 50 25 L 0 25 Z",{left:cx-35,top:cy-20,fill:color});',
'    else if (type==="arrowThin") s=new Path("M 0 18 L 55 18 L 55 8 L 75 22 L 55 36 L 55 26 L 0 26 Z",{left:cx-37,top:cy-22,fill:color,scaleX:0.8,scaleY:0.8});',
'    else if (type==="arrowDouble") s=new Path("M 20 5 L 0 20 L 20 35 L 20 25 L 50 25 L 50 35 L 70 20 L 50 5 L 50 15 L 20 15 Z",{left:cx-35,top:cy-20,fill:color});',
'    else if (type==="arrowCurved") s=new Path("M 5 35 Q 5 5 40 5 L 35 0 L 45 5 L 35 10 L 40 5 Q 10 5 10 35 Z",{left:cx-22,top:cy-17,fill:color,scaleX:1.5,scaleY:1.5});',
'    // Callouts / Speech Bubbles',
'    else if (type==="bubble") s=new Path("M 5 5 Q 5 0 10 0 L 60 0 Q 65 0 65 5 L 65 35 Q 65 40 60 40 L 25 40 L 15 50 L 18 40 L 10 40 Q 5 40 5 35 Z",{left:cx-32,top:cy-25,fill:color});',
'    else if (type==="bubbleRound") s=new Path("M 35 0 A 30 25 0 1 0 35 50 L 20 60 L 25 48 A 30 25 0 0 0 35 0 Z",{left:cx-30,top:cy-30,fill:color,scaleX:1,scaleY:0.9});',
'    else if (type==="bubbleCloud") s=new Path("M 30 45 Q 15 55 10 50 Q 0 50 5 40 Q 0 30 10 25 Q 5 15 15 10 Q 15 0 30 5 Q 40 0 45 10 Q 55 5 55 15 Q 65 20 60 30 Q 65 40 55 45 Q 50 55 40 50 Z",{left:cx-32,top:cy-27,fill:color});',
'    else if (type==="callout") s=new Path("M 0 0 L 70 0 L 70 40 L 30 40 L 15 55 L 20 40 L 0 40 Z",{left:cx-35,top:cy-27,fill:color});',
'    // Hearts & Misc',
'    else if (type==="heart") s=new Path("M 25 45 L 5 25 A 10 10 0 0 1 25 10 A 10 10 0 0 1 45 25 Z",{left:cx-22,top:cy-22,fill:color});',
'    else if (type==="ring") { s=new Circle({left:cx-30,top:cy-30,radius:30,fill:"",stroke:color,strokeWidth:8}); }',
'    if (s) { c.add(s); c.setActiveObject(s); c.renderAll(); refreshLayers(); }',
'  }, [color, refreshLayers]);'
];

lines.splice(shapeStart, shapeEnd-shapeStart+1, ...newAddShape);
console.log("FIX 1: addShape replaced ("+(shapeEnd-shapeStart+1)+" -> "+newAddShape.length+" lines)");

// === FIX 2: Remove setShowShapePanel(false) from shape buttons ===
let code=lines.join("\n");
code=code.replace(/addShape\(s\.id\);setShowShapePanel\(false\);/g, 'addShape(s.id);');
console.log("FIX 2: Removed setShowShapePanel(false) from shape buttons");

// === FIX 3: Update shape popup categories with new shapes ===
// Find and replace the shapes popup content
const oldRectBlock = '<div><div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Rectangles</div><div className="grid grid-cols-3 gap-1.5">{[{id:"rect",icon:"\\u25A1",tip:"Rect"},{id:"roundrect",icon:"\\u25A2",tip:"Rounded"},{id:"diamond",icon:"\\u25C7",tip:"Diamond"}]';
const oldCircleBlock = '<div><div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Circles</div><div className="grid grid-cols-3 gap-1.5">{[{id:"circle",icon:"\\u25CB",tip:"Circle"},{id:"ellipse",icon:"\\u2B2D",tip:"Ellipse"}]';

// Replace entire shape panel content - find start and end
lines=code.split("\n");
let panelStart=-1, panelEnd=-1;
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("Rectangles")&&lines[i].includes("grid grid-cols-3")&&lines[i].includes("addShape")){
    panelStart=i;
    console.log("Shape panel content starts at line "+(i+1));
    break;
  }
}
if(panelStart>-1){
  for(let i=panelStart;i<panelStart+10;i++){
    if(lines[i]&&lines[i].includes("Lines")&&lines[i].includes("addShape")){
      panelEnd=i;
      console.log("Shape panel content ends at line "+(i+1));
      break;
    }
  }
}

if(panelStart>-1&&panelEnd>-1){
  const newPanelContent = [
'              <div><div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Rectangles</div><div className="grid grid-cols-3 gap-1.5">{[{id:"rect",icon:"\u25A1",tip:"Rect"},{id:"roundrect",icon:"\u25A2",tip:"Rounded"},{id:"diamond",icon:"\u25C7",tip:"Diamond"}].map(s=>(<button key={s.id} onClick={()=>addShape(s.id)} title={s.tip} className="h-11 flex flex-col items-center justify-center rounded-lg text-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all"><span>{s.icon}</span><span className="text-[7px] text-gray-500 mt-0.5">{s.tip}</span></button>))}</div></div>',
'              <div><div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Circles & Arcs</div><div className="grid grid-cols-3 gap-1.5">{[{id:"circle",icon:"\u25CB",tip:"Circle"},{id:"ellipse",icon:"\u2B2D",tip:"Ellipse"},{id:"semicircle",icon:"\u25D3",tip:"Half"},{id:"arc",icon:"\u25E0",tip:"Arc"},{id:"ring",icon:"\u25CE",tip:"Ring"}].map(s=>(<button key={s.id} onClick={()=>addShape(s.id)} title={s.tip} className="h-11 flex flex-col items-center justify-center rounded-lg text-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all"><span>{s.icon}</span><span className="text-[7px] text-gray-500 mt-0.5">{s.tip}</span></button>))}</div></div>',
'              <div><div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Triangles</div><div className="grid grid-cols-3 gap-1.5">{[{id:"triangle",icon:"\u25B3",tip:"Triangle"},{id:"righttri",icon:"\u25F9",tip:"Right"},{id:"trapezoid",icon:"\u23E2",tip:"Trapezoid"}].map(s=>(<button key={s.id} onClick={()=>addShape(s.id)} title={s.tip} className="h-11 flex flex-col items-center justify-center rounded-lg text-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all"><span>{s.icon}</span><span className="text-[7px] text-gray-500 mt-0.5">{s.tip}</span></button>))}</div></div>',
'              <div><div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Polygons</div><div className="grid grid-cols-3 gap-1.5">{[{id:"pentagon",icon:"\u2B20",tip:"Pentagon"},{id:"hexagon",icon:"\u2B21",tip:"Hexagon"},{id:"octagon",icon:"\u2BC2",tip:"Octagon"},{id:"cross",icon:"\u271A",tip:"Cross"}].map(s=>(<button key={s.id} onClick={()=>addShape(s.id)} title={s.tip} className="h-11 flex flex-col items-center justify-center rounded-lg text-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all"><span>{s.icon}</span><span className="text-[7px] text-gray-500 mt-0.5">{s.tip}</span></button>))}</div></div>',
'              <div><div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Stars & Badges</div><div className="grid grid-cols-3 gap-1.5">{[{id:"star",icon:"\u2606",tip:"5-Star"},{id:"star6",icon:"\u2721",tip:"6-Star"},{id:"burst",icon:"\u2738",tip:"Burst"},{id:"badge",icon:"\u2605",tip:"Badge"},{id:"heart",icon:"\u2665",tip:"Heart"}].map(s=>(<button key={s.id} onClick={()=>addShape(s.id)} title={s.tip} className="h-11 flex flex-col items-center justify-center rounded-lg text-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all"><span>{s.icon}</span><span className="text-[7px] text-gray-500 mt-0.5">{s.tip}</span></button>))}</div></div>',
'              <div><div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Arrows</div><div className="grid grid-cols-3 gap-1.5">{[{id:"arrow",icon:"\u27A1",tip:"Arrow"},{id:"arrowThin",icon:"\u279C",tip:"Thin"},{id:"arrowDouble",icon:"\u2194",tip:"Double"},{id:"arrowCurved",icon:"\u21B7",tip:"Curved"}].map(s=>(<button key={s.id} onClick={()=>addShape(s.id)} title={s.tip} className="h-11 flex flex-col items-center justify-center rounded-lg text-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all"><span>{s.icon}</span><span className="text-[7px] text-gray-500 mt-0.5">{s.tip}</span></button>))}</div></div>',
'              <div><div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Speech Bubbles</div><div className="grid grid-cols-3 gap-1.5">{[{id:"bubble",icon:"\uD83D\uDCAC",tip:"Speech"},{id:"bubbleRound",icon:"\uD83D\uDDE8",tip:"Round"},{id:"bubbleCloud",icon:"\uD83D\uDCAD",tip:"Thought"},{id:"callout",icon:"\uD83D\uDCE2",tip:"Callout"}].map(s=>(<button key={s.id} onClick={()=>addShape(s.id)} title={s.tip} className="h-11 flex flex-col items-center justify-center rounded-lg text-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all"><span>{s.icon}</span><span className="text-[7px] text-gray-500 mt-0.5">{s.tip}</span></button>))}</div></div>',
'              <div><div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Lines</div><div className="grid grid-cols-3 gap-1.5">{[{id:"line",icon:"\u2500",tip:"Line"},{id:"dashed",icon:"\u2504",tip:"Dashed"},{id:"dotted",icon:"\u2508",tip:"Dotted"}].map(s=>(<button key={s.id} onClick={()=>addShape(s.id)} title={s.tip} className="h-11 flex flex-col items-center justify-center rounded-lg text-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all"><span>{s.icon}</span><span className="text-[7px] text-gray-500 mt-0.5">{s.tip}</span></button>))}</div></div>'
  ];
  lines.splice(panelStart, panelEnd-panelStart+1, ...newPanelContent);
  console.log("FIX 3: Shape panel categories replaced");
} else {
  console.log("FIX 3: Could not find panel content to replace");
}

// Remove old star6/burst/badge duplicates if any
code=lines.join("\n");
let dupeCount=0;
lines=code.split("\n");
for(let i=lines.length-1;i>=0;i--){
  if(lines[i]&&lines[i].includes("else if (type==='star6')")&&i>shapeStart+newAddShape.length){
    lines.splice(i,1);dupeCount++;
  }
  if(lines[i]&&lines[i].includes("else if (type==='burst')")&&i>shapeStart+newAddShape.length){
    lines.splice(i,1);dupeCount++;
  }
  if(lines[i]&&lines[i].includes("else if (type==='badge')")&&i>shapeStart+newAddShape.length){
    lines.splice(i,1);dupeCount++;
  }
}
if(dupeCount>0) console.log("Removed",dupeCount,"duplicate shape defs");

code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const fl=code.split("\n");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",fl.length,"| diff:",ob-cb);
