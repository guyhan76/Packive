const fs = require("fs");

// ── 1. Add missing keys to locale files ──
const newKeys = {
  "tool.cropping": { en: "Cropping...", ko: "자르는 중...", ja: "切り抜き中..." },
  "tool.drawing": { en: "Drawing", ko: "그리는 중", ja: "描画中" },
  "tool.measureOn": { en: "ON", ko: "ON", ja: "ON" },
  "color.pickColorScreen": { en: "Pick Color from screen", ko: "화면에서 색상 추출", ja: "画面から色を抽出" },
  "color.pickColorBtn": { en: "Pick Color", ko: "색상 추출", ja: "色を抽出" },
  "filter.brightness": { en: "Bright", ko: "밝기", ja: "明るさ" },
  "filter.bw": { en: "B&W", ko: "흑백", ja: "白黒" },
  "filter.sepia": { en: "Sepia", ko: "세피아", ja: "セピア" },
  "filter.reset": { en: "Reset", ko: "초기화", ja: "リセット" },
  "shadow.on": { en: "Shadow ON", ko: "그림자 ON", ja: "シャドウ ON" },
  "shadow.off": { en: "Shadow OFF", ko: "그림자 OFF", ja: "シャドウ OFF" },
  "tool.clearCanvasConfirm": { en: "Clear canvas? This cannot be undone.", ko: "캔버스를 초기화하시겠습니까? 되돌릴 수 없습니다.", ja: "キャンバスをクリアしますか？元に戻せません。" },
};

const locales = ["en", "ko", "ja"];
locales.forEach(lang => {
  const path = `src/locales/${lang}.json`;
  const data = JSON.parse(fs.readFileSync(path, "utf8"));
  let added = 0;
  for (const [key, vals] of Object.entries(newKeys)) {
    if (!data[key]) {
      data[key] = vals[lang];
      added++;
    }
  }
  fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
  console.log(`[Locale] ${lang}.json: added ${added} keys, total ${Object.keys(data).length}`);
});

// ── 2. Patch panel-editor.tsx ──
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

function rep(from, to) {
  if (code.includes(from)) {
    code = code.split(from).join(to);
    changes++;
    console.log(`[Fix] ${from.substring(0,60).replace(/\n/g,' ')}`);
    return true;
  }
  console.log(`[MISS] ${from.substring(0,60).replace(/\n/g,' ')}`);
  return false;
}

// Crop label (conditional)
rep(
  'label={cropMode ? "Cropping..." : "Crop"}',
  'label={cropMode ? t("tool.cropping") : t("tool.crop")}'
);

// Draw label (conditional)
rep(
  'label={drawMode ? "Drawing" : "Draw"}',
  'label={drawMode ? t("tool.drawing") : t("tool.draw")}'
);

// Measure label (conditional)
rep(
  'label={measureMode ? "ON" : "Measure"}',
  'label={measureMode ? t("tool.measureOn") : t("tool.measure")}'
);

// Pick Color button text (with emoji)
rep(
  '🩸 Pick Color',
  '{`🩸 ${t("color.pickColorBtn")}`}'
);

// Pick Color title
rep(
  'title="Pick Color from screen"',
  'title={t("color.pickColorScreen")}'
);

// Upload BG Image (inline text)
rep(
  'Upload BG Image',
  '{t("bg.uploadImage")}'
);

// Remove BG Image (inline text)
rep(
  'Remove BG Image',
  '{t("bg.removeImage")}'
);

// Apply Gradient (inline text)
rep(
  'Apply Gradient',
  '{t("bg.applyGradient")}'
);

// Select BG (inline text)
rep(
  'Select BG',
  '{t("bg.selectBG")}'
);

// Bright label
rep(
  '>Bright<',
  '>{t("filter.brightness")}<'
);

// B&W button
rep(
  '>B&W<',
  '>{t("filter.bw")}<'
);

// Sepia button (the UI button, not the filter class)
// Be careful: only replace the button text, not F.filters.Sepia
rep(
  'rounded hover:bg-gray-200">Sepia<',
  'rounded hover:bg-gray-200">{t("filter.sepia")}<'
);

// Reset button
rep(
  'rounded hover:bg-red-100">Reset<',
  'rounded hover:bg-red-100">{t("filter.reset")}<'
);

// Shadow ON/OFF
rep(
  "{textShadowOn ? 'Shadow ON' : 'Shadow OFF'}",
  '{textShadowOn ? t("shadow.on") : t("shadow.off")}'
);

// Clear Canvas button text
rep(
  'Clear Canvas',
  '{t("tool.clearCanvas")}'
);

// Clear Canvas title
rep(
  'title="Clear Canvas"',
  'title={t("tool.clearCanvas")}'
);

// Clear canvas confirm dialog
rep(
  '"Clear canvas? This cannot be undone."',
  't("tool.clearCanvasConfirm")'
);

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);

// ── 3. Verify remaining ──
const remaining = [];
const patterns = [
  /Pick Color/,
  /Upload BG/,
  /Remove BG/,
  /Apply Gradient/,
  /Select BG/,
  /Clear Canvas/,
  /Shadow OFF/,
  /Shadow ON/,
  />Bright</,
  />B&W</,
  />Sepia</,
  />Reset</,
];
const lines = code.split("\n");
lines.forEach((line, i) => {
  for (const p of patterns) {
    if (p.test(line) && !line.includes('t("') && !line.includes("t('") && !line.includes("filters.")) {
      remaining.push(`Line ${i+1}: ${line.trim().substring(0, 80)}`);
      break;
    }
  }
});
if (remaining.length > 0) {
  console.log(`\n[Warning] Possibly still hardcoded (${remaining.length}):`);
  remaining.forEach(r => console.log(`  ${r}`));
} else {
  console.log("\n[OK] All target strings translated!");
}
