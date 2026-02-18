const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// Find Properties section
let propsStart = -1, propsEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("props")')) propsStart = i;
  if (propsStart > 0 && !propsEnd && lines[i].includes('toggleSection("tools")')) { propsEnd = i; break; }
}
console.log('Properties: ' + (propsStart+1) + ' to ' + (propsEnd+1));

// 1. Reduce py-2 to py-1 on all flex-col divs
for (let i = propsStart; i < propsEnd; i++) {
  if (lines[i].includes('flex flex-col items-center') && lines[i].includes('py-2')) {
    lines[i] = lines[i].replace('py-2', 'py-1');
    changes++;
  }
}

// 2. Reduce divider margins from 4px to 2px
for (let i = propsStart; i < propsEnd; i++) {
  if (lines[i].includes('border-t border-gray-200') && lines[i].includes('marginTop')) {
    lines[i] = lines[i].replace('marginTop:"4px"', 'marginTop:"2px"').replace('marginBottom:"4px"', 'marginBottom:"2px"');
    changes++;
  }
}

// 3. Upload Font - make icon and text much bigger and add margin-top
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Upload Font') && lines[i].includes('className') && lines[i].includes('button')) {
    lines[i] = lines[i]
      .replace('text-[8px]', 'text-[12px] font-bold')
      .replace('text-[11px] font-semibold', 'text-[12px] font-bold')
      .replace('py-0.5', 'py-1.5')
      .replace('mt-0.5', 'mt-2');
    if (!lines[i].includes('mt-')) {
      lines[i] = lines[i].replace('rounded ', 'rounded mt-2 ');
    }
    changes++;
    console.log('Upload Font button updated at line ' + (i+1));
    break;
  }
}

// 4. Also update the emoji icon line if separate
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '📁 Upload Font' || lines[i].trim() === '\uD83D\uDCC1 Upload Font') {
    lines[i] = lines[i].replace('📁 Upload Font', '📁 Upload Font');
    break;
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('\\nDone! ' + changes + ' changes.');
