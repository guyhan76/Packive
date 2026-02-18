const fs = require('fs');
let totalChanges = 0;

// ── 1) editor/new/page.tsx: already at right end - OK ──
// LanguageSelector is last item in header, position is good
console.log('[new] LanguageSelector already at right end - OK');

// ── 2) editor/design/page.tsx (overview): move to after Export button ──
(function() {
  const f = 'src/app/editor/design/page.tsx';
  let s = fs.readFileSync(f, 'utf8');
  const lines = s.split(/\r?\n/);
  const sep = s.includes('\r\n') ? '\r\n' : '\n';
  
  // Remove LanguageSelector from current position (line 591, between progress bar and save button)
  let removed = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '<LanguageSelector />' && !removed) {
      // Check context: should be near progress bar
      const nearby = lines.slice(Math.max(0, i-5), i).join(' ');
      if (nearby.includes('totalDesigned') || nearby.includes('bg-green-500')) {
        lines.splice(i, 1);
        removed = true;
        totalChanges++;
        console.log('[design] Removed LanguageSelector from line ' + (i+1));
        break;
      }
    }
  }
  
  // Add LanguageSelector right before </div></header> (after Export button)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '</div>' && lines[i+1] && lines[i+1].trim() === '</div>' && lines[i+2] && lines[i+2].trim() === '</header>') {
      // Check this is the right header (overview header with Export button)
      const nearby = lines.slice(Math.max(0, i-5), i+1).join(' ');
      if (nearby.includes('ov.export') || nearby.includes('Export')) {
        const indent = lines[i].match(/^(\s*)/)[1];
        lines.splice(i, 0, indent + '<LanguageSelector />');
        totalChanges++;
        console.log('[design] Added LanguageSelector before header close at line ' + (i+1));
        break;
      }
    }
  }
  
  fs.writeFileSync(f, lines.join(sep), 'utf8');
})();

// ── 3) panel-editor.tsx: move to after PDF export button (right before </div></header>) ──
(function() {
  const f = 'src/components/editor/panel-editor.tsx';
  let s = fs.readFileSync(f, 'utf8');
  const lines = s.split(/\r?\n/);
  const sep = s.includes('\r\n') ? '\r\n' : '\n';
  
  // Remove LanguageSelector from current position (between load design and shortcuts)
  let removed = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '<LanguageSelector />' && !removed) {
      const nearby = lines.slice(Math.max(0, i-3), i+3).join(' ');
      if (nearby.includes('design.load') || nearby.includes('shortcut')) {
        lines.splice(i, 1);
        removed = true;
        totalChanges++;
        console.log('[panel] Removed LanguageSelector from line ' + (i+1));
        break;
      }
    }
  }
  
  // Add LanguageSelector right before </div>\n</header> in panel-editor
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '</div>' && lines[i+1] && lines[i+1].trim() === '</header>') {
      // Check this is the editor header (has exportPdf nearby)
      const nearby = lines.slice(Math.max(0, i-15), i+1).join(' ');
      if (nearby.includes('exportPdf') || nearby.includes('exportSvg')) {
        const indent = lines[i].match(/^(\s*)/)[1] + '  ';
        lines.splice(i, 0, indent + '<LanguageSelector />');
        totalChanges++;
        console.log('[panel] Added LanguageSelector before header close at line ' + (i+1));
        break;
      }
    }
  }
  
  fs.writeFileSync(f, lines.join(sep), 'utf8');
})();

// ── 4) Homepage header: already at right position (before CTA button) - OK ──
console.log('[header] LanguageSelector before CTA button - OK');

console.log('Total changes: ' + totalChanges);
