const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
// Find template card rendering
for(let i=1700;i<Math.min(lines.length,1870);i++){
  if(lines[i].includes("tpl.id")||lines[i].includes("tpl.preview")||lines[i].includes("tpl.name")||lines[i].includes("templateLoading")||lines[i].includes("tpl.category")){
    console.log((i+1)+": "+lines[i].substring(0,150));
  }
}
// Find category tabs
for(let i=1700;i<Math.min(lines.length,1870);i++){
  if(lines[i].includes("categories")||lines[i].includes("selectedCategory")||lines[i].includes("catFilter")){
    console.log("CAT "+(i+1)+": "+lines[i].substring(0,150));
  }
}
// Show template card block
for(let i=1720;i<Math.min(lines.length,1760);i++){
  console.log((i+1)+": "+lines[i]);
}
