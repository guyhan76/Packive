const fs = require('fs');
const f = 'src/app/editor/design/page.tsx';
let src = fs.readFileSync(f, 'utf8');
src = src.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
let changes = 0;

// Step 1: Add useI18n import
if (!src.includes('useI18n')) {
  src = src.replace(
    'import React, { useState, useCallback, useMemo, Suspense } from "react";',
    'import React, { useState, useCallback, useMemo, Suspense } from "react";\nimport { useI18n } from "@/lib/i18n";'
  );
  changes++;
  console.log('[1] Added useI18n import');
}

// Step 2: Add const { t } = useI18n() after router declaration
if (!src.includes('const { t } = useI18n()') && !src.includes('const {t} = useI18n()')) {
  const routerLine = 'const router = useRouter();';
  if (src.includes(routerLine)) {
    src = src.replace(routerLine, routerLine + '\n  const { t } = useI18n();');
    changes++;
    console.log('[2] Added const { t } = useI18n()');
  }
}

// Step 3: Translate panelConfig names and guides
const panelNames = [
  ['"Front (Main)"', 't("panel.front")'],
  ['"Left Side"', 't("panel.left")'],
  ['"Back"', 't("panel.back")'],
  ['"Right Side"', 't("panel.right")'],
  ['"Top Lid"', 't("panel.topLid")'],
  ['"Top Tuck Flap"', 't("panel.topTuck")'],
  ['"Top Dust Flap (L)"', 't("panel.topDustL")'],
  ['"Top Dust Flap (R)"', 't("panel.topDustR")'],
  ['"Bottom Flap (Front)"', 't("panel.bottomFlapFront")'],
  ['"Bottom Flap (Back)"', 't("panel.bottomFlapBack")'],
  ['"Bottom Dust (L)"', 't("panel.bottomDustL")'],
  ['"Bottom Dust (R)"', 't("panel.bottomDustR")'],
  ['"Glue Flap"', 't("panel.glueFlap")'],
];
const panelGuides = [
  ['"Main branding, logo, product name"', 't("guide.front")'],
  ['"Ingredients, certifications"', 't("guide.left")'],
  ['"Barcode, manufacturer info"', 't("guide.back")'],
  ['"Nutrition facts, usage"', 't("guide.right")'],
  ['"Lid surface - visible when closed"', 't("guide.topLid")'],
  ['"Folds inside - subtle branding"', 't("guide.topTuck")'],
  ['"Usually hidden"', 't("guide.dust")'],
  ['"Snap lock - folds first"', 't("guide.bottomFront")'],
  ['"Snap lock - folds second"', 't("guide.bottomBack")'],
  ['"Side tuck"', 't("guide.sideTuck")'],
  ['"Adhesive area"', 't("guide.glue")'],
];

[...panelNames, ...panelGuides].forEach(([old, nw]) => {
  // Only replace within panelConfig block
  const configStart = src.indexOf('const panelConfig');
  const configEnd = src.indexOf('}), [L, W, D,');
  if (configStart > -1 && configEnd > -1) {
    const before = src.substring(0, configStart);
    let block = src.substring(configStart, configEnd + 50);
    const after = src.substring(configStart + block.length);
    if (block.includes(old)) {
      block = block.replace(old, nw);
      src = before + block + after;
      changes++;
    }
  }
});

