const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// Find the parent container div with panning handlers
// It has the ref callback but wrapperRef is missing
const oldRefCallback = `ref={(el) => { 
            if (el) {
              (el as any).__scrollHost = true;`;

if (code.includes(oldRefCallback)) {
  const newRefCallback = `ref={(el) => { 
            if (el) {
              (wrapperRef as any).current = el;
              (el as any).__scrollHost = true;`;
  code = code.replace(oldRefCallback, newRefCallback);
  changes++;
  console.log("[1] Added wrapperRef assignment to parent div ref callback");
} else {
  console.log("[MISS] ref callback not found, trying alternate approach...");
  
  // Find the parent div with panning and add wrapperRef directly
  // Look for the className pattern
  const parentPattern = 'className={`flex-1 flex bg-gray-100';
  const parentIdx = code.indexOf(parentPattern);
  
  if (parentIdx > -1) {
    // Find the <div that starts this element
    let divStart = code.lastIndexOf('<div', parentIdx);
    // Check if there's already a ref on this div
    const divSnippet = code.slice(divStart, parentIdx + 50);
    console.log("[Debug] Parent div snippet:", divSnippet.substring(0, 100));
    
    if (!divSnippet.includes('ref=')) {
      // Add ref={wrapperRef} after <div\n
      const insertPoint = code.indexOf('\n', divStart) + 1;
      code = code.slice(0, insertPoint) + '          ref={wrapperRef}\n' + code.slice(insertPoint);
      changes++;
      console.log("[1b] Added ref={wrapperRef} to parent div");
    }
  }
}

// Also check if the onDragOver and onDrop were lost
if (!code.includes('onDragOver') || !code.includes('onDrop')) {
  console.log("[Warning] onDragOver/onDrop may be missing from parent div!");
  // Check what's after onMouseLeave
  const mouseLeaveIdx = code.indexOf('e.currentTarget.style.cursor = isPanning ? "grab" : "";\n          }}');
  if (mouseLeaveIdx > -1) {
    const afterMouseLeave = code.slice(mouseLeaveIdx, mouseLeaveIdx + 200);
    console.log("[Debug] After onMouseLeave:", afterMouseLeave.substring(0, 150));
  }
} else {
  console.log("[OK] onDragOver and onDrop exist");
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
