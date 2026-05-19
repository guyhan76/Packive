const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// Check if Space bar panning useEffect exists
if (code.includes("Space bar panning")) {
  console.log("[OK] Space bar panning useEffect exists");
  
  // Add debug logging
  const oldSpaceDown = "setIsPanning(true); isPanningRef.current = true;";
  if (code.includes(oldSpaceDown)) {
    const firstIdx = code.indexOf(oldSpaceDown);
    // Check context - is it in the Space bar handler?
    const context = code.slice(Math.max(0, firstIdx - 100), firstIdx + oldSpaceDown.length);
    console.log("[Debug] First setIsPanning(true) context:", context.trim().substring(0, 80));
  }
} else {
  console.log("[MISS] Space bar panning NOT found!");
}

// Check mouse handler
const panCheck = '(e.button === 0 && isPanningRef.current)';
if (code.includes(panCheck)) {
  console.log("[OK] Mouse handler checks isPanningRef");
} else {
  console.log("[MISS] isPanningRef check not found in mouse handler");
  // Check what the mouse handler looks like
  const mouseDown = code.indexOf("onMouseDown={(e) => {");
  if (mouseDown > -1) {
    console.log("[Debug] onMouseDown:", code.slice(mouseDown, mouseDown + 200));
  }
}

// The real issue might be that the fabric canvas intercepts mouse events
// when spacebar is pressed. Solution: when isPanning, disable fabric canvas interaction
// and handle mouse on the scroll container directly.

// Add: when isPanning changes, toggle fabric canvas selection
const panningEffect = `
  // Disable canvas interaction during panning
  useEffect(() => {
    const fc = fcRef.current;
    if (!fc) return;
    if (isPanning) {
      fc.selection = false;
      fc.defaultCursor = "grab";
      fc.hoverCursor = "grab";
      fc.getObjects().forEach((o: any) => { o._origSelectable = o.selectable; o.selectable = false; });
    } else {
      fc.selection = true;
      fc.defaultCursor = "default";
      fc.hoverCursor = "move";
      fc.getObjects().forEach((o: any) => { if (o._origSelectable !== undefined) { o.selectable = o._origSelectable; delete o._origSelectable; } });
    }
    fc.renderAll();
  }, [isPanning]);
`;

if (!code.includes("Disable canvas interaction during panning")) {
  // Insert after the Space bar panning useEffect
  const spaceEffectEnd = code.indexOf("// Space bar panning");
  if (spaceEffectEnd > -1) {
    // Find the end of this useEffect
    let searchFrom = spaceEffectEnd;
    const endMarker = "}, []);";
    let endIdx = code.indexOf(endMarker, searchFrom);
    if (endIdx > -1) {
      const insertAt = endIdx + endMarker.length;
      code = code.slice(0, insertAt) + panningEffect + code.slice(insertAt);
      changes++;
      console.log("[1] Added canvas interaction disable during panning");
    }
  }
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
