const fs = require('fs');
const file = 'src/app/editor/design/page.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// Fix 1: Page 1 (net layout) - extend thumbnail image to bleed area
const oldPage1Image = `if (pnl?.thumbnail) {
          try { doc.addImage(pnl.thumbnail, "PNG", px, py, p.w, p.h); } catch (e) { console.warn(e); }
        } else if (pc) {
          doc.setFontSize(Math.min(p.w * 0.15, p.h * 0.15, 8));
          doc.setTextColor(180, 180, 180);
          doc.text(pc.name, px + p.w / 2, py + p.h / 2, { align: "center", baseline: "middle" } as any);
        }
      }

      // Footer info`;

const newPage1Image = `if (pnl?.thumbnail) {
          // Extend image to bleed area for print
          try { doc.addImage(pnl.thumbnail, "PNG", px - bl, py - bl, p.w + bl * 2, p.h + bl * 2); } catch (e) { console.warn(e); }
        } else if (pc) {
          doc.setFontSize(Math.min(p.w * 0.15, p.h * 0.15, 8));
          doc.setTextColor(180, 180, 180);
          doc.text(pc.name, px + p.w / 2, py + p.h / 2, { align: "center", baseline: "middle" } as any);
        }

        // Draw trim line (where the panel actually cuts)
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.15);
        doc.setLineDashPattern([3, 2], 0);
        doc.rect(px, py, p.w, p.h);
        doc.setLineDashPattern([], 0);
      }

      // Footer info`;

if (code.includes(oldPage1Image)) {
  code = code.replace(oldPage1Image, newPage1Image);
  changes++;
  console.log('Fix1: Page 1 - image now extends to bleed area + trim marks');
} else {
  console.log('Fix1: Pattern not found');
}

// Fix 2: Individual panel pages (pages 2+) - extend image to bleed area
const oldPage2Image = `if (pnl?.designed && pnl.thumbnail) {
          try { doc.addImage(pnl.thumbnail, "PNG", ox, oy, pc.widthMM, pc.heightMM); } catch (e) { console.warn(e); }`;

const newPage2Image = `if (pnl?.designed && pnl.thumbnail) {
          // Extend image to bleed area for print
          try { doc.addImage(pnl.thumbnail, "PNG", ox - bl, oy - bl, pc.widthMM + bl * 2, pc.heightMM + bl * 2); } catch (e) { console.warn(e); }`;

if (code.includes(oldPage2Image)) {
  code = code.replace(oldPage2Image, newPage2Image);
  changes++;
  console.log('Fix2: Individual pages - image now extends to bleed area');
} else {
  console.log('Fix2: Pattern not found');
}

// Fix 3: On individual pages, draw trim line after image (so it shows on top)
const oldPage2Panel = `// Panel border (solid)
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.3);
        doc.setLineDashPattern([], 0);
        doc.setFillColor(255, 255, 255);
        doc.rect(ox, oy, pc.widthMM, pc.heightMM, "FD");

        // Panel content`;

const newPage2Panel = `// Panel background
        doc.setFillColor(255, 255, 255);
        doc.rect(ox - bl, oy - bl, pc.widthMM + bl * 2, pc.heightMM + bl * 2, "F");

        // Panel content`;

if (code.includes(oldPage2Panel)) {
  code = code.replace(oldPage2Panel, newPage2Panel);
  changes++;
  console.log('Fix3: Individual pages - background extends to bleed');
} else {
  console.log('Fix3: Pattern not found');
}

// Fix 4: Add trim marks after image on individual pages
const oldPage2Footer = `// Footer
        doc.setFontSize(5);
        doc.setTextColor(150, 150, 150);
        doc.setLineDashPattern([], 0);
        doc.text(boxTypeDisplay`;

const newPage2Footer = `// Trim line (actual cut line) - drawn ON TOP of image
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.setLineDashPattern([3, 2], 0);
        doc.rect(ox, oy, pc.widthMM, pc.heightMM);
        doc.setLineDashPattern([], 0);

        // Crop marks at corners (8mm long, 2mm offset from trim)
        const cmLen = 8;
        const cmOff = 2;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        // Top-left
        doc.line(ox - cmOff - cmLen, oy, ox - cmOff, oy);
        doc.line(ox, oy - cmOff - cmLen, ox, oy - cmOff);
        // Top-right
        doc.line(ox + pc.widthMM + cmOff, oy, ox + pc.widthMM + cmOff + cmLen, oy);
        doc.line(ox + pc.widthMM, oy - cmOff - cmLen, ox + pc.widthMM, oy - cmOff);
        // Bottom-left
        doc.line(ox - cmOff - cmLen, oy + pc.heightMM, ox - cmOff, oy + pc.heightMM);
        doc.line(ox, oy + pc.heightMM + cmOff, ox, oy + pc.heightMM + cmOff + cmLen);
        // Bottom-right
        doc.line(ox + pc.widthMM + cmOff, oy + pc.heightMM, ox + pc.widthMM + cmOff + cmLen, oy + pc.heightMM);
        doc.line(ox + pc.widthMM, oy + pc.heightMM + cmOff, ox + pc.widthMM, oy + pc.heightMM + cmOff + cmLen);

        // Footer
        doc.setFontSize(5);
        doc.setTextColor(150, 150, 150);
        doc.setLineDashPattern([], 0);
        doc.text(boxTypeDisplay`;

if (code.includes(oldPage2Footer)) {
  code = code.replace(oldPage2Footer, newPage2Footer);
  changes++;
  console.log('Fix4: Added trim marks and crop marks on individual pages');
} else {
  console.log('Fix4: Pattern not found');
}

// Fix 5: Also fix the page 1 background fill to extend to bleed
const oldPage1Fill = `doc.rect(px, py, p.w, p.h, "FD");`;
if (code.includes(oldPage1Fill)) {
  code = code.replace(oldPage1Fill, `doc.rect(px - bl, py - bl, p.w + bl * 2, p.h + bl * 2, "FD");`);
  changes++;
  console.log('Fix5: Page 1 background fill extends to bleed');
} else {
  console.log('Fix5: Pattern not found');
}

fs.writeFileSync(file, code, 'utf8');
console.log('\nTotal changes: ' + changes);
