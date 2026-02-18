import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');
let done = 0;

// 1. Add exportScale state near other states
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const [layersList, setLayersList]")) {
    lines.splice(i + 1, 0, "  const [exportScale, setExportScale] = useState<number>(2);");
    done++;
    console.log('1. Added exportScale state');
    break;
  }
}

// 2. Add exportPNG function after doSave
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const saveAndBack = useCallback")) {
    const exportFn = [
      '',
      '  const exportPNG = useCallback(() => {',
      '    const c = fcRef.current; if (!c) return;',
      '    const objs = c.getObjects();',
      '    objs.forEach((o: any) => { if (o._isSafeZone) o.set("visible", false); });',
      '    c.renderAll();',
      '    const dataUrl = c.toDataURL({ format: "png", quality: 1, multiplier: exportScale });',
      '    objs.forEach((o: any) => { if (o._isSafeZone) o.set("visible", true); });',
      '    c.renderAll();',
      '    const link = document.createElement("a");',
      '    link.download = `${panelName}_${exportScale}x.png`;',
      '    link.href = dataUrl;',
      '    link.click();',
      '  }, [exportScale, panelName]);',
    ];
    lines.splice(i, 0, ...exportFn);
    done++;
    console.log('2. Added exportPNG function');
    break;
  }
}

// 3. Add Export button in header after Save & Back
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("Save & Back</button>") && lines[i-1] && !lines[i-1].includes("saveAndBack} className=\"px-3")) {
    const exportBtns = [
      '          <select value={exportScale} onChange={e => setExportScale(+e.target.value)} className="px-2 py-1.5 text-sm border rounded-lg bg-white">',
      '            <option value={1}>1x</option>',
      '            <option value={2}>2x</option>',
      '            <option value={3}>3x</option>',
      '            <option value={4}>4x</option>',
      '          </select>',
      '          <button onClick={exportPNG} className="px-4 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">Export PNG</button>',
    ];
    lines.splice(i + 1, 0, ...exportBtns);
    done++;
    console.log('3. Added Export buttons in header');
    break;
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Changes: ' + done);
