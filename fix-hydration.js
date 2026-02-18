const fs = require('fs');
let totalChanges = 0;

// ── 1) Footer: add "use client" ──
const ff = 'src/components/marketing/footer.tsx';
let fs1 = fs.readFileSync(ff, 'utf8');
if (!fs1.startsWith('"use client"') && !fs1.startsWith("'use client'")) {
  // Remove any comment at top and add "use client"
  fs1 = '"use client"\n\n' + fs1;
  totalChanges++;
  console.log('[footer] Added "use client"');
}
fs.writeFileSync(ff, fs1, 'utf8');

// ── 2) Header: ensure "use client" is present ──
const hf = 'src/components/layout/header.tsx';
let hs = fs.readFileSync(hf, 'utf8');
if (!hs.startsWith('"use client"') && !hs.startsWith("'use client'")) {
  hs = '"use client"\n\n' + hs;
  totalChanges++;
  console.log('[header] Added "use client"');
}
fs.writeFileSync(hf, hs, 'utf8');

// ── 3) HowItWorks: ensure "use client" ──
const hwf = 'src/components/marketing/how-it-works.tsx';
let hws = fs.readFileSync(hwf, 'utf8');
if (!hws.startsWith('"use client"') && !hws.startsWith("'use client'")) {
  hws = '"use client"\n\n' + hws;
  totalChanges++;
  console.log('[how-it-works] Added "use client"');
}
fs.writeFileSync(hwf, hws, 'utf8');

// ── 4) Features: ensure "use client" ──
const ftf = 'src/components/marketing/features.tsx';
let fts = fs.readFileSync(ftf, 'utf8');
if (!fts.startsWith('"use client"') && !fts.startsWith("'use client'")) {
  fts = '"use client"\n\n' + fts;
  totalChanges++;
  console.log('[features] Added "use client"');
}
fs.writeFileSync(ftf, fts, 'utf8');

// ── 5) Hero: ensure "use client" ──
const rf = 'src/components/marketing/hero.tsx';
let rs = fs.readFileSync(rf, 'utf8');
if (!rs.startsWith('"use client"') && !rs.startsWith("'use client'")) {
  rs = '"use client"\n\n' + rs;
  totalChanges++;
  console.log('[hero] Added "use client"');
}
fs.writeFileSync(rf, rs, 'utf8');

// ── 6) EditorNewPage: wrap with Suspense to avoid hydration mismatch ──
// The issue is useI18n reads localStorage on client, causing SSR mismatch
// Solution: make EditorNewPage a client component (it already has "use client")
// Check if it has "use client"
const nf = 'src/app/editor/new/page.tsx';
let ns = fs.readFileSync(nf, 'utf8');
if (!ns.startsWith('"use client"') && !ns.startsWith("'use client'")) {
  ns = '"use client"\n\n' + ns;
  totalChanges++;
  console.log('[new/page] Added "use client"');
}
fs.writeFileSync(nf, ns, 'utf8');

// ── 7) Home page.tsx: needs "use client" since children use client hooks ──
// Actually, home page imports client components - it should be fine as server component
// The issue is footer.tsx was missing "use client" - that's fixed above

console.log('Total changes: ' + totalChanges);
