const fs = require('fs');
let totalChanges = 0;

// Helper: replace line content (handles indentation)
function replaceText(src, oldText, newText) {
  if (src.includes(oldText)) {
    src = src.replace(oldText, newText);
    totalChanges++;
    console.log('[Fix] ' + oldText.trim().substring(0, 50));
  }
  return src;
}

// ── 1) HowItWorks ──
(function() {
  const f = 'src/components/marketing/how-it-works.tsx';
  let s = fs.readFileSync(f, 'utf8');
  const lines = s.split(/\r?\n/);
  const sep = s.includes('\r\n') ? '\r\n' : '\n';
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === 'From idea to print-ready in 4 steps') {
      lines[i] = lines[i].replace('From idea to print-ready in 4 steps', '{t("m.hiw.title")}');
      totalChanges++; console.log('[hiw] title');
    }
    if (trimmed === 'Packive handles the complex parts so you can focus on your brand') {
      lines[i] = lines[i].replace('Packive handles the complex parts so you can focus on your brand', '{t("m.hiw.subtitle")}');
      totalChanges++; console.log('[hiw] subtitle');
    }
  }
  fs.writeFileSync(f, lines.join(sep), 'utf8');
})();

// ── 2) Features ──
(function() {
  const f = 'src/components/marketing/features.tsx';
  let s = fs.readFileSync(f, 'utf8');
  const lines = s.split(/\r?\n/);
  const sep = s.includes('\r\n') ? '\r\n' : '\n';
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === 'Everything you need for packaging design') {
      lines[i] = lines[i].replace('Everything you need for packaging design', '{t("m.feat.title")}');
      totalChanges++; console.log('[feat] title');
    }
    if (trimmed === 'From die-cut templates to print-ready files, all in one platform') {
      lines[i] = lines[i].replace('From die-cut templates to print-ready files, all in one platform', '{t("m.feat.subtitle")}');
      totalChanges++; console.log('[feat] subtitle');
    }
  }
  fs.writeFileSync(f, lines.join(sep), 'utf8');
})();

// ── 3) PricingCards ──
(function() {
  const f = 'src/components/marketing/pricing-cards.tsx';
  let s = fs.readFileSync(f, 'utf8');
  const lines = s.split(/\r?\n/);
  const sep = s.includes('\r\n') ? '\r\n' : '\n';
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === 'Simple, transparent pricing') {
      lines[i] = lines[i].replace('Simple, transparent pricing', '{t("m.price.title")}');
      totalChanges++; console.log('[price] title');
    }
    if (trimmed === 'A fraction of the cost of a design agency. Cancel anytime.') {
      lines[i] = lines[i].replace('A fraction of the cost of a design agency. Cancel anytime.', '{t("m.price.subtitle")}');
      totalChanges++; console.log('[price] subtitle');
    }
    if (trimmed === 'Most Popular') {
      lines[i] = lines[i].replace('Most Popular', '{t("m.price.popular")}');
      totalChanges++; console.log('[price] popular badge');
    }
  }
  fs.writeFileSync(f, lines.join(sep), 'utf8');
})();

// ── 4) Footer ──
(function() {
  const f = 'src/components/marketing/footer.tsx';
  let s = fs.readFileSync(f, 'utf8');
  const lines = s.split(/\r?\n/);
  const sep = s.includes('\r\n') ? '\r\n' : '\n';
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === 'Package design, made alive.') {
      lines[i] = lines[i].replace('Package design, made alive.', '{t("m.foot.slogan")}');
      totalChanges++; console.log('[footer] slogan');
    }
    if (trimmed === 'Product') {
      lines[i] = lines[i].replace('Product', '{t("m.foot.product")}');
      totalChanges++; console.log('[footer] product');
    }
    if (trimmed === 'Features' && lines[i-1] && lines[i-1].includes('href="#features"')) {
      lines[i] = lines[i].replace('Features', '{t("m.features")}');
      totalChanges++; console.log('[footer] features link');
    }
    if (trimmed === 'Pricing' && lines[i-1] && lines[i-1].includes('href="#pricing"')) {
      lines[i] = lines[i].replace('Pricing', '{t("m.pricing")}');
      totalChanges++; console.log('[footer] pricing link');
    }
    if (trimmed === 'Early Access' && lines[i-1] && lines[i-1].includes('href="#early-access"')) {
      lines[i] = lines[i].replace('Early Access', '{t("m.getEarlyAccess")}');
      totalChanges++; console.log('[footer] early access link');
    }
    if (trimmed === 'Connect') {
      lines[i] = lines[i].replace('Connect', '{t("m.foot.connect")}');
      totalChanges++; console.log('[footer] connect');
    }
    if (trimmed.includes('2026 Packive. All rights reserved.')) {
      lines[i] = lines[i].replace('&copy; 2026 Packive. All rights reserved.', '{t("m.foot.copyright")}');
      totalChanges++; console.log('[footer] copyright');
    }
  }
  fs.writeFileSync(f, lines.join(sep), 'utf8');
})();

