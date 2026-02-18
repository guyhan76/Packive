const fs = require('fs');

const headlines = {
  "m.hero.title1": [
    "Package design",
    "몇 주 걸리던 패키지 디자인,",
    "何週間もかかっていたパッケージデザイン、"
  ],
  "m.hero.title2": [
    "in minutes",
    "이제",
    "今はたった"
  ],
  "m.hero.title3": [
    ", not weeks",
    " 몇 분이면 끝",
    "数分で完成"
  ],
};

['src/locales/en.json', 'src/locales/ko.json', 'src/locales/ja.json'].forEach((f, li) => {
  const json = JSON.parse(fs.readFileSync(f, 'utf8'));
  Object.entries(headlines).forEach(([key, vals]) => {
    json[key] = vals[li];
  });
  fs.writeFileSync(f, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log('[Locale] ' + f + ': headline updated');
});

console.log('Done');
