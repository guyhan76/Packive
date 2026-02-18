const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// The savedJSON restore path has TWO places that remove bg images:
// 1) Pre-filter before loadFromJSON (line ~1186-1193) - filters JSON objects array
// 2) Post-filter after loadFromJSON (line ~1199-1205) - removes canvas objects

// Fix pre-filter: already has _isBgImage check at 1188, but check JSON property name
for (let i = 0; i < lines.length; i++) {
  // Find the savedJSON block
  if (lines[i].trim() === 'if (savedJSON) {') {
    // Scan forward for the filters
    for (let j = i; j < Math.min(i + 40, lines.length); j++) {
      // Pre-load filter
      if (lines[j].includes('o.selectable === false && o.evented === false') && lines[j].includes('return false')) {
        if (!lines[j].includes('_isBgImage')) {
          lines[j] = lines[j].replace(
            'o.selectable === false && o.evented === false',
            'o.selectable === false && o.evented === false && !o._isBgImage'
          );
          changes++;
          console.log('[pre-filter] Added _isBgImage at line ' + (j+1));
        } else {
          console.log('[pre-filter] Already has _isBgImage at line ' + (j+1));
        }
      }
      // Post-load filter
      if (lines[j].includes('o.selectable === false && o.evented === false') && lines[j].includes('canvas.remove')) {
        if (!lines[j].includes('_isBgImage')) {
          lines[j] = lines[j].replace(
            'o.selectable === false && o.evented === false',
            'o.selectable === false && o.evented === false && !o._isBgImage'
          );
          changes++;
          console.log('[post-filter] Added _isBgImage at line ' + (j+1));
        } else {
          console.log('[post-filter] Already has _isBgImage at line ' + (j+1));
        }
      }
    }
    break;
  }
}

// Also ensure the onSave export includes _isBgImage in toJSON custom properties
// AND ensure loadFromJSON restores _isBgImage properly
// After loadFromJSON in savedJSON block, add re-lock logic for _isBgImage
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('await canvas.loadFromJSON(_parsedSaved)')) {
    // Find addSafeZone() call after this
    for (let j = i+1; j < Math.min(i+20, lines.length); j++) {
      if (lines[j].trim() === 'addSafeZone();') {
        // Insert before addSafeZone: re-lock bg images
        const indent = lines[j].match(/^(\s*)/)[1];
        lines.splice(j, 0,
          `${indent}// Re-lock template background images after restore`,
          `${indent}canvas.getObjects().forEach((o: any) => {`,
          `${indent}  if (o._isBgImage) { o.set({ selectable: false, evented: false }); }`,
          `${indent}});`
        );
        changes++;
        console.log('[restore] Added _isBgImage re-lock after loadFromJSON at line ' + (j+1));
        break;
      }
    }
    break;
  }
}

// Same for auto-save restore path
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('await canvas.loadFromJSON(parsed)') && !lines[i].includes('_parsedSaved')) {
    for (let j = i+1; j < Math.min(i+20, lines.length); j++) {
      if (lines[j].trim() === 'addSafeZone();') {
        const indent = lines[j].match(/^(\s*)/)[1];
        lines.splice(j, 0,
          `${indent}// Re-lock template background images after auto-restore`,
          `${indent}canvas.getObjects().forEach((o: any) => {`,
          `${indent}  if (o._isBgImage) { o.set({ selectable: false, evented: false }); }`,
          `${indent}});`
        );
        changes++;
        console.log('[auto-restore] Added _isBgImage re-lock at line ' + (j+1));
        break;
      }
    }
    break;
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Total changes: ' + changes);
