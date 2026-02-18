const fs = require('fs');
let totalChanges = 0;

// ── 1) HowItWorks ──
(function() {
  const f = 'src/components/marketing/how-it-works.tsx';
  let s = fs.readFileSync(f, 'utf8');
  const sep = s.includes('\r\n') ? '\r\n' : '\n';

  // Remove old steps array (outside component)
  s = s.replace(/const steps = \[[\s\S]*?\];/m, '// steps moved inside component');
  
  // Replace section title and subtitle
  s = s.replace('>From idea to print-ready in 4 steps<', '>{t("m.hiw.title")}<');
  s = s.replace('>Packive handles the complex parts so you can focus on your brand<', '>{t("m.hiw.subtitle")}<');
  
  // Add steps array inside component, right after const { t } = useI18n();
  const stepsInside = `const { t } = useI18n();
  const steps = [
    { number: "01", icon: Package, title: t("m.hiw.s1.title"), description: t("m.hiw.s1.desc") },
    { number: "02", icon: Ruler, title: t("m.hiw.s2.title"), description: t("m.hiw.s2.desc") },
    { number: "03", icon: Palette, title: t("m.hiw.s3.title"), description: t("m.hiw.s3.desc") },
    { number: "04", icon: Download, title: t("m.hiw.s4.title"), description: t("m.hiw.s4.desc") },
  ];`;
  s = s.replace('const { t } = useI18n();', stepsInside);
  
  // Replace "STEP" prefix
  s = s.replace('STEP {step.number}', '{t("m.hiw.step")} {step.number}');
  
  fs.writeFileSync(f, s, 'utf8');
  totalChanges++;
  console.log('[how-it-works] Fixed: steps inside component + t() for all strings');
})();

// ── 2) Features ──
(function() {
  const f = 'src/components/marketing/features.tsx';
  let s = fs.readFileSync(f, 'utf8');

  // Remove old features array
  s = s.replace(/const features = \[[\s\S]*?\];/m, '// features moved inside component');

  // Replace section title and subtitle
  s = s.replace('>Everything you need for packaging design<', '>{t("m.feat.title")}<');
  s = s.replace('>From die-cut templates to print-ready files, all in one platform<', '>{t("m.feat.subtitle")}<');

  // Add features array inside component
  const featInside = `const { t } = useI18n();
  const features = [
    { icon: Layers, title: t("m.feat.f1.title"), description: t("m.feat.f1.desc") },
    { icon: Paintbrush, title: t("m.feat.f2.title"), description: t("m.feat.f2.desc") },
    { icon: Eye, title: t("m.feat.f3.title"), description: t("m.feat.f3.desc") },
    { icon: Download, title: t("m.feat.f4.title"), description: t("m.feat.f4.desc") },
    { icon: ShoppingCart, title: t("m.feat.f5.title"), description: t("m.feat.f5.desc"), badge: t("m.feat.comingSoon") },
    { icon: Sparkles, title: t("m.feat.f6.title"), description: t("m.feat.f6.desc"), badge: t("m.feat.comingSoon") },
  ];`;
  s = s.replace('const { t } = useI18n();', featInside);

  fs.writeFileSync(f, s, 'utf8');
  totalChanges++;
  console.log('[features] Fixed: features inside component + t() for all strings');
})();

// ── 3) PricingCards ──
(function() {
  const f = 'src/components/marketing/pricing-cards.tsx';
  let s = fs.readFileSync(f, 'utf8');

  // Remove old plans array
  s = s.replace(/const plans = \[[\s\S]*?\];/m, '// plans moved inside component');

  // Replace section title, subtitle, badge
  s = s.replace('>Simple, transparent pricing<', '>{t("m.price.title")}<');
  s = s.replace('>A fraction of the cost of a design agency. Cancel anytime.<', '>{t("m.price.subtitle")}<');
  s = s.replace('>Most Popular<', '>{t("m.price.popular")}<');

  // Add plans array inside component
  const plansInside = `const { t } = useI18n();
  const plans = [
    {
      name: t("m.price.free.name"), price: "$0", period: t("m.price.perMonth"),
      description: t("m.price.free.desc"),
      features: [t("m.price.free.f1"), t("m.price.free.f2"), t("m.price.free.f3"), t("m.price.free.f4")],
      cta: t("m.getEarlyAccess"), popular: false,
    },
    {
      name: t("m.price.starter.name"), price: "$29", period: t("m.price.perMonth"),
      description: t("m.price.starter.desc"),
      features: [t("m.price.starter.f1"), t("m.price.starter.f2"), t("m.price.starter.f3"), t("m.price.starter.f4"), t("m.price.starter.f5"), t("m.price.starter.f6")],
      cta: t("m.getEarlyAccess"), popular: true,
    },
    {
      name: t("m.price.pro.name"), price: "$99", period: t("m.price.perMonth"),
      description: t("m.price.pro.desc"),
      features: [t("m.price.pro.f1"), t("m.price.pro.f2"), t("m.price.pro.f3"), t("m.price.pro.f4"), t("m.price.pro.f5"), t("m.price.pro.f6"), t("m.price.pro.f7")],
      cta: t("m.getEarlyAccess"), popular: false,
    },
  ];`;
  s = s.replace('const { t } = useI18n();', plansInside);

  fs.writeFileSync(f, s, 'utf8');
  totalChanges++;
  console.log('[pricing] Fixed: plans inside component + t() for all strings');
})();

