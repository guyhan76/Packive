import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');
let done = 0;

// 1. Remove Select BG button from BG Color section (lines after "BG Color" span)
let selectBgStart = -1, selectBgEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('BG Color') && lines[i].includes('text-gray-400')) {
    // Next line should be the button start
    if (lines[i+1] && lines[i+1].includes('<button onClick')) {
      selectBgStart = i + 1;
      // Find closing of this button (line with "Select BG" then </button>)
      for (let j = selectBgStart; j < selectBgStart + 20; j++) {
        if (lines[j].includes('</button>')) {
          selectBgEnd = j;
          break;
        }
      }
    }
    break;
  }
}

let selectBgLines = [];
if (selectBgStart > -1 && selectBgEnd > -1) {
  selectBgLines = lines.splice(selectBgStart, selectBgEnd - selectBgStart + 1);
  done++;
  console.log('1. Removed Select BG from BG Color section (' + selectBgLines.length + ' lines)');
}

// 2. Find the <hr> between BG Opacity and Opacity sections, insert Select BG before it
if (selectBgLines.length > 0) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('BG Opacity') && lines[i].includes('text-gray-400')) {
      // Find the closing </div> of BG Opacity section, then the <hr> after it
      let bgOpEnd = -1;
      for (let j = i; j < i + 15; j++) {
        if (lines[j].includes('<hr className="w-28')) {
          bgOpEnd = j;
          break;
        }
      }
      if (bgOpEnd > -1) {
        // Insert Select BG button before the hr
        lines.splice(bgOpEnd, 0, ...selectBgLines);
        done++;
        console.log('2. Inserted Select BG between BG Opacity and Opacity');
      }
      break;
    }
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Changes: ' + done);