// Step 4: Overview page UI strings
const uiReplacements = [
  // Header
  ['                Back\n              </button>', '                {t("ov.back")}\n              </button>'],
  ['>Package Design Editor</h1>', '>{t("ov.title")}</h1>'],
  ['Save Project', '{t("ov.saveProject")}'],
  ['Load Project', '{t("ov.loadProject")}'],
  ['title="Save entire project"', 'title={t("ov.saveProject")}'],
  ['title="Load project file"', 'title={t("ov.loadProject")}'],
  // Section headers
  ['>Die-Cut Template (Reference)</h3>', '>{t("ov.diecutRef")}</h3>'],
  ['>No preview</div>', '>{t("ov.noPreview")}</div>'],
  ['>Design Preview - Full Net Layout</h3>', '>{t("ov.designPreview")}</h3>'],
  ['>Main Body - 4 sides</h3>', '>{t("ov.mainBody")}</h3>'],
  ['>Top - Lid, Tuck Flap, Dust Flaps</h3>', '>{t("ov.topSection")}</h3>'],
  ['>Top Lid is visible when closed. Tuck flap folds inside.</p>', '>{t("ov.topDesc")}</p>'],
  ['>Bottom Flaps and Glue Flap</h3>', '>{t("ov.bottomSection")}</h3>'],
  ['>Bottom flaps form snap-lock base. Glue flap is adhesive area.</p>', '>{t("ov.bottomDesc")}</p>'],
  // Progress steps
  ['{ label: "Die-Cut", done: true, partial: false }', '{ label: t("ov.stepDieCut"), done: true, partial: false }'],
  ['{ label: "Body (" + bodyDesigned + "/4)"', '{ label: t("ov.stepBody") + " (" + bodyDesigned + "/4)"'],
  ['{ label: "Top (" + topDesigned + "/4)"', '{ label: t("ov.stepTop") + " (" + topDesigned + "/4)"'],
  ['{ label: "Bottom (" + bottomDesigned + "/5)"', '{ label: t("ov.stepBottom") + " (" + bottomDesigned + "/5)"'],
  ['{ label: "Export", done: false, partial: false }', '{ label: t("ov.stepExport"), done: false, partial: false }'],
  // Action button
  ['? "Start Designing" : totalDesigned < 13 ? "Continue" : "Review and Export"', '? t("ov.startDesigning") : totalDesigned < 13 ? t("ov.continue") : t("ov.reviewExport")'],
  // Export modal
  ['>Export Design</h2>', '>{t("ov.exportDesign")}</h2>'],
  ['>Full Net PNG</span>', '>{t("ov.fullNetPng")}</span>'],
  ['>High-res net layout image</span>', '>{t("ov.fullNetDesc")}</span>'],
  ['>Print-Ready PDF</span>', '>{t("ov.printPdf")}</span>'],
  ['>Actual mm size for printing</span>', '>{t("ov.printPdfDesc")}</span>'],
  ['>Individual Panels</span>', '>{t("ov.individualPanels")}</span>'],
  ['>3D Screenshot</span>', '>{t("ov.screenshot3d")}</span>'],
  ['>3D preview as PNG image</span>', '>{t("ov.screenshot3dDesc")}</span>'],
  ['>Close</button>', '>{t("ov.close")}</button>'],
  ['>Exporting...</span>', '>{t("ov.exporting")}</span>'],
  // Copy modal
  ['>Copy Design</h3>', '>{t("ov.copyDesign")}</h3>'],
  // Export button
  ['>\n                Export\n              </button>', '>\n                {t("ov.export")}\n              </button>'],
  // Dimension labels
  ['>Tuck: {tuckH}mm</span>', '>{t("ov.tuck")}: {tuckH}mm</span>'],
  ['>Glue: {glueW}mm</span>', '>{t("ov.glue")}: {glueW}mm</span>'],
  ['>Dust: {dustH}mm</span>', '>{t("ov.dust")}: {dustH}mm</span>'],
  ['>Bottom: {bottomH}mm</span>', '>{t("ov.bottom")}: {bottomH}mm</span>'],
  ['>Paper: {T}mm</span>', '>{t("ov.paper")}: {T}mm</span>'],
  ['>Material: {matLabel}</span>', '>{t("ov.material")}: {matLabel}</span>'],
  // No designed panels alert
  ['"No designed panels"', 't("ov.noDesigned")'],
  // Loading text
  ['>Loading 3D...</p>', '>{t("ov.loading3d")}</p>'],
];

