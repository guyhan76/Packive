const fs = require('fs');
let totalChanges = 0;

// ── 1) Footer: fix remaining link texts ──
(function() {
  const f = 'src/components/marketing/footer.tsx';
  let s = fs.readFileSync(f, 'utf8');
  const lines = s.split(/\r?\n/);
  const sep = s.includes('\r\n') ? '\r\n' : '\n';
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    // Line 33: Features (after href="#features")
    if (trimmed === 'Features' && i > 0 && lines.slice(Math.max(0,i-3), i).some(l => l.includes('#features'))) {
      lines[i] = lines[i].replace('Features', '{t("m.features")}');
      totalChanges++; console.log('[footer] Features link');
    }
    // Line 41: Pricing (after href="#pricing")
    if (trimmed === 'Pricing' && i > 0 && lines.slice(Math.max(0,i-3), i).some(l => l.includes('#pricing'))) {
      lines[i] = lines[i].replace('Pricing', '{t("m.pricing")}');
      totalChanges++; console.log('[footer] Pricing link');
    }
    // Line 49: Early Access (after href="#early-access")
    if (trimmed === 'Early Access' && i > 0 && lines.slice(Math.max(0,i-3), i).some(l => l.includes('#early-access'))) {
      lines[i] = lines[i].replace('Early Access', '{t("m.getEarlyAccess")}');
      totalChanges++; console.log('[footer] Early Access link');
    }
  }
  fs.writeFileSync(f, lines.join(sep), 'utf8');
})();

// ── 2) EarlyAccessForm: fix join paragraph ──
(function() {
  const f = 'src/components/marketing/early-access-form.tsx';
  let s = fs.readFileSync(f, 'utf8');
  
  // Replace the two-line join text
  const oldJoin = "Join {signupCount > 0 ? `${signupCount}+` : ''} brands already on the waitlist.\n            Get early access to the platform that turns your box idea into a print-ready file in 30 minutes.";
  const oldJoinCRLF = oldJoin.replace(/\n/g, '\r\n');
  const newJoin = "{t(\"m.ea.joinText1\")} {signupCount > 0 ? `${signupCount}+` : ''} {t(\"m.ea.joinText2\")}";
  
  if (s.includes(oldJoinCRLF)) {
    s = s.replace(oldJoinCRLF, newJoin);
    totalChanges++; console.log('[ea] Fixed join paragraph (CRLF)');
  } else if (s.includes(oldJoin)) {
    s = s.replace(oldJoin, newJoin);
    totalChanges++; console.log('[ea] Fixed join paragraph (LF)');
  } else {
    // Try line-by-line
    const lines = s.split(/\r?\n/);
    const sep = s.includes('\r\n') ? '\r\n' : '\n';
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith("Join {signupCount")) {
        // Replace this line and the next
        const indent = lines[i].match(/^(\s*)/)[1];
        lines[i] = indent + '{t("m.ea.joinText1")} {signupCount > 0 ? `${signupCount}+` : \'\'} {t("m.ea.joinText2")}';
        // Remove next line if it's the continuation
        if (lines[i+1] && lines[i+1].trim().startsWith('Get early access')) {
          lines.splice(i+1, 1);
        }
        totalChanges++; console.log('[ea] Fixed join paragraph (line-by-line)');
        break;
      }
    }
    s = lines.join(sep);
  }
  fs.writeFileSync(f, s, 'utf8');
})();

// ── 3) Starter → Smart everywhere ──
// pricing-cards.tsx
(function() {
  const f = 'src/components/marketing/pricing-cards.tsx';
  let s = fs.readFileSync(f, 'utf8');
  // In the plans array, Starter is now t("m.price.starter.name")
  // Change key references from starter to smart
  s = s.replace(/m\.price\.starter\.name/g, 'm.price.smart.name');
  s = s.replace(/m\.price\.starter\.desc/g, 'm.price.smart.desc');
  s = s.replace(/m\.price\.starter\.f1/g, 'm.price.smart.f1');
  s = s.replace(/m\.price\.starter\.f2/g, 'm.price.smart.f2');
  s = s.replace(/m\.price\.starter\.f3/g, 'm.price.smart.f3');
  s = s.replace(/m\.price\.starter\.f4/g, 'm.price.smart.f4');
  s = s.replace(/m\.price\.starter\.f5/g, 'm.price.smart.f5');
  s = s.replace(/m\.price\.starter\.f6/g, 'm.price.smart.f6');
  fs.writeFileSync(f, s, 'utf8');
  totalChanges++; console.log('[pricing] Renamed starter → smart keys');
})();

// ── 4) Update locale files ──
['src/locales/en.json', 'src/locales/ko.json', 'src/locales/ja.json'].forEach((f, li) => {
  const json = JSON.parse(fs.readFileSync(f, 'utf8'));
  
  // Add smart keys (copy from starter, rename)
  const smartKeys = {
    "m.price.smart.name": ["Smart", "스마트", "スマート"],
    "m.price.smart.desc": ["For brands designing their own packaging", "자체 패키지를 디자인하는 브랜드를 위한", "自社パッケージをデザインするブランド向け"],
    "m.price.smart.f1": ["Unlimited projects", "프로젝트 무제한", "プロジェクト無制限"],
    "m.price.smart.f2": ["Print-ready export (EPS/PDF)", "인쇄용 내보내기 (EPS/PDF)", "印刷用エクスポート (EPS/PDF)"],
    "m.price.smart.f3": ["3D real-time preview", "3D 실시간 미리보기", "3Dリアルタイムプレビュー"],
    "m.price.smart.f4": ["All 200+ box types", "200개 이상의 모든 박스 유형", "200種類以上の全ボックスタイプ"],
    "m.price.smart.f5": ["CMYK & bleed support", "CMYK & 도련 지원", "CMYK＆塗り足しサポート"],
    "m.price.smart.f6": ["Text outline conversion", "텍스트 아웃라인 변환", "テキストアウトライン変換"],
  };
  
  // Update pro f1 to reference Smart instead of Starter
  const proF1 = {
    "m.price.pro.f1": ["Everything in Smart", "Smart의 모든 기능 포함", "Smartの全機能を含む"],
  };
  
  // Update joinText
  const joinTexts = {
    "m.ea.joinText1": ["Join", "현재", "現在"],
    "m.ea.joinText2": ["brands already on the waitlist. Get early access to the platform that turns your box idea into a print-ready file in 30 minutes.", "개 이상의 브랜드가 대기 중입니다. 박스 아이디어를 30분 만에 인쇄용 파일로 만들어주는 플랫폼에 사전 체험 신청하세요.", "以上のブランドがウェイトリストに登録済み。ボックスのアイデアを30分で印刷用ファイルに変換するプラットフォームに早期アクセスを申請しましょう。"],
  };

  // Remove old starter keys
  delete json["m.price.starter.name"];
  delete json["m.price.starter.desc"];
  delete json["m.price.starter.f1"];
  delete json["m.price.starter.f2"];
  delete json["m.price.starter.f3"];
  delete json["m.price.starter.f4"];
  delete json["m.price.starter.f5"];
  delete json["m.price.starter.f6"];
  
  let count = 0;
  [smartKeys, proF1, joinTexts].forEach(keys => {
    Object.entries(keys).forEach(([key, vals]) => {
      json[key] = vals[li];
      count++;
    });
  });
  
  fs.writeFileSync(f, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log('[Locale] ' + f + ': ' + count + ' keys updated');
  totalChanges++;
});

console.log('Total changes: ' + totalChanges);
