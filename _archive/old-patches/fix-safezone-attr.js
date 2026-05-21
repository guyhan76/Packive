const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// Add _isSafeZone to the recreated safe zone rect
if (code.includes("canvas.add(_sz2); canvas.sendObjectToBack(_sz2);")) {
  code = code.replace(
    "canvas.add(_sz2); canvas.sendObjectToBack(_sz2);",
    "(_sz2 as any)._isSafeZone = true; canvas.add(_sz2); canvas.sendObjectToBack(_sz2);"
  );
  changes++;
  console.log("1. Added _isSafeZone to recreated safe rect");
}

// Add _isGuideText to guide text
if (code.includes("canvas.add(_gt2); canvas.sendObjectToBack(_gt2);")) {
  code = code.replace(
    "canvas.add(_gt2); canvas.sendObjectToBack(_gt2);",
    "(_gt2 as any)._isGuideText = true; canvas.add(_gt2); canvas.sendObjectToBack(_gt2);"
  );
  changes++;
  console.log("2. Added _isGuideText to recreated guide text");
}

// Add _isSizeLabel to size label
if (code.includes("canvas.add(_sl2); canvas.sendObjectToBack(_sl2);")) {
  code = code.replace(
    "canvas.add(_sl2); canvas.sendObjectToBack(_sl2);",
    "(_sl2 as any)._isSizeLabel = true; canvas.add(_sl2); canvas.sendObjectToBack(_sl2);"
  );
  changes++;
  console.log("3. Added _isSizeLabel to recreated size label");
}

// Also check exportPNG - make sure it hides all guide objects
if (code.includes("if (o._isSafeZone) o.set(\"visible\", false)")) {
  code = code.replace(
    'if (o._isSafeZone) o.set("visible", false)',
    'if (o._isSafeZone || o._isGuideText || o._isSizeLabel || o.selectable === false) o.set("visible", false)'
  );
  changes++;
  console.log("4. Fixed exportPNG to hide all guide objects");
}

// Fix exportPNG restore
if (code.includes("if (o._isSafeZone) o.set(\"visible\", true)")) {
  code = code.replace(
    'if (o._isSafeZone) o.set("visible", true)',
    'if (o._isSafeZone || o._isGuideText || o._isSizeLabel) o.set("visible", true)'
  );
  changes++;
  console.log("5. Fixed exportPNG restore visibility");
}

if (changes > 0) {
  fs.writeFileSync(file, code, "utf8");
  console.log("Done! " + changes + " changes applied.");
} else {
  console.log("No changes made.");
}
