const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// ── Check: Is Space bar panning useEffect present? ──
if (code.includes("Space bar panning")) {
  console.log("[EXISTS] Space bar panning useEffect found");
} else {
  console.log("[MISSING] Space bar panning useEffect NOT found - adding it now");
}

// ── Check: Where is setIsPanning called? ──
const setIsPanningMatches = code.split("setIsPanning").length - 1;
console.log(`[Info] setIsPanning appears ${setIsPanningMatches} times`);

// ── Find a reliable insertion point ──
// Insert RIGHT AFTER the isPanningRef declaration
const isPanningRefLine = "const isPanningRef = useRef(false);";
const refIdx = code.indexOf(isPanningRefLine);

if (refIdx > -1) {
  const insertAt = refIdx + isPanningRefLine.length;
  
  // Check if space handler already exists nearby
  const nextChunk = code.slice(insertAt, insertAt + 500);
  if (nextChunk.includes("handleSpaceDown") || nextChunk.includes("Space bar")) {
    console.log("[SKIP] Space handler already near isPanningRef");
  } else {
    const spaceHandler = `

  // ── Space bar panning handler ──
  useEffect(() => {
    const handleSpaceDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        e.stopPropagation();
        setIsPanning(true);
        isPanningRef.current = true;
        console.log("[Panning] Space DOWN - isPanning = true");
      }
    };
    const handleSpaceUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsPanning(false);
        isPanningRef.current = false;
        panActiveRef.current = false;
        console.log("[Panning] Space UP - isPanning = false");
      }
    };
    document.addEventListener("keydown", handleSpaceDown);
    document.addEventListener("keyup", handleSpaceUp);
    return () => {
      document.removeEventListener("keydown", handleSpaceDown);
      document.removeEventListener("keyup", handleSpaceUp);
    };
  }, []);`;

    code = code.slice(0, insertAt) + spaceHandler + code.slice(insertAt);
    changes++;
    console.log("[1] Inserted Space bar panning useEffect after isPanningRef");
  }
}

// ── Remove duplicate panning handlers (keep only the first set on the main container) ──
// Line 3591-3616 seems like a duplicate. Let's check.
// Find all onMouseDown with isPanning
const panHandlerCount = (code.match(/e\.button === 0 && isPanning/g) || []).length;
const panHandlerRefCount = (code.match(/e\.button === 0 && isPanningRef\.current/g) || []).length;
console.log(`[Info] isPanning mouse checks: ${panHandlerCount}, isPanningRef checks: ${panHandlerRefCount}`);

// Make sure the FIRST mouse handler (on the scroll container) uses isPanningRef
// Line 3594 uses isPanning (state) - should use isPanningRef.current
const oldCheck = "(e.button === 0 && isPanning))";
// Replace ALL isPanning state checks in mouse handlers with ref
let replaced = 0;
while (code.includes(oldCheck)) {
  code = code.replace(oldCheck, "(e.button === 0 && isPanningRef.current))");
  replaced++;
}
if (replaced > 0) {
  changes++;
  console.log(`[2] Fixed ${replaced} mouse handler(s) to use isPanningRef.current`);
}

// ── Also fix cursor style to use isPanningRef ──
// style={{ cursor: isPanning ? "grab" : undefined }}
// This is fine for rendering (uses state for re-render trigger)

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
console.log("\nVerification:");
console.log("  setIsPanning count:", code.split("setIsPanning").length - 1);
console.log("  isPanningRef count:", code.split("isPanningRef").length - 1);
console.log("  handleSpaceDown count:", code.split("handleSpaceDown").length - 1);
