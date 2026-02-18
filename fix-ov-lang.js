const fs = require('fs');
const f = 'src/app/editor/design/page.tsx';
let src = fs.readFileSync(f, 'utf8');
src = src.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
let changes = 0;

// Step 1: Add LanguageSelector import
if (!src.includes('LanguageSelector')) {
  src = src.replace(
    'import { useI18n } from "@/lib/i18n";',
    'import { useI18n } from "@/lib/i18n";\nimport { LanguageSelector } from "@/components/editor/language-selector";'
  );
  changes++;
  console.log('[1] Added LanguageSelector import');
}

// Step 2: Add LanguageSelector to header (before Save Project button)
const saveBtn = '              <button\n                onClick={saveProject}';
if (src.includes(saveBtn) && !src.includes('<LanguageSelector />')) {
  src = src.replace(saveBtn, '              <LanguageSelector />\n' + saveBtn);
  changes++;
  console.log('[2] Added LanguageSelector to header');
}

src = src.replace(/\n/g, '\r\n');
fs.writeFileSync(f, src, 'utf8');
console.log('Total changes: ' + changes);
