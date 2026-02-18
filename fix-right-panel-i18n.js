const fs = require('fs');
const f = 'src/components/editor/panel-editor.tsx';
let src = fs.readFileSync(f, 'utf8');
src = src.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
let changes = 0;

const replacements = [
  // Tab labels
  ["{ key: 'templates', label: '\uD83C\uDFA8 Templates' }", "{ key: 'templates', label: '\uD83C\uDFA8 ' + t('tab.templates') }"],
  ["{ key: 'copy', label: '\u270F\uFE0F Copy' }", "{ key: 'copy', label: '\u270F\uFE0F ' + t('tab.copy') }"],
  ["{ key: 'review', label: '\u2705 Review' }", "{ key: 'review', label: '\u2705 ' + t('tab.review') }"],
  ["{ key: 'layers', label: '\uD83D\uDCD0 Layers' }", "{ key: 'layers', label: '\uD83D\uDCD0 ' + t('tab.layers') }"],
  ["{ key: 'history', label: '\u23F1 History' }", "{ key: 'history', label: '\u23F1 ' + t('tab.history') }"],

  // Templates tab
  ["Applying...</span>", "{t('right.applying')}</span>"],
  ["Click to apply", "{t('right.clickToApply')}"],
  ["\uD83E\uDD16 AI Image (Reference)</p>", "\uD83E\uDD16 {t('right.aiImage')}</p>"],
  ['placeholder="Describe a concept... e.g. \'luxury chocolate box, gold foil on dark background\'"', 'placeholder={t("right.aiPlaceholder")}'],
  ["'Generating...' : 'Generate AI Image'", "t('right.generating') : t('right.generateAI')"],
  ["+ Add to Canvas", "{t('right.addToCanvas')}"],

  // Copy tab
  ["Product Name</label>", "{t('right.productName')}</label>"],
  ['placeholder="e.g. Premium Dark Chocolate 72% Cacao"', 'placeholder={t("right.productPlaceholder")}'],
  ["Brand Name</label>", "{t('right.brandName')}</label>"],
  ['placeholder="e.g. ChocoVerde"', 'placeholder={t("right.brandPlaceholder")}'],
  ["'Generating...' : '\u270F\uFE0F Generate Copy'", "t('right.generating') : '\u270F\uFE0F ' + t('right.generateCopy')"],
  [">Headline</p>", ">{t('right.headline')}</p>"],
  [">Slogan</p>", ">{t('right.slogan')}</p>"],
  [">Description</p>", ">{t('right.description')}</p>"],
  [">Features</p>", ">{t('right.features')}</p>"],
  [">Back Panel Copy</p>", ">{t('right.backPanel')}</p>"],
  [">+ Add</button>", ">{t('right.add')}</button>"],

  // Review tab
  ["AI will analyze your current canvas design for print quality, layout issues, and packaging best practices.", "{t('right.reviewDesc')}"],
  ["'Analyzing...' : '\u2705 Review My Design'", "t('right.analyzing') : '\u2705 ' + t('right.reviewBtn')"],
  ["? 'Excellent!' :", "? t('right.excellent') :"],
  ["? 'Good' :", "? t('right.good') :"],
  ["? 'Needs Improvement' : 'Review Required'", "? t('right.needsImprovement') : t('right.reviewRequired')"],
  [">Issues Found</p>", ">{t('right.issuesFound')}</p>"],

  // Layers tab
  [">▲ Forward</button>", ">{t('right.forward')}</button>"],
  [">▼ Backward</button>", ">{t('right.backward')}</button>"],
  [">\u2B06 Top</button>", ">{t('right.top')}</button>"],
  [">\u2B07 Bottom</button>", ">{t('right.bottom')}</button>"],
  ['title="Bring Forward"', 'title={t("right.forward")}'],
  ['title="Send Backward"', 'title={t("right.backward")}'],
  ['title="Bring to Front"', 'title={t("right.top")}'],
  ['title="Send to Back"', 'title={t("right.bottom")}'],
  ['title="Toggle visibility"', 'title={t("right.toggleVisibility")}'],
  ['title="Toggle lock"', 'title={t("right.toggleLock")}'],
  [">No objects on canvas</p>", ">{t('right.noObjects')}</p>"],

  // History tab
  ["states)</p>", "{t('right.states')})</p>"],
  [">Current: {historyIdx + 1}</span>", ">{t('right.current')}: {historyIdx + 1}</span>"],
  [">No history yet</p>", ">{t('right.noHistory')}</p>"],

  // Clipboard alert
  ["'No image in clipboard. Copy an image first (right-click image > Copy Image, or Win+Shift+S)'", "t('right.noClipboard')"],
];

replacements.forEach(([old, nw], i) => {
  if (src.includes(old)) {
    src = src.replaceAll(old, nw);
    changes++;
  } else {
    console.log('SKIP ' + i + ': ' + old.substring(0, 50));
  }
});

// Also fix Objects label
const objLabel = "Objects ({layersList.length})";
if (src.includes(objLabel)) {
  src = src.replace(objLabel, "{t('right.objects')} ({layersList.length})");
  changes++;
}

