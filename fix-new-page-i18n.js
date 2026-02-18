const fs = require('fs');
let changes = 0;

// ===== File 1: src/app/editor/new/page.tsx =====
const f1 = 'src/app/editor/new/page.tsx';
let s1 = fs.readFileSync(f1, 'utf8').replace(/\r\n/g, '\n');

// Add useI18n import
if (!s1.includes('useI18n')) {
  s1 = s1.replace(
    "import { useState } from 'react'",
    "import { useState } from 'react'\nimport { useI18n, LanguageSelector } from '@/components/i18n-context'"
  );
  changes++;
  console.log('[1] Added useI18n import to new/page.tsx');
}

// Add const { t } inside component
if (!s1.includes('const { t } = useI18n()')) {
  s1 = s1.replace(
    "const [selectedBoxType, setSelectedBoxType]",
    "const { t } = useI18n()\n  const [selectedBoxType, setSelectedBoxType]"
  );
  changes++;
  console.log('[2] Added useI18n hook');
}

// Header translations
const newPageReplacements = [
  ['<span className="text-sm">Back</span>', '<span className="text-sm">{t("new.back")}</span>'],
  ['Packive \u2014 Die-Cut Generator', '{t("new.title")}'],
  ['Powered by FEFCO/ECMA Standards', '{t("new.powered")}'],
  ['Start Designing', '{t("new.startDesigning")}'],
  ['Design each panel of your package', '{t("new.designDesc")}'],
];

newPageReplacements.forEach(([old, nw]) => {
  if (s1.includes(old)) {
    s1 = s1.replace(old, nw);
    changes++;
  } else {
    console.log('SKIP new/page: ' + old.substring(0, 40));
  }
});

// Add LanguageSelector to header
if (!s1.includes('<LanguageSelector')) {
  const headerEnd = 'Powered by FEFCO/ECMA Standards';
  if (s1.includes('{t("new.powered")}')) {
    s1 = s1.replace(
      '<div className="ml-auto text-xs text-gray-400">\n          {t("new.powered")}\n        </div>',
      '<div className="ml-auto flex items-center gap-3">\n          <span className="text-xs text-gray-400">{t("new.powered")}</span>\n          <LanguageSelector />\n        </div>'
    );
    changes++;
    console.log('[3] Added LanguageSelector to header');
  }
}

s1 = s1.replace(/\n/g, '\r\n');
fs.writeFileSync(f1, s1, 'utf8');

// ===== File 2: src/components/editor/box-type-selector.tsx =====
const f2 = 'src/components/editor/box-type-selector.tsx';
let s2 = fs.readFileSync(f2, 'utf8').replace(/\r\n/g, '\n');

// Add useI18n
if (!s2.includes('useI18n')) {
  s2 = s2.replace(
    "'use client'",
    "'use client'\n\nimport { useI18n } from '@/components/i18n-context'"
  );
  changes++;
}

// Add nameJa to interface and data
if (!s2.includes('nameJa')) {
  s2 = s2.replace('nameKo: string', 'nameKo: string\n  nameJa: string\n  descKo: string\n  descJa: string');
  
  const boxUpdates = [
    ["nameKo: '\uB9DE\uB6F0\uAEBB \uC0C1\uC790',\n    description: 'Cosmetics, food, small products',", 
     "nameKo: '\uB9DE\uB6F0\uAEBB \uC0C1\uC790',\n    nameJa: '\u30BF\u30C3\u30AF\u30A8\u30F3\u30C9\u30DC\u30C3\u30AF\u30B9',\n    description: 'Cosmetics, food, small products',\n    descKo: '\uD654\uC7A5\uD488, \uC2DD\uD488, \uC18C\uD615 \uC81C\uD488',\n    descJa: '\u5316\u7CA7\u54C1\u3001\u98DF\u54C1\u3001\u5C0F\u578B\u88FD\u54C1',"],
    ["nameKo: '\uC77C\uBC18 \uC2AC\uB85C\uD2F0\uB4DC \uBC15\uC2A4',\n    description: 'Shipping, e-commerce',",
     "nameKo: '\uC77C\uBC18 \uC2AC\uB85C\uD2F0\uB4DC \uBC15\uC2A4',\n    nameJa: '\u30EC\u30AE\u30E5\u30E9\u30FC\u30B9\u30ED\u30C3\u30C8\u30DC\u30C3\u30AF\u30B9',\n    description: 'Shipping, e-commerce',\n    descKo: '\uBC30\uC1A1, \uC804\uC790\uC0C1\uAC70\uB798',\n    descJa: '\u914D\u9001\u3001EC',"],
    ["nameKo: '\uBC14\uB2E5 \uC7A0\uAE08 \uC0C1\uC790',\n    description: 'Heavy items, premium packaging',",
     "nameKo: '\uBC14\uB2E5 \uC7A0\uAE08 \uC0C1\uC790',\n    nameJa: '\u30AA\u30FC\u30C8\u30ED\u30C3\u30AF\u30DC\u30C8\u30E0',\n    description: 'Heavy items, premium packaging',\n    descKo: '\uBB34\uAC70\uC6B4 \uC81C\uD488, \uD504\uB9AC\uBBF8\uC5C4 \uD3EC\uC7A5',\n    descJa: '\u91CD\u91CF\u54C1\u3001\u30D7\u30EC\u30DF\u30A2\u30E0\u30D1\u30C3\u30B1\u30FC\u30B8',"],
    ["nameKo: '\uD154\uB808\uC2A4\uCF54\uD53D \uC0C1\uC790',\n    description: 'Lid and base separate',",
     "nameKo: '\uD154\uB808\uC2A4\uCF54\uD53D \uC0C1\uC790',\n    nameJa: '\u30C6\u30EC\u30B9\u30B3\u30FC\u30D7\u30DC\u30C3\u30AF\u30B9',\n    description: 'Lid and base separate',\n    descKo: '\uB49C\uAEBB\uACFC \uBC14\uB2E5 \uBD84\uB9AC\uD615',\n    descJa: '\u84CB\u3068\u5E95\u304C\u5225\u3005',"],
    ["nameKo: '\uD3F4\uB529\uCE74\uD1A4',\n    description: 'Retail, display packaging',",
     "nameKo: '\uD3F4\uB529\uCE74\uD1A4',\n    nameJa: '\u30D5\u30A9\u30FC\u30EB\u30C7\u30A3\u30F3\u30B0\u30AB\u30FC\u30C8\u30F3',\n    description: 'Retail, display packaging',\n    descKo: '\uB9AC\uD14C\uC77C, \uB514\uC2A4\uD50C\uB808\uC774 \uD3EC\uC7A5',\n    descJa: '\u5C0F\u58F2\u3001\u30C7\u30A3\u30B9\u30D7\u30EC\u30A4\u30D1\u30C3\u30B1\u30FC\u30B8',"],
  ];
  
  boxUpdates.forEach(([old, nw]) => {
    if (s2.includes(old)) {
      s2 = s2.replace(old, nw);
      changes++;
    }
  });
}

