const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// FIX 1: _isBgImage not serialized by toJSON
// Fabric.js needs the property set via obj.set() or added to stateProperties
// Change (img as any)._isBgImage = true to img.set('_isBgImage', true) won't work either
// The real fix: after EVERY toJSON call, manually inject _isBgImage from canvas objects

// Find the template bg image assignment and also set it properly
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('(img as any)._isBgImage = true')) {
    // Add toObject override so toJSON includes _isBgImage
    const indent = lines[i].match(/^(\s*)/)[1];
    lines.splice(i + 1, 0,
      `${indent}const origToObj = img.toObject.bind(img);`,
      `${indent}img.toObject = function(propertiesToInclude?: string[]) {`,
      `${indent}  const obj = origToObj(propertiesToInclude);`,
      `${indent}  obj._isBgImage = true;`,
      `${indent}  return obj;`,
      `${indent}};`
    );
    changes++;
    console.log('[serialize] Added toObject override for _isBgImage at line ' + (i+1));
    break;
  }
}

// FIX 2: Also fix any existing bg images loaded from templates
// After loadFromJSON, find objects that were bg images and re-add toObject override
// Find the _isBgImage re-lock sections we added earlier and extend them

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('if (o._isBgImage) { o.set({ selectable: false, evented: false }); }')) {
    const indent = lines[i].match(/^(\s*)/)[1];
    lines[i] = [
      `${indent}if (o._isBgImage) {`,
      `${indent}  o.set({ selectable: false, evented: false });`,
      `${indent}  const origTo = o.toObject.bind(o);`,
      `${indent}  o.toObject = function(p?: string[]) { const r = origTo(p); r._isBgImage = true; return r; };`,
      `${indent}}`
    ].join('\n');
    changes++;
    console.log('[serialize] Extended re-lock with toObject override at line ' + (i+1));
  }
}

// FIX 3: Also do this in the history restore (undo/redo) path
// Find where selectable/evented is re-set after loadFromJSON in history
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern || o.selectable === false || o.evented === false')) {
    const indent = lines[i].match(/^(\s*)/)[1];
    // Add _isBgImage toObject override after this line
    for (let j = i; j < Math.min(i+5, lines.length); j++) {
      if (lines[j].includes('c.renderAll()') || lines[j].includes('canvas.renderAll()')) {
        lines.splice(j, 0,
          `${indent}c.getObjects().forEach((ob: any) => { if (ob._isBgImage) { const _ot = ob.toObject.bind(ob); ob.toObject = function(p?: string[]) { const r = _ot(p); r._isBgImage = true; return r; }; } });`
        );
        changes++;
        console.log('[serialize] Added toObject fix in history restore at line ' + (j+1));
        break;
      }
    }
    break;
  }
}

// FIX 4: panelsRef is not defined error in handleSave
const file2 = 'src/app/editor/design/page.tsx';
const lines2 = fs.readFileSync(file2, 'utf8').split('\n');
for (let i = 0; i < lines2.length; i++) {
  if (lines2[i].includes('panelsRef.current')) {
    // Check if panelsRef is defined
    const hasPanelsRef = lines2.some(l => l.includes('const panelsRef') || l.includes('panelsRef = useRef'));
    if (!hasPanelsRef) {
      // Find panels state declaration
      for (let j = 0; j < lines2.length; j++) {
        if (lines2[j].includes('const [panels, setPanels]')) {
          const indent = lines2[j].match(/^(\s*)/)[1];
          lines2.splice(j + 1, 0,
            `${indent}const panelsRef = React.useRef(panels);`,
            `${indent}React.useEffect(() => { panelsRef.current = panels; }, [panels]);`
          );
          changes++;
          console.log('[panelsRef] Added panelsRef in design page');
          break;
        }
      }
    }
    break;
  }
}
// Also fix pid/thumb references
for (let i = 0; i < lines2.length; i++) {
  if (lines2[i].includes('[pid]') && lines2[i].includes('json: json')) {
    lines2[i] = lines2[i].replace('[pid]', '[panelId]').replace('thumbnail: thumb', 'thumbnail: thumbnail');
    changes++;
    console.log('[panelsRef] Fixed pid/thumb references');
    break;
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
fs.writeFileSync(file2, lines2.join('\n'), 'utf8');
console.log('Total changes: ' + changes);
