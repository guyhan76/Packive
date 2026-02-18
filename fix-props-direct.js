const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// Direct line numbers with gap-0.5 or inconsistent classes
const targetLines = [2731, 2742, 2765, 2788, 2811, 2823, 2842, 2946, 2970, 3031, 3080, 3129, 3170];

for (const ln of targetLines) {
  const idx = ln - 1;
  if (idx < 0 || idx >= lines.length) continue;
  const line = lines[idx];
  
  if (!line.includes('flex flex-col items-center')) {
    console.log('Line ' + ln + ' SKIP (no match): ' + line.trim().substring(0, 50));
    continue;
  }
  
  // Skip bg-blue-50 (shadow detail panel)
  if (line.includes('bg-blue-50')) {
    console.log('Line ' + ln + ' SKIP (blue bg)');
    continue;
  }
  
  // Replace: remove all gap-*, pb-*, mb-* and set uniform py-2
  let newLine = line;
  // Remove existing spacing classes
  newLine = newLine.replace(/gap-[0-9.]+/g, '');
  newLine = newLine.replace(/pb-[0-9.]+/g, '');
  newLine = newLine.replace(/mb-[0-9.]+/g, '');
  newLine = newLine.replace(/py-[0-9.]+/g, '');
  // Clean up double spaces
  newLine = newLine.replace(/\s+"/g, '"');
  newLine = newLine.replace(/items-center\s+/g, 'items-center ');
  // Add uniform classes
  newLine = newLine.replace('items-center"', 'items-center gap-1 py-2"');
  newLine = newLine.replace("items-center'", "items-center gap-1 py-2'");
  
  if (newLine !== line) {
    lines[idx] = newLine;
    changes++;
    console.log('Line ' + ln + ' FIXED: ' + newLine.trim().substring(0, 80));
  } else {
    console.log('Line ' + ln + ' NO CHANGE: ' + line.trim().substring(0, 80));
  }
}

// Now handle dividers - remove old ones and add fresh
let propsStart = -1, propsEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("props")')) propsStart = i;
  if (propsStart > 0 && !propsEnd && lines[i].includes('toggleSection("tools")')) { propsEnd = i; break; }
}

// Remove existing dividers
for (let i = propsEnd - 1; i >= propsStart; i--) {
  if (lines[i].trim().startsWith('<hr') || lines[i].trim().startsWith('<div className="border-t')) {
    lines.splice(i, 1);
    changes++;
    console.log('Removed old divider at line ' + (i+1));
  }
}

// Recalculate
propsStart = -1; propsEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("props")')) propsStart = i;
  if (propsStart > 0 && !propsEnd && lines[i].includes('toggleSection("tools")')) { propsEnd = i; break; }
}

// Find divider insertion points by label
const dividerLabels = ['Stroke Color', 'Image Filters', 'Rotation', 'Shadow', 'Font', 'Position'];
const inserts = [];
for (const lbl of dividerLabels) {
  for (let i = propsStart; i < propsEnd; i++) {
    if (lines[i].includes('>' + lbl + '</span>')) {
      // Find parent div above
      for (let k = i; k >= Math.max(propsStart, i - 3); k--) {
        if (lines[k].includes('flex flex-col items-center')) {
          inserts.push({ idx: k, label: lbl });
          break;
        }
      }
      break;
    }
  }
}

inserts.sort((a, b) => b.idx - a.idx);
for (const ins of inserts) {
  lines.splice(ins.idx, 0, '          <div className="w-full border-t border-gray-200" style={{marginTop:"4px",marginBottom:"4px"}} />');
  changes++;
  console.log('+ Divider before ' + ins.label);
}

// Upload Font button - enlarge
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Upload Font') && lines[i].includes('className')) {
    if (lines[i].includes('text-[8px]')) {
      lines[i] = lines[i].replace('text-[8px]', 'text-[11px] font-semibold').replace('py-0.5', 'py-1.5');
      changes++;
      console.log('Upload Font enlarged at line ' + (i+1));
    }
    break;
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('\\nTotal: ' + changes + ' changes applied.');
