const fs = require('fs');
let totalChanges = 0;

// ── Helper ──
function readFile(f) { return fs.readFileSync(f, 'utf8'); }
function writeFile(f, s) { fs.writeFileSync(f, s, 'utf8'); }
function addImport(src, file) {
  if (src.includes('useI18n')) return src;
  // Add after last import
  const idx = src.lastIndexOf('import ');
  const nl = src.indexOf('\n', idx);
  src = src.slice(0, nl+1) + 'import { useI18n } from "@/components/i18n-context";\n' + src.slice(nl+1);
  totalChanges++;
  console.log('[' + file + '] Added useI18n import');
  return src;
}

// ── 1) Header ──
(function() {
  const f = 'src/components/layout/header.tsx';
  let s = readFile(f);
  s = addImport(s, 'header');
  // Add hook
  if (!s.includes('const { t }')) {
    s = s.replace('export function Header()', 'export function Header()');
    s = s.replace(/export function Header\(\)\s*\{/, 'export function Header() {\n  const { t } = useI18n();');
    totalChanges++;
    console.log('[header] Added useI18n hook');
  }
  // Replace strings
  const headerReplacements = [
    ['>Features<', '>{t("m.features")}<'],
    ['>How It Works<', '>{t("m.howItWorks")}<'],
    ['>Pricing<', '>{t("m.pricing")}<'],
    ['>Get Early Access<', '>{t("m.getEarlyAccess")}<'],
  ];
  headerReplacements.forEach(([from, to]) => {
    if (s.includes(from)) { s = s.replace(from, to); totalChanges++; console.log('[header] ' + from); }
  });
  writeFile(f, s);
})();

// ── 2) Hero ──
(function() {
  const f = 'src/components/marketing/hero.tsx';
  let s = readFile(f);
  s = addImport(s, 'hero');
  if (!s.includes('const { t }')) {
    s = s.replace(/export function Hero\(\)\s*\{/, 'export function Hero() {\n  const { t } = useI18n();');
    totalChanges++;
  }
  const heroReplacements = [
    ['Early Access Now Open', '{t("m.hero.badge")}'],
    ['>Package design,<br/>made simple.</', '>{t("m.hero.title1")}<br/>{t("m.hero.title2")}</'],
    ['>Design production‑ready packaging — die‑cut templates, 3D preview,<br/>and export — all in your browser. No design skills required.</', '>{t("m.hero.subtitle")}</'],
    ['>Get Early Access — Free</', '>{t("m.hero.ctaFree")}</'],
    ['>Try Die-Cut Generator</', '>{t("m.hero.ctaGenerator")}</'],
    ['>Watch Demo</', '>{t("m.hero.ctaDemo")}</'],
    ['>Choose Box Style</', '>{t("m.hero.step1")}</'],
    ['>Auto Die-Cut</', '>{t("m.hero.step2")}</'],
    ['>3D Preview</', '>{t("m.hero.step3")}</'],
    ['>Print-Ready Export</', '>{t("m.hero.step4")}</'],
  ];
  heroReplacements.forEach(([from, to]) => {
    if (s.includes(from)) { s = s.replace(from, to); totalChanges++; console.log('[hero] ' + from.substring(0,40)); }
  });
  writeFile(f, s);
})();

// ── 3) HowItWorks ──
(function() {
  const f = 'src/components/marketing/how-it-works.tsx';
  let s = readFile(f);
  s = addImport(s, 'how-it-works');
  if (!s.includes('const { t }')) {
    s = s.replace(/export function HowItWorks\(\)\s*\{/, 'export function HowItWorks() {\n  const { t } = useI18n();');
    totalChanges++;
  }
  // Section title
  if (s.includes('>How it works<')) { s = s.replace('>How it works<', '>{t("m.hiw.title")}<'); totalChanges++; }
  if (s.includes('>From idea to print-ready file in 4 steps<')) { s = s.replace('>From idea to print-ready file in 4 steps<', '>{t("m.hiw.subtitle")}<'); totalChanges++; }
  // Steps array – replace hard-coded strings with t() calls
  // We need to make steps dynamic
  const stepsOld = `const steps = [`;
  if (s.includes(stepsOld) && !s.includes('t("m.hiw.s1.title")')) {
    s = s.replace(
      /const steps = \[[\s\S]*?\];/,
      `const steps = [
    { icon: Package, title: t("m.hiw.s1.title"), description: t("m.hiw.s1.desc") },
    { icon: Ruler, title: t("m.hiw.s2.title"), description: t("m.hiw.s2.desc") },
    { icon: Palette, title: t("m.hiw.s3.title"), description: t("m.hiw.s3.desc") },
    { icon: Download, title: t("m.hiw.s4.title"), description: t("m.hiw.s4.desc") },
  ];`
    );
    totalChanges++;
    console.log('[how-it-works] Replaced steps array');
  }
  writeFile(f, s);
})();

// ── 4) Features ──
(function() {
  const f = 'src/components/marketing/features.tsx';
  let s = readFile(f);
  s = addImport(s, 'features');
  if (!s.includes('const { t }')) {
    s = s.replace(/export function Features\(\)\s*\{/, 'export function Features() {\n  const { t } = useI18n();');
    totalChanges++;
  }
  if (s.includes('>Everything you need to design packaging<')) {
    s = s.replace('>Everything you need to design packaging<', '>{t("m.feat.title")}<');
    totalChanges++;
  }
  if (s.includes('>Professional tools, zero complexity<')) {
    s = s.replace('>Professional tools, zero complexity<', '>{t("m.feat.subtitle")}<');
    totalChanges++;
  }
  // Replace features array
  if (s.includes('const features = [') && !s.includes('t("m.feat.f1.title")')) {
    s = s.replace(
      /const features = \[[\s\S]*?\];/,
      `const features = [
    { icon: Cpu, title: t("m.feat.f1.title"), description: t("m.feat.f1.desc") },
    { icon: MousePointerClick, title: t("m.feat.f2.title"), description: t("m.feat.f2.desc") },
    { icon: Eye, title: t("m.feat.f3.title"), description: t("m.feat.f3.desc") },
    { icon: FileDown, title: t("m.feat.f4.title"), description: t("m.feat.f4.desc") },
    { icon: Factory, title: t("m.feat.f5.title"), description: t("m.feat.f5.desc"), badge: t("m.feat.comingSoon") },
    { icon: Sparkles, title: t("m.feat.f6.title"), description: t("m.feat.f6.desc"), badge: t("m.feat.comingSoon") },
  ];`
    );
    totalChanges++;
    console.log('[features] Replaced features array');
  }
  writeFile(f, s);
})();

// ── 5) PricingCards ──
(function() {
  const f = 'src/components/marketing/pricing-cards.tsx';
  let s = readFile(f);
  s = addImport(s, 'pricing-cards');
  if (!s.includes('const { t }')) {
    s = s.replace(/export function PricingCards\(\)\s*\{/, 'export function PricingCards() {\n  const { t } = useI18n();');
    totalChanges++;
  }
  // Section titles
  [
    ['>Simple, transparent pricing<', '>{t("m.price.title")}<'],
    ['>A fraction of the cost of a design agency. Cancel anytime.<', '>{t("m.price.subtitle")}<'],
    ['>Most Popular<', '>{t("m.price.popular")}<'],
  ].forEach(([from, to]) => {
    if (s.includes(from)) { s = s.replace(from, to); totalChanges++; console.log('[pricing] ' + from.substring(0,40)); }
  });
  // Replace plans array
  if (s.includes('const plans = [') && !s.includes('t("m.price.free.name")')) {
    s = s.replace(
      /const plans = \[[\s\S]*?\];/m,
      `const plans = "PLACEHOLDER";`
    );
    // Now replace placeholder with function that uses t()
    s = s.replace(
      'const plans = "PLACEHOLDER";',
      `const plans = [
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
  ];`
    );
    totalChanges++;
    console.log('[pricing] Replaced plans array');
  }
  // Move plans inside component (must be after hook)
  // plans needs t(), so it must be inside the component
  if (s.includes('const plans = [') && s.indexOf('const plans = [') < s.indexOf('export function PricingCards')) {
    // plans is outside component - need to move it inside
    const plansMatch = s.match(/(const plans = \[[\s\S]*?\];)\s*\/\/ Early Access/);
    if (plansMatch) {
      s = s.replace(plansMatch[1], '');
      s = s.replace('const { t } = useI18n();', 'const { t } = useI18n();\n  ' + plansMatch[1]);
      totalChanges++;
      console.log('[pricing] Moved plans inside component');
    }
  }
  writeFile(f, s);
})();

// ── 6) EarlyAccessForm ──
(function() {
  const f = 'src/components/marketing/early-access-form.tsx';
  let s = readFile(f);
  s = addImport(s, 'early-access-form');
  if (!s.includes('const { t }')) {
    s = s.replace(/export function EarlyAccessForm\(\)\s*\{/, 'export function EarlyAccessForm() {\n  const { t } = useI18n();');
    totalChanges++;
  }
  const eaReplacements = [
    ["You&apos;re in!", '{t("m.ea.success.title")}'],
    [">You&apos;re <span", '>{t("m.ea.success.rank1")} <span'],
    [">#{signupCount}</span> on the early access list.<", '>#{signupCount}</span> {t("m.ea.success.rank2")}<'],
    [">We&apos;ll notify you as soon as Packive is ready. Get ready to design your packaging in minutes, not weeks.<", '>{t("m.ea.success.desc")}<'],
    ['Early Access — Limited Spots', '{t("m.ea.badge")}'],
    ['>Be the first to design<br />', '>{t("m.ea.title1")}<br />'],
    ['>your packaging<', '>{t("m.ea.title2")}<'],
    [">Available worldwide<", '>{t("m.ea.worldwide")}<'],
    [">Launching Q2 2026<", '>{t("m.ea.launching")}<'],
    [">Work email *<", '>{t("m.ea.emailLabel")}<'],
    [">Company / Brand name<", '>{t("m.ea.companyLabel")}<'],
    [">What packaging do you need?<", '>{t("m.ea.needLabel")}<'],
    ["placeholder=\"you@company.com\"", 'placeholder={t("m.ea.emailPh")}'],
    ["placeholder=\"Your brand name\"", 'placeholder={t("m.ea.companyPh")}'],
    ['placeholder="e.g., Cosmetic box, food packaging, shipping box..."', 'placeholder={t("m.ea.needPh")}'],
    ["'This email is already on the waitlist!'", 't("m.ea.errDuplicate")'],
    ["'You\\'re already on the list!'", 't("m.ea.errDuplicate")'],
    ["'Something went wrong. Please try again.'", 't("m.ea.errGeneric")'],
    ["'Please try again.'", 't("m.ea.errGeneric")'],
    ["'Welcome to Packive! You\\'re on the list.'", 't("m.ea.successToast")'],
    [" 'Joining...' : 'Get Early Access — It\\'s Free'", ' t("m.ea.joining") : t("m.ea.ctaFree")'],
    [">No credit card required. We&apos;ll only email you about Packive launch updates.<", '>{t("m.ea.noCard")}<'],
    [">30 min<", '>{t("m.ea.stat1.value")}<'],
    [">From idea to print-ready file<", '>{t("m.ea.stat1.label")}<'],
    [">90% less<", '>{t("m.ea.stat2.value")}<'],
    [">Cost vs. design agency<", '>{t("m.ea.stat2.label")}<'],
    [">$29/mo<", '>{t("m.ea.stat3.value")}<'],
    [">Starting price for full access<", '>{t("m.ea.stat3.label")}<'],
  ];
  eaReplacements.forEach(([from, to]) => {
    if (s.includes(from)) { s = s.replace(from, to); totalChanges++; console.log('[ea] ' + (typeof from === 'string' ? from.substring(0,45) : from)); }
  });
  // waitlisted text
  if (s.includes("`${signupCount}+ waitlisted`")) {
    s = s.replace("`${signupCount}+ waitlisted`", '`${signupCount}+ ${t("m.ea.waitlisted")}`');
    totalChanges++;
  }
  if (s.includes("'Be the first!'")) {
    s = s.replace("'Be the first!'", 't("m.ea.beFirst")');
    totalChanges++;
  }
  writeFile(f, s);
})();

// ── 7) Footer ──
(function() {
  const f = 'src/components/marketing/footer.tsx';
  let s = readFile(f);
  s = addImport(s, 'footer');
  if (!s.includes('const { t }')) {
    s = s.replace(/export function Footer\(\)\s*\{/, 'export function Footer() {\n  const { t } = useI18n();');
    totalChanges++;
  }
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
    if (s.includes(from)) { s = s.replace(from, to); totalChanges++; console.log('[footer] ' + from.substring(0,40)); }
  });
  writeFile(f, s);
})();

// ── 8) Update locale files ──
const localeKeys = {
  // Header & shared
  "m.features": ["Features", "기능", "機能"],
  "m.howItWorks": ["How It Works", "사용 방법", "使い方"],
  "m.pricing": ["Pricing", "가격", "料金"],
  "m.getEarlyAccess": ["Get Early Access", "사전 체험 신청", "早期アクセス申請"],

  // Hero
  "m.hero.badge": ["Early Access Now Open", "사전 체험 신청 가능", "早期アクセス受付中"],
  "m.hero.title1": ["Package design,", "패키지 디자인,", "パッケージデザイン、"],
  "m.hero.title2": ["made simple.", "쉽고 빠르게.", "シンプルに。"],
  "m.hero.subtitle": ["Design production-ready packaging — die-cut templates, 3D preview, and export — all in your browser. No design skills required.", "인쇄용 패키지를 디자인하세요 — 칼선 템플릿, 3D 미리보기, 내보내기까지 브라우저에서 모두 가능합니다. 디자인 기술이 필요 없습니다.", "印刷対応パッケージをデザイン — ダイカットテンプレート、3Dプレビュー、エクスポートまでブラウザで完結。デザインスキル不要。"],
  "m.hero.ctaFree": ["Get Early Access — Free", "사전 체험 신청 — 무료", "早期アクセス申請 — 無料"],
  "m.hero.ctaGenerator": ["Try Die-Cut Generator", "칼선 생성기 체험하기", "ダイカットジェネレーターを試す"],
  "m.hero.ctaDemo": ["Watch Demo", "데모 보기", "デモを見る"],
  "m.hero.step1": ["Choose Box Style", "박스 스타일 선택", "ボックススタイル選択"],
  "m.hero.step2": ["Auto Die-Cut", "자동 칼선 생성", "自動ダイカット"],
  "m.hero.step3": ["3D Preview", "3D 미리보기", "3Dプレビュー"],
  "m.hero.step4": ["Print-Ready Export", "인쇄용 내보내기", "印刷用エクスポート"],

  // HowItWorks
  "m.hiw.title": ["How it works", "사용 방법", "使い方"],
  "m.hiw.subtitle": ["From idea to print-ready file in 4 steps", "아이디어에서 인쇄용 파일까지 4단계", "アイデアから印刷用ファイルまで4ステップ"],
  "m.hiw.s1.title": ["Choose Box Style", "박스 스타일 선택", "ボックススタイル選択"],
  "m.hiw.s1.desc": ["Pick from 200+ FEFCO/ECMA standard box types — tuck end, mailer, display box, and more.", "200개 이상의 FEFCO/ECMA 표준 박스 유형 중 선택 — 맞뚜껑, 우편용, 진열 박스 등.", "200種類以上のFEFCO/ECMA標準ボックスから選択 — 差し込み蓋、メーラー、ディスプレイボックスなど。"],
  "m.hiw.s2.title": ["Set Dimensions", "치수 입력", "寸法を入力"],
  "m.hiw.s2.desc": ["Enter length, width, depth in mm. Our engine generates a precise die-cut template instantly.", "길이, 너비, 깊이를 mm 단위로 입력하세요. 엔진이 정확한 칼선 템플릿을 즉시 생성합니다.", "長さ、幅、深さをmmで入力。エンジンが正確なダイカットテンプレートを即座に生成します。"],
  "m.hiw.s3.title": ["Design & Preview", "디자인 & 미리보기", "デザイン＆プレビュー"],
  "m.hiw.s3.desc": ["Add graphics, text, and branding to each panel. See your box in real-time 3D.", "각 면에 그래픽, 텍스트, 브랜딩을 추가하세요. 실시간 3D로 박스를 확인합니다.", "各パネルにグラフィック、テキスト、ブランディングを追加。リアルタイム3Dでボックスを確認。"],
  "m.hiw.s4.title": ["Export & Order", "내보내기 & 주문", "エクスポート＆注文"],
  "m.hiw.s4.desc": ["Download print-ready PDF/EPS files. Send directly to your manufacturer.", "인쇄용 PDF/EPS 파일을 다운로드하세요. 제조사에 직접 전송할 수 있습니다.", "印刷用PDF/EPSファイルをダウンロード。メーカーに直接送信できます。"],

  // Features
  "m.feat.title": ["Everything you need to design packaging", "패키지 디자인에 필요한 모든 것", "パッケージデザインに必要なすべて"],
  "m.feat.subtitle": ["Professional tools, zero complexity", "전문 도구, 복잡함은 제로", "プロのツール、複雑さゼロ"],
  "m.feat.f1.title": ["Auto Die-Cut Generation", "자동 칼선 생성", "自動ダイカット生成"],
  "m.feat.f1.desc": ["Enter dimensions, get a precise die-cut template based on FEFCO/ECMA standards.", "치수를 입력하면 FEFCO/ECMA 표준 기반의 정확한 칼선 템플릿을 생성합니다.", "寸法を入力すると、FEFCO/ECMA標準に基づく正確なダイカットテンプレートを生成。"],
  "m.feat.f2.title": ["Drag & Drop Designer", "드래그 앤 드롭 디자이너", "ドラッグ＆ドロップデザイナー"],
  "m.feat.f2.desc": ["Add images, text, shapes, and brand elements to any panel. No Illustrator required.", "어떤 면에든 이미지, 텍스트, 도형, 브랜드 요소를 추가하세요. 일러스트레이터가 필요 없습니다.", "任意のパネルに画像、テキスト、図形、ブランド要素を追加。Illustrator不要。"],
  "m.feat.f3.title": ["Real-Time 3D Preview", "실시간 3D 미리보기", "リアルタイム3Dプレビュー"],
  "m.feat.f3.desc": ["See your finished package as a 3D model. Rotate, zoom, and inspect every angle.", "완성된 패키지를 3D 모델로 확인하세요. 회전, 확대, 모든 각도를 점검합니다.", "完成パッケージを3Dモデルで確認。回転、ズーム、あらゆる角度を検査。"],
  "m.feat.f4.title": ["Print-Ready Export", "인쇄용 내보내기", "印刷用エクスポート"],
  "m.feat.f4.desc": ["Export EPS, PDF, and PNG files with proper bleeds, crop marks, and CMYK support.", "적절한 도련, 재단선, CMYK 지원이 포함된 EPS, PDF, PNG 파일을 내보냅니다.", "適切な塗り足し、トンボ、CMYKサポート付きのEPS、PDF、PNGファイルをエクスポート。"],
  "m.feat.f5.title": ["One-Click Manufacturing", "원클릭 제조 연결", "ワンクリック製造"],
  "m.feat.f5.desc": ["Send your design directly to partner manufacturers for quoting and production.", "디자인을 파트너 제조사에 직접 보내 견적 및 생산을 진행하세요.", "デザインをパートナーメーカーに直接送信し、見積もりと生産を依頼。"],
  "m.feat.f6.title": ["AI Design Assistant", "AI 디자인 어시스턴트", "AIデザインアシスタント"],
  "m.feat.f6.desc": ["Get AI-powered design suggestions, color palettes, and layout recommendations.", "AI 기반의 디자인 제안, 색상 팔레트, 레이아웃 추천을 받으세요.", "AI搭載のデザイン提案、カラーパレット、レイアウト推奨を取得。"],
  "m.feat.comingSoon": ["Coming Soon", "출시 예정", "近日公開"],

  // Pricing
  "m.price.title": ["Simple, transparent pricing", "심플하고 투명한 가격", "シンプルで透明な料金"],
  "m.price.subtitle": ["A fraction of the cost of a design agency. Cancel anytime.", "디자인 에이전시 비용의 일부분. 언제든 해지 가능.", "デザインエージェンシーのコストのわずか一部。いつでも解約可能。"],
  "m.price.popular": ["Most Popular", "가장 인기", "最も人気"],
  "m.price.perMonth": ["/mo", "/월", "/月"],
  "m.price.free.name": ["Free", "무료", "無料"],
  "m.price.free.desc": ["Try Packive with basic features", "기본 기능으로 Packive 체험", "基本機能でPackiveを試す"],
  "m.price.free.f1": ["3 projects", "프로젝트 3개", "プロジェクト3件"],
  "m.price.free.f2": ["Watermarked export", "워터마크 내보내기", "ウォーターマーク付きエクスポート"],
  "m.price.free.f3": ["2D preview only", "2D 미리보기만 가능", "2Dプレビューのみ"],
  "m.price.free.f4": ["Basic box types", "기본 박스 유형", "基本ボックスタイプ"],
  "m.price.starter.name": ["Starter", "Starter", "Starter"],
  "m.price.starter.desc": ["For brands designing their own packaging", "자체 패키지를 디자인하는 브랜드를 위한", "自社パッケージをデザインするブランド向け"],
  "m.price.starter.f1": ["Unlimited projects", "프로젝트 무제한", "プロジェクト無制限"],
  "m.price.starter.f2": ["Print-ready export (EPS/PDF)", "인쇄용 내보내기 (EPS/PDF)", "印刷用エクスポート (EPS/PDF)"],
  "m.price.starter.f3": ["3D real-time preview", "3D 실시간 미리보기", "3Dリアルタイムプレビュー"],
  "m.price.starter.f4": ["All 200+ box types", "200개 이상의 모든 박스 유형", "200種類以上の全ボックスタイプ"],
  "m.price.starter.f5": ["CMYK & bleed support", "CMYK & 도련 지원", "CMYK＆塗り足しサポート"],
  "m.price.starter.f6": ["Text outline conversion", "텍스트 아웃라인 변환", "テキストアウトライン変換"],
  "m.price.pro.name": ["Pro", "Pro", "Pro"],
  "m.price.pro.desc": ["For teams and agencies", "팀 및 에이전시를 위한", "チームとエージェンシー向け"],
  "m.price.pro.f1": ["Everything in Starter", "Starter의 모든 기능 포함", "Starterの全機能を含む"],
  "m.price.pro.f2": ["AI Design Assistant", "AI 디자인 어시스턴트", "AIデザインアシスタント"],
  "m.price.pro.f3": ["Team collaboration (5 seats)", "팀 협업 (5인석)", "チームコラボレーション (5席)"],
  "m.price.pro.f4": ["Priority support", "우선 지원", "優先サポート"],
  "m.price.pro.f5": ["API access", "API 접근", "APIアクセス"],
  "m.price.pro.f6": ["Custom templates", "커스텀 템플릿", "カスタムテンプレート"],
  "m.price.pro.f7": ["Spot color support", "별색 지원", "スポットカラーサポート"],

  // Early Access
  "m.ea.success.title": ["You're in!", "등록 완료!", "登録完了！"],
  "m.ea.success.rank1": ["You're", "당신은", "あなたは"],
  "m.ea.success.rank2": ["on the early access list.", "번째 사전 체험 신청자입니다.", "番目の早期アクセス申請者です。"],
  "m.ea.success.desc": ["We'll notify you as soon as Packive is ready. Get ready to design your packaging in minutes, not weeks.", "Packive가 준비되면 바로 알려드리겠습니다. 몇 주가 아닌 몇 분 만에 패키지를 디자인할 준비를 하세요.", "Packiveの準備ができ次第お知らせします。数週間ではなく数分でパッケージをデザインする準備をしましょう。"],
  "m.ea.badge": ["Early Access — Limited Spots", "사전 체험 — 한정 모집", "早期アクセス — 限定募集"],
  "m.ea.title1": ["Be the first to design", "가장 먼저 디자인하세요", "いち早くデザインしよう"],
  "m.ea.title2": ["your packaging", "나만의 패키지", "あなたのパッケージ"],
  "m.ea.waitlisted": ["waitlisted", "명 대기 중", "名が待機中"],
  "m.ea.beFirst": ["Be the first!", "첫 번째가 되세요!", "最初の一人になろう！"],
  "m.ea.worldwide": ["Available worldwide", "전 세계 이용 가능", "世界中で利用可能"],
  "m.ea.launching": ["Launching Q2 2026", "2026년 2분기 출시", "2026年第2四半期リリース"],
  "m.ea.emailLabel": ["Work email *", "업무용 이메일 *", "業務用メール *"],
  "m.ea.companyLabel": ["Company / Brand name", "회사 / 브랜드명", "会社 / ブランド名"],
  "m.ea.needLabel": ["What packaging do you need?", "어떤 패키지가 필요하신가요?", "どのようなパッケージが必要ですか？"],
  "m.ea.emailPh": ["you@company.com", "you@company.com", "you@company.com"],
  "m.ea.companyPh": ["Your brand name", "브랜드명", "ブランド名"],
  "m.ea.needPh": ["e.g., Cosmetic box, food packaging, shipping box...", "예: 화장품 상자, 식품 포장, 택배 박스...", "例：化粧品箱、食品包装、配送ボックス..."],
  "m.ea.errDuplicate": ["This email is already on the waitlist!", "이미 대기 목록에 등록된 이메일입니다!", "このメールはすでにウェイトリストに登録されています！"],
  "m.ea.errGeneric": ["Something went wrong. Please try again.", "문제가 발생했습니다. 다시 시도해주세요.", "エラーが発生しました。もう一度お試しください。"],
  "m.ea.successToast": ["Welcome to Packive! You're on the list.", "Packive에 오신 것을 환영합니다! 등록이 완료되었습니다.", "Packiveへようこそ！リストに登録されました。"],
  "m.ea.joining": ["Joining...", "등록 중...", "登録中..."],
  "m.ea.ctaFree": ["Get Early Access — It's Free", "사전 체험 신청 — 무료", "早期アクセス申請 — 無料"],
  "m.ea.noCard": ["No credit card required. We'll only email you about Packive launch updates.", "신용카드가 필요 없습니다. Packive 출시 소식만 이메일로 보내드립니다.", "クレジットカード不要。Packiveのリリース情報のみメールでお届けします。"],
  "m.ea.stat1.value": ["30 min", "30분", "30分"],
  "m.ea.stat1.label": ["From idea to print-ready file", "아이디어에서 인쇄용 파일까지", "アイデアから印刷用ファイルまで"],
  "m.ea.stat2.value": ["90% less", "90% 절감", "90%削減"],
  "m.ea.stat2.label": ["Cost vs. design agency", "디자인 에이전시 대비 비용", "デザインエージェンシー比のコスト"],
  "m.ea.stat3.value": ["$29/mo", "$29/월", "$29/月"],
  "m.ea.stat3.label": ["Starting price for full access", "전체 이용 시작 가격", "フルアクセス開始価格"],

  // Footer
  "m.foot.slogan": ["Package design, made alive.", "패키지 디자인에 생명을.", "パッケージデザインに命を。"],
  "m.foot.product": ["Product", "제품", "製品"],
  "m.foot.connect": ["Connect", "연결", "つながる"],
  "m.foot.copyright": ["© 2026 Packive. All rights reserved.", "© 2026 Packive. All rights reserved.", "© 2026 Packive. All rights reserved."],
};

['src/locales/en.json', 'src/locales/ko.json', 'src/locales/ja.json'].forEach((f, li) => {
  const json = JSON.parse(readFile(f));
  let count = 0;
  Object.entries(localeKeys).forEach(([key, vals]) => {
    json[key] = vals[li];
    count++;
  });
  writeFile(f, JSON.stringify(json, null, 2) + '\n');
  console.log('[Locale] ' + f + ': ' + count + ' keys');
  totalChanges++;
});

// ── 9) Add LanguageSelector to home page ──
(function() {
  const f = 'src/app/page.tsx';
  let s = readFile(f);
  // Home page doesn't need LanguageSelector directly since Header should have it
  // But Header needs to show language selector
  writeFile(f, s);
})();

// Add LanguageSelector to Header
(function() {
  const f = 'src/components/layout/header.tsx';
  let s = readFile(f);
  if (!s.includes('LanguageSelector')) {
    s = s.replace(
      'import { useI18n } from "@/components/i18n-context";',
      'import { useI18n, LanguageSelector } from "@/components/i18n-context";'
    );
    // Add before "Get Early Access" button
    if (s.includes('{t("m.getEarlyAccess")}')) {
      s = s.replace(
        /(\s*)(<Button[\s\S]*?{t\("m\.getEarlyAccess"\)})/,
        '$1<LanguageSelector />\n$1$2'
      );
      totalChanges++;
      console.log('[header] Added LanguageSelector');
    }
  }
  writeFile(f, s);
})();

console.log('Total changes: ' + totalChanges);
