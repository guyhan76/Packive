const fs = require("fs");

// 1) Add i18n keys to locale files
const keys = {
  "header.back": { en: "← Back", ko: "← 뒤로", ja: "← 戻る" },
  "header.saveAndBack": { en: "Save & Back", ko: "저장 후 뒤로", ja: "保存して戻る" }
};

["en", "ko", "ja"].forEach(lang => {
  const p = `src/locales/${lang}.json`;
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  let added = 0;
  Object.entries(keys).forEach(([k, v]) => {
    if (!data[k]) { data[k] = v[lang]; added++; }
  });
  fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf8");
  console.log(`[${lang}.json] Added ${added} keys`);
});

// 2) Patch panel-editor.tsx
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// Replace "← Back" button text
const backOld = '>← Back</button>';
const backNew = '>{t("header.back")}</button>';
if (code.includes(backOld)) {
  code = code.replace(backOld, backNew);
  changes++;
  console.log("[Fix] ← Back → t('header.back')");
}

// Replace "Save & Back" button text
const saveOld = '>Save & Back</button>';
const saveNew = '>{t("header.saveAndBack")}</button>';
if (code.includes(saveOld)) {
  code = code.replace(saveOld, saveNew);
  changes++;
  console.log("[Fix] Save & Back → t('header.saveAndBack')");
}

// Also check for "Save &amp; Back" variant
const saveAmpOld = '>Save &amp; Back</button>';
if (code.includes(saveAmpOld)) {
  code = code.replace(saveAmpOld, saveNew);
  changes++;
  console.log("[Fix] Save &amp; Back → t('header.saveAndBack')");
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);

// 3) Verify
const verify = fs.readFileSync(file, "utf8");
const remaining = [];
if (verify.includes(">← Back<")) remaining.push("← Back");
if (verify.includes(">Save & Back<")) remaining.push("Save & Back");
if (verify.includes(">Save &amp; Back<")) remaining.push("Save &amp; Back");

if (remaining.length === 0) {
  console.log("✅ All header buttons are now translated!");
} else {
  console.log("⚠️ Still hardcoded:", remaining.join(", "));
}
