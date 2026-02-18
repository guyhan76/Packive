const fs = require('fs');
const f = 'src/components/editor/panel-editor.tsx';
let src = fs.readFileSync(f, 'utf8');
src = src.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
let changes = 0;

// Fix 1: Add onContextMenu to canvas container
// Find the div with ref wrapperRef
const lines = src.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('wrapperRef') && lines[i].includes('__scrollHost')) {
    // Go back to find the parent div
    for (let j = i - 1; j >= Math.max(0, i - 10); j--) {
      if (lines[j].includes('className=') && lines[j].includes('flex-1') && lines[j].includes('overflow')) {
        console.log('[Debug] Found wrapper className at line ' + (j+1) + ': ' + lines[j].trim().substring(0, 80));
        if (!lines[j].includes('onContextMenu')) {
          // Add onContextMenu after the className line
          lines.splice(j + 1, 0, '          onContextMenu={(e) => e.preventDefault()}');
          changes++;
          console.log('[Fix 1] Added onContextMenu to canvas wrapper');
        }
        break;
      }
    }
    break;
  }
}
src = lines.join('\n');

// Fix 2: Translate remaining context menu items
const ctxReplacements = [
  [">' Unlock'", ">{t('ctx.unlock')}"],
  [">' Lock'", ">{t('ctx.lock')}"],
  ["> Unlock' : ' Lock'}</button>", ">{t('ctx.unlock')} : {t('ctx.lock')}}</button>"],
  // Handle the ternary: lockMovementX ? ' Unlock' : ' Lock'
  ["? '\uD83D\uDD13 Unlock' : '\uD83D\uDD12 Lock'", "? t('ctx.unlock') : t('ctx.lock')"],
  // Bring Forward
  [">\u2B06 Bring Forward</button>", ">\u2B06 {t('ctx.bringForward')}</button>"],
  // Bring to Front  
  [">\u23EB Bring to Front</button>", ">\u23EB {t('ctx.bringToFront')}</button>"],
  // Send Backward
  [">\u2B07 Send Backward</button>", ">\u2B07 {t('ctx.sendBackward')}</button>"],
];

ctxReplacements.forEach(([old, nw], i) => {
  if (src.includes(old)) {
    src = src.replace(old, nw);
    changes++;
    console.log('[Fix 2.' + i + '] Replaced: ' + old.substring(0, 40));
  }
});

// Fix 3: Update locale files with new keys
const newKeys = {
  "ctx.lock": ["\uD83D\uDD12 Lock", "\uD83D\uDD12 \uC7A0\uAE08", "\uD83D\uDD12 \u30ED\u30C3\u30AF"],
  "ctx.unlock": ["\uD83D\uDD13 Unlock", "\uD83D\uDD13 \uC7A0\uAE08 \uD574\uC81C", "\uD83D\uDD13 \u30ED\u30C3\u30AF\u89E3\u9664"],
  "ctx.bringForward": ["Bring Forward", "\uC55E\uC73C\uB85C", "\u524D\u9762\u3078"],
  "ctx.bringToFront": ["Bring to Front", "\uB9E8 \uC55E\uC73C\uB85C", "\u6700\u524D\u9762\u3078"],
  "ctx.sendBackward": ["Send Backward", "\uB4A4\uB85C", "\u80CC\u9762\u3078"]
};

const localeFiles = ['src/locales/en.json', 'src/locales/ko.json', 'src/locales/ja.json'];
localeFiles.forEach((lf, li) => {
  try {
    let obj = JSON.parse(fs.readFileSync(lf, 'utf8'));
    let added = 0;
    Object.entries(newKeys).forEach(([k, vals]) => {
      if (!obj[k]) {
        obj[k] = vals[li];
        added++;
      }
    });
    fs.writeFileSync(lf, JSON.stringify(obj, null, 2) + '\n', 'utf8');
    if (added > 0) {
      changes += added;
      console.log('[Fix 3] Added ' + added + ' keys to ' + lf);
    }
  } catch (e) {
    console.log('[Fix 3] ERROR ' + lf + ': ' + e.message);
  }
});

src = src.replace(/\n/g, '\r\n');
fs.writeFileSync(f, src, 'utf8');
console.log('Total changes: ' + changes);
