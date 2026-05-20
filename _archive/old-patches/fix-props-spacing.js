const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// Find Properties section boundaries
let propsStart = -1, propsEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("props")')) propsStart = i;
  if (propsStart > 0 && !propsEnd && lines[i].includes('toggleSection("tools")')) { propsEnd = i; break; }
}
console.log('Properties: lines ' + (propsStart+1) + ' to ' + (propsEnd+1));

if (propsStart > 0 && propsEnd > 0) {
  for (let i = propsStart; i < propsEnd; i++) {
    const line = lines[i];
    
    // 1. Normalize all gap-0.5 and gap-1 to gap-1.5 for consistent internal spacing
    if (line.includes('flex flex-col items-center gap-0.5')) {
      lines[i] = line.replace('gap-0.5', 'gap-1');
      changes++;
    }
    
    // 2. Add margin-bottom to each item group div for spacing between groups
    // Each group starts with <div className="flex flex-col items-center
    if (line.includes('flex flex-col items-center gap-1') && !line.includes('gap-1.5')) {
      lines[i] = line.replace('flex flex-col items-center gap-1', 'flex flex-col items-center gap-1 mb-2');
      changes++;
    }
    if (line.includes('flex flex-col items-center gap-1 mb-2') && line.includes('gap-1 mb-2 mb-2')) {
      // prevent double mb-2
      lines[i] = lines[i].replace('mb-2 mb-2', 'mb-2');
    }

    // 3. Make dividers have consistent spacing
    if (line.includes('<hr') && line.includes('my-3') && line.includes('border-gray-300')) {
      // Already upgraded - good
    }
  }
  
  // 4. Now handle specific tight areas - add mb-2 to groups that use flex flex-col but with gap-0.5 (now gap-1)
  for (let i = propsStart; i < propsEnd; i++) {
    if (lines[i].includes('flex flex-col items-center gap-1') && !lines[i].includes('mb-')) {
      lines[i] = lines[i].replace('gap-1"', 'gap-1 mb-2"');
      if (!lines[i].includes('mb-2')) {
        lines[i] = lines[i].replace('gap-1 ', 'gap-1 mb-2 ');
      }
      changes++;
    }
  }
  
  // 5. Also add padding to the Properties content wrapper
  // Find the display div after props toggle
  for (let i = propsStart; i < propsStart + 5; i++) {
    if (lines[i].includes('openSections.has("props")') && lines[i].includes('display')) {
      if (!lines[i].includes('py-')) {
        // Add some vertical padding
        lines[i] = lines[i].replace('className="', 'className="py-1 ');
        if (lines[i].includes("className='")) {
          lines[i] = lines[i].replace("className='", "className='py-1 ");
        }
        changes++;
        console.log('Added padding to props content wrapper at line ' + (i+1));
      }
      break;
    }
  }

  // 6. Fix the shadow section - it has its own complex structure, add mb-2
  for (let i = propsStart; i < propsEnd; i++) {
    if (lines[i].includes('>Shadow</span>')) {
      // Find parent div
      for (let k = i; k >= Math.max(propsStart, i - 3); k--) {
        if (lines[k].includes('flex flex-col') && !lines[k].includes('mb-2')) {
          lines[k] = lines[k].replace('gap-1"', 'gap-1 mb-2"').replace("gap-1'", "gap-1 mb-2'");
          changes++;
          console.log('Shadow group spacing at line ' + (k+1));
          break;
        }
      }
      break;
    }
  }
}

// Also fix the remaining gap-0.5 that wasn't caught
for (let i = propsStart; i < propsEnd; i++) {
  if (lines[i].includes('gap-0.5') && lines[i].includes('flex-col')) {
    lines[i] = lines[i].replace('gap-0.5', 'gap-1');
    changes++;
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Done! ' + changes + ' spacing fixes applied.');
