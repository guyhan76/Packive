const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let code=fs.readFileSync(file,"utf8");
console.log("Start:",code.split("\n").length);

// FIX 1: Remove Quick Sizes grid (the grid with [8,10,12,14,...96])
// Find the grid div with quick sizes
const quickSizesPattern = /\s*<div className="grid grid-cols-5 gap-1">\{?\[8,10,12[\s\S]*?\}<\/div>/;
if(quickSizesPattern.test(code)){
  code=code.replace(quickSizesPattern,'');
  console.log("FIX 1: Quick sizes grid removed");
} else {
  console.log("FIX 1: Quick sizes not found, trying alt");
  // Try line by line
  const lines=code.split("\n");
  for(let i=0;i<lines.length;i++){
    if(lines[i]&&lines[i].includes("grid grid-cols-5")&&lines[i].includes("[8,10,12")){
      lines.splice(i,1);
      console.log("FIX 1: Removed quick sizes at line "+(i+1));
      break;
    }
  }
  code=lines.join("\n");
}

// FIX 2: Font select option text color - change text-gray-300 to text-black in font select
code=code.replace(
  /(<select value=\{selectedFont\}[\s\S]*?className="w-full text-\[10px\]) bg-white\/5 border border-white\/10 rounded-lg px-2 py-1\.5 text-gray-300 outline-none"/,
  '$1 bg-white border border-white/10 rounded-lg px-2 py-1.5 text-black outline-none"'
);
console.log("FIX 2: Font select text color changed to black");

// FIX 3: Font option style - add color black
code=code.replace(
  /style=\{\{fontFamily:f\}\}>\{f\.split\(","\)\[0\]\}/g,
  'style={{fontFamily:f,color:"#000"}}>{f.split(",")[0]}'
);
console.log("FIX 3: Font option color set to black");

fs.writeFileSync(file,code,"utf8");
const fl=code.split("\n");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("panel-editor Lines:",fl.length,"| diff:",ob-cb);
