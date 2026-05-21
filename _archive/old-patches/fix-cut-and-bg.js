const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// FIX 1: Ctrl+X - children reference lost after discardActiveObject
// Need to clone children array BEFORE discard
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("(window as any).__clipboardJSON = {type:'activeselection',items}") &&
      lines[i+1] && lines[i+1].trim() === 'canvas.discardActiveObject();' &&
      lines[i+2] && lines[i+2].trim().includes('children.forEach')) {
    // children refs become invalid after discardActiveObject
    // We already saved to clipboard, now just remove properly
    const indent = lines[i+1].match(/^(\s*)/)[1];
    lines[i+1] = `${indent}const toRemove = [...children];`;
    lines[i+2] = `${indent}canvas.discardActiveObject();`;
    lines.splice(i+3, 0, `${indent}toRemove.forEach((o: any) => canvas.remove(o));`);
    changes++;
    console.log('[cut] Fixed children reference after discard');
    break;
  }
}

// FIX 2: Template background removed on restore
// Line ~1093-1099: filter removes ALL selectable:false objects including bg images
// Change to only remove guide-type objects, not bg images
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('canvas.getObjects().filter((o: any) =>') &&
      lines[i+1] && lines[i+1].includes('_isSafeZone') && lines[i+1].includes('_isGuideLine') &&
      lines[i+2] && lines[i+2].includes('selectable === false && o.evented === false')) {
    // Replace the filter to NOT remove _isBgImage objects
    const indent = lines[i].match(/^(\s*)/)[1];
    const newFilter = [
      `${indent}canvas.getObjects().filter((o: any) => {`,
      `${indent}  if (o._isBgImage) return false; // Keep template backgrounds`,
      `${indent}  if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) return true;`,
      `${indent}  if (o.type === 'rect' && o.stroke === '#93B5F7' && o.fill === 'transparent') return true;`,
      `${indent}  if (o.type === 'text' && (o.fill === '#C0C0C0' || o.fill === '#B0B0B0') && o.fontSize <= 13) return true;`,
      `${indent}  return false;`,
    ];
    // Find end of this filter block
    let end = i;
    for (let j = i; j < lines.length; j++) {
      if (lines[j].includes('}).forEach((o) => canvas.remove(o))')) { end = j; break; }
      if (lines[j].includes('.forEach((o) => canvas.remove(o));')) { end = j; break; }
    }
    lines.splice(i, end - i + 1, ...newFilter, `${indent}}).forEach((o) => canvas.remove(o));`);
    changes++;
    console.log('[bg] Fixed template background preserved on restore');
    break;
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Total changes: ' + changes);