// Add useI18n to component and use translated names
if (!s2.includes('const { t, lang }')) {
  s2 = s2.replace(
    'export function BoxTypeSelector({ selectedType, onSelect }: BoxTypeSelectorProps) {',
    'export function BoxTypeSelector({ selectedType, onSelect }: BoxTypeSelectorProps) {\n  const { t, lang } = useI18n();'
  );
  changes++;
}

// Replace header text
if (s2.includes('1. Choose Box Style')) {
  s2 = s2.replace('1. Choose Box Style', '{t("new.chooseBox")}');
  changes++;
}

// Replace name display with language-aware
if (s2.includes('{box.name}</span>')) {
  s2 = s2.replace('{box.name}</span>', '{lang === "ko" ? box.nameKo : lang === "ja" ? box.nameJa : box.name}</span>');
  changes++;
}

// Replace description with language-aware
if (s2.includes('{box.description}</p>')) {
  s2 = s2.replace('{box.description}</p>', '{lang === "ko" ? box.descKo : lang === "ja" ? box.descJa : box.description}</p>');
  changes++;
}

// Replace Coming Soon
if (s2.includes('Coming Soon')) {
  s2 = s2.replace('Coming Soon', '{t("new.comingSoon")}');
  changes++;
}

s2 = s2.replace(/\n/g, '\r\n');
fs.writeFileSync(f2, s2, 'utf8');

// ===== File 3: src/components/editor/dimension-form.tsx =====
const f3 = 'src/components/editor/dimension-form.tsx';
let s3 = fs.readFileSync(f3, 'utf8').replace(/\r\n/g, '\n');

if (!s3.includes('useI18n')) {
  s3 = s3.replace(
    "'use client'",
    "'use client'\n\nimport { useI18n } from '@/components/i18n-context'"
  );
  changes++;
}

if (!s3.includes('const { t }')) {
  s3 = s3.replace(
    "const [length, setLength] = useState",
    "const { t } = useI18n()\n  const [length, setLength] = useState"
  );
  changes++;
}

const dimReplacements = [
  ['2. Set Dimensions (mm)', '{t("new.setDimensions")}'],
  ['>Length (L)</label>', '>{t("new.length")}</label>'],
  ['>Width (W)</label>', '>{t("new.width")}</label>'],
  ['>Depth (D)</label>', '>{t("new.depth")}</label>'],
  ['>Material</label>', '>{t("new.material")}</label>'],
  ['label="White Cardboard"', 'label={t("new.whiteCardboard")}'],
  ['label="Kraft Paperboard"', 'label={t("new.kraftPaperboard")}'],
  ['label="Corrugated - Single Flute (SW)"', 'label={t("new.singleFlute")}'],
  ['label="Corrugated - Double Flute (DW)"', 'label={t("new.doubleFlute")}'],
  ['>Paper thickness</span>', '>{t("new.paperThickness")}</span>'],
  ['>Glue flap</span>', '>{t("new.glueFlap")}</span>'],
  ['>Tuck length</span>', '>{t("new.tuckLength")}</span>'],
  ["'Generating...' : 'Generate Die-Cut'", "t('new.generating') : t('new.generateDieCut')"],
];

