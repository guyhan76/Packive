const fs = require('fs');
const f = 'src/components/editor/panel-editor.tsx';
let src = fs.readFileSync(f, 'utf8');
src = src.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
let changes = 0;

// All replacements in the shortcuts modal and context menu
const replacements = [
  // Modal title
  ['"text-lg font-bold text-gray-800">\u2328 Keyboard Shortcuts</h2>', '"text-lg font-bold text-gray-800">\u2328 {t("shortcut.title")}</h2>'],
  // Section headers
  ['tracking-wider mb-2">General</h3>', 'tracking-wider mb-2">{t("shortcut.general")}</h3>'],
  ['tracking-wider mb-2">Edit</h3>', 'tracking-wider mb-2">{t("shortcut.edit")}</h3>'],
  ['tracking-wider mb-2">Move Object</h3>', 'tracking-wider mb-2">{t("shortcut.moveObject")}</h3>'],
  ['tracking-wider mb-2">Clipboard</h3>', 'tracking-wider mb-2">{t("shortcut.clipboard")}</h3>'],
  ['tracking-wider mb-2">Help</h3>', 'tracking-wider mb-2">{t("shortcut.help")}</h3>'],
  // General section
  ['text-gray-700">Redo (Alt)</span>', 'text-gray-700">{t("shortcut.redoAlt")}</span>'],
  // Edit section
  ['text-gray-700">Copy</span>', 'text-gray-700">{t("shortcut.copy")}</span>'],
  ['text-gray-700">Paste</span>', 'text-gray-700">{t("shortcut.paste")}</span>'],
  ['text-gray-700">Cut</span>', 'text-gray-700">{t("shortcut.cut")}</span>'],
  ['text-gray-700">Duplicate</span>', 'text-gray-700">{t("shortcut.duplicate")}</span>'],
  ['text-gray-700">Delete</span>', 'text-gray-700">{t("shortcut.delete")}</span>'],
  // Move Object section
  ['text-gray-700">Move 5px</span>', 'text-gray-700">{t("shortcut.move5px")}</span>'],
  ['text-gray-700">Move 1px (precise)</span>', 'text-gray-700">{t("shortcut.move1px")}</span>'],
  // Clipboard section
  ['text-gray-700">Paste Image</span>', 'text-gray-700">{t("shortcut.pasteImage")}</span>'],
  // Help section
  ['text-gray-700">Toggle this panel</span>', 'text-gray-700">{t("shortcut.togglePanel")}</span>'],
  ['text-gray-700">Close modal</span>', 'text-gray-700">{t("shortcut.closeModal")}</span>'],
  // Footer
  ['Press <span className="font-mono bg-gray-200 px-1 rounded">?</span> anytime to toggle this panel', '{t("shortcut.footer")}'],
  // Context menu items
  ['>\uD83D\uDCCB Duplicate</button>', '>\uD83D\uDCCB {t("ctx.duplicate")}</button>'],
  ['>\uD83D\uDDD1 Delete</button>', '>\uD83D\uDDD1 {t("ctx.delete")}</button>'],
];

replacements.forEach(([old, nw], i) => {
  if (src.includes(old)) {
    src = src.replace(old, nw);
    changes++;
  } else {
    console.log('SKIP replacement ' + i + ': ' + old.substring(0, 50));
  }
});

// Also handle context menu items that may appear later
const ctxReplacements = [
  ['>⏬ Send to Back</button>', '>\u23EC {t("ctx.sendToBack")}</button>'],
  ['>\u2194 Flip Horizontal</button>', '>\u2194 {t("ctx.flipH")}</button>'],
  ['>\u2195 Flip Vertical</button>', '>\u2195 {t("ctx.flipV")}</button>'],
];
ctxReplacements.forEach(([old, nw], i) => {
  if (src.includes(old)) {
    src = src.replace(old, nw);
    changes++;
  }
});

src = src.replace(/\n/g, '\r\n');
fs.writeFileSync(f, src, 'utf8');

