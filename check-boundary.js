const fs = require('fs');
var backup = fs.readFileSync('aside-full-backup.txt', 'utf8').split('\n');

// Show ADD section end and IMAGE section start
console.log('=== ADD end (lines 155-165) ===');
for (var i = 155; i <= 168; i++) {
  console.log((i+1) + ': ' + backup[i]);
}
console.log('');
console.log('=== IMAGE start (lines 163-175) ===');
for (var i = 163; i <= 175; i++) {
  console.log((i+1) + ': ' + backup[i]);
}
console.log('');
console.log('=== COLOR start (lines 320-330) ===');
for (var i = 320; i <= 330; i++) {
  console.log((i+1) + ': ' + backup[i]);
}
console.log('');
console.log('=== IMAGE end (lines 316-325) ===');
for (var i = 316; i <= 325; i++) {
  console.log((i+1) + ': ' + backup[i]);
}