dimReplacements.forEach(([old, nw]) => {
  if (s3.includes(old)) {
    s3 = s3.replace(old, nw);
    changes++;
  } else {
    console.log('SKIP dim: ' + old.substring(0, 40));
  }
});

s3 = s3.replace(/\n/g, '\r\n');
fs.writeFileSync(f3, s3, 'utf8');

// ===== Locale files =====
const keys = {
  "new.back": ["\u2190 Back", "\u2190 \uB4A4\uB85C", "\u2190 \u623B\u308B"],
  "new.title": ["Packive \u2014 Die-Cut Generator", "Packive \u2014 \uCE7C\uC120 \uC0DD\uC131\uAE30", "Packive \u2014 \u30C0\u30A4\u30AB\u30C3\u30C8\u30B8\u30A7\u30CD\u30EC\u30FC\u30BF"],
  "new.powered": ["Powered by FEFCO/ECMA Standards", "FEFCO/ECMA \uD45C\uC900 \uAE30\uBC18", "FEFCO/ECMA\u898F\u683C\u6E96\u62E0"],
  "new.startDesigning": ["Start Designing", "\uB514\uC790\uC778 \uC2DC\uC791", "\u30C7\u30B6\u30A4\u30F3\u3092\u59CB\u3081\u308B"],
  "new.designDesc": ["Design each panel of your package", "\uD328\uD0A4\uC9C0\uC758 \uAC01 \uBA74\uC744 \uB514\uC790\uC778\uD558\uC138\uC694", "\u30D1\u30C3\u30B1\u30FC\u30B8\u306E\u5404\u9762\u3092\u30C7\u30B6\u30A4\u30F3"],
  "new.chooseBox": ["1. Choose Box Style", "1. \uBC15\uC2A4 \uC2A4\uD0C0\uC77C \uC120\uD0DD", "1. \u30DC\u30C3\u30AF\u30B9\u30B9\u30BF\u30A4\u30EB\u9078\u629E"],
  "new.comingSoon": ["Coming Soon", "\uCD9C\uC2DC \uC608\uC815", "\u8FD1\u65E5\u516C\u958B"],
  "new.setDimensions": ["2. Set Dimensions (mm)", "2. \uCE58\uC218 \uC124\uC815 (mm)", "2. \u5BF8\u6CD5\u8A2D\u5B9A (mm)"],
  "new.length": ["Length (L)", "\uAE38\uC774 (L)", "\u9577\u3055 (L)"],
  "new.width": ["Width (W)", "\uD3ED (W)", "\u5E45 (W)"],
  "new.depth": ["Depth (D)", "\uB192\uC774 (D)", "\u6DF1\u3055 (D)"],
  "new.material": ["Material", "\uC18C\uC7AC", "\u7D20\u6750"],
  "new.whiteCardboard": ["White Cardboard", "\uBC31\uC0C1\uC9C0", "\u767D\u677F\u7D19"],
  "new.kraftPaperboard": ["Kraft Paperboard", "\uD06C\uB798\uD504\uD2B8\uC9C0", "\u30AF\u30E9\u30D5\u30C8\u677F\u7D19"],
  "new.singleFlute": ["Corrugated - Single Flute (SW)", "\uACE8\uD310\uC9C0 - \uB2E8\uBA74 (SW)", "\u6BB5\u30DC\u30FC\u30EB - \u30B7\u30F3\u30B0\u30EB (SW)"],
  "new.doubleFlute": ["Corrugated - Double Flute (DW)", "\uACE8\uD310\uC9C0 - \uC591\uBA74 (DW)", "\u6BB5\u30DC\u30FC\u30EB - \u30C0\u30D6\u30EB (DW)"],
  "new.paperThickness": ["Paper thickness", "\uC885\uC774 \uB450\uAED8", "\u7D19\u306E\u539A\u3055"],
  "new.glueFlap": ["Glue flap", "\uC811\uCC29\uBA74", "\u7CCA\u4EE3"],
  "new.tuckLength": ["Tuck length", "\uAF42\uC774 \uAE38\uC774", "\u5DEE\u3057\u8FBC\u307F\u9577\u3055"],
  "new.generating": ["Generating...", "\uC0DD\uC131 \uC911...", "\u751F\u6210\u4E2D..."],
  "new.generateDieCut": ["Generate Die-Cut", "\uCE7C\uC120 \uC0DD\uC131", "\u30C0\u30A4\u30AB\u30C3\u30C8\u751F\u6210"],
};

const locales = ['src/locales/en.json', 'src/locales/ko.json', 'src/locales/ja.json'];
locales.forEach((lf, li) => {
  let obj = JSON.parse(fs.readFileSync(lf, 'utf8'));
  Object.entries(keys).forEach(([k, vals]) => { obj[k] = vals[li]; });
  fs.writeFileSync(lf, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  console.log('[Locale] ' + lf + ': ' + Object.keys(keys).length + ' keys');
});

console.log('Total changes: ' + changes);
