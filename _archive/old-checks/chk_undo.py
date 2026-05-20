with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Find undo/redo function definitions
for i, line in enumerate(lines):
    if ('const undo' in line or 'const redo' in line or 'function undo' in line or 'function redo' in line) and i < 1000:
        print(f"L{i+1}: {line.rstrip()[:200]}")

# Find pushHistory
print("\n=== pushHistory ===")
for i, line in enumerate(lines):
    if 'const pushHistory' in line or 'function pushHistory' in line:
        print(f"L{i+1}: {line.rstrip()[:200]}")

# Find history state
print("\n=== history state ===")
for i, line in enumerate(lines):
    if 'historyRef' in line or 'historyIndex' in line or 'historyStack' in line:
        if i < 500:
            print(f"L{i+1}: {line.rstrip()[:200]}")

# Find undo/redo button in header
print("\n=== Undo/Redo buttons ===")
for i, line in enumerate(lines):
    if 'onClick={undo}' in line or 'onClick={redo}' in line:
        print(f"L{i+1}: {line.rstrip()[:200]}")
