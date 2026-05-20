const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

const curvedEnd = 'c.add(grp);\n            c.setActiveObject(grp);\n            c.renderAll();\n            refreshLayers();\n          }} />';

if (code.includes(curvedEnd)) {
  const btn = [
    '          <ToolButton label="Path Text" icon="\u301C" onClick={async () => {',
    '            const c = fcRef.current; if (!c) return;',
    '            const text = prompt(String.fromCharCode(69,110,116,101,114) + " text for path:", "Hello Path Text") || "Hello Path Text";',
    '            const pathType = prompt("Path type: 1=Wave 2=ArcTop 3=ArcBottom 4=S-Curve 5=Custom", "1") || "1";',
    '            const { FabricText, Path } = await import("fabric");',
    '            const cw = c.getWidth();',
    '            const ch = c.getHeight();',
    '            let pathStr = "";',
    '            if (pathType === "1") { pathStr = "M 0 0 Q " + (cw*0.25) + " " + (-ch*0.15) + " " + (cw*0.5) + " 0 Q " + (cw*0.75) + " " + (ch*0.15) + " " + cw + " 0"; }',
    '            else if (pathType === "2") { pathStr = "M 0 " + (ch*0.2) + " Q " + (cw*0.5) + " " + (-ch*0.2) + " " + cw + " " + (ch*0.2); }',
    '            else if (pathType === "3") { pathStr = "M 0 0 Q " + (cw*0.5) + " " + (ch*0.4) + " " + cw + " 0"; }',
    '            else if (pathType === "4") { pathStr = "M 0 " + (ch*0.1) + " C " + (cw*0.33) + " " + (-ch*0.15) + " " + (cw*0.66) + " " + (ch*0.35) + " " + cw + " " + (ch*0.1); }',
    '            else if (pathType === "5") { pathStr = prompt("Enter SVG path:", "M 0 0 Q 150 -50 300 0") || "M 0 0 Q 150 -50 300 0"; }',
    '            else { pathStr = "M 0 0 Q " + (cw*0.25) + " " + (-ch*0.15) + " " + (cw*0.5) + " 0 Q " + (cw*0.75) + " " + (ch*0.15) + " " + cw + " 0"; }',
    '            const pathObj = new Path(pathStr, { fill: "", stroke: "", visible: false });',
    '            const pathText = new FabricText(text, {',
    '              left: cw / 2, top: ch / 2, fontSize: fSize, fill: color,',
    '              fontFamily: selectedFont, originX: "center", originY: "center",',
    '              path: pathObj,',
    '            });',
    '            c.add(pathText);',
    '            c.setActiveObject(pathText);',
    '            c.renderAll();',
    '            refreshLayers();',
    '          }} />',
  ].join("\n");
  code = code.replace(curvedEnd, curvedEnd + "\n" + btn);
  changes++;
  console.log("1. Added Path Text button after Curved Text");
}

if (changes > 0) {
  fs.writeFileSync(file, code, "utf8");
  console.log("Done! " + changes + " changes applied.");
} else {
  console.log("No changes made.");
}
