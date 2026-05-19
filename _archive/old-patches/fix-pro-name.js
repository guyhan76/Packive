const fs = require('fs');
['src/locales/ko.json', 'src/locales/ja.json'].forEach((f, li) => {
  const json = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (li === 0) json["m.price.pro.name"] = "프로";
  if (li === 1) json["m.price.pro.name"] = "プロ";
  fs.writeFileSync(f, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log('[Locale] ' + f + ': pro name updated');
});
