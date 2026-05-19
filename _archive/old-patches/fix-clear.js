const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");

// Replace line 1880 - add handleSavePanel after pushHistory
const old = lines[1879];
if(old && old.includes("Clear Canvas") || (old && old.includes("c.backgroundColor"))){
  lines[1879] = '              <button onClick={() => { const c=fcRef.current; if(!c) return; c.getObjects().slice().forEach(o=>c.remove(o)); c.backgroundColor="#FFFFFF"; c.renderAll(); pushHistory(); handleSavePanel(); }} className="col-span-2 py-2 mb-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1">';
  console.log("Fixed: Clear Canvas now saves panel state");
}

const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
console.log("Done! Lines:",code.split("\n").length);
