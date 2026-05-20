const fs = require("fs");
const file = "src/app/editor/design/page.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// 1) Add saveProject and loadProject functions before navigatePanel
const navMarker = `const navigatePanel = useCallback((direction: "next" | "prev") => {`;

const projectFunctions = `// ── Save/Load entire project ──
  const saveProject = useCallback(async () => {
    const projectData = {
      version: 1,
      boxType, boxTypeDisplay, L, W, D, materialId, matLabel,
      panels,
      savedAt: new Date().toISOString(),
    };
    const data = JSON.stringify(projectData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const fileName = 'packive-' + boxType + '-' + L + 'x' + W + 'x' + D + '.json';
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [{ description: 'Packive Project', accept: { 'application/json': ['.json'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = fileName; a.click();
    URL.revokeObjectURL(url);
  }, [boxType, boxTypeDisplay, L, W, D, materialId, matLabel, panels]);

  const loadProject = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const project = JSON.parse(text);
        if (!project.version || !project.panels) {
          alert('Invalid project file');
          return;
        }
        // Restore all panels
        const restored: Record<string, PanelData> = {};
        allPanelIds.forEach((id) => {
          if (project.panels[id] && project.panels[id].designed) {
            restored[id] = project.panels[id];
          } else {
            restored[id] = { json: null, thumbnail: null, designed: false };
          }
        });
        setPanels(restored);
      } catch (err) {
        console.error('Project load error:', err);
        alert('Failed to load project file');
      }
    };
    input.click();
  }, []);

  `;

if (code.includes(navMarker)) {
  code = code.replace(navMarker, projectFunctions + navMarker);
  changes++;
  console.log("[Fix 1] Added saveProject and loadProject functions");
}

// 2) Add Save/Load buttons to header (after Export button)
const oldExportBtn = `              >
                Export
              </button>
            </div>
          </div>
        </header>`;

const newExportBtn = `              >
                Export
              </button>
              <button onClick={saveProject} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                💾 Save Project
              </button>
              <button onClick={loadProject} className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition">
                📂 Load Project
              </button>
            </div>
          </div>
        </header>`;

if (code.includes(oldExportBtn)) {
  code = code.replace(oldExportBtn, newExportBtn);
  changes++;
  console.log("[Fix 2] Added Save/Load Project buttons to header");
}

// 3) Also auto-save to localStorage whenever panels change
const handleSaveMarker = `const handleSave = useCallback((panelId: string, json: string, thumbnail: string) => {
    setPanels((prev) => ({ ...prev, [panelId]: { json, thumbnail, designed: true } }));
  }, []);`;

const handleSaveNew = `const handleSave = useCallback((panelId: string, json: string, thumbnail: string) => {
    setPanels((prev) => {
      const next = { ...prev, [panelId]: { json, thumbnail, designed: true } };
      // Auto-save to localStorage
      try {
        const key = 'packive_project_' + boxType + '_' + L + '_' + W + '_' + D;
        localStorage.setItem(key, JSON.stringify({ version: 1, panels: next, savedAt: new Date().toISOString() }));
      } catch {}
      return next;
    });
  }, [boxType, L, W, D]);`;

if (code.includes(handleSaveMarker)) {
  code = code.replace(handleSaveMarker, handleSaveNew);
  changes++;
  console.log("[Fix 3] handleSave: added auto-save to localStorage");
}

// 4) Restore from localStorage on initial load
const oldPanelsInit = `const [panels, setPanels] = useState<Record<string, PanelData>>(() => {
    const init: Record<string, PanelData> = {};
    allPanelIds.forEach((id) => { init[id] = { json: null, thumbnail: null, designed: false }; });
    return init;
  });`;

const newPanelsInit = `const [panels, setPanels] = useState<Record<string, PanelData>>(() => {
    const init: Record<string, PanelData> = {};
    allPanelIds.forEach((id) => { init[id] = { json: null, thumbnail: null, designed: false }; });
    // Try restore from localStorage
    try {
      const key = 'packive_project_' + boxType + '_' + L + '_' + W + '_' + D;
      const saved = localStorage.getItem(key);
      if (saved) {
        const project = JSON.parse(saved);
        if (project.panels) {
          allPanelIds.forEach((id) => {
            if (project.panels[id] && project.panels[id].designed) {
              init[id] = project.panels[id];
            }
          });
          console.log('Project restored from localStorage');
        }
      }
    } catch {}
    return init;
  });`;

if (code.includes(oldPanelsInit)) {
  code = code.replace(oldPanelsInit, newPanelsInit);
  changes++;
  console.log("[Fix 4] panels init: restore from localStorage");
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
if (changes >= 3) console.log("✅ Project save/load + auto-save/restore added!");
