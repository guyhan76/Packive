const fs = require('fs');
const f = 'src/app/editor/design/page.tsx';
let src = fs.readFileSync(f, 'utf8');
src = src.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
let changes = 0;

// Fix: Replace closure-based auto-save with a version that reads latest panels from a ref
// Step 1: Add a panelsRef that always has the latest panels
const panelsDecl = 'const [panels, setPanels] = useState<Record<string';
if (src.includes(panelsDecl) && !src.includes('panelsRef.current = panels')) {
  // Find the line after the useState closing
  const idx = src.indexOf(panelsDecl);
  // Find the next blank line or next const/let after the useState block
  const afterIdx = src.indexOf('\n', src.indexOf('));', idx) + 3);
  const insertCode = '\n  const panelsRef = useRef(panels);\n  useEffect(() => { panelsRef.current = panels; }, [panels]);\n';
  src = src.substring(0, afterIdx) + insertCode + src.substring(afterIdx);
  changes++;
  console.log('[Fix 1] Added panelsRef to track latest panels');
} else if (src.includes('panelsRef.current = panels')) {
  console.log('[Fix 1] SKIP - panelsRef already exists');
} else {
  console.log('[Fix 1] SKIP - panels declaration not found');
}

// Step 2: Replace the auto-save code in handleSave to use panelsRef
const oldAutoSave = 'const up = Object.assign({}, panels, { [pid]: { json: json, thumbnail: thumb, designed: true } });';
const newAutoSave = 'const up = Object.assign({}, panelsRef.current, { [pid]: { json: json, thumbnail: thumb, designed: true } });';
if (src.includes(oldAutoSave)) {
  src = src.replace(oldAutoSave, newAutoSave);
  changes++;
  console.log('[Fix 2] Updated auto-save to use panelsRef.current');
} else {
  console.log('[Fix 2] SKIP - old auto-save pattern not found');
}

// Step 3: Also update saveProject to use panelsRef if it uses panels directly
if (src.includes('JSON.stringify(panels)') || src.includes('JSON.stringify({ panels:')) {
  // Find saveProject function and ensure it uses latest panels
  const saveProjectMarker = 'const saveProject = useCallback(async ()';
  if (src.includes(saveProjectMarker)) {
    // Check if it directly references panels
    const spIdx = src.indexOf(saveProjectMarker);
    const spEnd = src.indexOf('}, [', spIdx);
    const spBlock = src.substring(spIdx, spEnd);
    if (spBlock.includes('panels') && !spBlock.includes('panelsRef.current')) {
      // In the saveProject block, replace panels references with panelsRef.current
      const newSpBlock = spBlock
        .replace(/JSON\.stringify\(\{ panels,/g, 'JSON.stringify({ panels: panelsRef.current,')
        .replace(/Object\.entries\(panels\)/g, 'Object.entries(panelsRef.current)');
      if (newSpBlock !== spBlock) {
        src = src.replace(spBlock, newSpBlock);
        changes++;
        console.log('[Fix 3] Updated saveProject to use panelsRef.current');
      }
    }
  }
}

// Step 4: Ensure useRef is imported
if (!src.includes('useRef') && src.includes("from 'react'")) {
  src = src.replace("from 'react'", ", useRef from 'react'");
  changes++;
  console.log('[Fix 4] Added useRef to imports');
} else {
  console.log('[Fix 4] SKIP - useRef already imported');
}

src = src.replace(/\n/g, '\r\n');
fs.writeFileSync(f, src, 'utf8');
console.log('Total changes: ' + changes);
