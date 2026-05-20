const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// Replace saveDesignFile with showSaveFilePicker version
const oldSave = `const saveDesignFile = useCallback(() => {
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
  }, [panelName]);`;

const newSave = `const saveDesignFile = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const _ej = c.toJSON(['src','_isSafeZone','_isGuideLine','_isGuideText','_isSizeLabel','_isBgImage','_isBgPattern']);
    _ej.objects = (_ej.objects || []).filter((o: any) => !o._isSafeZone && !o._isGuideLine && !o._isGuideText && !o._isSizeLabel);
    if (c.backgroundColor) _ej.backgroundColor = c.backgroundColor;
    const data = JSON.stringify(_ej, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const fileName = (panelName || 'design') + '.json';
    // Use File System Access API if available (folder picker)
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'Design JSON',
            accept: { 'application/json': ['.json'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return; // User cancelled
        console.warn('showSaveFilePicker failed, falling back:', err);
      }
    }
    // Fallback: auto-download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [panelName]);`;

if (code.includes(oldSave)) {
  code = code.replace(oldSave, newSave);
  changes++;
  console.log("[Fix] saveDesignFile: added folder picker with fallback");
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
