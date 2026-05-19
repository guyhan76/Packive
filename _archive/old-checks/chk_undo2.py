with open('src/components/editor/unified-editor.tsx','r',encoding='utf-8') as f:
    lines = f.readlines()

# Print lines 424-510 (pushHistory, undo, redo full code)
for i in range(423, 510):
    if i < len(lines):
        print(f"L{i+1}: {lines[i].rstrip()[:250]}")
