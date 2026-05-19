const fs = require('fs');
const lf = 'src/locales/ja.json';
let obj = JSON.parse(fs.readFileSync(lf, 'utf8'));
obj['right.brandPlaceholder'] = '\u4F8B: \u30C1\u30E7\u30B3\u30F4\u30A7\u30EB\u30C7';
fs.writeFileSync(lf, JSON.stringify(obj, null, 2) + '\n', 'utf8');
console.log('Updated ja.json: right.brandPlaceholder = ' + obj['right.brandPlaceholder']);