// History label
const histLabel = "History ({historyThumbs.length}";
if (src.includes(histLabel)) {
  src = src.replace(histLabel, "{t('tab.history')} ({historyThumbs.length}");
  changes++;
}

src = src.replace(/\n/g, '\r\n');
fs.writeFileSync(f, src, 'utf8');

// Update locale files
const keys = {
  "tab.templates": ["Templates", "\uD15C\uD50C\uB9BF", "\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8"],
  "tab.copy": ["Copy", "\uCE74\uD53C", "\u30B3\u30D4\u30FC"],
  "tab.review": ["Review", "\uB9AC\uBDF0", "\u30EC\u30D3\u30E5\u30FC"],
  "tab.layers": ["Layers", "\uB808\uC774\uC5B4", "\u30EC\u30A4\u30E4\u30FC"],
  "tab.history": ["History", "\uD788\uC2A4\uD1A0\uB9AC", "\u5C65\u6B74"],
  "right.applying": ["Applying...", "\uC801\uC6A9 \uC911...", "\u9069\u7528\u4E2D..."],
  "right.clickToApply": ["Click to apply", "\uD074\uB9AD\uD558\uC5EC \uC801\uC6A9", "\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u9069\u7528"],
  "right.aiImage": ["AI Image (Reference)", "AI \uC774\uBBF8\uC9C0 (\uCC38\uACE0\uC6A9)", "AI\u753B\u50CF (\u53C2\u8003)"],
  "right.aiPlaceholder": ["Describe a concept... e.g. 'luxury chocolate box, gold foil on dark background'", "\uCEE8\uC149\uC744 \uC124\uBA85\uD558\uC138\uC694... \uC608: '\uACE0\uAE09 \uCD08\uCF5C\uB9BF \uBC15\uC2A4, \uC5B4\uB450\uC6B4 \uBC30\uACBD\uC5D0 \uAE08\uBC15'", "\u30B3\u30F3\u30BB\u30D7\u30C8\u3092\u8AAC\u660E... \u4F8B: '\u9AD8\u7D1A\u30C1\u30E7\u30B3\u30EC\u30FC\u30C8\u30DC\u30C3\u30AF\u30B9\u3001\u6697\u3044\u80CC\u666F\u306B\u91D1\u7B94'"],
  "right.generating": ["Generating...", "\uC0DD\uC131 \uC911...", "\u751F\u6210\u4E2D..."],
  "right.generateAI": ["Generate AI Image", "AI \uC774\uBBF8\uC9C0 \uC0DD\uC131", "AI\u753B\u50CF\u3092\u751F\u6210"],
  "right.addToCanvas": ["+ Add to Canvas", "+ \uCE94\uBC84\uC2A4\uC5D0 \uCD94\uAC00", "+ \u30AD\u30E3\u30F3\u30D0\u30B9\u306B\u8FFD\u52A0"],
  "right.productName": ["Product Name", "\uC81C\uD488\uBA85", "\u88FD\u54C1\u540D"],
  "right.productPlaceholder": ["e.g. Premium Dark Chocolate 72% Cacao", "\uC608: \uD504\uB9AC\uBBF8\uC5C4 \uB2E4\uD06C \uCD08\uCF5C\uB9BF 72% \uCE74\uCE74\uC624", "\u4F8B: \u30D7\u30EC\u30DF\u30A2\u30E0\u30C0\u30FC\u30AF\u30C1\u30E7\u30B3\u30EC\u30FC\u30C8 72%\u30AB\u30AB\u30AA"],
  "right.brandName": ["Brand Name", "\uBE0C\uB79C\uB4DC\uBA85", "\u30D6\u30E9\u30F3\u30C9\u540D"],
  "right.brandPlaceholder": ["e.g. ChocoVerde", "\uC608: \uCD08\uCF54\uBCA0\uB974\uB370", "\u4F8B: ChocoVerde"],
  "right.generateCopy": ["Generate Copy", "\uCE74\uD53C \uC0DD\uC131", "\u30B3\u30D4\u30FC\u3092\u751F\u6210"],
  "right.headline": ["Headline", "\uD5E4\uB4DC\uB77C\uC778", "\u30D8\u30C3\u30C9\u30E9\u30A4\u30F3"],
  "right.slogan": ["Slogan", "\uC2AC\uB85C\uAC74", "\u30B9\u30ED\u30FC\u30AC\u30F3"],
  "right.description": ["Description", "\uC124\uBA85", "\u8AAC\u660E"],
  "right.features": ["Features", "\uD2B9\uC9D5", "\u7279\u5FB4"],
  "right.backPanel": ["Back Panel Copy", "\uB4B7\uBA74 \uCE74\uD53C", "\u80CC\u9762\u30B3\u30D4\u30FC"],
  "right.add": ["+ Add", "+ \uCD94\uAC00", "+ \u8FFD\u52A0"],
  "right.reviewDesc": ["AI will analyze your current canvas design for print quality, layout issues, and packaging best practices.", "AI\uAC00 \uD604\uC7AC \uCE94\uBC84\uC2A4 \uB514\uC790\uC778\uC758 \uC778\uC1C4 \uD488\uC9C8, \uB808\uC774\uC544\uC6C3 \uBB38\uC81C, \uD328\uD0A4\uC9C0 \uBAA8\uBC94 \uC0AC\uB840\uB97C \uBD84\uC11D\uD569\uB2C8\uB2E4.", "AI\u304C\u73FE\u5728\u306E\u30AD\u30E3\u30F3\u30D0\u30B9\u30C7\u30B6\u30A4\u30F3\u306E\u5370\u5237\u54C1\u8CEA\u3001\u30EC\u30A4\u30A2\u30A6\u30C8\u554F\u984C\u3001\u30D1\u30C3\u30B1\u30FC\u30B8\u30F3\u30B0\u306E\u30D9\u30B9\u30C8\u30D7\u30E9\u30AF\u30C6\u30A3\u30B9\u3092\u5206\u6790\u3057\u307E\u3059\u3002"],
  "right.analyzing": ["Analyzing...", "\uBD84\uC11D \uC911...", "\u5206\u6790\u4E2D..."],
  "right.reviewBtn": ["Review My Design", "\uB0B4 \uB514\uC790\uC778 \uB9AC\uBDF0", "\u30C7\u30B6\u30A4\u30F3\u3092\u30EC\u30D3\u30E5\u30FC"],
  "right.excellent": ["Excellent!", "\uD6CC\uB96D\uD574\uC694!", "\u512A\u79C0\uFF01"],
  "right.good": ["Good", "\uC88B\uC74C", "\u826F\u3044"],
  "right.needsImprovement": ["Needs Improvement", "\uAC1C\uC120 \uD544\uC694", "\u6539\u5584\u304C\u5FC5\u8981"],
  "right.reviewRequired": ["Review Required", "\uAC80\uD1A0 \uD544\uC694", "\u30EC\u30D3\u30E5\u30FC\u304C\u5FC5\u8981"],
  "right.issuesFound": ["Issues Found", "\uBC1C\uACAC\uB41C \uBB38\uC81C", "\u554F\u984C\u304C\u898B\u3064\u304B\u308A\u307E\u3057\u305F"],
  "right.forward": ["▲ Forward", "▲ \uC55E\uC73C\uB85C", "▲ \u524D\u9762\u3078"],
  "right.backward": ["▼ Backward", "▼ \uB4A4\uB85C", "▼ \u80CC\u9762\u3078"],
  "right.top": ["⬆ Top", "⬆ \uB9E8 \uC55E", "⬆ \u6700\u524D\u9762"],
  "right.bottom": ["⬇ Bottom", "⬇ \uB9E8 \uB4A4", "⬇ \u6700\u80CC\u9762"],
  "right.toggleVisibility": ["Toggle visibility", "\uD45C\uC2DC/\uC228\uAE40", "\u8868\u793A\u5207\u308A\u66FF\u3048"],
  "right.toggleLock": ["Toggle lock", "\uC7A0\uAE08/\uD574\uC81C", "\u30ED\u30C3\u30AF\u5207\u308A\u66FF\u3048"],
  "right.noObjects": ["No objects on canvas", "\uCE94\uBC84\uC2A4\uC5D0 \uAC1D\uCCB4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4", "\u30AD\u30E3\u30F3\u30D0\u30B9\u306B\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u304C\u3042\u308A\u307E\u305B\u3093"],
  "right.objects": ["Objects", "\uAC1D\uCCB4", "\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8"],
  "right.states": ["states", "\uC0C1\uD0DC", "\u72B6\u614B"],
  "right.current": ["Current", "\uD604\uC7AC", "\u73FE\u5728"],
  "right.noHistory": ["No history yet", "\uD788\uC2A4\uD1A0\uB9AC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4", "\u5C65\u6B74\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093"],
  "right.noClipboard": ["No image in clipboard. Copy an image first (right-click image > Copy Image, or Win+Shift+S)", "\uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uC774\uBBF8\uC9C0\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uBA3C\uC800 \uC774\uBBF8\uC9C0\uB97C \uBCF5\uC0AC\uD558\uC138\uC694.", "\u30AF\u30EA\u30C3\u30D7\u30DC\u30FC\u30C9\u306B\u753B\u50CF\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u5148\u306B\u753B\u50CF\u3092\u30B3\u30D4\u30FC\u3057\u3066\u304F\u3060\u3055\u3044\u3002"]
};

const locales = ['src/locales/en.json', 'src/locales/ko.json', 'src/locales/ja.json'];
locales.forEach((lf, li) => {
  let obj = JSON.parse(fs.readFileSync(lf, 'utf8'));
  let added = 0;
  Object.entries(keys).forEach(([k, vals]) => {
    obj[k] = vals[li];
    added++;
  });
  fs.writeFileSync(lf, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  console.log('[Locale] ' + lf + ': updated ' + added + ' keys');
});

console.log('Total changes: ' + changes);