uiReplacements.forEach(([old, nw], i) => {
  if (src.includes(old)) {
    src = src.replace(old, nw);
    changes++;
  } else {
    console.log('SKIP UI ' + i + ': ' + old.substring(0, 50));
  }
});

src = src.replace(/\n/g, '\r\n');
fs.writeFileSync(f, src, 'utf8');

// Update locale files
const keys = {
  "panel.front": ["Front (Main)", "\uC804\uBA74 (\uBA54\uC778)", "\u524D\u9762 (\u30E1\u30A4\u30F3)"],
  "panel.left": ["Left Side", "\uC88C\uCE21\uBA74", "\u5DE6\u5074\u9762"],
  "panel.back": ["Back", "\uD6C4\uBA74", "\u80CC\u9762"],
  "panel.right": ["Right Side", "\uC6B0\uCE21\uBA74", "\u53F3\u5074\u9762"],
  "panel.topLid": ["Top Lid", "\uC0C1\uB2E8 \uB49C\uAEBB", "\u4E0A\u84CB"],
  "panel.topTuck": ["Top Tuck Flap", "\uC0C1\uB2E8 \uD139 \uD50C\uB7A9", "\u4E0A\u90E8\u30BF\u30C3\u30AF\u30D5\u30E9\u30C3\u30D7"],
  "panel.topDustL": ["Top Dust Flap (L)", "\uC0C1\uB2E8 \uB354\uC2A4\uD2B8 \uD50C\uB7A9 (\uC88C)", "\u4E0A\u90E8\u30C0\u30B9\u30C8\u30D5\u30E9\u30C3\u30D7 (L)"],
  "panel.topDustR": ["Top Dust Flap (R)", "\uC0C1\uB2E8 \uB354\uC2A4\uD2B8 \uD50C\uB7A9 (\uC6B0)", "\u4E0A\u90E8\u30C0\u30B9\u30C8\u30D5\u30E9\u30C3\u30D7 (R)"],
  "panel.bottomFlapFront": ["Bottom Flap (Front)", "\uD558\uB2E8 \uD50C\uB7A9 (\uC804\uBA74)", "\u4E0B\u90E8\u30D5\u30E9\u30C3\u30D7 (\u524D)"],
  "panel.bottomFlapBack": ["Bottom Flap (Back)", "\uD558\uB2E8 \uD50C\uB7A9 (\uD6C4\uBA74)", "\u4E0B\u90E8\u30D5\u30E9\u30C3\u30D7 (\u5F8C)"],
  "panel.bottomDustL": ["Bottom Dust (L)", "\uD558\uB2E8 \uB354\uC2A4\uD2B8 (\uC88C)", "\u4E0B\u90E8\u30C0\u30B9\u30C8 (L)"],
  "panel.bottomDustR": ["Bottom Dust (R)", "\uD558\uB2E8 \uB354\uC2A4\uD2B8 (\uC6B0)", "\u4E0B\u90E8\u30C0\u30B9\u30C8 (R)"],
  "panel.glueFlap": ["Glue Flap", "\uC811\uCC29 \uD50C\uB7A9", "\u63A5\u7740\u30D5\u30E9\u30C3\u30D7"],
  "guide.front": ["Main branding, logo, product name", "\uBA54\uC778 \uBE0C\uB79C\uB529, \uB85C\uACE0, \uC81C\uD488\uBA85", "\u30E1\u30A4\u30F3\u30D6\u30E9\u30F3\u30C7\u30A3\u30F3\u30B0\u3001\u30ED\u30B4\u3001\u88FD\u54C1\u540D"],
  "guide.left": ["Ingredients, certifications", "\uC131\uBD84, \uC778\uC99D", "\u539F\u6750\u6599\u3001\u8A8D\u8A3C"],
  "guide.back": ["Barcode, manufacturer info", "\uBC14\uCF54\uB4DC, \uC81C\uC870\uC0AC \uC815\uBCF4", "\u30D0\u30FC\u30B3\u30FC\u30C9\u3001\u88FD\u9020\u5143\u60C5\u5831"],
  "guide.right": ["Nutrition facts, usage", "\uC601\uC591 \uC815\uBCF4, \uC0AC\uC6A9\uBC95", "\u6804\u990A\u6210\u5206\u3001\u4F7F\u7528\u6CD5"],
  "guide.topLid": ["Lid surface - visible when closed", "\uB49C\uAEBB \uD45C\uBA74 - \uB2EB\uD78C \uC0C1\uD0DC\uC5D0\uC11C \uBCF4\uC784", "\u84CB\u8868\u9762 - \u9589\u3058\u305F\u6642\u306B\u898B\u3048\u308B"],
  "guide.topTuck": ["Folds inside - subtle branding", "\uB0B4\uBD80\uB85C \uC811\uD798 - \uC740\uC740\uD55C \uBE0C\uB79C\uB529", "\u5185\u5074\u306B\u6298\u308A\u8FBC\u307F - \u3055\u308A\u3052\u306A\u30D6\u30E9\u30F3\u30C7\u30A3\u30F3\u30B0"],
  "guide.dust": ["Usually hidden", "\uBCF4\uD1B5 \uC228\uACA8\uC9D0", "\u901A\u5E38\u96A0\u308C\u308B"],
  "guide.bottomFront": ["Snap lock - folds first", "\uC2A4\uB0C5 \uB77D - \uBA3C\uC800 \uC811\uD798", "\u30B9\u30CA\u30C3\u30D7\u30ED\u30C3\u30AF - \u6700\u521D\u306B\u6298\u308B"],
  "guide.bottomBack": ["Snap lock - folds second", "\uC2A4\uB0C5 \uB77D - \uB098\uC911\uC5D0 \uC811\uD798", "\u30B9\u30CA\u30C3\u30D7\u30ED\u30C3\u30AF - 2\u756A\u76EE\u306B\u6298\u308B"],
  "guide.sideTuck": ["Side tuck", "\uCE21\uBA74 \uD139", "\u30B5\u30A4\u30C9\u30BF\u30C3\u30AF"],
  "guide.glue": ["Adhesive area", "\uC811\uCC29 \uC601\uC5ED", "\u63A5\u7740\u30A8\u30EA\u30A2"],
  "ov.back": ["Back", "\uB4A4\uB85C", "\u623B\u308B"],
  "ov.title": ["Package Design Editor", "\uD328\uD0A4\uC9C0 \uB514\uC790\uC778 \uC5D0\uB514\uD130", "\u30D1\u30C3\u30B1\u30FC\u30B8\u30C7\u30B6\u30A4\u30F3\u30A8\u30C7\u30A3\u30BF"],
  "ov.saveProject": ["Save Project", "\uD504\uB85C\uC81D\uD2B8 \uC800\uC7A5", "\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u4FDD\u5B58"],
  "ov.loadProject": ["Load Project", "\uD504\uB85C\uC81D\uD2B8 \uBD88\uB7EC\uC624\uAE30", "\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u8AAD\u307F\u8FBC\u307F"],
  "ov.export": ["Export", "\uB0B4\uBCF4\uB0B4\uAE30", "\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8"],
  "ov.diecutRef": ["Die-Cut Template (Reference)", "\uCE7C\uC120 \uD15C\uD50C\uB9BF (\uCC38\uACE0\uC6A9)", "\u30C0\u30A4\u30AB\u30C3\u30C8\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8 (\u53C2\u8003)"],
  "ov.noPreview": ["No preview", "\uBBF8\uB9AC\uBCF4\uAE30 \uC5C6\uC74C", "\u30D7\u30EC\u30D3\u30E5\u30FC\u306A\u3057"],
  "ov.designPreview": ["Design Preview - Full Net Layout", "\uB514\uC790\uC778 \uBBF8\uB9AC\uBCF4\uAE30 - \uC804\uAC1C\uB3C4 \uB808\uC774\uC544\uC6C3", "\u30C7\u30B6\u30A4\u30F3\u30D7\u30EC\u30D3\u30E5\u30FC - \u5168\u5C55\u958B\u56F3\u30EC\u30A4\u30A2\u30A6\u30C8"],
  "ov.mainBody": ["Main Body - 4 sides", "\uBCF8\uCCB4 - 4\uBA74", "\u672C\u4F53 - 4\u9762"],
  "ov.topSection": ["Top - Lid, Tuck Flap, Dust Flaps", "\uC0C1\uB2E8 - \uB49C\uAEBB, \uD139 \uD50C\uB7A9, \uB354\uC2A4\uD2B8 \uD50C\uB7A9", "\u4E0A\u90E8 - \u84CB\u3001\u30BF\u30C3\u30AF\u30D5\u30E9\u30C3\u30D7\u3001\u30C0\u30B9\u30C8\u30D5\u30E9\u30C3\u30D7"],
  "ov.topDesc": ["Top Lid is visible when closed. Tuck flap folds inside.", "\uC0C1\uB2E8 \uB49C\uAEBB\uC740 \uB2EB\uD78C \uC0C1\uD0DC\uC5D0\uC11C \uBCF4\uC785\uB2C8\uB2E4. \uD139 \uD50C\uB7A9\uC740 \uB0B4\uBD80\uB85C \uC811\uD799\uB2C8\uB2E4.", "\u4E0A\u84CB\u306F\u9589\u3058\u305F\u6642\u306B\u898B\u3048\u307E\u3059\u3002\u30BF\u30C3\u30AF\u30D5\u30E9\u30C3\u30D7\u306F\u5185\u5074\u306B\u6298\u308A\u8FBC\u307F\u307E\u3059\u3002"],
  "ov.bottomSection": ["Bottom Flaps and Glue Flap", "\uD558\uB2E8 \uD50C\uB7A9 \uBC0F \uC811\uCC29 \uD50C\uB7A9", "\u4E0B\u90E8\u30D5\u30E9\u30C3\u30D7\u3068\u63A5\u7740\u30D5\u30E9\u30C3\u30D7"],
  "ov.bottomDesc": ["Bottom flaps form snap-lock base. Glue flap is adhesive area.", "\uD558\uB2E8 \uD50C\uB7A9\uC740 \uC2A4\uB0C5 \uB77D \uBC14\uB2E5\uC744 \uD615\uC131\uD569\uB2C8\uB2E4. \uC811\uCC29 \uD50C\uB7A9\uC740 \uC811\uCC29 \uC601\uC5ED\uC785\uB2C8\uB2E4.", "\u4E0B\u90E8\u30D5\u30E9\u30C3\u30D7\u306F\u30B9\u30CA\u30C3\u30D7\u30ED\u30C3\u30AF\u5E95\u3092\u5F62\u6210\u3057\u307E\u3059\u3002\u63A5\u7740\u30D5\u30E9\u30C3\u30D7\u306F\u63A5\u7740\u30A8\u30EA\u30A2\u3067\u3059\u3002"],
  "ov.stepDieCut": ["Die-Cut", "\uCE7C\uC120", "\u30C0\u30A4\u30AB\u30C3\u30C8"],
  "ov.stepBody": ["Body", "\uBCF8\uCCB4", "\u672C\u4F53"],
  "ov.stepTop": ["Top", "\uC0C1\uB2E8", "\u4E0A\u90E8"],
  "ov.stepBottom": ["Bottom", "\uD558\uB2E8", "\u4E0B\u90E8"],
  "ov.stepExport": ["Export", "\uB0B4\uBCF4\uB0B4\uAE30", "\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8"],
  "ov.startDesigning": ["Start Designing", "\uB514\uC790\uC778 \uC2DC\uC791", "\u30C7\u30B6\u30A4\u30F3\u3092\u59CB\u3081\u308B"],
  "ov.continue": ["Continue", "\uACC4\uC18D", "\u7D9A\u3051\u308B"],
  "ov.reviewExport": ["Review and Export", "\uAC80\uD1A0 \uBC0F \uB0B4\uBCF4\uB0B4\uAE30", "\u30EC\u30D3\u30E5\u30FC\u3068\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8"],
  "ov.exportDesign": ["Export Design", "\uB514\uC790\uC778 \uB0B4\uBCF4\uB0B4\uAE30", "\u30C7\u30B6\u30A4\u30F3\u3092\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8"],
  "ov.fullNetPng": ["Full Net PNG", "\uC804\uAC1C\uB3C4 PNG", "\u5168\u5C55\u958B\u56F3 PNG"],
  "ov.fullNetDesc": ["High-res net layout image", "\uACE0\uD574\uC0C1\uB3C4 \uC804\uAC1C\uB3C4 \uC774\uBBF8\uC9C0", "\u9AD8\u89E3\u50CF\u5EA6\u5C55\u958B\u56F3\u753B\u50CF"],
  "ov.printPdf": ["Print-Ready PDF", "\uC778\uC1C4\uC6A9 PDF", "\u5370\u5237\u7528 PDF"],
  "ov.printPdfDesc": ["Actual mm size for printing", "\uC2E4\uC81C mm \uD06C\uAE30 \uC778\uC1C4\uC6A9", "\u5B9F\u969B\u306Emm\u30B5\u30A4\u30BA\u5370\u5237\u7528"],
  "ov.individualPanels": ["Individual Panels", "\uAC1C\uBCC4 \uD328\uB110", "\u500B\u5225\u30D1\u30CD\u30EB"],
  "ov.screenshot3d": ["3D Screenshot", "3D \uC2A4\uD06C\uB9B0\uC0F7", "3D\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8"],
  "ov.screenshot3dDesc": ["3D preview as PNG image", "3D \uBBF8\uB9AC\uBCF4\uAE30 PNG \uC774\uBBF8\uC9C0", "3D\u30D7\u30EC\u30D3\u30E5\u30FC PNG\u753B\u50CF"],
  "ov.close": ["Close", "\uB2EB\uAE30", "\u9589\u3058\u308B"],
  "ov.exporting": ["Exporting...", "\uB0B4\uBCF4\uB0B4\uB294 \uC911...", "\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u4E2D..."],
  "ov.copyDesign": ["Copy Design", "\uB514\uC790\uC778 \uBCF5\uC0AC", "\u30C7\u30B6\u30A4\u30F3\u3092\u30B3\u30D4\u30FC"],
  "ov.tuck": ["Tuck", "\uD139", "\u30BF\u30C3\u30AF"],
  "ov.glue": ["Glue", "\uC811\uCC29", "\u63A5\u7740"],
  "ov.dust": ["Dust", "\uB354\uC2A4\uD2B8", "\u30C0\u30B9\u30C8"],
  "ov.bottom": ["Bottom", "\uD558\uB2E8", "\u4E0B\u90E8"],
  "ov.paper": ["Paper", "\uC885\uC774", "\u7D19"],
  "ov.material": ["Material", "\uC18C\uC7AC", "\u7D20\u6750"],
  "ov.noDesigned": ["No designed panels", "\uB514\uC790\uC778\uB41C \uD328\uB110\uC774 \uC5C6\uC2B5\uB2C8\uB2E4", "\u30C7\u30B6\u30A4\u30F3\u3055\u308C\u305F\u30D1\u30CD\u30EB\u304C\u3042\u308A\u307E\u305B\u3093"],
  "ov.loading3d": ["Loading 3D...", "3D \uB85C\uB529 \uC911...", "3D\u8AAD\u307F\u8FBC\u307F\u4E2D..."],
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
