import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let lines = readFileSync(f, "utf8").split("\n");

// 1. Add exportSVG callback after exportPNG callback (line 1509)
let exportPngEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("}, [exportScale, panelName]);") && lines[i-1]?.includes("revokeObjectURL")) {
    exportPngEnd = i;
    break;
  }
}
// Fallback: find by pattern
if (exportPngEnd === -1) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("[exportScale, panelName]")) {
      exportPngEnd = i;
      break;
    }
  }
}

if (exportPngEnd === -1) { console.log("ERROR: exportPNG end not found"); process.exit(1); }

const svgCallback = [
  '',
  '  const exportSVG = useCallback(() => {',
  '    const c = fcRef.current; if (!c) return;',
  '    const objs = c.getObjects();',
  '    objs.forEach((o: any) => { if (o._isSafeZone || o._isGuideText || o._isGuideLine) o.set("visible", false); });',
  '    c.renderAll();',
  '    const svg = c.toSVG();',
  '    objs.forEach((o: any) => { if (o._isSafeZone || o._isGuideText || o._isGuideLine) o.set("visible", true); });',
  '    c.renderAll();',
  '    const blob = new Blob([svg], { type: "image/svg+xml" });',
  '    const url = URL.createObjectURL(blob);',
  '    const link = document.createElement("a");',
  '    link.href = url;',
  '    link.download = `${panelName}.svg`;',
  '    document.body.appendChild(link); link.click(); document.body.removeChild(link);',
  '    URL.revokeObjectURL(url);',
  '  }, [panelName]);',
];

lines.splice(exportPngEnd + 1, 0, ...svgCallback);
console.log("1. Added exportSVG callback after line " + (exportPngEnd + 1));

// 2. Add SVG button next to Export PNG button
let btnIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("Export PNG</button>")) {
    btnIdx = i;
    break;
  }
}

if (btnIdx === -1) { console.log("ERROR: Export PNG button not found"); process.exit(1); }

const svgBtn = '          <button onClick={exportSVG} className="px-4 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700">Export SVG</button>';
lines.splice(btnIdx + 1, 0, svgBtn);
console.log("2. Added Export SVG button after line " + (btnIdx + 1));

writeFileSync(f, lines.join("\n"), "utf8");
console.log("Done! SVG Export added.");
