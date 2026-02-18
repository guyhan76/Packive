const fs=require("fs");
const file="src/app/editor/design/page.tsx";
let code=fs.readFileSync(file,"utf8");
// Add empty check before JSON.parse
code = code.replace(
  "const project = JSON.parse(text);",
  "if (!text || !text.trim()) { alert('Empty file'); return; }\n        const project = JSON.parse(text);"
);
fs.writeFileSync(file,code,"utf8");
console.log("Fixed empty JSON check");
