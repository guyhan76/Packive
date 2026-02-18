const fs = require('fs');
let totalChanges = 0;

// ── 1) Header ──
const hf = 'src/components/layout/header.tsx';
let hs = fs.readFileSync(hf, 'utf8');
if (hs.includes('>\n            Get Early Access\n          </Button>')) {
  hs = hs.replace('>\n            Get Early Access\n          </Button>', '>\n            {t("m.getEarlyAccess")}\n          </Button>');
  totalChanges++;
  console.log('[header] Fixed button text (LF)');
} else if (hs.includes('>\r\n            Get Early Access\r\n          </Button>')) {
  hs = hs.replace('>\r\n            Get Early Access\r\n          </Button>', '>\r\n            {t("m.getEarlyAccess")}\r\n          </Button>');
  totalChanges++;
  console.log('[header] Fixed button text (CRLF)');
} else {
  // Brute force: line-by-line
  const lines = hs.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === 'Get Early Access' && i > 0 && lines[i-1].includes('>')) {
      lines[i] = lines[i].replace('Get Early Access', '{t("m.getEarlyAccess")}');
      totalChanges++;
      console.log('[header] Fixed button text at line ' + (i+1));
      break;
    }
  }
  hs = lines.join('\n');
}
fs.writeFileSync(hf, hs, 'utf8');

// ── 2) Hero ──
const rf = 'src/components/marketing/hero.tsx';
let rs = fs.readFileSync(rf, 'utf8');
// Fix "Get Early Access — Free"
const heroLines = rs.split(/\r?\n/);
for (let i = 0; i < heroLines.length; i++) {
  if (heroLines[i].trim() === 'Get Early Access — Free') {
    heroLines[i] = heroLines[i].replace('Get Early Access — Free', '{t("m.hero.ctaFree")}');
    totalChanges++;
    console.log('[hero] Fixed CTA button at line ' + (i+1));
    break;
  }
}
rs = heroLines.join('\n');
fs.writeFileSync(rf, rs, 'utf8');

console.log('Total changes: ' + totalChanges);
