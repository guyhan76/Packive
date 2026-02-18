import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");
let changes = 0;

// 1. Add refs for auto-save after cropTargetRef
const refAnchor = "const cropTargetRef = useRef<any>(null);";
const refReplace = `const cropTargetRef = useRef<any>(null);
  const autoSaveRef = useRef<any>(null);
  const beforeUnloadRef = useRef<any>(null);`;
if (code.includes(refAnchor) && !code.includes('autoSaveRef')) {
  code = code.replace(refAnchor, refReplace);
  changes++;
  console.log("1. Added autoSaveRef and beforeUnloadRef");
}

// 2. Replace const autoSaveInterval = setInterval with autoSaveRef.current = setInterval
const old1 = "const autoSaveInterval = setInterval(";
const new1 = "autoSaveRef.current = setInterval(";
if (code.includes(old1)) {
  code = code.replace(old1, new1);
  changes++;
  console.log("2. Changed autoSaveInterval to autoSaveRef.current");
}

// 3. Replace const handleBeforeUnload with beforeUnloadRef.current
const old2 = "const handleBeforeUnload = () => {";
const new2 = "beforeUnloadRef.current = () => {";
if (code.includes(old2)) {
  code = code.replace(old2, new2);
  changes++;
  console.log("3. Changed handleBeforeUnload to beforeUnloadRef.current");
}

// 4. Fix addEventListener
const old3 = "window.addEventListener('beforeunload', handleBeforeUnload);";
const new3 = "window.addEventListener('beforeunload', beforeUnloadRef.current);";
if (code.includes(old3)) {
  code = code.replace(old3, new3);
  changes++;
  console.log("4. Fixed addEventListener");
}

// 5. Fix cleanup - clearInterval
const old4 = "clearInterval(autoSaveInterval);";
const new4 = "if (autoSaveRef.current) clearInterval(autoSaveRef.current);";
if (code.includes(old4)) {
  code = code.replace(old4, new4);
  changes++;
  console.log("5. Fixed clearInterval");
}

// 6. Fix cleanup - removeEventListener
const old5 = "window.removeEventListener('beforeunload', handleBeforeUnload);";
const new5 = "if (beforeUnloadRef.current) window.removeEventListener('beforeunload', beforeUnloadRef.current);";
if (code.includes(old5)) {
  code = code.replace(old5, new5);
  changes++;
  console.log("6. Fixed removeEventListener");
}

if (changes > 0) {
  writeFileSync(f, code, "utf8");
  console.log("Done! Applied " + changes + " changes");
} else {
  console.log("No changes applied");
}
