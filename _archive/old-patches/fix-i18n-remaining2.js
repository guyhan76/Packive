const fs = require("fs");

// ── 1. Add missing keys to locale files ──
const newKeys = {
  // Shape sub-headers
  "shape.basic": { en: "Basic", ko: "기본", ja: "基本" },
  "shape.lines": { en: "Lines", ko: "선", ja: "線" },
  "shape.triangles": { en: "Triangles", ko: "삼각형", ja: "三角形" },
  "shape.polygons": { en: "Polygons", ko: "다각형", ja: "多角形" },
  "shape.starsAndBadges": { en: "Stars & Badges", ko: "별 & 뱃지", ja: "星 & バッジ" },
  "shape.curvesAndArcs": { en: "Curves & Arcs", ko: "곡선 & 호", ja: "曲線 & 弧" },
  "shape.bubblesAndSpecial": { en: "Bubbles & Special", ko: "말풍선 & 특수", ja: "吹出し & 特殊" },
  // Image & Code section
  "tool.crop": { en: "Crop", ko: "자르기", ja: "切り抜き" },
  "tool.mask": { en: "Mask", ko: "마스크", ja: "マスク" },
  "tool.paste": { en: "Paste", ko: "붙여넣기", ja: "貼り付け" },
  // Color & Background section
  "color.color": { en: "Color", ko: "색상", ja: "色" },
  "color.pickColor": { en: "Pick Color", ko: "색상 선택", ja: "色を選択" },
  "bg.uploadImage": { en: "Upload BG Image", ko: "배경 이미지 업로드", ja: "背景画像アップロード" },
  "bg.removeImage": { en: "Remove BG Image", ko: "배경 이미지 제거", ja: "背景画像削除" },
  "bg.applyGradient": { en: "Apply Gradient", ko: "그라디언트 적용", ja: "グラデーション適用" },
  "bg.selectBG": { en: "Select BG", ko: "배경 선택", ja: "背景選択" },
  "bg.topToBottom": { en: "Top→Bottom", ko: "위→아래", ja: "上→下" },
  "bg.leftToRight": { en: "Left→Right", ko: "좌→우", ja: "左→右" },
  "bg.diagonalTLBR": { en: "TL→BR", ko: "좌상→우하", ja: "左上→右下" },
  "bg.diagonalTRBL": { en: "TR→BL", ko: "우상→좌하", ja: "右上→左下" },
  "bg.radial": { en: "Radial", ko: "원형", ja: "放射状" },
  // Tool section
  "tool.group": { en: "Group", ko: "그룹", ja: "グループ" },
  "tool.groupShort": { en: "G", ko: "G", ja: "G" },
  "tool.ungroupShort": { en: "UG", ko: "UG", ja: "UG" },
  "tool.draw": { en: "Draw", ko: "그리기", ja: "描画" },
  "tool.measure": { en: "Measure", ko: "측정", ja: "計測" },
  "tool.clearCanvas": { en: "Clear Canvas", ko: "캔버스 초기화", ja: "キャンバスクリア" },
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

function replaceAll(from, to) {
  if (code.includes(from)) {
    code = code.split(from).join(to);
    const count = code.split(to).length - 1;
    changes++;
    console.log(`[Fix] "${from.substring(0,50)}..." → translated`);
    return true;
  }
  return false;
}

// Shape sub-headers
const shapeHeaders = [
  ['>Basic<', '>{t("shape.basic")}<'],
  ['>Lines<', '>{t("shape.lines")}<'],
  ['>Triangles<', '>{t("shape.triangles")}<'],
  ['>Polygons<', '>{t("shape.polygons")}<'],
  ['>Stars & Badges<', '>{t("shape.starsAndBadges")}<'],
  ['>Curves & Arcs<', '>{t("shape.curvesAndArcs")}<'],
  ['>Bubbles & Special<', '>{t("shape.bubblesAndSpecial")}<'],
];
for (const [from, to] of shapeHeaders) {
  replaceAll(from, to);
}

// Image & Code tool labels
const toolLabels = [
  ['label="Crop"', 'label={t("tool.crop")}'],
  ['label="Mask"', 'label={t("tool.mask")}'],
  ['label="Paste"', 'label={t("tool.paste")}'],
  ['label="Draw"', 'label={t("tool.draw")}'],
  ['label="Measure"', 'label={t("tool.measure")}'],
];
for (const [from, to] of toolLabels) {
  replaceAll(from, to);
}

// Color section
replaceAll('>Color<', '>{t("color.color")}<');
replaceAll('>Pick Color<', '>{t("color.pickColor")}<');
// Handle Pick Color with emoji
replaceAll('>🔺 Pick Color<', '>{`🔺 ${t("color.pickColor")}`}<');

// Background buttons
replaceAll('>Upload BG Image<', '>{t("bg.uploadImage")}<');
replaceAll('>Remove BG Image<', '>{t("bg.removeImage")}<');
replaceAll('>Apply Gradient<', '>{t("bg.applyGradient")}<');
replaceAll('>Select BG<', '>{t("bg.selectBG")}<');

// Gradient direction options
replaceAll('>Top→Bottom<', '>{t("bg.topToBottom")}<');
replaceAll('>Top→Botto<', '>{t("bg.topToBottom")}<');
replaceAll('>Left→Right<', '>{t("bg.leftToRight")}<');
replaceAll('>TL→BR<', '>{t("bg.diagonalTLBR")}<');
replaceAll('>TR→BL<', '>{t("bg.diagonalTRBL")}<');
replaceAll('>Radial<', '>{t("bg.radial")}<');

// Tool section
replaceAll('>Group<', '>{t("tool.group")}<');
replaceAll('>Clear Canvas<', '>{t("tool.clearCanvas")}<');

// G / UG buttons (be careful with exact match)
// These are likely short labels inside buttons
const gButtonOld = '>G<';
const ugButtonOld = '>UG<';
// Only replace if they appear as standalone button text near Group context
// Let's find exact patterns
const gPatterns = code.match(/.{0,40}>G<.{0,20}/g);
if (gPatterns) {
  console.log("[Info] G button contexts:", gPatterns.map(p => p.trim()).join(" | "));
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);

// Verify remaining hardcoded strings
const remaining = [];
const lines = code.split("\n");
lines.forEach((line, i) => {
  // Check for English text in labels/titles that aren't wrapped in t()
  if (line.match(/label="[A-Z][a-z]/) && !line.includes("label={t(")) {
    remaining.push(`Line ${i+1}: ${line.trim().substring(0, 80)}`);
  }
  if (line.match(/title="[A-Z][a-z]/) && !line.includes("title={t(")) {
    remaining.push(`Line ${i+1}: ${line.trim().substring(0, 80)}`);
  }
});
if (remaining.length > 0) {
  console.log(`\n[Warning] Still hardcoded (${remaining.length}):`);
  remaining.forEach(r => console.log(`  ${r}`));
} else {
  console.log("\n[OK] No remaining hardcoded label/title strings found!");
}
