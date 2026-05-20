const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let lines = code.split("\n");
console.log("Start:", lines.length);

// Replace all "if (eraserMode) { toggleEraser(); }" with inline cleanup
// This avoids the circular dependency issue

const inlineCleanup = `if (eraserMode) { const c2=fcRef.current; if(c2){c2.selection=true;c2.defaultCursor="default";c2.hoverCursor="move";c2.forEachObject((o:any)=>{if(o._prevSelectable!==undefined){o.selectable=o._prevSelectable;o.evented=o._prevEvented;delete o._prevSelectable;delete o._prevEvented;}});const _el=(c2 as any)._eraserCanvasEl;if(_el){if((c2 as any)._eraserNativeDown)_el.removeEventListener("mousedown",(c2 as any)._eraserNativeDown);if((c2 as any)._eraserNativeMove)_el.removeEventListener("mousemove",(c2 as any)._eraserNativeMove);if((c2 as any)._eraserNativeUp){_el.removeEventListener("mouseup",(c2 as any)._eraserNativeUp);document.removeEventListener("mouseup",(c2 as any)._eraserNativeUp);}}const cur=document.getElementById("eraser-cursor");if(cur)cur.remove();c2.renderAll();} setEraserMode(false); }`;

let count = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("if (eraserMode) { toggleEraser(); }")) {
    lines[i] = lines[i].replace("if (eraserMode) { toggleEraser(); }", inlineCleanup);
    count++;
    console.log("Replaced at line", i + 1);
  }
}
console.log("Total replacements:", count);

// Fix toggleDraw line too
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("if (eraserMode) { toggleEraser(); } else { setEraserMode(false); }")) {
    lines[i] = lines[i].replace("if (eraserMode) { toggleEraser(); } else { setEraserMode(false); }", inlineCleanup);
    count++;
    console.log("Replaced toggleDraw eraser at line", i + 1);
  }
}

// Remove toggleEraser from dependency arrays
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(", toggleEraser]")) {
    lines[i] = lines[i].replace(", toggleEraser]", "]");
    console.log("Removed toggleEraser dep at line", i + 1);
  }
  if (lines[i].includes(", eraserMode, toggleEraser")) {
    lines[i] = lines[i].replace(", eraserMode, toggleEraser", ", eraserMode");
    console.log("Removed toggleEraser from deps at line", i + 1);
  }
}

// Also fix addImage
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const addImage = useCallback") && lines[i].includes("toggleEraser")) {
    lines[i] = lines[i].replace(/if \(eraserMode\) \{ toggleEraser\(\); \} /, "");
    lines[i] = lines[i].replace(", eraserMode, toggleEraser", "");
    console.log("Fixed addImage at line", i + 1);
  }
}

code = lines.join("\n");
lines = code.split("\n");
const ob = (code.match(/\{/g) || []).length;
const cb = (code.match(/\}/g) || []).length;
console.log("Done! Lines:", lines.length, "| { :", ob, "| } :", cb, "| diff:", ob - cb);
fs.writeFileSync(file, code, "utf8");