// ── 4) Footer ──
(function() {
  const f = 'src/components/marketing/footer.tsx';
  let s = fs.readFileSync(f, 'utf8');

  const footerReplacements = [
    ['>Package design, made alive.<', '>{t("m.foot.slogan")}<'],
    ['>Product<', '>{t("m.foot.product")}<'],
    ['>Features<', '>{t("m.features")}<'],
    ['>Pricing<', '>{t("m.pricing")}<'],
    ['>Early Access<', '>{t("m.getEarlyAccess")}<'],
    ['>Connect<', '>{t("m.foot.connect")}<'],
    ['>&copy; 2026 Packive. All rights reserved.<', '>{t("m.foot.copyright")}<'],
  ];
  footerReplacements.forEach(([from, to]) => {
    if (s.includes(from)) {
      s = s.replace(from, to);
      totalChanges++;
      console.log('[footer] ' + from.substring(0, 40));
    }
  });

  // Check if useI18n is imported and used
  if (!s.includes('useI18n')) {
    s = s.replace("import Link from \"next/link\"", "import Link from \"next/link\"\nimport { useI18n } from \"@/components/i18n-context\";");
  }
  if (!s.includes('const { t }')) {
    s = s.replace('export function Footer() {', 'export function Footer() {\n  const { t } = useI18n();');
  }

  fs.writeFileSync(f, s, 'utf8');
})();

// ── 5) EarlyAccessForm - check remaining strings ──
(function() {
  const f = 'src/components/marketing/early-access-form.tsx';
  let s = fs.readFileSync(f, 'utf8');

  const eaReplacements = [
    [">Be the first to design<br />", ">{t(\"m.ea.title1\")}<br />"],
    [">Work email *<", ">{t(\"m.ea.emailLabel\")}<"],
    [">Company / Brand name<", ">{t(\"m.ea.companyLabel\")}<"],
    [">What packaging do you need?<", ">{t(\"m.ea.needLabel\")}<"],
    [">No credit card required. We&apos;ll only email you about Packive launch updates.<", ">{t(\"m.ea.noCard\")}<"],
  ];
  eaReplacements.forEach(([from, to]) => {
    if (s.includes(from)) {
      s = s.replace(from, to);
      totalChanges++;
      console.log('[ea] ' + from.substring(0, 45));
    }
  });

  // Fix the subtitle paragraph that has dynamic content
  if (s.includes("Join {signupCount > 0 ?") && !s.includes('t("m.ea.joinPrefix")')) {
    // This is complex dynamic text - leave as is for now
    console.log('[ea] SKIP dynamic join text (complex interpolation)');
  }

  fs.writeFileSync(f, s, 'utf8');
})();

// ── 6) Add missing locale key ──
const newKeys = {
  "m.hiw.step": ["STEP", "단계", "ステップ"],
  "m.feat.subtitle": ["From die-cut templates to print-ready files, all in one platform", "칼선 템플릿에서 인쇄용 파일까지, 하나의 플랫폼에서", "ダイカットテンプレートから印刷用ファイルまで、一つのプラットフォームで"],
  "m.hiw.subtitle": ["Packive handles the complex parts so you can focus on your brand", "Packive가 복잡한 부분을 처리하여 브랜드에 집중할 수 있습니다", "Packiveが複雑な部分を処理し、ブランドに集中できます"],
};

['src/locales/en.json', 'src/locales/ko.json', 'src/locales/ja.json'].forEach((f, li) => {
  const json = JSON.parse(fs.readFileSync(f, 'utf8'));
  let count = 0;
  Object.entries(newKeys).forEach(([key, vals]) => {
    json[key] = vals[li];
    count++;
  });
  fs.writeFileSync(f, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log('[Locale] ' + f + ': updated ' + count + ' keys');
  totalChanges++;
});

console.log('Total changes: ' + totalChanges);
