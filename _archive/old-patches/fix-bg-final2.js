const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// Remove all previous bgImg inject lines - they don't work due to index mismatch
const injectPattern = /\s*\/\/ bgImg inject:.*\n\s*\(\(\) => \{.*_isBgImage.*\}\)\(\);\n/g;
const count1 = (code.match(injectPattern) || []).length;
code = code.replace(injectPattern, '\n');
if (count1 > 0) {
  changes++;
  console.log('[cleanup] Removed ' + count1 + ' broken bgImg inject blocks');
}

// New strategy: Instead of trying to serialize _isBgImage through toJSON,
// we'll mark bg images with a VISIBLE property that Fabric DOES serialize:
// Use a custom 'name' property like '__bgImage__'
// Fabric serializes 'name' by default!

// 1. Change where _isBgImage is set to ALSO set name = '__bgImage__'
code = code.replace(
  '(img as any)._isBgImage = true;',
  `(img as any)._isBgImage = true;\n                  img.set('name', '__bgImage__');`
);
changes++;
console.log('[name] Added name=__bgImage__ when setting _isBgImage');

// 2. After every loadFromJSON, restore _isBgImage from name property
// Replace existing _isBgImage re-lock blocks with version that checks name too
const oldRelock1 = /if \(o\._isBgImage\) \{\s*\n\s*o\.set\(\{ selectable: false, evented: false \}\);\s*\n\s*const origTo.*\n\s*o\.toObject.*\n\s*\}/gs;
code = code.replace(oldRelock1, `if (o._isBgImage || o.name === '__bgImage__') {
                o._isBgImage = true;
                o.set({ selectable: false, evented: false });
              }`);
changes++;
console.log('[relock] Updated re-lock to check name property');

// 3. In all filter conditions that check _isBgImage, also check name
code = code.replace(
  /!o\._isBgImage(?!\s*&&\s*o\.name)/g,
  "!o._isBgImage && o.name !== '__bgImage__'"
);
changes++;
console.log('[filter] Updated filters to check name property');

// 4. In the pre-load filter for savedJSON (line ~1188), also check name
code = code.replace(
  'o.selectable === false && o.evented === false && !o._isBgImage',
  "o.selectable === false && o.evented === false && !o._isBgImage && o.name !== '__bgImage__'"
);
changes++;
console.log('[prefilter] Updated pre-filter to check name');

// 5. In the post-load cleanup (line ~1202), also check name  
code = code.replace(
  "o.selectable === false && o.evented === false && !o._isBgImage) { canvas.remove(o)",
  "o.selectable === false && o.evented === false && !o._isBgImage && o.name !== '__bgImage__') { canvas.remove(o)"
);
changes++;
console.log('[postfilter] Updated post-filter to check name');

// 6. After ALL loadFromJSON calls, add name-based _isBgImage restoration
// Find .loadFromJSON( and add restoration after the .then or await
const loadPattern = /await canvas\.loadFromJSON\(([^)]+)\);/g;
let match;
const insertions = [];
while ((match = loadPattern.exec(code)) !== null) {
  insertions.push(match.index + match[0].length);
}
// Insert in reverse order to preserve positions
for (let i = insertions.length - 1; i >= 0; i--) {
  const pos = insertions[i];
  const insertion = `\n            canvas.getObjects().forEach((o: any) => { if (o.name === '__bgImage__') { o._isBgImage = true; o.set({ selectable: false, evented: false }); } });`;
  code = code.slice(0, pos) + insertion + code.slice(pos);
  changes++;
  console.log('[loadRestore] Added name-based restore after loadFromJSON');
}

// 7. Also handle the .then() style loadFromJSON
const loadPattern2 = /canvas\.loadFromJSON\(JSON\.parse\([^)]+\)\)\.then\(\(\) => \{/g;
while ((match = loadPattern2.exec(code)) !== null) {
  const pos = match.index + match[0].length;
  const insertion = `\n              canvas.getObjects().forEach((o: any) => { if (o.name === '__bgImage__') { o._isBgImage = true; o.set({ selectable: false, evented: false }); } });`;
  code = code.slice(0, pos) + insertion + code.slice(pos);
  changes++;
  console.log('[loadRestore] Added name-based restore after .then loadFromJSON');
  // Reset regex since we modified the string
  loadPattern2.lastIndex = pos + insertion.length;
}

// 8. In getObjects filter for layers (line ~846), also exclude __bgImage__
code = code.replace(
  "o.selectable !== false && !o._isBgRect && !o._isSafeZone && !o._isGuideLine && !o._isGuideText && !o._isSizeLabel",
  "o.selectable !== false && !o._isBgRect && !o._isSafeZone && !o._isGuideLine && !o._isGuideText && !o._isSizeLabel && o.name !== '__bgImage__'"
);

fs.writeFileSync(file, code, 'utf8');
console.log('Total changes: ' + changes);
