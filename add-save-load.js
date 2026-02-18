const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// 1) Add saveDesignFile and loadDesignFile functions before the colors array
const colorsMarker = "const colors = ['#000000','#FFFFFF','#FF0000'";

const newFunctions = `// ── Save/Load design file ──
  const saveDesignFile = useCallback(() => {
    const c = fcRef.current; if (!c) return;
    const _ej = c.toJSON(['src','_isSafeZone','_isGuideLine','_isGuideText','_isSizeLabel','_isBgImage','_isBgPattern']);
    _ej.objects = (_ej.objects || []).filter((o: any) => !o._isSafeZone && !o._isGuideLine && !o._isGuideText && !o._isSizeLabel);
    if (c.backgroundColor) _ej.backgroundColor = c.backgroundColor;
    const data = JSON.stringify(_ej, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (panelName || 'design') + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [panelName]);

  const loadDesignFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const c = fcRef.current; if (!c) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const savedBg = parsed.backgroundColor;
        // Remove guide objects from loaded data
        parsed.objects = (parsed.objects || []).filter((o: any) => {
          if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) return false;
          return true;
        });
        await c.loadFromJSON(parsed);
        if (savedBg) c.backgroundColor = savedBg;
        // Remove any residual guide objects
        c.getObjects().slice().forEach((o: any) => {
          if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) c.remove(o);
        });
        // Re-add safe zone
        const { Rect, FabricText } = await import('fabric');
        const cw = c.getWidth(); const ch = c.getHeight();
        const sc = scaleRef.current; const mg = Math.round(5 * sc);
        const sz = new Rect({ left: mg, top: mg, originX: 'left', originY: 'top', width: cw - mg*2, height: ch - mg*2, fill: 'transparent', stroke: '#93B5F7', strokeWidth: 1.5, strokeDashArray: [8,5], selectable: false, evented: false });
        (sz as any)._isSafeZone = true; c.add(sz); c.sendObjectToBack(sz);
        const gt = new FabricText(guideText || '', { left: cw/2, top: ch/2 - 10, originX: 'center', originY: 'center', fontSize: 13, fill: '#C0C0C0', fontFamily: 'Arial, sans-serif', selectable: false, evented: false });
        (gt as any)._isGuideText = true; c.add(gt); c.sendObjectToBack(gt);
        const sl = new FabricText(widthMM + ' \\u00d7 ' + heightMM + ' mm', { left: cw - mg - 4, top: ch - mg - 4, originX: 'right', originY: 'bottom', fontSize: 11, fill: '#B0B0B0', fontFamily: 'Arial, sans-serif', selectable: false, evented: false });
        (sl as any)._isSizeLabel = true; c.add(sl); c.sendObjectToBack(sl);
        c.renderAll();
        refreshLayers();
      } catch (err) {
        console.error('Design file load error:', err);
        alert('Failed to load design file');
      }
    };
    input.click();
  }, [guideText, widthMM, heightMM]);

  `;

if (code.includes(colorsMarker)) {
  code = code.replace(colorsMarker, newFunctions + colorsMarker);
  changes++;
  console.log("[Fix 1] Added saveDesignFile and loadDesignFile functions");
}

// 2) Add Save/Load buttons to header (after keyboard shortcut button)
const headerMarker = `<button onClick={() => setShowShortcuts(true)} className="px-2 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-bold transition-colors" title={t("shortcut.title.tooltip")}>⌨</button>`;

const saveLoadButtons = `<button onClick={() => setShowShortcuts(true)} className="px-2 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-bold transition-colors" title={t("shortcut.title.tooltip")}>⌨</button>
          <button onClick={saveDesignFile} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700" title={t("design.save")}>{t("design.save")}</button>
          <button onClick={loadDesignFile} className="px-3 py-1.5 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600" title={t("design.load")}>{t("design.load")}</button>`;

if (code.includes(headerMarker)) {
  code = code.replace(headerMarker, saveLoadButtons);
  changes++;
  console.log("[Fix 2] Added Save/Load buttons to header");
}

// 3) Add i18n keys
const localeKeys = {
  "design.save": { en: "Save Design", ko: "디자인 저장", ja: "デザイン保存" },
  "design.load": { en: "Load Design", ko: "디자인 불러오기", ja: "デザイン読込" }
};

["en", "ko", "ja"].forEach(lang => {
  const p = "src/locales/" + lang + ".json";
  try {
    const data = JSON.parse(fs.readFileSync(p, "utf8"));
    let added = 0;
    Object.entries(localeKeys).forEach(([k, v]) => {
      if (!data[k]) { data[k] = v[lang]; added++; }
    });
    fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf8");
    if (added > 0) console.log(`[${lang}.json] Added ${added} keys`);
  } catch (e) { console.log(`[${lang}.json] Error:`, e.message); }
});

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
if (changes >= 2) console.log("✅ Save/Load design buttons added!");
