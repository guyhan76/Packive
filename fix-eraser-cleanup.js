const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let lines = code.split("\n");
console.log("Start:", lines.length);

// FIX A: toggleEraser OFF branch — add _eraserCleanup call before setEraserMode(false)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const toggleEraser = useCallback")) {
    // Find setEraserMode(false) in the OFF branch (first occurrence after toggleEraser)
    for (let j = i; j < i + 30; j++) {
      if (lines[j] && lines[j].trim() === "setEraserMode(false);") {
        lines.splice(j, 0, "        if ((c as any)._eraserCleanup) { (c as any)._eraserCleanup(); delete (c as any)._eraserCleanup; }");
        console.log("FIX A: _eraserCleanup added before line", j + 1);
        break;
      }
    }
    break;
  }
}

code = lines.join("\n"); lines = code.split("\n");

// FIX B: Select button — add full eraser cleanup
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("Select (V)") && lines[i].includes("setEraserMode(false)") && !lines[i].includes("_eraserCleanup")) {
    lines[i] = lines[i].replace(
      "setEraserMode(false);} }",
      "setEraserMode(false);if((c as any)._eraserCleanup){(c as any)._eraserCleanup();delete (c as any)._eraserCleanup;}const _cur=document.getElementById('eraser-cursor');if(_cur)_cur.remove();c.selection=true;c.defaultCursor='default';c.hoverCursor='move';const _uel=c.upperCanvasEl||c.getElement();if(_uel)_uel.style.cursor='';} }"
    );
    console.log("FIX B: Select button cleanup at line", i + 1);
    break;
  }
}

code = lines.join("\n"); lines = code.split("\n");
const ob = (code.match(/\{/g) || []).length;
const cb = (code.match(/\}/g) || []).length;
console.log("Done! Lines:", lines.length, "| { :", ob, "| } :", cb, "| diff:", ob - cb);
fs.writeFileSync(file, code, "utf8");
