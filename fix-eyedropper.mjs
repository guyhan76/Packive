import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
const lines = code.split('\n');
let changes = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('applyColor(e.target.value)') && lines[i].includes('w-10 h-5 mt-1 cursor-pointer')) {
    // Insert eyedropper button after this line
    const indent = lines[i].match(/^(\s*)/)?.[1] || '            ';
    const eyedropperLines = [
      indent + `<button onClick={async () => {`,
      indent + `  if ('EyeDropper' in window) {`,
      indent + `    try {`,
      indent + `      const ed = new (window as any).EyeDropper();`,
      indent + `      const result = await ed.open();`,
      indent + `      if (result?.sRGBHex) { applyColor(result.sRGBHex); setColor(result.sRGBHex); }`,
      indent + `    } catch {}`,
      indent + `  } else { alert('EyeDropper API not supported'); }`,
      indent + `}} className="w-10 py-0.5 text-[8px] bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 mt-0.5" title="Pick color from screen">`,
      indent + `  💧 Pick`,
      indent + `</button>`,
    ];
    lines.splice(i + 1, 0, ...eyedropperLines);
    changes++;
    console.log("1. Added Eyedropper button after line " + i);
    break;
  }
}

if (changes > 0) {
  writeFileSync(file, lines.join('\n'), "utf8");
  console.log(`\nDone! ${changes} changes applied.`);
} else {
  console.log("No changes made.");
}
