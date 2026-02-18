const fs = require('fs');
let totalChanges = 0;
function readFile(f) { return fs.readFileSync(f, 'utf8'); }
function writeFile(f, s) { fs.writeFileSync(f, s, 'utf8'); }

// ── 1) Header: fix button text + add LanguageSelector ──
(function() {
  const f = 'src/components/layout/header.tsx';
  let s = readFile(f);
  // Fix button text
  if (s.includes('>\\n            Get Early Access\\n          </Button>') || s.includes('>\n            Get Early Access\n          </Button>')) {
    s = s.replace(/>\s*Get Early Access\s*<\/Button>/g, '>\n            {t("m.getEarlyAccess")}\n          </Button>');
    totalChanges++;
    console.log('[header] Fixed Get Early Access button');
  }
  // Add LanguageSelector before Button
  if (!s.includes('<LanguageSelector')) {
    s = s.replace(
      '<Button\n            size="sm"',
      '<LanguageSelector />\n          <Button\n            size="sm"'
    );
    totalChanges++;
    console.log('[header] Added LanguageSelector');
  }
  writeFile(f, s);
})();

// ── 2) Hero: replace all remaining hard-coded strings ──
(function() {
  const f = 'src/components/marketing/hero.tsx';
  let s = readFile(f);

  // Main headline
  s = s.replace(
    /Design Your Packaging\{" "\}\s*\n\s*<span className="bg-gradient-to-r from-\[#2563EB\] to-\[#7C3AED\] bg-clip-text text-transparent">\s*\n\s*in Minutes\s*\n\s*<\/span>\s*\n\s*, Not Weeks/,
    '{t("m.hero.title1")}{" "}\n            <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">\n              {t("m.hero.title2")}\n            </span>\n            {t("m.hero.title3")}'
  );
  if (s.includes('t("m.hero.title1")')) { totalChanges++; console.log('[hero] Fixed headline'); }

  // Subtitle paragraph
  s = s.replace(
    /Packive auto-generates die-cut templates, lets you design on top,\s*\n\s*preview in 3D, and export print-ready files\. No Illustrator needed\./,
    '{t("m.hero.subtitle")}'
  );
  if (s.includes('{t("m.hero.subtitle")}')) { totalChanges++; console.log('[hero] Fixed subtitle'); }

  // AI tagline
  s = s.replace(
    'Now with AI-Powered Design — describe your vision and let AI create it.',
    '{t("m.hero.aiTag")}'
  );
  totalChanges++; console.log('[hero] Fixed AI tagline');

  // CTA buttons
  const heroReplacements = [
    ['>\n              Get Early Access — Free\n', '>\n              {t("m.hero.ctaFree")}\n'],
    ['Get Early Access — Free\n              <ArrowRight', '{t("m.hero.ctaFree")}\n              <ArrowRight'],
    ['Try Die-Cut Generator', '{t("m.hero.ctaGenerator")}'],
    ['Watch Demo', '{t("m.hero.ctaDemo")}'],
  ];
  heroReplacements.forEach(([from, to]) => {
    if (s.includes(from)) {
      s = s.replace(from, to);
      totalChanges++;
      console.log('[hero] ' + from.trim().substring(0, 40));
    }
  });

  // Icon grid labels
  const iconReplacements = [
    ['label: "Choose Box Style"', 'label: t("m.hero.step1")'],
    ['label: "Auto Die-Cut"', 'label: t("m.hero.step2")'],
    ['label: "3D Preview"', 'label: t("m.hero.step3")'],
    ['label: "Print-Ready Export"', 'label: t("m.hero.step4")'],
  ];
  iconReplacements.forEach(([from, to]) => {
    if (s.includes(from)) {
      s = s.replace(from, to);
      totalChanges++;
      console.log('[hero] ' + from);
    }
  });

  writeFile(f, s);
})();

// ── 3) Update locale files with new hero keys ──
const newKeys = {
  "m.hero.title1": ["Design Your Packaging", "패키지를 디자인하세요", "パッケージをデザイン"],
  "m.hero.title2": ["in Minutes", "몇 분 만에", "数分で"],
  "m.hero.title3": [", Not Weeks", ", 몇 주가 아닌", "、数週間ではなく"],
  "m.hero.subtitle": ["Packive auto-generates die-cut templates, lets you design on top, preview in 3D, and export print-ready files. No Illustrator needed.", "Packive가 칼선 템플릿을 자동 생성하고, 그 위에 디자인하고, 3D로 미리보고, 인쇄용 파일로 내보낼 수 있습니다. 일러스트레이터가 필요 없습니다.", "Packiveがダイカットテンプレートを自動生成し、その上にデザインし、3Dでプレビューし、印刷用ファイルとしてエクスポートできます。Illustrator不要。"],
  "m.hero.aiTag": ["Now with AI-Powered Design — describe your vision and let AI create it.", "AI 디자인 기능 탑재 — 비전을 설명하면 AI가 만들어 드립니다.", "AIデザイン機能搭載 — ビジョンを説明すればAIが作成します。"],
};

['src/locales/en.json', 'src/locales/ko.json', 'src/locales/ja.json'].forEach((f, li) => {
  const json = JSON.parse(readFile(f));
  let count = 0;
  Object.entries(newKeys).forEach(([key, vals]) => {
    json[key] = vals[li];
    count++;
  });
  writeFile(f, JSON.stringify(json, null, 2) + '\n');
  console.log('[Locale] ' + f + ': updated ' + count + ' keys');
  totalChanges++;
});

console.log('Total changes: ' + totalChanges);
