const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// Fix: e.repeat events must also preventDefault to stop browser scroll
const oldLine = `if (e.code !== "Space" || e.repeat) return;
      const tag = (document.activeElement?.tagName || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      e.stopImmediatePropagation();`;

const newLine = `if (e.code !== "Space") return;
      const tag = (document.activeElement?.tagName || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      // Always prevent default to stop browser scroll (even on repeat)
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.repeat) return;`;

if (code.includes(oldLine)) {
  code = code.replace(oldLine, newLine);
  changes++;
  console.log("[Fix] preventDefault now runs before repeat check");
}

fs.writeFileSync(file, code, "utf8");
console.log(`Total changes: ${changes}`);
if (changes > 0) console.log("✅ Space repeat scroll prevented!");
