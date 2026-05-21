const fs = require('fs');
let totalChanges = 0;

// ── 1) new/page.tsx: "Start Designing" ──
(function() {
  const f = 'src/app/editor/new/page.tsx';
  let s = fs.readFileSync(f, 'utf8');
  const lines = s.split(/\r?\n/);
  const sep = s.includes('\r\n') ? '\r\n' : '\n';
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === 'Start Designing') {
      lines[i] = lines[i].replace('Start Designing', '{t("new.startDesigning")}');
      totalChanges++; console.log('[new] Start Designing');
      break;
    }
  }
  fs.writeFileSync(f, lines.join(sep), 'utf8');
})();

// ── 2) box-3d-preview.tsx: 3D Preview texts ──
(function() {
  const f = 'src/components/editor/box-3d-preview.tsx';
  let s = fs.readFileSync(f, 'utf8');
  
  // Add useI18n import if missing
  if (!s.includes('useI18n')) {
    s = s.replace(
      /^("use client"[\s\S]*?)(import )/m,
      '$1import { useI18n } from "@/components/i18n-context";\n$2'
    );
    // If no "use client", add after first import
    if (!s.includes('useI18n')) {
      const idx = s.indexOf('import ');
      const nl = s.indexOf('\n', idx);
      s = s.slice(0, nl + 1) + 'import { useI18n } from "@/components/i18n-context";\n' + s.slice(nl + 1);
    }
    totalChanges++; console.log('[3d] Added useI18n import');
  }
  
  // Add hook if missing
  if (!s.includes('const { t }')) {
    // Find the component function
    s = s.replace(
      /export (default )?function (\w+)\(([^)]*)\)\s*\{/,
      (match, def, name, params) => match + '\n  const { t } = useI18n();'
    );
    totalChanges++; console.log('[3d] Added useI18n hook');
  }
  
  const lines = s.split(/\r?\n/);
  const sep = s.includes('\r\n') ? '\r\n' : '\n';
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === '3D Preview') {
      lines[i] = lines[i].replace('3D Preview', '{t("3d.title")}');
      totalChanges++; console.log('[3d] title');
    }
    if (trimmed.includes('/6 faces')) {
      lines[i] = lines[i].replace('{designedCount}/6 faces', '{designedCount}/6 {t("3d.faces")}');
      totalChanges++; console.log('[3d] faces');
    }
    if (trimmed.includes('Drag to rotate')) {
      lines[i] = lines[i].replace('Drag to rotate · Scroll to zoom', '{t("3d.hint")}');
      totalChanges++; console.log('[3d] hint');
    }
    if (trimmed.includes('Loading 3D Preview')) {
      lines[i] = lines[i].replace('Loading 3D Preview...', '{t("3d.loading")}');
      totalChanges++; console.log('[3d] loading');
    }
  }
  fs.writeFileSync(f, lines.join(sep), 'utf8');
})();

// ── 3) Update locale files ──
const newKeys = {
  "new.startDesigning": ["Start Designing", "디자인 시작", "デザイン開始"],
  "3d.title": ["3D Preview", "3D 미리보기", "3Dプレビュー"],
  "3d.faces": ["faces", "면", "面"],
  "3d.hint": ["Drag to rotate · Scroll to zoom", "드래그하여 회전 · 스크롤하여 확대", "ドラッグで回転 · スクロールでズーム"],
  "3d.loading": ["Loading 3D Preview...", "3D 미리보기 로딩 중...", "3Dプレビュー読み込み中..."],
};

['src/locales/en.json', 'src/locales/ko.json', 'src/locales/ja.json'].forEach((f, li) => {
  const json = JSON.parse(fs.readFileSync(f, 'utf8'));
  Object.entries(newKeys).forEach(([key, vals]) => { json[key] = vals[li]; });
  fs.writeFileSync(f, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log('[Locale] ' + f);
  totalChanges++;
});

console.log('Total changes: ' + totalChanges);
