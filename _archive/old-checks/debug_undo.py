with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    content = f.read()

# Add debug logging to undo/redo
fixes = 0

# 1. Add log to pushHistory
old_push = 'const pushHistory = useCallback(() => {'
new_push = 'const pushHistory = useCallback(() => { console.log("[History] pushHistory called, stack size:", historyRef.current.length, "idx:", historyIdxRef.current);'
if old_push in content:
    content = content.replace(old_push, new_push, 1)
    fixes += 1
    print("Fix 1: Added pushHistory debug log")

# 2. Add log to undo
old_undo = 'const undo = useCallback(async () => {'
new_undo = 'const undo = useCallback(async () => { console.log("[History] undo called, stack size:", historyRef.current.length, "idx:", historyIdxRef.current);'
if old_undo in content:
    content = content.replace(old_undo, new_undo, 1)
    fixes += 1
    print("Fix 2: Added undo debug log")

# 3. Add log to redo
old_redo = 'const redo = useCallback(async () => {'
new_redo = 'const redo = useCallback(async () => { console.log("[History] redo called, stack size:", historyRef.current.length, "idx:", historyIdxRef.current);'
if old_redo in content:
    content = content.replace(old_redo, new_redo, 1)
    fixes += 1
    print("Fix 3: Added redo debug log")

print(f"\nTotal fixes: {fixes}")

with open('src/components/editor/unified-editor.tsx','w',encoding='utf-8',newline='') as f:
    f.write(content)
