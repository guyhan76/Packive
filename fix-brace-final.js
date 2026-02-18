const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

// 1111줄(index 1110)이 "              });" 이고
// 1112줄(index 1111)도 "              });" 면 중복 - 하나 제거
// 그리고 1110줄(index 1109)의 } 앞에 닫는 } 추가

let found = false;
for (let i = 1108; i < 1115; i++) {
  console.log(i + ': |' + lines[i] + '|');
}

// Find the double }); and remove one
for (let i = 1109; i < 1114; i++) {
  if (lines[i].trim() === '});' && lines[i+1] && lines[i+1].trim() === '});') {
    console.log('Found duplicate }); at lines ' + (i+1) + ' and ' + (i+2));
    lines.splice(i+1, 1); // remove second one
    found = true;
    break;
  }
}

if (!found) console.log('No duplicate found');

fs.writeFileSync(file, lines.join('\n'), 'utf8');
const ob = (lines.join('\n').match(/\{/g) || []).length;
const cb = (lines.join('\n').match(/\}/g) || []).length;
console.log('After fix - Braces: {', ob, '}', cb, 'diff:', ob - cb);
