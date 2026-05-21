const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// Step 1: Add state for shortcut modal
const oldStates = "const [showGrid, setShowGrid] = useState(false);";
const newStates = `const [showGrid, setShowGrid] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);`;
if (code.includes(oldStates)) {
  code = code.replace(oldStates, newStates);
  changes++;
  console.log('Step1: Added showShortcuts state');
}

// Step 2: Add keyboard shortcut to open modal (? key or F1)
const oldKeyHandler = "if (e.key === 'Delete' || e.key === 'Backspace') {";
const newKeyHandler = `if (e.key === '?' || e.key === 'F1') {
          e.preventDefault();
          setShowShortcuts(prev => !prev);
          return;
        }
        if (e.key === 'Escape') {
          setShowShortcuts(false);
        }
        if (e.key === 'Delete' || e.key === 'Backspace') {`;
if (code.includes(oldKeyHandler)) {
  code = code.replace(oldKeyHandler, newKeyHandler);
  changes++;
  console.log('Step2: Added ? and F1 shortcut for modal');
}

// Step 3: Add the shortcut button in the header area (near Save & Back)
const oldSaveBack = `Save &amp; Back`;
if (code.includes(oldSaveBack)) {
  // Find the button containing Save & Back and add shortcut button after it
  console.log('Step3: Found Save & Back button text');
}

// Step 3 alternative: Add button near the zoom controls at bottom
// Or add in the header - find the header area
const headerPattern = `Save &amp; Back</button>`;
if (code.includes(headerPattern)) {
  code = code.replace(headerPattern, `Save &amp; Back</button>
            <button onClick={() => setShowShortcuts(true)} className="px-2 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-bold transition-colors" title="Keyboard Shortcuts (?)">⌨</button>`);
  changes++;
  console.log('Step3: Added shortcut button in header');
} else {
  // Try finding Save & Back differently
  const alt = "Save &amp; Back";
  if (code.includes(alt + "</button>")) {
    console.log('Step3: Found alt pattern');
  } else {
    console.log('Step3: Looking for header pattern...');
  }
}

// Step 3 fallback: search for the actual Save & Back text
if (changes < 3) {
  const saveBackPatterns = ["Save & Back", "Save &amp; Back", "Save&Back"];
  for (const p of saveBackPatterns) {
    const idx = code.indexOf(p);
    if (idx > 0) {
      console.log('Step3 fallback: Found "' + p + '" at index ' + idx);
      // Find the closing </button> after it
      const closeBtn = code.indexOf("</button>", idx);
      if (closeBtn > 0) {
        const insertAt = closeBtn + "</button>".length;
        const btnCode = `\n            <button onClick={() => setShowShortcuts(true)} className="px-2 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-bold transition-colors" title="Keyboard Shortcuts (?)">⌨</button>`;
        code = code.substring(0, insertAt) + btnCode + code.substring(insertAt);
        changes++;
        console.log('Step3 fallback: Inserted shortcut button');
        break;
      }
    }
  }
}

// Step 4: Add the modal component before the final closing tags
// Find the last </aside> or the context menu section
const modalCode = `
      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">⌨ Keyboard Shortcuts</h2>
              <button onClick={() => setShowShortcuts(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">General</h3>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center py-1"><span className="text-sm text-gray-700">Undo</span><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">Ctrl + Z</span></div>
                  <div className="flex justify-between items-center py-1"><span className="text-sm text-gray-700">Redo</span><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">Ctrl + Y</span></div>
                  <div className="flex justify-between items-center py-1"><span className="text-sm text-gray-700">Redo (Alt)</span><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">Ctrl + Shift + Z</span></div>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Edit</h3>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center py-1"><span className="text-sm text-gray-700">Copy</span><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">Ctrl + C</span></div>
                  <div className="flex justify-between items-center py-1"><span className="text-sm text-gray-700">Paste</span><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">Ctrl + V</span></div>
                  <div className="flex justify-between items-center py-1"><span className="text-sm text-gray-700">Cut</span><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">Ctrl + X</span></div>
                  <div className="flex justify-between items-center py-1"><span className="text-sm text-gray-700">Duplicate</span><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">Ctrl + D</span></div>
                  <div className="flex justify-between items-center py-1"><span className="text-sm text-gray-700">Delete</span><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">Delete / Backspace</span></div>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Move Object</h3>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center py-1"><span className="text-sm text-gray-700">Move 5px</span><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">Arrow Keys</span></div>
                  <div className="flex justify-between items-center py-1"><span className="text-sm text-gray-700">Move 1px (precise)</span><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">Ctrl + Arrow Keys</span></div>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Clipboard</h3>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center py-1"><span className="text-sm text-gray-700">Paste Image</span><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">Ctrl + V (image)</span></div>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Help</h3>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center py-1"><span className="text-sm text-gray-700">Toggle this panel</span><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">? or F1</span></div>
                  <div className="flex justify-between items-center py-1"><span className="text-sm text-gray-700">Close modal</span><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">Esc</span></div>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <p className="text-xs text-gray-400 text-center">Press <span className="font-mono bg-gray-200 px-1 rounded">?</span> anytime to toggle this panel</p>
            </div>
          </div>
        </div>
      )}`;

// Find a good insertion point - before the final return's closing fragment or after context menu
const ctxMenuEnd = "ctxMenu && (";
if (code.includes(ctxMenuEnd)) {
  // Find the context menu block end and insert after it
  // Actually, insert before the context menu - find the wrapper div end
  // Better: insert right before the closing of the main return
  
  // Find the last occurrence of "</div>" before the final closing
  // Let's insert before {ctxMenu && 
  const ctxIdx = code.lastIndexOf("ctxMenu && (");
  if (ctxIdx > 0) {
    // Find the line start
    let lineStart = code.lastIndexOf('\n', ctxIdx);
    code = code.substring(0, lineStart) + '\n' + modalCode + code.substring(lineStart);
    changes++;
    console.log('Step4: Inserted shortcut modal before context menu');
  }
} else {
  console.log('Step4: Context menu pattern not found');
}

fs.writeFileSync(file, code, 'utf8');
console.log('\nTotal changes: ' + changes);
