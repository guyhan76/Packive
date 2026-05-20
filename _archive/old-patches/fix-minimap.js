const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// ── Fix 1: Remove zoom >= 150 condition from minimap UI ──
// Allow manual toggle at any zoom level
const oldCondition = '{showMinimap && zoom >= 150 && (';
const newCondition = '{showMinimap && (';
if (code.includes(oldCondition)) {
  code = code.replace(oldCondition, newCondition);
  changes++;
  console.log("[1] Removed zoom >= 150 condition from minimap display");
}

// ── Fix 2: Zoom buttons should use applyZoom instead of setZoom ──
// Minus button
const zoomMinus = 'onClick={() => setZoom(z => Math.max(25, z - 25))}';
const zoomMinusFix = 'onClick={() => applyZoom(zoom - 25)}';
if (code.includes(zoomMinus)) {
  code = code.replace(zoomMinus, zoomMinusFix);
  changes++;
  console.log("[2] Fixed zoom minus button to use applyZoom");
}

// Reset button
const zoomReset = 'onClick={() => setZoom(100)}';
const zoomResetFix = 'onClick={() => applyZoom(100)}';
if (code.includes(zoomReset)) {
  code = code.replace(zoomReset, zoomResetFix);
  changes++;
  console.log("[3] Fixed zoom reset button to use applyZoom");
}

// Plus button
const zoomPlus = 'onClick={() => setZoom(z => Math.min(400, z + 25))}';
const zoomPlusFix = 'onClick={() => applyZoom(zoom + 25)}';
if (code.includes(zoomPlus)) {
  code = code.replace(zoomPlus, zoomPlusFix);
  changes++;
  console.log("[4] Fixed zoom plus button to use applyZoom");
}

// ── Fix 3: Auto-show at 150% but don't auto-hide on manual toggle ──
// Replace auto show/hide logic
const autoShowOld = `    // Auto show/hide minimap
    if (z >= 150) setShowMinimap(true);
    else setShowMinimap(false);`;
const autoShowNew = `    // Auto show minimap at 150%+ (don't auto-hide if manually toggled)
    if (z >= 150) setShowMinimap(true);`;
if (code.includes(autoShowOld)) {
  code = code.replace(autoShowOld, autoShowNew);
  changes++;
  console.log("[5] Fixed auto-show logic (no longer auto-hides)");
}

// ── Fix 4: Add Navigator label i18n ──
const navLabel = `<span className="text-[9px] font-medium text-gray-500">Navigator</span>`;
const navLabelI18n = `<span className="text-[9px] font-medium text-gray-500">{t("minimap.navigator")}</span>`;
if (code.includes(navLabel)) {
  code = code.replace(navLabel, navLabelI18n);
  changes++;
  console.log("[6] i18n Navigator label");
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);

// ── Add locale keys ──
const newKeys = {
  "minimap.navigator": { en: "Navigator", ko: "네비게이터", ja: "ナビゲーター" },
  "minimap.toggle": { en: "Toggle Minimap", ko: "미니맵 토글", ja: "ミニマップ切替" },
};
["en", "ko", "ja"].forEach(lang => {
  const path = `src/locales/${lang}.json`;
  const data = JSON.parse(fs.readFileSync(path, "utf8"));
  let added = 0;
  for (const [key, vals] of Object.entries(newKeys)) {
    if (!data[key]) { data[key] = vals[lang]; added++; }
  }
  fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
  if (added > 0) console.log(`[Locale] ${lang}.json: added ${added} keys`);
});
