const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");

// Fix: title="{t("tool.clearCanvas")}" → title={t("tool.clearCanvas")}
const bad = 'title="{t("tool.clearCanvas")}"';
const good = 'title={t("tool.clearCanvas")}';

if (code.includes(bad)) {
  code = code.replace(bad, good);
  fs.writeFileSync(file, code, "utf8");
  console.log("[Fixed] title attribute corrected");
} else {
  // Try alternate pattern - maybe quotes are different
  const regex = /title="(\{t\([^)]+\)\})"/g;
  let count = 0;
  code = code.replace(regex, (match, inner) => {
    count++;
    return `title=${inner}`;
  });
  if (count > 0) {
    fs.writeFileSync(file, code, "utf8");
    console.log(`[Fixed] ${count} title attributes corrected via regex`);
  } else {
    console.log("[Info] Pattern not found, showing line 3448:");
    const lines = code.split("\n");
    console.log(lines[3447]);
  }
}