// Update locale files
const keys = {
  "shortcut.title": ["Keyboard Shortcuts", "\uD0A4\uBCF4\uB4DC \uB2E8\uCD95\uD0A4", "\u30AD\u30FC\u30DC\u30FC\u30C9\u30B7\u30E7\u30FC\u30C8\u30AB\u30C3\u30C8"],
  "shortcut.general": ["General", "\uC77C\uBC18", "\u4E00\u822C"],
  "shortcut.edit": ["Edit", "\uD3B8\uC9D1", "\u7DE8\u96C6"],
  "shortcut.moveObject": ["Move Object", "\uAC1D\uCCB4 \uC774\uB3D9", "\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u79FB\u52D5"],
  "shortcut.clipboard": ["Clipboard", "\uD074\uB9BD\uBCF4\uB4DC", "\u30AF\u30EA\u30C3\u30D7\u30DC\u30FC\u30C9"],
  "shortcut.help": ["Help", "\uB3C4\uC6C0\uB9D0", "\u30D8\u30EB\u30D7"],
  "shortcut.redoAlt": ["Redo (Alt)", "\uB2E4\uC2DC \uC2E4\uD589 (Alt)", "\u3084\u308A\u76F4\u3057 (Alt)"],
  "shortcut.copy": ["Copy", "\uBCF5\uC0AC", "\u30B3\u30D4\u30FC"],
  "shortcut.paste": ["Paste", "\uBD99\uC5EC\uB123\uAE30", "\u8CBC\u308A\u4ED8\u3051"],
  "shortcut.cut": ["Cut", "\uC798\uB77C\uB0B4\uAE30", "\u5207\u308A\u53D6\u308A"],
  "shortcut.duplicate": ["Duplicate", "\uBCF5\uC81C", "\u8907\u88FD"],
  "shortcut.delete": ["Delete", "\uC0AD\uC81C", "\u524A\u9664"],
  "shortcut.move5px": ["Move 5px", "5px \uC774\uB3D9", "5px\u79FB\u52D5"],
  "shortcut.move1px": ["Move 1px (precise)", "1px \uC774\uB3D9 (\uC815\uBC00)", "1px\u79FB\u52D5 (\u7CBE\u5BC6)"],
  "shortcut.pasteImage": ["Paste Image", "\uC774\uBBF8\uC9C0 \uBD99\uC5EC\uB123\uAE30", "\u753B\u50CF\u3092\u8CBC\u308A\u4ED8\u3051"],
  "shortcut.togglePanel": ["Toggle this panel", "\uD328\uB110 \uD1A0\uAE00", "\u30D1\u30CD\u30EB\u5207\u308A\u66FF\u3048"],
  "shortcut.closeModal": ["Close modal", "\uBAA8\uB2EC \uB2EB\uAE30", "\u30E2\u30FC\u30C0\u30EB\u3092\u9589\u3058\u308B"],
  "shortcut.footer": ["Press ? anytime to toggle this panel", "\uC5B8\uC81C\uB4E0 ?\uB97C \uB20C\uB7EC \uC774 \uD328\uB110\uC744 \uD1A0\uAE00\uD558\uC138\uC694", "\u3044\u3064\u3067\u3082 ? \u3092\u62BC\u3057\u3066\u30D1\u30CD\u30EB\u3092\u5207\u308A\u66FF\u3048"],
  "ctx.duplicate": ["Duplicate", "\uBCF5\uC81C", "\u8907\u88FD"],
  "ctx.delete": ["Delete", "\uC0AD\uC81C", "\u524A\u9664"],
  "ctx.sendToBack": ["Send to Back", "\uB9E8 \uB4A4\uB85C \uBCF4\uB0B4\uAE30", "\u6700\u80CC\u9762\u3078"],
  "ctx.flipH": ["Flip Horizontal", "\uC88C\uC6B0 \uBC18\uC804", "\u5DE6\u53F3\u53CD\u8EE2"],
  "ctx.flipV": ["Flip Vertical", "\uC0C1\uD558 \uBC18\uC804", "\u4E0A\u4E0B\u53CD\u8EE2"]
};

const locales = ['src/locales/en.json', 'src/locales/ko.json', 'src/locales/ja.json'];
locales.forEach((lf, li) => {
  try {
    let obj = JSON.parse(fs.readFileSync(lf, 'utf8'));
    let added = 0;
    Object.entries(keys).forEach(([k, vals]) => {
      if (!obj[k] || obj[k] !== vals[li]) {
        obj[k] = vals[li];
        added++;
      }
    });
    fs.writeFileSync(lf, JSON.stringify(obj, null, 2) + '\n', 'utf8');
    console.log('[Locale] ' + lf + ': added/updated ' + added + ' keys');
    changes += added;
  } catch (e) {
    console.log('[Locale] ERROR ' + lf + ': ' + e.message);
  }
});

console.log('Total changes: ' + changes);
