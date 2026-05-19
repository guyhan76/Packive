const fs = require('fs');
const f = 'src/app/editor/design/page.tsx';
let src = fs.readFileSync(f, 'utf8');
src = src.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
let changes = 0;

// Fix 1: Add t to panelConfig useMemo dependencies
const oldDeps = '}), [L, W, D, tuckH, dustH, glueW, bottomH, bottomDustH]);';
const newDeps = '}), [L, W, D, tuckH, dustH, glueW, bottomH, bottomDustH, t]);';
if (src.includes(oldDeps)) {
  src = src.replace(oldDeps, newDeps);
  changes++;
  console.log('[1] Added t to panelConfig useMemo deps');
}

// Fix 2: Translate "Click to design" in PanelCard
const oldClick = '>Click to design</span>';
if (src.includes(oldClick)) {
  // PanelCard is outside the main component, need to pass t or use useI18n
  // Easier: add useI18n inside PanelCard
  const oldPanelCard = 'function PanelCard({ idx, cfg, data, onClick, onCopy }: { idx: number; cfg: PanelConfig; data: PanelData; onClick: () => void; onCopy?: () => void }) {';
  const newPanelCard = 'function PanelCard({ idx, cfg, data, onClick, onCopy }: { idx: number; cfg: PanelConfig; data: PanelData; onClick: () => void; onCopy?: () => void }) {\n  const { t } = useI18n();';
  if (src.includes(oldPanelCard)) {
    src = src.replace(oldPanelCard, newPanelCard);
    changes++;
    console.log('[2a] Added useI18n to PanelCard');
  }
  src = src.replace(oldClick, '>{t("ov.clickToDesign")}</span>');
  changes++;
  console.log('[2b] Translated Click to design');
}

// Fix 3: Translate "Copy to..." in PanelCard
const oldCopy = '>Copy to...</span>';
if (src.includes('Copy to...')) {
  src = src.replace(/Copy to\.\.\./g, '{t("ov.copyTo")}');
  changes++;
  console.log('[3] Translated Copy to...');
}

// Fix 4: Add useI18n to SmallPanelCard (for future use)
const oldSmall = 'function SmallPanelCard({ cfg, data, onClick }: { cfg: PanelConfig; data: PanelData; onClick: () => void }) {';
const newSmall = 'function SmallPanelCard({ cfg, data, onClick }: { cfg: PanelConfig; data: PanelData; onClick: () => void }) {\n  const { t } = useI18n();';
if (src.includes(oldSmall)) {
  src = src.replace(oldSmall, newSmall);
  changes++;
  console.log('[4] Added useI18n to SmallPanelCard');
}

// Fix 5: useI18n import - check it includes useI18n
if (!src.includes('useI18n')) {
  console.log('[5] WARNING: useI18n not imported!');
}

src = src.replace(/\n/g, '\r\n');
fs.writeFileSync(f, src, 'utf8');

// Update locale files
const keys = {
  "ov.clickToDesign": ["Click to design", "\uD074\uB9AD\uD558\uC5EC \uB514\uC790\uC778", "\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u30C7\u30B6\u30A4\u30F3"],
  "ov.copyTo": ["Copy to...", "\uBCF5\uC0AC \uB300\uC0C1...", "\u30B3\u30D4\u30FC\u5148..."]
};
const locales = ['src/locales/en.json', 'src/locales/ko.json', 'src/locales/ja.json'];
locales.forEach((lf, li) => {
  let obj = JSON.parse(fs.readFileSync(lf, 'utf8'));
  Object.entries(keys).forEach(([k, vals]) => { obj[k] = vals[li]; });
  fs.writeFileSync(lf, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  console.log('[Locale] ' + lf);
});

console.log('Total changes: ' + changes);
