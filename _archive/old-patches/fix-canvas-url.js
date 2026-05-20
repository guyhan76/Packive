const fs = require("fs");

// ═══════════════════════════════════════════
// FIX 1: Canvas size — more padding
// ═══════════════════════════════════════════
const peFile = "src/components/editor/panel-editor.tsx";
let peCode = fs.readFileSync(peFile, "utf8");

// Change padding from 40 to 120 (60px each side)
peCode = peCode.replace(
  /const padW = cw - 40;\s*\n\s*const padH = ch - 40;/,
  "const padW = cw - 120;\n      const padH = ch - 120;"
);
console.log("FIX 1: Canvas padding changed to 120");

fs.writeFileSync(peFile, peCode, "utf8");
const peLines = peCode.split("\n");
const peOb = (peCode.match(/\{/g) || []).length;
const peCb = (peCode.match(/\}/g) || []).length;
console.log("panel-editor.tsx Lines:", peLines.length, "| diff:", peOb - peCb);

// ═══════════════════════════════════════════
// FIX 2: Persist currentView in URL
// ═══════════════════════════════════════════
const dpFile = "src/app/editor/design/page.tsx";
let dpCode = fs.readFileSync(dpFile, "utf8");
let dpLines = dpCode.split("\n");
console.log("\ndesign/page.tsx Start:", dpLines.length);

// 2a: Change initial state to read from URL
const cvIdx = dpLines.findIndex(l => l.includes('const [currentView, setCurrentView] = useState'));
if (cvIdx !== -1) {
  const oldLine = dpLines[cvIdx];
  dpLines[cvIdx] = '  const [currentView, setCurrentView] = useState<ViewMode>(() => { const p = searchParams.get("panel"); return (p && p !== "overview") ? p as ViewMode : "overview"; });';
  console.log("FIX 2a: currentView reads from URL at line", cvIdx + 1);
}

dpCode = dpLines.join("\n"); dpLines = dpCode.split("\n");

// 2b: Add useEffect to sync currentView to URL
// Find navigatePanel and insert before it
const navIdx = dpLines.findIndex(l => l.includes("const navigatePanel = useCallback"));
if (navIdx !== -1) {
  const syncEffect = `  // Sync currentView to URL
  useEffect(() => {
    const url = new URL(window.location.href);
    if (currentView === "overview") {
      url.searchParams.delete("panel");
    } else {
      url.searchParams.set("panel", currentView);
    }
    window.history.replaceState({}, "", url.toString());
  }, [currentView]);

`;
  // Check if already exists
  if (!dpCode.includes('url.searchParams.set("panel"')) {
    dpLines.splice(navIdx, 0, ...syncEffect.split("\n"));
    console.log("FIX 2b: URL sync effect added before line", navIdx + 1);
  }
}

// 2c: Update setCurrentView("overview") in onBack to also work with URL
// Already handled by the useEffect above

dpCode = dpLines.join("\n");
dpLines = dpCode.split("\n");
const dpOb = (dpCode.match(/\{/g) || []).length;
const dpCb = (dpCode.match(/\}/g) || []).length;
console.log("design/page.tsx Lines:", dpLines.length, "| diff:", dpOb - dpCb);
fs.writeFileSync(dpFile, dpCode, "utf8");
