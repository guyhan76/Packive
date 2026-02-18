import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
const lines = code.split('\n');
let changes = 0;

// Find and replace the Eyedropper button block
let startIdx = -1;
let endIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('EyeDropper') && lines[i].includes('onClick')) {
    startIdx = i;
  }
  if (startIdx > -1 && lines[i].includes(' Pick')) {
    // Find the closing </button>
    for (let j = i; j < i + 3; j++) {
      if (lines[j].includes('</button>')) {
        endIdx = j;
        break;
      }
    }
    break;
  }
}

if (startIdx > -1 && endIdx > -1) {
  const indent = lines[startIdx].match(/^(\s*)/)?.[1] || '            ';
  const newBtn = [
    indent + `<button onClick={async () => {`,
    indent + `  const c = fcRef.current; if (!c) return;`,
    indent + `  if ('EyeDropper' in window) {`,
    indent + `    try {`,
    indent + `      const ed = new (window as any).EyeDropper();`,
    indent + `      const result = await ed.open();`,
    indent + `      if (result?.sRGBHex) {`,
    indent + `        applyColor(result.sRGBHex);`,
    indent + `        setColor(result.sRGBHex);`,
    indent + `      }`,
    indent + `    } catch {}`,
    indent + `  } else {`,
    indent + `    // Fallback: use canvas pixel sampling`,
    indent + `    c.defaultCursor = 'crosshair';`,
    indent + `    c.selection = false;`,
    indent + `    const handler = (opt: any) => {`,
    indent + `      const ctx = c.getContext('2d');`,
    indent + `      const pointer = c.getScenePoint(opt.e);`,
    indent + `      const px = Math.round(pointer.x);`,
    indent + `      const py = Math.round(pointer.y);`,
    indent + `      const pixel = ctx.getImageData(px, py, 1, 1).data;`,
    indent + `      const hex = '#' + [pixel[0],pixel[1],pixel[2]].map((v:number) => v.toString(16).padStart(2,'0')).join('');`,
    indent + `      applyColor(hex);`,
    indent + `      setColor(hex);`,
    indent + `      c.defaultCursor = 'default';`,
    indent + `      c.selection = true;`,
    indent + `      c.off('mouse:down', handler);`,
    indent + `    };`,
    indent + `    c.on('mouse:down', handler);`,
    indent + `  }`,
    indent + `}} className="w-full py-0.5 text-[8px] bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 mt-0.5 flex items-center justify-center gap-0.5" title="Eyedropper - Click to sample a color">`,
    indent + `   Eyedropper`,
    indent + `</button>`,
  ];
  lines.splice(startIdx, endIdx - startIdx + 1, ...newBtn);
  changes++;
  console.log("1. Replaced Pick with Eyedropper (point-sample, HEX)");
}

if (changes > 0) {
  writeFileSync(file, lines.join('\n'), "utf8");
  console.log(`\nDone! ${changes} changes applied.`);
} else {
  console.log("No changes made.");
}
