const fs = require("fs");

// ═══ 1. Update locale files ═══
const enFile = "src/locales/en.json";
const koFile = "src/locales/ko.json";
const jaFile = "src/locales/ja.json";

const en = JSON.parse(fs.readFileSync(enFile, "utf8"));
const ko = JSON.parse(fs.readFileSync(koFile, "utf8"));
const ja = JSON.parse(fs.readFileSync(jaFile, "utf8"));

// Fix "back" translation
en["back"] = "Back";
ko["back"] = "뒤로";
ja["back"] = "戻る";

// Add editor UI keys
en["ed.save"] = "Save";
en["ed.load"] = "Load";
en["ed.prev"] = "Prev";
en["ed.next"] = "Next";
en["ed.undo"] = "Undo";
en["ed.redo"] = "Redo";

ko["ed.save"] = "저장";
ko["ed.load"] = "불러오기";
ko["ed.prev"] = "이전";
ko["ed.next"] = "다음";
ko["ed.undo"] = "실행취소";
ko["ed.redo"] = "다시실행";

ja["ed.save"] = "保存";
ja["ed.load"] = "読込";
ja["ed.prev"] = "前へ";
ja["ed.next"] = "次へ";
ja["ed.undo"] = "元に戻す";
ja["ed.redo"] = "やり直し";

fs.writeFileSync(enFile, JSON.stringify(en, null, 2) + "\n", "utf8");
fs.writeFileSync(koFile, JSON.stringify(ko, null, 2) + "\n", "utf8");
fs.writeFileSync(jaFile, JSON.stringify(ja, null, 2) + "\n", "utf8");
console.log("Locale files updated");

// ═══ 2. Update panel-editor.tsx ═══
const peFile = "src/components/editor/panel-editor.tsx";
let lines = fs.readFileSync(peFile, "utf8").split("\n");
console.log("Start:", lines.length);

// 2a: Replace tab labels — line 1534
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("tab.charAt(0).toUpperCase()+tab.slice(1)")) {
    lines[i] = "              {tab==='templates'?'🎨':tab==='copy'?'✍':tab==='review'?'🔍':tab==='layers'?'◫':'⏱'}<br/>{t('tab.'+tab)}";
    console.log("FIX 2a: Tab labels use t() at line", i + 1);
    break;
  }
}

// 2b: Save button
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("handleSaveDesign") && lines[i].includes("Save</button>")) {
    lines[i] = lines[i].replace("💾 Save</button>", "💾 {t('ed.save')}</button>");
    console.log("FIX 2b: Save button at line", i + 1);
    break;
  }
}

// 2c: Load button
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("handleLoadDesign") && lines[i].includes("Load</button>")) {
    lines[i] = lines[i].replace("📂 Load</button>", "📂 {t('ed.load')}</button>");
    console.log("FIX 2c: Load button at line", i + 1);
    break;
  }
}

// 2d: Prev button
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("onPrevPanel") && lines[i].includes("← Prev</button>")) {
    lines[i] = lines[i].replace("← Prev</button>", "← {t('ed.prev')}</button>");
    console.log("FIX 2d: Prev button at line", i + 1);
    break;
  }
}

// 2e: Next button
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("onNextPanel") && lines[i].includes("Next →</button>")) {
    lines[i] = lines[i].replace("Next →</button>", "{t('ed.next')} →</button>");
    console.log("FIX 2e: Next button at line", i + 1);
    break;
  }
}

// 2f: Back button
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("onBack") && lines[i].includes("Back'}</button>")) {
    lines[i] = lines[i].replace("{t('back')||'Back'}", "{t('back')}");
    console.log("FIX 2f: Back button at line", i + 1);
    break;
  }
}

const code = lines.join("\n");
const ob = (code.match(/\{/g) || []).length;
const cb = (code.match(/\}/g) || []).length;
console.log("Done! Lines:", lines.length, "| diff:", ob - cb);
fs.writeFileSync(peFile, code, "utf8");
