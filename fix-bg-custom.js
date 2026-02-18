const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
const lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

// Insert custom color picker for Background after line 1658 (after the grid closing </div>)
// Line 1658 is </div> closing the grid, line 1659 is </div> closing the Background section
const bgCustom = '              <div className="mt-2 flex items-center gap-2">' +
  '<input type="color" value={bgColor} onChange={e=>{const c=e.target.value;setBgColor(c);const cv=fcRef.current;if(cv){cv.backgroundColor=c;cv.renderAll();}}} className="w-6 h-6 cursor-pointer rounded border border-white/20" title="Custom background color"/>' +
  '<span className="text-[9px] text-gray-500">Custom</span></div>';

lines.splice(1658,0,bgCustom);
console.log("Background custom picker added after line 1658");

const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
