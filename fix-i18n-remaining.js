const fs = require("fs");

// ── 1. Add missing keys to locale files ──
const newKeys = {
  // Shape tooltips
  "shape.rectangle": { en: "Rectangle", ko: "직사각형", ja: "長方形" },
  "shape.roundedRect": { en: "Rounded Rect", ko: "둥근 사각형", ja: "角丸四角形" },
  "shape.circle": { en: "Circle", ko: "원", ja: "円" },
  "shape.ellipse": { en: "Ellipse", ko: "타원", ja: "楕円" },
  "shape.solid": { en: "Solid", ko: "실선", ja: "実線" },
  "shape.dashed": { en: "Dashed", ko: "점선", ja: "破線" },
  "shape.dotted": { en: "Dotted", ko: "도트", ja: "点線" },
  "shape.vertical": { en: "Vertical", ko: "세로선", ja: "縦線" },
  "shape.arrowRight": { en: "Arrow Right", ko: "오른쪽 화살표", ja: "右矢印" },
  "shape.arrowLeft": { en: "Arrow Left", ko: "왼쪽 화살표", ja: "左矢印" },
  "shape.arrowBoth": { en: "Arrow Both", ko: "양쪽 화살표", ja: "双方向矢印" },
  "shape.triangle": { en: "Triangle", ko: "삼각형", ja: "三角形" },
  "shape.right": { en: "Right Triangle", ko: "직각삼각형", ja: "直角三角形" },
  "shape.left": { en: "Left Triangle", ko: "좌삼각형", ja: "左三角形" },
  "shape.pentagon": { en: "Pentagon", ko: "오각형", ja: "五角形" },
  "shape.hexagon": { en: "Hexagon", ko: "육각형", ja: "六角形" },
  "shape.octagon": { en: "Octagon", ko: "팔각형", ja: "八角形" },
  "shape.diamond": { en: "Diamond", ko: "마름모", ja: "ひし形" },
  "shape.parallelogram": { en: "Parallelogram", ko: "평행사변형", ja: "平行四辺形" },
  "shape.trapezoid": { en: "Trapezoid", ko: "사다리꼴", ja: "台形" },
  "shape.star5": { en: "Star 5", ko: "별 5각", ja: "星5角" },
  "shape.star6": { en: "Star 6", ko: "별 6각", ja: "星6角" },
  "shape.badge": { en: "Badge", ko: "뱃지", ja: "バッジ" },
  "shape.semiCircle": { en: "Semi Circle", ko: "반원", ja: "半円" },
  "shape.arc": { en: "Arc", ko: "호", ja: "弧" },
  "shape.wave": { en: "Wave", ko: "물결", ja: "波" },
  "shape.fan": { en: "Fan", ko: "부채꼴", ja: "扇形" },
  "shape.spiral": { en: "Spiral", ko: "나선", ja: "螺旋" },
  // Other missing
  "tool.pathText": { en: "Path Text", ko: "패스 텍스트", ja: "パステキスト" },
  "shortcut.title.tooltip": { en: "Keyboard Shortcuts (?)", ko: "키보드 단축키 (?)", ja: "キーボードショートカット (?)" },
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

// Shape title replacements
const titleMap = {
  'title="Rectangle"': 'title={t("shape.rectangle")}',
  'title="Rounded Rect"': 'title={t("shape.roundedRect")}',
  'title="Circle"': 'title={t("shape.circle")}',
  'title="Ellipse"': 'title={t("shape.ellipse")}',
  'title="Solid"': 'title={t("shape.solid")}',
  'title="Dashed"': 'title={t("shape.dashed")}',
  'title="Dotted"': 'title={t("shape.dotted")}',
  'title="Vertical"': 'title={t("shape.vertical")}',
  'title="Arrow Right"': 'title={t("shape.arrowRight")}',
  'title="Arrow Left"': 'title={t("shape.arrowLeft")}',
  'title="Arrow Both"': 'title={t("shape.arrowBoth")}',
  'title="Triangle"': 'title={t("shape.triangle")}',
  'title="Right"': 'title={t("shape.right")}',
  'title="Left"': 'title={t("shape.left")}',
  'title="Pentagon"': 'title={t("shape.pentagon")}',
  'title="Hexagon"': 'title={t("shape.hexagon")}',
  'title="Octagon"': 'title={t("shape.octagon")}',
  'title="Diamond"': 'title={t("shape.diamond")}',
  'title="Parallelogram"': 'title={t("shape.parallelogram")}',
  'title="Trapezoid"': 'title={t("shape.trapezoid")}',
  'title="Star 5"': 'title={t("shape.star5")}',
  'title="Star 6"': 'title={t("shape.star6")}',
  'title="Badge"': 'title={t("shape.badge")}',
  'title="Semi Circle"': 'title={t("shape.semiCircle")}',
  'title="Arc"': 'title={t("shape.arc")}',
  'title="Wave"': 'title={t("shape.wave")}',
  'title="Fan"': 'title={t("shape.fan")}',
  'title="Spiral"': 'title={t("shape.spiral")}',
  'title="Keyboard Shortcuts (?)"': 'title={t("shortcut.title.tooltip")}',
};

for (const [from, to] of Object.entries(titleMap)) {
  if (code.includes(from)) {
    code = code.replace(from, to);
    changes++;
    console.log(`[Fix] ${from} → ${to}`);
  }
}

// Path Text label
const pathTextOld = 'label="Path Text"';
const pathTextNew = 'label={t("tool.pathText")}';
if (code.includes(pathTextOld)) {
  code = code.replace(pathTextOld, pathTextNew);
  changes++;
  console.log(`[Fix] ${pathTextOld} → ${pathTextNew}`);
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
