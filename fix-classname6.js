const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');

// Find and replace the entire broken button block
const badPatterns = [
  /className=\{\s*\x0C?\\?f?lex-1 py-2 text-center text-\[10px\] font-medium transition-colors \}>/g,
  /className=\{\nlex-1[^\n]*\}>/g,
  /className=\{\r?\n?lex-1[^\n]*\}>/g
];

let fixed = false;
for (const pat of badPatterns) {
  if (pat.test(code)) {
    code = code.replace(pat, 'className={lex-1 py-2 text-center text-[10px] font-medium transition-colors }>');
    fixed = true;
    console.log('Fixed pattern: ' + pat.source.substring(0, 40));
  }
}

// Also check if icon div is missing and add it back
if (!code.includes('{tab.icon}')) {
  code = code.replace(
    '<div>{tab.label}</div>',
    '<div className="text-sm">{tab.icon}</div>\n                <div>{tab.label}</div>'
  );
  console.log('Restored {tab.icon} div');
}

if (fixed) {
  fs.writeFileSync(file, code, 'utf8');
  console.log('Done! File saved.');
} else {
  // Brute force: find any line with 'lex-1' near className
  let lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('lex-1') && lines[i].includes('className')) {
      console.log('Found at line ' + (i+1) + ': ' + JSON.stringify(lines[i]));
    }
  }
}
