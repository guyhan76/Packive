const fs = require('fs');
const f = 'src/app/editor/design/page.tsx';
let src = fs.readFileSync(f, 'utf8');
src = src.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// Remove separate useI18n import and combine into one
src = src.replace(
  'import { useI18n } from "@/lib/i18n";\nimport { LanguageSelector } from "@/components/i18n-context";',
  'import { useI18n, LanguageSelector } from "@/components/i18n-context";'
);

src = src.replace(/\n/g, '\r\n');
fs.writeFileSync(f, src, 'utf8');
console.log('Fixed: combined imports from i18n-context');
