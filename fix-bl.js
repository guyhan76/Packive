const fs = require('fs');
const file = 'src/app/editor/design/page.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// The old exportPDF (non-enhanced) had its rect changed incorrectly
// Find it in the exportPDF block (before exportPDFEnhanced)
// The old exportPDF uses "doc.rect(px - bl," which is wrong since bl is not defined there

// Strategy: find the FIRST occurrence of the broken line (in exportPDF, not exportPDFEnhanced)
// exportPDF is defined first, exportPDFEnhanced comes after

const enhancedMarker = "Enhanced PDF Export: Per-panel pages with bleed";
const enhancedIdx = code.indexOf(enhancedMarker);

if (enhancedIdx > 0) {
  // Only fix the rect in the code BEFORE the enhanced marker (i.e., in old exportPDF)
  const beforeEnhanced = code.substring(0, enhancedIdx);
  const afterEnhanced = code.substring(enhancedIdx);

  const brokenRect = 'doc.rect(px - bl, py - bl, p.w + bl * 2, p.h + bl * 2, "FD");';
  if (beforeEnhanced.includes(brokenRect)) {
    const fixedBefore = beforeEnhanced.replace(brokenRect, 'doc.rect(px, py, p.w, p.h, "FD");');
    code = fixedBefore + afterEnhanced;
    changes++;
    console.log('Fix: Restored original exportPDF rect (removed bl reference)');
  } else {
    console.log('Broken rect not found in old exportPDF');
  }
} else {
  console.log('Enhanced marker not found');
}

// Also fix the old exportPDF thumbnail - make sure it does NOT use bl
const beforeEnhanced2 = code.substring(0, code.indexOf(enhancedMarker));
if (beforeEnhanced2.includes('px - bl, py - bl')) {
  console.log('WARNING: Still found bl reference in old exportPDF!');
}

fs.writeFileSync(file, code, 'utf8');
console.log('\nTotal changes: ' + changes);
