const fs = require("fs");
const file = "src/app/editor/design/page.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// 1) Remove duplicate saveProject/loadProject (second copy)
// Find the second occurrence
const funcMarker = "// ── Save/Load entire project ──";
const firstIdx = code.indexOf(funcMarker);
const secondIdx = code.indexOf(funcMarker, firstIdx + 1);
if (secondIdx > firstIdx && firstIdx >= 0) {
  // Find the end of second block (ends before "const navigatePanel")
  const endMarker = "const navigatePanel = useCallback";
  const endIdx = code.indexOf(endMarker, secondIdx);
  if (endIdx > secondIdx) {
    code = code.substring(0, secondIdx) + code.substring(endIdx);
    changes++;
    console.log("[Fix 1] Removed duplicate saveProject/loadProject");
  }
}

// 2) Add buttons to header - find the Export button area
const oldExport = `                Export
              </button>
            </div>
          </div>
        </header>`;

const newExport = `                Export
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

if (code.includes(oldExport)) {
  code = code.replace(oldExport, newExport);
  changes++;
  console.log("[Fix 2] Added Save/Load Project buttons to header");
} else {
  console.log("[Skip 2] Export button pattern not found, trying alternate...");
  // Try finding just "Export" button closing
  const altPattern = `Export\n              </button>`;
  if (code.includes(altPattern)) {
    console.log("  Found alternate pattern");
  }
}

// 3) Fix handleSave to auto-save to localStorage
const oldHandleSave = `const handleSave = useCallback((panelId: string, json: string, thumbnail: string) => {
    setPanels((prev) => ({ ...prev, [panelId]: { json, thumbnail, designed: true } }));
  }, []);`;

const newHandleSave = `const handleSave = useCallback((panelId: string, json: string, thumbnail: string) => {
    setPanels((prev) => {
      const next = { ...prev, [panelId]: { json, thumbnail, designed: true } };
      try {
        const key = 'packive_project_' + boxType + '_' + L + '_' + W + '_' + D;
        localStorage.setItem(key, JSON.stringify({ version: 1, panels: next, savedAt: new Date().toISOString() }));
      } catch {}
      return next;
    });
  }, [boxType, L, W, D]);`;

if (code.includes(oldHandleSave)) {
  code = code.replace(oldHandleSave, newHandleSave);
  changes++;
  console.log("[Fix 3] handleSave: auto-save to localStorage");
}

// 4) Restore from localStorage on init
const oldInit = `const [panels, setPanels] = useState<Record<string, PanelData>>(() => {
    const init: Record<string, PanelData> = {};
    allPanelIds.forEach((id) => { init[id] = { json: null, thumbnail: null, designed: false }; });
    return init;
  });`;

const newInit = `const [panels, setPanels] = useState<Record<string, PanelData>>(() => {
    const init: Record<string, PanelData> = {};
    allPanelIds.forEach((id) => { init[id] = { json: null, thumbnail: null, designed: false }; });
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

if (code.includes(oldInit)) {
  code = code.replace(oldInit, newInit);
  changes++;
  console.log("[Fix 4] panels init: auto-restore from localStorage");
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
