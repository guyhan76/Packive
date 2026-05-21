const fs = require('fs');
const f = 'src/components/editor/panel-editor.tsx';
let src = fs.readFileSync(f, 'utf8');
src = src.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
let changes = 0;

// Step 1: Remove keyboard shortcut button from current position (between saveAndBack and saveDesignFile)
const oldShortcutBtn = '            <button onClick={() => setShowShortcuts(true)} className="px-2 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-bold transition-colors" title={t("shortcut.title.tooltip")}>\u2328</button>';

if (src.includes(oldShortcutBtn)) {
  src = src.replace(oldShortcutBtn + '\n', '');
  changes++;
  console.log('[Fix 1] Removed shortcut button from old position');
} else {
  console.log('[Fix 1] SKIP - shortcut button not found');
  // Debug
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('setShowShortcuts(true)')) {
      console.log('  Found at line ' + (i+1) + ': ' + JSON.stringify(lines[i]));
    }
  }
}

// Step 2: Insert shortcut button after LanguageSelector with clean tooltip
const langSelector = '            <LanguageSelector />';
const newShortcutBtn = langSelector + '\n          <button onClick={() => setShowShortcuts(true)} className="px-2 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-bold transition-colors" title={t("shortcut.title")}>\u2328</button>';

if (src.includes(langSelector) && !src.includes('setShowShortcuts(true)')) {
  // Button was removed in step 1, now add after LanguageSelector
  src = src.replace(langSelector, newShortcutBtn);
  changes++;
  console.log('[Fix 2] Inserted shortcut button after LanguageSelector');
} else if (src.includes(langSelector) && src.includes('setShowShortcuts(true)')) {
  console.log('[Fix 2] SKIP - button still exists, trying alternate approach');
}

// Step 3: Fix the i18n key - change "shortcut.title.tooltip" to "shortcut.title" 
// and ensure locale files have proper value without "(?)
const localeFiles = ['src/locales/en.json', 'src/locales/ko.json', 'src/locales/ja.json'];
const shortcutValues = {
  'src/locales/en.json': 'Keyboard Shortcuts',
  'src/locales/ko.json': '\uD0A4\uBCF4\uB4DC \uB2E8\uCD95\uD0A4',
  'src/locales/ja.json': '\u30AD\u30FC\u30DC\u30FC\u30C9\u30B7\u30E7\u30FC\u30C8\u30AB\u30C3\u30C8'
};

localeFiles.forEach(lf => {
  try {
    let lsrc = fs.readFileSync(lf, 'utf8');
    let lobj = JSON.parse(lsrc);
    // Add or update shortcut.title
    if (!lobj['shortcut.title'] || lobj['shortcut.title'].includes('(?)')) {
      lobj['shortcut.title'] = shortcutValues[lf];
      fs.writeFileSync(lf, JSON.stringify(lobj, null, 2) + '\n', 'utf8');
      changes++;
      console.log('[Fix 3] Updated shortcut.title in ' + lf);
    } else {
      console.log('[Fix 3] SKIP - ' + lf + ' already has clean shortcut.title');
    }
  } catch (e) {
    console.log('[Fix 3] ERROR reading ' + lf + ': ' + e.message);
  }
});

src = src.replace(/\n/g, '\r\n');
fs.writeFileSync(f, src, 'utf8');
console.log('Total changes: ' + changes);
