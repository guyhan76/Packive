with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

fixes = 0

# Fix 1: Remove debug logs first
for old, new in [
    ('const pushHistory = useCallback(() => { console.log("[History] pushHistory called, stack size:", historyRef.current.length, "idx:", historyIdxRef.current);',
     'const pushHistory = useCallback(() => {'),
    ('const undo = useCallback(async () => { console.log("[History] undo called, stack size:", historyRef.current.length, "idx:", historyIdxRef.current);',
     'const undo = useCallback(async () => {'),
    ('const redo = useCallback(async () => { console.log("[History] redo called, stack size:", historyRef.current.length, "idx:", historyIdxRef.current);',
     'const redo = useCallback(async () => {'),
]:
    if old in content:
        content = content.replace(old, new, 1)
        fixes += 1

# Fix 2: Rewrite undo with proper loading guard timing
old_undo = """const undo = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current--;
    loadingRef.current = true;
    const snapshot = JSON.parse(historyRef.current[historyIdxRef.current]);
    await c.loadFromJSON(snapshot);
    restoreCustomProps(c, snapshot);
    c.requestRenderAll();
    loadingRef.current = false;
    refreshLayers();
    setTimeout(() => { setSelProps(null); setTableEditCell(null); }, 30);
  }, []);"""

new_undo = """const undo = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current--;
    loadingRef.current = true;
    const snapshot = JSON.parse(historyRef.current[historyIdxRef.current]);
    await c.loadFromJSON(snapshot);
    restoreCustomProps(c, snapshot);
    c.requestRenderAll();
    refreshLayers();
    setTimeout(() => { setSelProps(null); setTableEditCell(null); }, 30);
    setTimeout(() => { loadingRef.current = false; }, 200);
  }, []);"""

if old_undo in content:
    content = content.replace(old_undo, new_undo, 1)
    fixes += 1
    print("Fix: undo - delayed loadingRef reset to 200ms")

# Fix 3: Rewrite redo with same guard
old_redo = """const redo = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current++;
    loadingRef.current = true;
    const snapshot = JSON.parse(historyRef.current[historyIdxRef.current]);
    await c.loadFromJSON(snapshot);
    restoreCustomProps(c, snapshot);
    c.requestRenderAll();
    loadingRef.current = false;
    refreshLayers();
    setTimeout(() => { setSelProps(null); setTableEditCell(null); }, 30);
  }, []);"""

new_redo = """const redo = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current++;
    loadingRef.current = true;
    const snapshot = JSON.parse(historyRef.current[historyIdxRef.current]);
    await c.loadFromJSON(snapshot);
    restoreCustomProps(c, snapshot);
    c.requestRenderAll();
    refreshLayers();
    setTimeout(() => { setSelProps(null); setTableEditCell(null); }, 30);
    setTimeout(() => { loadingRef.current = false; }, 200);
  }, []);"""

if old_redo in content:
    content = content.replace(old_redo, new_redo, 1)
    fixes += 1
    print("Fix: redo - delayed loadingRef reset to 200ms")

print(f"\nTotal fixes: {fixes}")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)
