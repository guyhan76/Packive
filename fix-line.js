const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let lines = fs.readFileSync(file, "utf8").split("\n");

// Lines 3769-3771 (0-indexed: 3768-3770) are broken
// Find the exact broken lines
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('}}> 100 ?')) {
    console.log(`Found broken line at ${i + 1}: ${lines[i].trim()}`);
    
    // This line and the next 2 lines need to be removed
    // Line i:   }}> 100 ? `${...height...}px` : undefined,
    // Line i+1: marginRight: zoom > 100 ? `${...width...}px` : undefined,
    // Line i+2: }}>
    
    // Replace these 3 lines with nothing (the div already closed with }}> on prev line)
    // But we need to fix the previous line too - it has }}> which should be }}>
    
    // Actually look at line i-1
    console.log(`Line ${i}: ${lines[i-1].trim()}`);
    console.log(`Line ${i+1}: ${lines[i].trim()}`);
    console.log(`Line ${i+2}: ${lines[i+1].trim()}`);
    console.log(`Line ${i+3}: ${lines[i+2].trim()}`);
    
    // The previous line ends with ease-out",
    // Then we have the broken }}> 100 ? ... line
    // We need to:
    // 1. Change line i-1 (transition line) to not close yet
    // 2. Replace lines i, i+1, i+2 with proper margin + closing

    // Fix: replace the 3 broken lines with correct code
    lines[i] = '              marginBottom: zoom > 100 ? `${((zoom / 100) - 1) * (canvasElRef.current?.height || 300)}px` : undefined,';
    lines[i+1] = '              marginRight: zoom > 100 ? `${((zoom / 100) - 1) * (canvasElRef.current?.width || 400)}px` : undefined,';
    lines[i+2] = '            }}>';
    
    // Fix the previous line - remove the }}> ending
    // Line i-1 should be: transition: "transform 0.15s ease-out",
    // But check what line i-2 looks like (it might have }}>)
    let prevLine = lines[i-1].trimEnd();
    if (prevLine.endsWith('}}>')) {
      lines[i-1] = prevLine.slice(0, -3) + '';
      console.log(`Fixed line ${i}: removed }}> from end`);
    }
    
    console.log("\nFixed lines:");
    for (let j = Math.max(0, i-2); j <= i+3; j++) {
      console.log(`  ${j+1}: ${lines[j]}`);
    }
    break;
  }
}

fs.writeFileSync(file, lines.join("\n"), "utf8");
console.log("\n[Done] File saved");
