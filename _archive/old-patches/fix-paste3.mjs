import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");
let changes = 0;

// 1. Add pasteHandlerRef after beforeUnloadRef
const refAnchor = "const beforeUnloadRef = useRef<any>(null);";
const refReplace = "const beforeUnloadRef = useRef<any>(null);\n  const pasteHandlerRef = useRef<any>(null);";
if (code.includes(refAnchor) && !code.includes('pasteHandlerRef')) {
  code = code.replace(refAnchor, refReplace);
  changes++;
  console.log("1. Added pasteHandlerRef");
}

// 2. Replace const pasteHandler with pasteHandlerRef.current
const old1 = "const pasteHandler = async (e: ClipboardEvent) => {";
const new1 = "pasteHandlerRef.current = async (e: ClipboardEvent) => {";
if (code.includes(old1)) {
  code = code.replace(old1, new1);
  changes++;
  console.log("2. Changed pasteHandler to ref");
}

// 3. Fix addEventListener
const old2 = "document.addEventListener('paste', pasteHandler as EventListener);";
const new2 = "document.addEventListener('paste', pasteHandlerRef.current as EventListener);";
if (code.includes(old2)) {
  code = code.replace(old2, new2);
  changes++;
  console.log("3. Fixed addEventListener");
}

// 4. Fix removeEventListener
const old3 = "document.removeEventListener('paste', pasteHandler as EventListener);";
const new3 = "if (pasteHandlerRef.current) document.removeEventListener('paste', pasteHandlerRef.current as EventListener);";
if (code.includes(old3)) {
  code = code.replace(old3, new3);
  changes++;
  console.log("4. Fixed removeEventListener");
}

if (changes > 0) {
  writeFileSync(f, code, "utf8");
  console.log("Done! Applied " + changes + " changes");
} else {
  console.log("No changes applied");
}
