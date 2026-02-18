import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
const lines = code.split('\n');
let changes = 0;

// Find line 1023 (historyIdxRef.current = historyRef.current.length - 1;)
// and insert thumbnail code after it, before the closing }, 400);
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('historyIdxRef.current = historyRef.current.length - 1;') && 
      i > 1000 && i < 1100 &&
      !lines[i+1]?.includes('thumbData')) {
    const indent = lines[i].match(/^(\s*)/)?.[1] || '';
    const thumbCode = [
      indent + `// Generate thumbnail for history panel`,
      indent + `try {`,
      indent + `  const thumbData = canvas.toDataURL({ format: 'png', multiplier: 0.15, quality: 0.5 });`,
      indent + `  const now = new Date();`,
      indent + `  const timeStr = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0') + ':' + now.getSeconds().toString().padStart(2,'0');`,
      indent + `  setHistoryThumbs(prev => {`,
      indent + `    const next = prev.slice(0, historyIdxRef.current);`,
      indent + `    next.push({ idx: historyIdxRef.current, thumb: thumbData, time: timeStr });`,
      indent + `    if (next.length > 50) next.shift();`,
      indent + `    return next;`,
      indent + `  });`,
      indent + `  setHistoryIdx(historyIdxRef.current);`,
      indent + `} catch(e) { console.error('History thumb error:', e); }`,
    ];
    lines.splice(i + 1, 0, ...thumbCode);
    changes++;
    console.log("1. Inserted thumbnail generation after line " + i);
    break;
  }
}

if (changes > 0) {
  writeFileSync(file, lines.join('\n'), "utf8");
  console.log(`\nDone! ${changes} changes applied.`);
} else {
  console.log("No changes made.");
}