// ── 5) EarlyAccessForm ──
(function() {
  const f = 'src/components/marketing/early-access-form.tsx';
  let s = fs.readFileSync(f, 'utf8');
  const lines = s.split(/\r?\n/);
  const sep = s.includes('\r\n') ? '\r\n' : '\n';
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === 'Be the first to design<br />') {
      lines[i] = lines[i].replace('Be the first to design', '{t("m.ea.title1")}');
      totalChanges++; console.log('[ea] title1');
    }
    if (trimmed === 'Work email *') {
      lines[i] = lines[i].replace('Work email *', '{t("m.ea.emailLabel")}');
      totalChanges++; console.log('[ea] email label');
    }
    if (trimmed === 'Company / Brand name') {
      lines[i] = lines[i].replace('Company / Brand name', '{t("m.ea.companyLabel")}');
      totalChanges++; console.log('[ea] company label');
    }
    if (trimmed === 'What packaging do you need?') {
      lines[i] = lines[i].replace('What packaging do you need?', '{t("m.ea.needLabel")}');
      totalChanges++; console.log('[ea] need label');
    }
    if (trimmed.includes("No credit card required")) {
      lines[i] = lines[i].replace("No credit card required. We&apos;ll only email you about Packive launch updates.", '{t("m.ea.noCard")}');
      totalChanges++; console.log('[ea] no card');
    }
  }
  
  // Fix the join paragraph (complex dynamic text)
  s = lines.join(sep);
  if (s.includes("Join {signupCount > 0 ?")) {
    s = s.replace(
      /Join \{signupCount > 0 \? `\$\{signupCount\}\+` : ''\} brands already on the waitlist\.\s*\n\s*Get early access to the platform that\s*\n\s*turns your box idea into a print-ready file in 30 minutes\./,
      '{t("m.ea.joinText1")} {signupCount > 0 ? `${signupCount}+` : ""} {t("m.ea.joinText2")}'
    );
    totalChanges++; console.log('[ea] join paragraph');
  }
  
  fs.writeFileSync(f, s, 'utf8');
})();

// ── 6) Locale updates ──
const newKeys = {
  "m.ea.joinText1": ["Join", "현재", "現在"],
  "m.ea.joinText2": ["brands already on the waitlist. Get early access to the platform that turns your box idea into a print-ready file in 30 minutes.", "개 이상의 브랜드가 대기 중입니다. 박스 아이디어를 30분 만에 인쇄용 파일로 만들어주는 플랫폼에 사전 체험 신청하세요.", "以上のブランドがウェイトリストに登録済み。ボックスのアイデアを30分で印刷用ファイルに変換するプラットフォームに早期アクセスを申請しましょう。"],
};
['src/locales/en.json', 'src/locales/ko.json', 'src/locales/ja.json'].forEach((f, li) => {
  const json = JSON.parse(fs.readFileSync(f, 'utf8'));
  Object.entries(newKeys).forEach(([key, vals]) => { json[key] = vals[li]; });
  fs.writeFileSync(f, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log('[Locale] ' + f);
  totalChanges++;
});

console.log('Total changes: ' + totalChanges);
