import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");
let changes = 0;

// 1. Change document.addEventListener to window.addEventListener for paste
const old1 = "document.addEventListener('paste', pasteHandlerRef.current as EventListener);";
const new1 = "window.addEventListener('paste', pasteHandlerRef.current as EventListener);";
if (code.includes(old1)) {
  code = code.replace(old1, new1);
  changes++;
  console.log("1. Changed to window paste listener");
}

// 2. Change cleanup too
const old2 = "if (pasteHandlerRef.current) document.removeEventListener('paste', pasteHandlerRef.current as EventListener);";
const new2 = "if (pasteHandlerRef.current) window.removeEventListener('paste', pasteHandlerRef.current as EventListener);";
if (code.includes(old2)) {
  code = code.replace(old2, new2);
  changes++;
  console.log("2. Changed cleanup to window");
}

if (changes > 0) {
  writeFileSync(f, code, "utf8");
  console.log("Done! Applied " + changes + " changes");
} else {
  console.log("No changes");
}
