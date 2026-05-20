const fs = require('fs');
let changes = 0;

const updates = {
  'src/locales/ko.json': {
    "ov.tuck": "꽂이",
    "ov.dust": "폭 상단 날개",
    "ov.topSection": "상단 - 뚜껑, 꽂이, 폭 날개",
    "ov.topDesc": "상단 뚜껑은 닫힌 상태에서 보입니다. 꽂이는 내부로 접힙니다.",
    "ov.bottomSection": "하단 - 날개, 접착면",
    "ov.bottomDesc": "하단 날개는 스냅 락 바닥을 형성합니다. 접착면은 풀칠 영역입니다.",
    "panel.topLid": "상단 뚜껑",
    "panel.topTuck": "상단 꽂이",
    "panel.topDustL": "상단 폭 날개 (좌)",
    "panel.topDustR": "상단 폭 날개 (우)",
    "panel.bottomFlapFront": "하단 장날개 (전면)",
    "panel.bottomFlapBack": "하단 장날개 (후면)",
    "panel.bottomDustL": "하단 폭 날개 (좌)",
    "panel.bottomDustR": "하단 폭 날개 (우)",
    "panel.glueFlap": "접착면",
    "guide.topLid": "뚜껑 표면 - 닫힌 상태에서 보임",
    "guide.topTuck": "내부로 접힘 - 닫힌 상태에서 안보임",
    "guide.dust": "보통 숨겨짐",
    "guide.bottomFront": "스냅 락 - 먼저 접힘",
    "guide.bottomBack": "스냅 락 - 나중에 접힘",
    "guide.sideTuck": "측면 날개",
    "guide.glue": "접착 영역"
  },
  'src/locales/ja.json': {
    "ov.tuck": "\u5DEE\u3057\u8FBC\u307F",
    "ov.dust": "\u5E45\u4E0A\u90E8\u30D5\u30E9\u30C3\u30D7",
    "ov.topSection": "\u4E0A\u90E8 - \u84CB\u3001\u5DEE\u3057\u8FBC\u307F\u3001\u5E45\u30D5\u30E9\u30C3\u30D7",
    "ov.topDesc": "\u4E0A\u84CB\u306F\u9589\u3058\u305F\u6642\u306B\u898B\u3048\u307E\u3059\u3002\u5DEE\u3057\u8FBC\u307F\u306F\u5185\u5074\u306B\u6298\u308A\u8FBC\u307F\u307E\u3059\u3002",
    "ov.bottomSection": "\u4E0B\u90E8 - \u30D5\u30E9\u30C3\u30D7\u3001\u7CCA\u4EE3",
    "ov.bottomDesc": "\u4E0B\u90E8\u30D5\u30E9\u30C3\u30D7\u306F\u30B9\u30CA\u30C3\u30D7\u30ED\u30C3\u30AF\u5E95\u3092\u5F62\u6210\u3057\u307E\u3059\u3002\u7CCA\u4EE3\u306F\u63A5\u7740\u30A8\u30EA\u30A2\u3067\u3059\u3002",
    "panel.topLid": "\u4E0A\u84CB",
    "panel.topTuck": "\u4E0A\u90E8\u5DEE\u3057\u8FBC\u307F",
    "panel.topDustL": "\u4E0A\u90E8\u5E45\u30D5\u30E9\u30C3\u30D7 (L)",
    "panel.topDustR": "\u4E0A\u90E8\u5E45\u30D5\u30E9\u30C3\u30D7 (R)",
    "panel.bottomFlapFront": "\u4E0B\u90E8\u9577\u30D5\u30E9\u30C3\u30D7 (\u524D)",
    "panel.bottomFlapBack": "\u4E0B\u90E8\u9577\u30D5\u30E9\u30C3\u30D7 (\u5F8C)",
    "panel.bottomDustL": "\u4E0B\u90E8\u5E45\u30D5\u30E9\u30C3\u30D7 (L)",
    "panel.bottomDustR": "\u4E0B\u90E8\u5E45\u30D5\u30E9\u30C3\u30D7 (R)",
    "panel.glueFlap": "\u7CCA\u4EE3",
    "guide.topLid": "\u84CB\u8868\u9762 - \u9589\u3058\u305F\u6642\u306B\u898B\u3048\u308B",
    "guide.topTuck": "\u5185\u5074\u306B\u6298\u308A\u8FBC\u307F - \u3055\u308A\u3052\u306A\u30D6\u30E9\u30F3\u30C7\u30A3\u30F3\u30B0",
    "guide.dust": "\u901A\u5E38\u96A0\u308C\u308B",
    "guide.bottomFront": "\u30B9\u30CA\u30C3\u30D7\u30ED\u30C3\u30AF - \u6700\u521D\u306B\u6298\u308B",
    "guide.bottomBack": "\u30B9\u30CA\u30C3\u30D7\u30ED\u30C3\u30AF - 2\u756A\u76EE\u306B\u6298\u308B",
    "guide.sideTuck": "\u5074\u9762\u30D5\u30E9\u30C3\u30D7",
    "guide.glue": "\u63A5\u7740\u30A8\u30EA\u30A2"
  }
};

Object.entries(updates).forEach(([lf, kvs]) => {
  let obj = JSON.parse(fs.readFileSync(lf, 'utf8'));
  Object.entries(kvs).forEach(([k, v]) => {
    obj[k] = v;
    changes++;
  });
  fs.writeFileSync(lf, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  console.log('[Updated] ' + lf + ': ' + Object.keys(kvs).length + ' keys');
});

console.log('Total changes: ' + changes);
