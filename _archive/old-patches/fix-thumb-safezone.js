const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// Fix 1: Thumbnail generation - hide safe zone before toDataURL
const oldThumb = "const thumb = c.toDataURL({ format: 'png', quality: 0.7, multiplier: 1 });";
const newThumb = `// Hide safe zone/guide objects for clean thumbnail
    c.getObjects().forEach((o: any) => {
      if (o._isSafeZone || o._isGuideText || o._isSizeLabel || o._isGuideLine) o.set('visible', false);
    });
    c.renderAll();
    const thumb = c.toDataURL({ format: 'png', quality: 0.7, multiplier: 1 });
    // Restore safe zone visibility
    c.getObjects().forEach((o: any) => {
      if (o._isSafeZone || o._isGuideText || o._isSizeLabel || o._isGuideLine) o.set('visible', true);
    });`;

if (code.includes(oldThumb)) {
  code = code.replace(oldThumb, newThumb);
  changes++;
  console.log('Fix1: Thumbnail now hides safe zone before capture');
} else {
  console.log('Fix1: Pattern not found');
}

// Fix 2: Also fix the exportPNG to include _isGuideLine
const oldExportHide = 'objs.forEach((o: any) => { if (o._isSafeZone || o._isGuideText || o._isSizeLabel || o.selectable === false) o.set("visible", false); });';
const newExportHide = 'objs.forEach((o: any) => { if (o._isSafeZone || o._isGuideText || o._isSizeLabel || o._isGuideLine || o.selectable === false) o.set("visible", false); });';

if (code.includes(oldExportHide)) {
  code = code.replace(oldExportHide, newExportHide);
  changes++;
  console.log('Fix2: exportPNG now also hides _isGuideLine');
} else {
  console.log('Fix2: Pattern not found');
}

// Fix 3: exportPNG restore - also restore _isGuideLine
const oldExportRestore = 'objs.forEach((o: any) => { if (o._isSafeZone || o._isGuideText || o._isSizeLabel) o.set("visible", true); });';
const newExportRestore = 'objs.forEach((o: any) => { if (o._isSafeZone || o._isGuideText || o._isSizeLabel || o._isGuideLine) o.set("visible", true); });';

if (code.includes(oldExportRestore)) {
  code = code.replace(oldExportRestore, newExportRestore);
  changes++;
  console.log('Fix3: exportPNG restore includes _isGuideLine');
} else {
  console.log('Fix3: Pattern not found');
}

fs.writeFileSync(file, code, 'utf8');
console.log('\nTotal changes: ' + changes);
