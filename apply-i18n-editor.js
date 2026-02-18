const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// Step 1: Add import for useI18n and LanguageSelector
const firstImport = code.indexOf("import ");
const firstImportEnd = code.indexOf('\n', firstImport);
code = code.substring(0, firstImportEnd + 1) + 
  'import { useI18n, LanguageSelector } from "@/components/i18n-context";\n' + 
  code.substring(firstImportEnd + 1);
changes++;
console.log('Step1: Added i18n import');

// Step 2: Add useI18n() hook in component
const hookPoint = "const [color, setColor] = useState('#000000');";
if (code.includes(hookPoint)) {
  code = code.replace(hookPoint, 'const { t } = useI18n();\n  ' + hookPoint);
  changes++;
  console.log('Step2: Added useI18n hook');
}

// Step 3: Add LanguageSelector in header (near the keyboard shortcut button)
const kbdButton = `title="Keyboard Shortcuts (?)">⌨</button>`;
if (code.includes(kbdButton)) {
  code = code.replace(kbdButton, kbdButton + '\n            <LanguageSelector />');
  changes++;
  console.log('Step3: Added LanguageSelector in header');
}

// Step 4: Replace section labels with t() calls
const replacements = [
  // Section headers
  ['+ Add Objects', '{t("addObjects")}'],
  ['>Shape<', '>{t("shape")}<'],
  ['>Image & Code<', '>{t("imageCode")}<'],
  ['>Color & Background<', '>{t("colorBg")}<'],
  ['>Properties<', '>{t("properties")}<'],
  ['>Tools<', '>{t("tools")}<'],
  
  // Tool buttons - using label prop
  ['label="Text"', 'label={t("text")}'],
  ['label="Curved"', 'label={t("curved")}'],
  ['label="Rect"', 'label={t("rect")}'],
  ['label="Circle"', 'label={t("circle")}'],
  ['label="Triangle"', 'label={t("triangle")}'],
  ['label="Line"', 'label={t("line")}'],
  ['label="Star"', 'label={t("star")}'],
  ['label="Arrow"', 'label={t("arrow")}'],
  ['label="Image"', 'label={t("image")}'],
  ['label="QR Code"', 'label={t("qrCode")}'],
  ['label="Barcode"', 'label={t("barcode")}'],
  ['label="Group"', 'label={t("group")}'],
  ['label="Ungroup"', 'label={t("ungroup")}'],
  ['label="Clone"', 'label={t("clone")}'],
  ['label="Delete"', 'label={t("delete")}'],
  ['label="Draw"', 'label={t("draw")}'],
  ['label="Measure"', 'label={t("measure")}'],
  
  // Property labels
  ['>Opacity<', '>{t("opacity")}<'],
  ['>Size<', '>{t("size")}<'],
  ['>Line Height<', '>{t("lineHeight")}<'],
  ['>Letter Spacing<', '>{t("letterSpacing")}<'],
  ['>Stroke Color<', '>{t("strokeColor")}<'],
  ['>Stroke Width<', '>{t("strokeWidth")}<'],
  ['>Image Filters<', '>{t("imageFilters")}<'],
  ['>Brightness<', '>{t("brightness")}<'],
  ['>Contrast<', '>{t("contrast")}<'],
  ['>Saturate<', '>{t("saturation")}<'],
  ['>Blur<', '>{t("blur")}<'],
  ['>Rotation<', '>{t("rotation")}<'],
  ['>Shadow<', '>{t("shadow")}<'],
  ['>Font<', '>{t("font")}<'],
  ['>Align<', '>{t("align")}<'],
  ['>Style<', '>{t("style")}<'],
  ['>Position<', '>{t("position")}<'],
  
  // Color & Background labels
  ['>Pick Color<', '>{t("pickColor")}<'],
  ['>BG Image<', '>{t("bgImage")}<'],
  ['>BG Color<', '>{t("bgColor")}<'],
  ['>BG Gradient<', '>{t("bgGradient")}<'],
  ['>BG Opacity<', '>{t("bgOpacity")}<'],
  ['>Select BG<', '>{t("selectBg")}<'],
  ['>From<', '>{t("from")}<'],
  ['>To<', '>{t("to")}<'],
  ['>Direction<', '>{t("direction")}<'],
  
  // Tools section
  ['>Clear Canvas<', '>{t("clearCanvas")}<'],
  ['>Undo<', '>{t("undo")}<'],
  ['>Redo<', '>{t("redo")}<'],
  ['>Pen Size<', '>{t("penSize")}<'],
  ['>Pen Color<', '>{t("penColor")}<'],
  ['>Eraser<', '>{t("eraser")}<'],
  
  // Buttons
  ['Upload Font', '{t("uploadFont")}'],
  
  // Header buttons
  ['Save &amp; Back', '{t("saveBack")}'],
  ['Export PNG', '{t("exportPng")}'],
  ['Export SVG', '{t("exportSvg")}'],
  ['Export PDF', '{t("exportPdf")}'],
];

for (const [oldText, newText] of replacements) {
  if (code.includes(oldText)) {
    // Only replace first occurrence for safety, or all if it's a label
    code = code.split(oldText).join(newText);
    changes++;
    console.log('Replaced: "' + oldText + '" -> "' + newText + '"');
  }
}

// Step 5: Replace Next/Prev buttons
const nextBtn = '>Next →<';
if (code.includes(nextBtn)) {
  code = code.replace(nextBtn, '>{t("next")} →<');
  changes++;
  console.log('Replaced Next button');
}
const prevBtn = '>← Prev<';
if (code.includes(prevBtn)) {
  code = code.replace(prevBtn, '>← {t("prev")}<');
  changes++;
  console.log('Replaced Prev button');
}

// Step 6: Shortcuts modal headers
const shortcutReplacements = [
  ['Keyboard Shortcuts', '{t("keyboardShortcuts")}'],
  ['GENERAL', '{t("general").toUpperCase()}'],
  ['EDIT', '{t("edit").toUpperCase()}'],
  ['MOVE OBJECT', '{t("moveObject").toUpperCase()}'],
  ['CLIPBOARD', '{t("clipboard").toUpperCase()}'],
  ['HELP', '{t("help").toUpperCase()}'],
];

// Be careful with shortcuts modal - these are inside specific JSX
for (const [oldText, newText] of shortcutReplacements) {
  if (code.includes('>' + oldText + '<')) {
    code = code.replace('>' + oldText + '<', '>' + newText + '<');
    changes++;
    console.log('Shortcut modal: "' + oldText + '" -> "' + newText + '"');
  }
}

fs.writeFileSync(file, code, 'utf8');
console.log('\nTotal changes: ' + changes);
