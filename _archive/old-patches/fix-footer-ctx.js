const fs = require('fs');

// Fix 1: Update shortcut.footer in locale files
const locales = [
  ['src/locales/en.json', 'Press shortcut key anytime to toggle this panel'],
  ['src/locales/ko.json', '\uC5B8\uC81C\uB4E0 \uB2E8\uCD95\uD0A4\uB97C \uB20C\uB7EC \uC774 \uD328\uB110\uC744 \uD1A0\uAE00\uD558\uC138\uC694'],
  ['src/locales/ja.json', '\u3044\u3064\u3067\u3082\u30B7\u30E7\u30FC\u30C8\u30AB\u30C3\u30C8\u30AD\u30FC\u3092\u62BC\u3057\u3066\u30D1\u30CD\u30EB\u3092\u5207\u308A\u66FF\u3048']
];
let changes = 0;
locales.forEach(([lf, val]) => {
  let obj = JSON.parse(fs.readFileSync(lf, 'utf8'));
  obj['shortcut.footer'] = val;
  fs.writeFileSync(lf, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  changes++;
  console.log('[Fix 1] Updated footer in ' + lf);
});

// Fix 2: Remove the ? badge from footer HTML and just use t("shortcut.footer")
const f = 'src/components/editor/panel-editor.tsx';
let src = fs.readFileSync(f, 'utf8');
src = src.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// The footer might still have the old HTML with <span> for ?
// Check what's there now
const oldFooter1 = '{t("shortcut.footer")}';
if (src.includes(oldFooter1)) {
  // Already using t(), but we need to check if there's still a <span>?</span> around it
  console.log('[Fix 2] Footer already uses t("shortcut.footer")');
  // Check if the parent p tag has extra elements
  const footerLine = src.split('\n').find(l => l.includes('shortcut.footer'));
  if (footerLine) {
    console.log('  Current line: ' + footerLine.trim());
  }
} else {
  console.log('[Fix 2] SKIP - footer pattern not found');
}

src = src.replace(/\n/g, '\r\n');
fs.writeFileSync(f, src, 'utf8');

// Fix 3: Check context menu code
console.log('\n--- Context Menu Debug ---');
const lines = src.split('\r\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ctxMenu') && lines[i].includes('onMouseLeave')) {
    console.log('Context menu at line ' + (i+1));
  }
  if (lines[i].includes('contextmenu') || lines[i].includes('onContextMenu')) {
    console.log('contextmenu handler at line ' + (i+1) + ': ' + lines[i].trim().substring(0, 80));
  }
}

console.log('\nTotal changes: ' + changes);
